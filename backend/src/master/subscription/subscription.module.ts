import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { DatabaseModule } from '../../core/database/database.module';
import { AuthModule as MasterAuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, MasterAuthModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
