import { Module } from '@nestjs/common';
import { GlobalThemeService } from './global-theme.service';
import { GlobalThemeController } from './global-theme.controller';
import { MasterPrismaService } from '../../core/database/master-prisma.service';

@Module({
  controllers: [GlobalThemeController],
  providers: [GlobalThemeService, MasterPrismaService],
  exports: [GlobalThemeService],
})
export class GlobalThemeModule {}
