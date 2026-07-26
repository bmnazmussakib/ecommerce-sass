import { Module } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { BkashService } from './adapters/bkash.service';
import { SslCommerzService } from './adapters/sslcommerz.service';

@Module({
  controllers: [IntegrationController],
  providers: [IntegrationService, BkashService, SslCommerzService],
  exports: [BkashService, SslCommerzService],
})
export class IntegrationModule {}

