import { Module } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { BkashService } from './adapters/bkash.service';

@Module({
  controllers: [IntegrationController],
  providers: [IntegrationService, BkashService],
  exports: [BkashService],
})
export class IntegrationModule {}
