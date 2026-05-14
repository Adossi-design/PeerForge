import { IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  fullName?: string;

  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  university?: string;

  @IsOptional()
  country?: string;

  @IsOptional()
  avatarUrl?: string;

  @IsOptional()
  githubUrl?: string;

  @IsOptional()
  portfolioUrl?: string;
}

export class AddSkillDto {
  skillId!: string;
  proficiencyLevel!: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

export class UserResponseDto {
  id!: string;
  username!: string;
  fullName!: string;
  email!: string;
  bio?: string;
  avatarUrl?: string;
  university?: string;
  country?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  reputation!: number;
  isVerified!: boolean;
  createdAt!: Date;
}
