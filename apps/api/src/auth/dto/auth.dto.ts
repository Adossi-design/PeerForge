import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(3)
  username!: string;

  @IsNotEmpty()
  fullName!: string;

  @IsOptional()
  university?: string;

  @IsOptional()
  country?: string;
}

export class OnboardingDto {
  @IsNotEmpty()
  skills!: string[]; // skill IDs

  @IsOptional()
  bio?: string;

  @IsOptional()
  avatarUrl?: string;

  @IsOptional()
  githubUrl?: string;

  @IsOptional()
  portfolioUrl?: string;
}

export class AuthDto {
  @IsNotEmpty()
  clerkId!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  username!: string;

  @IsNotEmpty()
  fullName!: string;
}
