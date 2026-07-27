import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { DatabaseModule } from '../../core/database/database.module';
import { AuthModule as MasterAuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, MasterAuthModule],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
