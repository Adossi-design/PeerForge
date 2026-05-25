import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { AuthDto, OnboardingDto } from './dto/auth.dto';
import { ProficiencyLevel } from '@/types';
import { createClerkClient } from '@clerk/backend';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private prisma: PrismaService) {}

  async upsertUserFromClerk(data: AuthDto) {
    let user = await this.prisma.user.findUnique({ where: { clerkId: data.clerkId } });
    if (!user) {
      const existingUsername = await this.prisma.user.findUnique({ where: { username: data.username } });
      if (existingUsername) throw new BadRequestException('Username already taken');
      user = await this.prisma.user.create({
        data: { clerkId: data.clerkId, email: data.email, username: data.username, fullName: data.fullName },
      });
    }
    return user;
  }

  async completeOnboarding(userId: string, data: OnboardingDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (data.skills?.length) {
      for (const skillId of data.skills) {
        await this.prisma.userSkill.create({
          data: { userId, skillId, proficiencyLevel: ProficiencyLevel.BEGINNER },
        }).catch((err) => {
          // Duplicate (userId, skillId) is expected; warn for anything else
          if (err?.code !== 'P2002') this.logger.warn(`userSkill create failed: ${err?.message}`);
        });
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { bio: data.bio, avatarUrl: data.avatarUrl, githubUrl: data.githubUrl, portfolioUrl: data.portfolioUrl },
    });
  }

  async getCurrentUser(clerkId: string) {
    let user = await this.prisma.user.findUnique({
      where: { clerkId },
      include: {
        skills: { include: { skill: true } },
        _count: { select: { posts: true } },
      },
    });

    // Auto-create from Clerk if not in DB yet
    if (!user) {
      try {
        const clerkUser = await clerk.users.getUser(clerkId);
        const email = clerkUser.emailAddresses[0]?.emailAddress ?? `${clerkId}@unknown.local`;
        const rawUsername = clerkUser.username
          ?? (clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName.toLowerCase()}${clerkUser.lastName.toLowerCase()}`
            : clerkUser.firstName
              ? `${clerkUser.firstName.toLowerCase()}${clerkId.slice(-4)}`
              : `user_${clerkId.slice(-8)}`);
        const username = rawUsername;

        const existingByEmail = await this.prisma.user.findUnique({ where: { email } });
        const existingByUsername = await this.prisma.user.findUnique({ where: { username } });

        user = await this.prisma.user.create({
          data: {
            clerkId,
            email: existingByEmail ? `${clerkId}@clerk.local` : email,
            username: existingByUsername ? `${username}_${clerkId.slice(-4)}` : username,
            fullName: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
            avatarUrl: clerkUser.imageUrl || null,
          },
          include: {
            skills: { include: { skill: true } },
            _count: { select: { posts: true } },
          },
        });
      } catch {
        return null;
      }
    }

    if (!user) return null;

    const skillNames = (user.skills ?? []).map((us) => us.skill?.name ?? '');
    let skillsFromJson: string[] = [];
    if (user.skillsJson) {
      try { skillsFromJson = JSON.parse(user.skillsJson); } catch {}
    }
    const finalSkills = skillsFromJson.length > 0 ? skillsFromJson : skillNames;
    let interests: string[] = [];
    try { interests = user.interests ? JSON.parse(user.interests) : []; } catch {}

    return {
      id: user.id,
      clerkId: user.clerkId,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      university: user.university,
      country: user.country,
      githubUrl: user.githubUrl,
      portfolioUrl: user.portfolioUrl,
      linkedinUrl: user.linkedinUrl,
      skills: finalSkills,
      interests,
      reputation: user.reputation,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      _count: user._count,
    };
  }
}
