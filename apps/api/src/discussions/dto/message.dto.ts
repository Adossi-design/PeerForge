import { IsNotEmpty, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  codeLanguage?: string;

  @IsOptional()
  codeContent?: string;

  @IsOptional()
  codeFilename?: string;
}

export class MessageResponseDto {
  id!: string;
  content!: string;
  author!: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt!: Date;
  isEdited!: boolean;
}
