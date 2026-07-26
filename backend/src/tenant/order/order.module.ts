import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { DatabaseModule } from '../../core/database/database.module';
import { IntegrationModule } from '../integration/integration.module';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [DatabaseModule, IntegrationModule],
  controllers: [OrderController],
  providers: [OrderService, InvoiceService],
})
export class OrderModule {}

