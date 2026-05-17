import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  Min,
} from 'class-validator';
import { PostType, ProjectStatus, PostVisibility } from '@/types';

export class CreatePostDto {
  @IsNotEmpty()
  title!: string;

  @IsNotEmpty()
  description!: string;

  @IsEnum(PostType)
  type!: PostType;

  @IsOptional()
  status?: ProjectStatus;

  @IsOptional()
  visibility?: PostVisibility;

  @IsArray()
  @IsOptional()
  tags: string[] = [];

  @IsArray()
  @IsOptional()
  requiredSkillIds: string[] = [];

  @IsNumber()
  @IsOptional()
  @Min(1)
  teamSize?: number;

  @IsOptional()
  deadline?: Date;

  @IsNumber()
  @IsOptional()
  @Min(0)
  budget?: number;

  @IsOptional()
  repositoryUrl?: string;

  @IsOptional()
  attachments?: { name: string; url: string; size: number; type: string }[];
}

export class UpdatePostDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsOptional()
  tags?: string[];

  @IsEnum(PostVisibility)
  @IsOptional()
  visibility?: PostVisibility;
}

export class PostResponseDto {
  id!: string;
  title!: string;
  description!: string;
  type!: PostType;
  status!: ProjectStatus;
  visibility!: PostVisibility;
  tags!: string[];
  teamSize?: number;
  budget?: number;
  repositoryUrl?: string;
  author!: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  commentCount!: number;
  likeCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
