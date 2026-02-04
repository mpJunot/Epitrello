import {
  Controller,
  Post,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Request } from 'express';

const AVATARS_DIR = 'uploads/avatars';
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function getExtension(mimetype: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return map[mimetype] ?? 'jpg';
}

/**
 * Upload controller: saves files and returns public URLs.
 * Avatar is only applied to the user when they save the profile form (updateUser).
 */
@Controller('api/upload')
export class UploadController {
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
          cb(new BadRequestException('Invalid file type. Use JPEG, PNG, GIF or WebP.'), false);
          return;
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dest = join(process.cwd(), AVATARS_DIR);
          if (!existsSync(dest)) {
            mkdirSync(dest, { recursive: true });
          }
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const user = (req as Request & { user?: { id: string } }).user;
          const userId = user?.id ?? 'anon';
          const ext = getExtension(file.mimetype);
          const name = `${userId}-${Date.now()}.${ext}`;
          cb(null, name);
        },
      }),
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request & { user?: { id: string } },
  ): Promise<{ url: string }> {
    const user = req.user;
    if (!user?.id) {
      throw new UnauthorizedException('Authentication required');
    }
    if (!file) {
      throw new BadRequestException('No file uploaded. Use form field "avatar".');
    }
    const baseUrl = process.env.API_PUBLIC_URL ?? `${req.protocol}://${req.get('host')}`;
    const relativePath = `/${AVATARS_DIR}/${file.filename}`;
    const url = `${baseUrl}${relativePath}`;
    return { url };
  }
}
