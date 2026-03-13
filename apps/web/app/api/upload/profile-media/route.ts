import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export const runtime = 'nodejs';

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const kind = (formData.get('kind') as string | null) ?? null;

    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded', error: 'NO_FILE' },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          message: 'File is too large',
          error: 'MAX_SIZE_EXCEEDED',
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          message: 'Invalid file type. Use JPEG, PNG, or WEBP.',
          error: 'INVALID_TYPE',
        },
        { status: 400 },
      );
    }

    const ext =
      file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
        ? 'webp'
        : 'jpg';

    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'company');

    await fs.mkdir(uploadDir, { recursive: true });
    const targetPath = path.join(uploadDir, filename);
    await fs.writeFile(targetPath, buffer);

    // If this is the main company logo, also copy as favicon for the site
    if (kind === 'company-logo') {
      const publicDir = path.join(process.cwd(), 'public');
      await fs.mkdir(publicDir, { recursive: true });
      const faviconPng = path.join(publicDir, 'favicon.png');
      await fs.copyFile(targetPath, faviconPng);
    }

    const url = `/uploads/company/${filename}`;

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error('POST /api/upload/profile-media error', error);
    return NextResponse.json(
      {
        message: 'Failed to upload file',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

