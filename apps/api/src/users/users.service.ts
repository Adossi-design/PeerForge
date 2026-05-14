import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { UpdateUserProfileDto, AddSkillDto, UserResponseDto } from './dto/user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.formatUser(user);
  }

  async getUserByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        posts: {
          select: {
            id: true,
            title: true,
            type: true,
            createdAt: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.formatUser(user);
  }

  async updateProfile(userId: string, data: UpdateUserProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return this.formatUser(user);
  }

  async addSkill(userId: string, skillData: AddSkillDto) {
    // Check if user already has this skill
    const existingSkill = await this.prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId: skillData.skillId,
        },
      },
    });

    if (existingSkill) {
      // Update proficiency level
      return this.prisma.userSkill.update({
        where: { id: existingSkill.id },
        data: { proficiencyLevel: skillData.proficiencyLevel },
        include: { skill: true },
      });
    }

    // Create new user skill
    return this.prisma.userSkill.create({
      data: {
        userId,
        skillId: skillData.skillId,
        proficiencyLevel: skillData.proficiencyLevel,
      },
      include: { skill: true },
    });
  }

  async searchUsers(query: string, limit = 20) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query } },
          { fullName: { contains: query } },
        ],
      },
      take: limit,
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        reputation: true,
      },
    });

    return users;
  }

  private formatUser(user: any): UserResponseDto {
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
      reputation: user.reputation,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}
