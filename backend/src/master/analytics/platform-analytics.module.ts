import { Module } from '@nestjs/common';
import { PlatformAnalyticsService } from './platform-analytics.service';
import { PlatformAnalyticsController } from './platform-analytics.controller';
import { MasterPrismaService } from '../../core/database/master-prisma.service';

@Module({
  controllers: [PlatformAnalyticsController],
  providers: [PlatformAnalyticsService, MasterPrismaService],
  exports: [PlatformAnalyticsService],
})
export class PlatformAnalyticsModule {}
