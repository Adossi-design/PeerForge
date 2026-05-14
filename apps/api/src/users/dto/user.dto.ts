import { IsOptional, MinLength, MaxLength, IsArray } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

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

  @IsOptional()
  linkedinUrl?: string;

  @IsOptional()
  @IsArray()
  skills?: string[];

  @IsOptional()
  @IsArray()
  interests?: string[];
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
  linkedinUrl?: string;
  skills!: string[];
  interests!: string[];
  reputation!: number;
  isVerified!: boolean;
  createdAt!: Date;
}
