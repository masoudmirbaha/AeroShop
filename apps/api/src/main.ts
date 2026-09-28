import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { API_PREFIX } from '@aeroshop/shared';
import { AppModule } from './app.module.js';
import type { Env } from './config/env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.setGlobalPrefix(API_PREFIX);
  app.enableCors({
    origin: config.get('WEB_URL', { infer: true }),
    credentials: true,
  });
  app.enableShutdownHooks();

  await app.listen(config.get('PORT', { infer: true }));
}
await bootstrap();
