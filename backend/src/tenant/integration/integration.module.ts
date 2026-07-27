import { Module } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { BkashService } from './adapters/bkash.service';
import { SslCommerzService } from './adapters/sslcommerz.service';
import { SteadfastService } from './adapters/steadfast.service';
import { PathaoService } from './adapters/pathao.service';

@Module({
  controllers: [IntegrationController],
  providers: [
    IntegrationService,
    BkashService,
    SslCommerzService,
    SteadfastService,
    PathaoService,
  ],
  exports: [BkashService, SslCommerzService, SteadfastService, PathaoService],
})
export class IntegrationModule {}


