import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add this line to allow your Vercel app to communicate with the backend
  app.enableCors({
    origin: '*', // For development. For production, change to your exact Vercel URL
  });

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
