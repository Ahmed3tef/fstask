import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(MainModule);
  const configService = app.get(ConfigService);

  // Enable CORS for frontend (Next.js dev server on port 3000)
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const port = configService.get<number>('PORT') ?? 4000;
  await app.listen(port);
}
bootstrap();
