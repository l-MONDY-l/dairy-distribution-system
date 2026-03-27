import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = Number(process.env.PORT) || 3001;
  try {
    await app.listen(port);
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException;
    if (e?.code === 'EADDRINUSE') {
      const logger = new Logger('Bootstrap');
      logger.error(
        `Port ${port} is already in use. Another server may still be running, or another app is bound to this port.`,
      );
      logger.error(
        `Stop the other process, then start again. Or set PORT to a free port and update API_SERVER_URL / NEXT_PUBLIC_API_BASE_URL in the web app.`,
      );
      logger.error(
        `Windows: netstat -ano | findstr :${port}  →  note the PID in the last column  →  taskkill /PID <pid> /F`,
      );
      process.exit(1);
    }
    throw err;
  }
}
bootstrap();