import { Module } from '@nestjs/common';
import { GdprService } from './gdpr.service';
import { GdprController } from './gdpr.controller';
import { MasterPrismaService } from '../../core/database/master-prisma.service';

@Module({
  controllers: [GdprController],
  providers: [GdprService, MasterPrismaService],
  exports: [GdprService],
})
export class GdprModule {}
