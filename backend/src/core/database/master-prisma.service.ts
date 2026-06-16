import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/master-client';

@Injectable()
export class MasterPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MasterPrismaService.name);

  constructor(configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('MASTER_DATABASE_URL') || '',
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Master DB connected successfully');
    } catch (err) {
      this.logger.warn(`⚠️ Master DB connection failed: ${(err as Error).message}`);
      this.logger.warn('Server started without DB. Set MASTER_DATABASE_URL in .env file.');
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {
      // silently ignore disconnect errors
    }
  }
}
