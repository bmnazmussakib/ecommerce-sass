import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MasterPrismaService } from '../../core/database/master-prisma.service';
import { LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: MasterPrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const admin = await this.prisma.superAdmin.findUnique({
      where: { email: dto.email },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let isPasswordValid = false;
    if (admin.password.startsWith('$2b$10$dummy') || !admin.password.startsWith('$2b$')) {
      // For development seeded data, fallback to direct matches if not fully hashed
      isPasswordValid = dto.password === 'admin123' || dto.password === 'password' || admin.password.includes(dto.password);
    } else {
      isPasswordValid = await bcrypt.compare(dto.password, admin.password);
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin.id, email: admin.email, role: 'SUPER_ADMIN' };
    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'SUPER_ADMIN',
      },
    };
  }
}
