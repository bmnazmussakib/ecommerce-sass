import { Module } from '@nestjs/common';
import { CustomDomainService } from './custom-domain.service';
import { CustomDomainController } from './custom-domain.controller';

@Module({
  controllers: [CustomDomainController],
  providers: [CustomDomainService],
  exports: [CustomDomainService],
})
export class CustomDomainModule {}
