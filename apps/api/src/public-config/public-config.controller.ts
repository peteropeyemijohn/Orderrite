import { Controller, Get, Inject } from '@nestjs/common';
import { DEMO_ACCOUNTS, DEMO_OTP_CODE } from '../auth/demo-accounts.js';
import { Public } from '../common/decorators/public.decorator.js';
import { ENV, type Env } from '../config/env.js';
import { CountriesService } from '../countries/countries.service.js';

/**
 * GET /config/public: settings the apps need before sign-in, e.g. the
 * default country's dialling code, and (in DEMO_MODE only) the demo details.
 */
@Controller('config')
export class PublicConfigController {
  constructor(
    private readonly countries: CountriesService,
    @Inject(ENV) private readonly env: Pick<Env, 'DEMO_MODE'>,
  ) {}

  @Public()
  @Get('public')
  async getPublicConfig() {
    return {
      defaultCountry: await this.countries.getDefault(),
      demo: this.env.DEMO_MODE
        ? { code: DEMO_OTP_CODE, accounts: DEMO_ACCOUNTS.map(({ phone, role, name }) => ({ phone, role, name })) }
        : null,
    };
  }
}
