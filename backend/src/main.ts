import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Hardening
  app.enableCors({
    origin: ['http://localhost:5000', 'http://localhost:5173', 'https://ctschool.vercel.app', 'https://chewetech.com'],
    credentials: true,
  });

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
