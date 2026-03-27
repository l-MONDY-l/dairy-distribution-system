import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { extname, join } from 'path';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];
const IMAGE_ONLY_MIMES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

@Controller('uploads')
export class UploadsController {
  @Post('kyc')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
          cb(new Error('Allowed: images (JPEG, PNG, GIF, WebP) or PDF'), false);
          return;
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), 'uploads', 'kyc');
          mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '.bin';
          const name = `${randomUUID()}${ext}`;
          cb(null, name);
        },
      }),
    }),
  )
  uploadKyc(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const url = `/uploads/kyc/${file.filename}`;
    return { url };
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!IMAGE_ONLY_MIMES.includes(file.mimetype)) {
          cb(new Error('Allowed: JPEG, PNG, GIF, WebP only'), false);
          return;
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), 'uploads', 'products');
          mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '.jpg';
          const name = `${randomUUID()}${ext}`;
          cb(null, name);
        },
      }),
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const url = `/uploads/products/${file.filename}`;
    return { url };
  }
}
