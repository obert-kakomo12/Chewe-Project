import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add this line to allow your Vercel app to communicate with the backend
  app.enableCors({
    origin: '*', // For development. For production, change to your exact Vercel URL
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
