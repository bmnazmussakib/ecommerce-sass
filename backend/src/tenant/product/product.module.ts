import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { DatabaseModule } from '../../core/database/database.module';
import { BullModule } from '@nestjs/bullmq';
import { CsvParserProcessor } from './jobs/csv-parser.processor';
import { MasterPrismaService } from '../../core/database/master-prisma.service';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: 'csv-import',
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService, CsvParserProcessor, MasterPrismaService],
})
export class ProductModule {}

