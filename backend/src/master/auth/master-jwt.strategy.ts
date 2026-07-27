import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class MasterJwtStrategy extends PassportStrategy(Strategy, 'super-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: any) {
    if (payload.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Access denied. Super Admin role required.');
    }
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
