import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingStaff = await this.prisma.staff.findUnique({
      where: { email: registerDto.email },
    });

    if (existingStaff) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const staff = await this.prisma.staff.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        role: registerDto.role || 'STAFF',
      },
    });

    return this.generateToken(staff);
  }

  async login(loginDto: LoginDto) {
    const staff = await this.prisma.staff.findUnique({
      where: { email: loginDto.email },
    });

    if (!staff || !staff.status) {
      throw new UnauthorizedException('Invalid credentials or account inactive');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, staff.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(staff);
  }

  private generateToken(staff: any) {
    const payload = { sub: staff.id, email: staff.email, role: staff.role };
    return {
      access_token: this.jwtService.sign(payload),
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    };
  }
}
