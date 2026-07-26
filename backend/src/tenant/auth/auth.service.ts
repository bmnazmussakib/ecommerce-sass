import { Injectable, Inject, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { generateSecret, verify, generateURI } from 'otplib';
import * as qrcode from 'qrcode';

import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { RegisterDto, LoginDto, Verify2FaDto } from './dto/auth.dto';

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

    // If 2FA enabled, enforce verification challenge
    if (staff.twoFactorEnabled) {
      return {
        twoFactorRequired: true,
        email: staff.email,
        message: '2FA token required to complete login',
      };
    }

    return this.generateToken(staff);
  }

  async generate2FactorSecret(userId: string) {
    const staff = await this.prisma.staff.findUnique({ where: { id: userId } });
    if (!staff) throw new NotFoundException('User not found');

    const secret = generateSecret();
    const otpAuthUrl = generateURI({
      secret,
      label: staff.email,
      issuer: 'Ecomize SaaS',
    });


    await this.prisma.staff.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl);

    return {
      secret,
      qrCodeDataUrl,
    };
  }

  async enable2Factor(userId: string, token: string) {
    const staff = await this.prisma.staff.findUnique({ where: { id: userId } });
    if (!staff || !staff.twoFactorSecret) {
      throw new BadRequestException('2FA secret is not generated');
    }

    const isValid = verify({
      token,
      secret: staff.twoFactorSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid OTP token');
    }

    await this.prisma.staff.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return { success: true, message: '2FA enabled successfully' };
  }

  async disable2Factor(userId: string) {
    await this.prisma.staff.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return { success: true, message: '2FA disabled successfully' };
  }

  async verify2FactorLogin(verifyDto: Verify2FaDto) {
    const staff = await this.prisma.staff.findUnique({
      where: { email: verifyDto.email },
    });

    if (!staff || !staff.twoFactorSecret || !staff.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    const isValid = verify({
      token: verifyDto.token,
      secret: staff.twoFactorSecret,
    });


    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP token');
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
        twoFactorEnabled: staff.twoFactorEnabled,
      },
    };
  }
}
