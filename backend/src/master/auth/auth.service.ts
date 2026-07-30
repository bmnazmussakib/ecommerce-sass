import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MasterPrismaService } from '../../core/database/master-prisma.service';
import { LoginDto, Verify2FaDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { generateSecret, verify, generateURI } from 'otplib';
import * as qrcode from 'qrcode';

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

    const isPasswordValid = await bcrypt.compare(dto.password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (admin.twoFactorEnabled) {
      return {
        twoFactorRequired: true,
        email: admin.email,
        message: '2FA token required to complete Super Admin login',
      };
    }

    return this.generateToken(admin);
  }

  async generate2FactorSecret(adminId: string) {
    const admin = await this.prisma.superAdmin.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Super Admin not found');

    const secret = generateSecret();
    const otpAuthUrl = generateURI({
      secret,
      label: admin.email,
      issuer: 'Ecomize Master Admin',
    });

    await this.prisma.superAdmin.update({
      where: { id: adminId },
      data: { twoFactorSecret: secret },
    });

    const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl);

    return {
      secret,
      qrCodeDataUrl,
    };
  }

  async enable2Factor(adminId: string, token: string) {
    const admin = await this.prisma.superAdmin.findUnique({ where: { id: adminId } });
    if (!admin || !admin.twoFactorSecret) {
      throw new BadRequestException('2FA secret is not generated');
    }

    const isValid = verify({
      token,
      secret: admin.twoFactorSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid OTP token');
    }

    await this.prisma.superAdmin.update({
      where: { id: adminId },
      data: { twoFactorEnabled: true },
    });

    return { success: true, message: '2FA enabled successfully for Super Admin' };
  }

  async disable2Factor(adminId: string) {
    await this.prisma.superAdmin.update({
      where: { id: adminId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return { success: true, message: '2FA disabled successfully for Super Admin' };
  }

  async verify2FactorLogin(verifyDto: Verify2FaDto) {
    const admin = await this.prisma.superAdmin.findUnique({
      where: { email: verifyDto.email },
    });

    if (!admin || !admin.twoFactorSecret || !admin.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this Super Admin');
    }

    const isValid = verify({
      token: verifyDto.token,
      secret: admin.twoFactorSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP token');
    }

    return this.generateToken(admin);
  }

  private generateToken(admin: any) {
    const payload = { sub: admin.id, email: admin.email, role: 'SUPER_ADMIN' };
    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'SUPER_ADMIN',
        twoFactorEnabled: admin.twoFactorEnabled,
      },
    };
  }
}

