import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { AuthDto, OnboardingDto, SignUpDto } from './dto/auth.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async upsertUserFromClerk(data: AuthDto): Promise<User> {
    // Find or create user from Clerk webhook
    let user = await this.prisma.user.findUnique({
      where: { clerkId: data.clerkId },
    });

    if (!user) {
      // Check if username already exists
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUsername) {
        throw new BadRequestException('Username already taken');
      }

      user = await this.prisma.user.create({
        data: {
          clerkId: data.clerkId,
          email: data.email,
          username: data.username,
          fullName: data.fullName,
        },
      });
    }

    return user;
  }

  async completeOnboarding(userId: string, data: OnboardingDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Add skills to user
    if (data.skills && data.skills.length > 0) {
      for (const skillId of data.skills) {
        await this.prisma.userSkill.create({
          data: {
            userId,
            skillId,
            proficiencyLevel: 'BEGINNER',
          },
        });
      }
    }

    // Update user profile
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        githubUrl: data.githubUrl,
        portfolioUrl: data.portfolioUrl,
      },
    });
  }

  async getCurrentUser(clerkId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { clerkId },
    });
  }
}
