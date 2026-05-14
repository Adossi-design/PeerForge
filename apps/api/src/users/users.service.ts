import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { UpdateUserProfileDto, AddSkillDto, UserResponseDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        skills: { include: { skill: true } },
        _count: { select: { posts: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.formatUser(user);
  }

  async getUserByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        skills: { include: { skill: true } },
        _count: { select: { posts: true } },
        posts: {
          select: { id: true, title: true, type: true, createdAt: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.formatUser(user);
  }

  async getUserByClerkId(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      include: {
        skills: { include: { skill: true } },
        _count: { select: { posts: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.formatUser(user);
  }

  async updateProfile(userId: string, data: UpdateUserProfileDto) {
    const { skills, interests, ...rest } = data as any;

    const updateData: any = { ...rest };
    if (interests !== undefined) updateData.interests = JSON.stringify(interests);
    if (skills !== undefined) updateData.skillsJson = JSON.stringify(skills);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        skills: { include: { skill: true } },
        _count: { select: { posts: true } },
      },
    });
    return this.formatUser(user);
  }

  async addSkill(userId: string, skillData: AddSkillDto) {
    const existing = await this.prisma.userSkill.findUnique({
      where: { userId_skillId: { userId, skillId: skillData.skillId } },
    });
    if (existing) {
      return this.prisma.userSkill.update({
        where: { id: existing.id },
        data: { proficiencyLevel: skillData.proficiencyLevel },
        include: { skill: true },
      });
    }
    return this.prisma.userSkill.create({
      data: { userId, skillId: skillData.skillId, proficiencyLevel: skillData.proficiencyLevel },
      include: { skill: true },
    });
  }

  async searchUsers(query: string, limit = 20) {
    return this.prisma.user.findMany({
      where: {
        OR: [{ username: { contains: query } }, { fullName: { contains: query } }],
      },
      take: limit,
      select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true, reputation: true },
    });
  }

  private formatUser(user: any): UserResponseDto {
    // Skills: prefer skillsJson (plain string array) over UserSkill relations
    let skillNames: string[] = [];
    if (user.skillsJson) {
      try { skillNames = JSON.parse(user.skillsJson); } catch { skillNames = []; }
    } else {
      skillNames = (user.skills ?? []).map((us: any) => us.skill?.name ?? us.skillId);
    }

    let interests: string[] = [];
    if (user.interests) {
      try { interests = JSON.parse(user.interests); } catch { interests = []; }
    }

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName || '',
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      university: user.university,
      country: user.country,
      githubUrl: user.githubUrl,
      portfolioUrl: user.portfolioUrl,
      linkedinUrl: user.linkedinUrl,
      skills: skillNames,
      interests,
      reputation: user.reputation,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      _count: user._count,
    } as any;
  }
}
