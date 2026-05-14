import {
  Controller, Post, UseInterceptors, UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        const allowed = /\.(pdf|zip|png|jpg|jpeg|gif|webp|sketch)$/i;
        allowed.test(extname(file.originalname)) ? cb(null, true) : cb(new BadRequestException(`File type not allowed`), false);
      },
    }),
  )
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('No files uploaded');
    const base = `http://localhost:${process.env.PORT || 3001}`;
    return {
      files: files.map((f) => ({
        name: f.originalname,
        url: `${base}/uploads/${f.filename}`,
        size: f.size,
        type: f.mimetype,
      })),
    };
  }
}
