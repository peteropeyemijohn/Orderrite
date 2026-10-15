import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { OtpProvider } from './auth/otp-providers/otp-provider.js';
import { loadEnv } from './config/env.js';

async function bootstrap() {
  const env = loadEnv();
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Behind a hosting proxy (Render), read the real visitor IP from the proxy's header.
  // Locally this is 0, so nobody can fake their IP with a header.
  app.set('trust proxy', env.TRUST_PROXY_HOPS);

  // Only these web addresses may call the API from a browser.
  app.enableCors({
    origin: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
  });
  app.enableShutdownHooks();

  // 0.0.0.0 lets phones on the same Wi-Fi (and hosting platforms) reach the API.
  await app.listen(env.PORT, '0.0.0.0');
  logger.log(`API running on http://localhost:${env.PORT}`);
  const otpProvider = app.get(OtpProvider);
  logger.log(`Sign-in codes: ${otpProvider.name}${otpProvider.canSend ? '' : ' (no SMS provider configured, codes will not be sent)'}`);
  if (env.DEMO_MODE) {
    logger.warn('DEMO_MODE is ON. This must never be enabled in a real launch.');
  }
}
await bootstrap();
