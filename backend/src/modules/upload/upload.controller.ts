import {
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { Request } from 'express';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { StorageService } from './storage.service';

const AVATARS_DIR = 'uploads/avatars';
const BACKGROUNDS_DIR = 'uploads/backgrounds';
export const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function getExtension(mimetype: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return map[mimetype] ?? 'jpg';
}

/** Used by FileInterceptor to reject non-image uploads. Exported for tests. */
export function createImageFileFilter(): (
  _req: unknown,
  file: Express.Multer.File,
  cb: (err: Error | null, accept: boolean) => void,
) => void {
  return (_req: unknown, file: Express.Multer.File, cb: (err: Error | null, accept: boolean) => void) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      cb(
        new BadRequestException('Invalid file type. Use JPEG, PNG, GIF or WebP.'),
        false,
      );
      return;
    }
    cb(null, true);
  };
}

/**
 * Upload controller: saves files to Google Cloud Storage (or disk when GCS not configured)
 * and returns public URLs. Used for avatar, board/card background images.
 * Protected by JWT (Bearer or cookie auth_token); same auth as GraphQL.
 */
@Controller('api/upload')
@UseGuards(GqlAuthGuard)
export class UploadController {
  constructor(private readonly storage: StorageService) {}

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      fileFilter: createImageFileFilter(),
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
    const ext = getExtension(file.mimetype);
    const filename = `${user.id}-${Date.now()}.${ext}`;

    if (this.storage.isGcsEnabled()) {
      const url = await this.storage.uploadToGcs(
        file.buffer,
        'avatars',
        filename,
        file.mimetype,
      );
      return { url };
    }

    const dest = join(process.cwd(), AVATARS_DIR);
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    const filepath = join(dest, filename);
    writeFileSync(filepath, file.buffer);
    const baseUrl =
      process.env.API_PUBLIC_URL ?? `${req.protocol}://${req.get('host')}`;
    return { url: `${baseUrl}/${AVATARS_DIR}/${filename}` };
  }

  @Post('background')
  @UseInterceptors(
    FileInterceptor('background', {
      storage: memoryStorage(),
      fileFilter: createImageFileFilter(),
    }),
  )
  async uploadBackground(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request & { user?: { id: string } },
  ): Promise<{ url: string }> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Authentication required');
    }
    if (!file) {
      throw new BadRequestException('No file uploaded. Use form field "background".');
    }
    const ext = getExtension(file.mimetype);
    const filename = `background-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    if (this.storage.isGcsEnabled()) {
      const url = await this.storage.uploadToGcs(
        file.buffer,
        'backgrounds',
        filename,
        file.mimetype,
      );
      return { url };
    }

    const dest = join(process.cwd(), BACKGROUNDS_DIR);
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    writeFileSync(join(dest, filename), file.buffer);
    const baseUrl =
      process.env.API_PUBLIC_URL ?? `${req.protocol}://${req.get('host')}`;
    return { url: `${baseUrl}/${BACKGROUNDS_DIR}/${filename}` };
  }
}
