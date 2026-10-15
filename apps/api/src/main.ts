import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { loadEnv } from './config/env.js';

async function bootstrap() {
  const env = loadEnv();
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Only these web addresses may call the API from a browser.
  app.enableCors({
    origin: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
  });
  app.enableShutdownHooks();

  // 0.0.0.0 lets phones on the same Wi-Fi (and hosting platforms) reach the API.
  await app.listen(env.PORT, '0.0.0.0');
  logger.log(`API running on http://localhost:${env.PORT}`);
  if (env.DEMO_MODE) {
    logger.warn('DEMO_MODE is ON. This must never be enabled in a real launch.');
  }
}
await bootstrap();
