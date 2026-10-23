import { Global, Module } from '@nestjs/common';
import { CitiesService } from './cities.service.js';
import { CountriesService } from './countries.service.js';

@Global()
@Module({
  providers: [CountriesService, CitiesService],
  exports: [CountriesService, CitiesService],
})
export class CountriesModule {}
