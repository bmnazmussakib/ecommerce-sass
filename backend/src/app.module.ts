import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from './core/database/database.module';
import { MasterModule } from './master/master.module';
import { TenantModule } from './tenant/tenant.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantResolverMiddleware } from './core/middleware/tenant-resolver.middleware';
import { TrafficThrottleMiddleware } from './core/middleware/traffic-throttle.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // Max 100 requests per minute per client
    }]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    MasterModule,
    TenantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantResolverMiddleware)
      .forRoutes('*');

    consumer
      .apply(TrafficThrottleMiddleware)
      .forRoutes('api/tenant/*');
  }
}

