import { Module } from '@nestjs/common';
import { DigitalProductService } from './digital-product.service';
import { DigitalProductController } from './digital-product.controller';
import { DatabaseModule } from '../../core/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DigitalProductController],
  providers: [DigitalProductService],
  exports: [DigitalProductService],
})
export class DigitalProductModule {}
