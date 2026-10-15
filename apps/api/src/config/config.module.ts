import { Global, Module } from '@nestjs/common';
import { ENV, loadEnv } from './env.js';

/** Makes the checked environment settings available everywhere as ENV. */
@Global()
@Module({
  providers: [{ provide: ENV, useFactory: () => loadEnv() }],
  exports: [ENV],
})
export class ConfigModule {}
