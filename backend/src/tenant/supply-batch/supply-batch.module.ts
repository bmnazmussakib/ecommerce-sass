import { Module } from '@nestjs/common';
import { SupplyBatchService } from './supply-batch.service';
import { SupplyBatchController } from './supply-batch.controller';

@Module({
  controllers: [SupplyBatchController],
  providers: [SupplyBatchService],
  exports: [SupplyBatchService],
})
export class SupplyBatchModule {}
