import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { DatabaseModule } from '../../core/database/database.module';
import { IntegrationModule } from '../integration/integration.module';

@Module({
  imports: [DatabaseModule, IntegrationModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}
