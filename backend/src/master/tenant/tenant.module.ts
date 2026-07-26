import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [TenantController],
  providers: [TenantService],
})
export class TenantModule {}
