import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuditLogController } from './audit-log.controller';
import { MasterJwtStrategy } from './master-jwt.strategy';
import { DatabaseModule } from '../../core/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'super-jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController, AuditLogController],
  providers: [AuthService, MasterJwtStrategy],
  exports: [MasterJwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
