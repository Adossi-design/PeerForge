import {
  Controller, Post, UseInterceptors, UploadedFiles,
  BadRequestException, UnauthorizedException, Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AuthenticatedRequest } from '@/common/auth-request';

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
  uploadFiles(@UploadedFiles() files: Express.Multer.File[], @Req() req: AuthenticatedRequest) {
    if (!req.user?.id) throw new UnauthorizedException('User not authenticated');
    if (!files?.length) throw new BadRequestException('No files uploaded');
    // Prefer an explicit PUBLIC_API_URL so generated URLs work in production.
    // Fall back to the request's own host/proto for local dev.
    const base =
      process.env.PUBLIC_API_URL ||
      `${req.protocol}://${req.get('host')}`;
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
