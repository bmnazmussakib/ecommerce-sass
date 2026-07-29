import {
  Injectable,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import {
  UpdateCaptchaSettingDto,
  VerifyCaptchaDto,
  CaptchaProvider,
} from './dto/captcha.dto';
import * as crypto from 'crypto';

const HMAC_SECRET = process.env.JWT_SECRET || 'captcha_secret_key_antigravity';

@Injectable()
export class CaptchaService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async getSettings() {
    let settings = await this.prisma.captchaSetting.findFirst();
    if (!settings) {
      settings = await this.prisma.captchaSetting.create({
        data: {
          provider: 'MATH',
          enableOnLogin: false,
          enableOnCheckout: false,
          enableOnContactForm: true,
          isEnabled: true,
        },
      });
    }
    return settings;
  }

  async updateSettings(dto: UpdateCaptchaSettingDto) {
    const settings = await this.getSettings();
    return this.prisma.captchaSetting.update({
      where: { id: settings.id },
      data: dto,
    });
  }

  /**
   * Generate lightweight, zero-dependency Math CAPTCHA equation & HMAC signed token
   */
  generateMathCaptcha() {
    const num1 = Math.floor(Math.random() * 15) + 1;
    const num2 = Math.floor(Math.random() * 15) + 1;
    const answer = num1 + num2;
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    const payload = `${answer}:${expiresAt}`;
    const signature = crypto
      .createHmac('sha256', HMAC_SECRET)
      .update(payload)
      .digest('hex');

    const token = Buffer.from(`${payload}:${signature}`).toString('base64');

    return {
      question: `What is ${num1} + ${num2}?`,
      captchaToken: token,
      expiresAt,
    };
  }

  /**
   * Verify CAPTCHA token for Math, reCAPTCHA, or Turnstile
   */
  async verify(dto: VerifyCaptchaDto): Promise<boolean> {
    const settings = await this.getSettings();
    if (!settings.isEnabled) return true;

    if (settings.provider === CaptchaProvider.MATH || !settings.secretKey) {
      return this.verifyMathCaptcha(dto.captchaToken, dto.captchaAnswer || '');
    }

    if (
      settings.provider === CaptchaProvider.RECAPTCHA_V2 ||
      settings.provider === CaptchaProvider.RECAPTCHA_V3
    ) {
      return this.verifyReCaptcha(settings.secretKey, dto.captchaToken);
    }

    if (settings.provider === CaptchaProvider.TURNSTILE) {
      return this.verifyTurnstile(settings.secretKey, dto.captchaToken);
    }

    return true;
  }

  /**
   * Convenience method to enforce CAPTCHA on specific actions (LOGIN, CHECKOUT, CONTACT)
   */
  async verifyForAction(
    action: 'LOGIN' | 'CHECKOUT' | 'CONTACT',
    captchaToken?: string,
    captchaAnswer?: string,
  ) {
    const settings = await this.getSettings();
    if (!settings.isEnabled) return true;

    if (action === 'LOGIN' && !settings.enableOnLogin) return true;
    if (action === 'CHECKOUT' && !settings.enableOnCheckout) return true;
    if (action === 'CONTACT' && !settings.enableOnContactForm) return true;

    if (!captchaToken) {
      throw new BadRequestException('CAPTCHA token is required for this action');
    }

    const isValid = await this.verify({ captchaToken, captchaAnswer });
    if (!isValid) {
      throw new BadRequestException('CAPTCHA verification failed. Please try again.');
    }

    return true;
  }

  private verifyMathCaptcha(token: string, answerStr: string): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      if (parts.length !== 3) return false;

      const [expectedAnswer, expiresAtStr, signature] = parts;
      if (Date.now() > Number(expiresAtStr)) return false; // Expired

      const payload = `${expectedAnswer}:${expiresAtStr}`;
      const expectedSig = crypto
        .createHmac('sha256', HMAC_SECRET)
        .update(payload)
        .digest('hex');

      if (signature !== expectedSig) return false;

      return String(answerStr).trim() === String(expectedAnswer).trim();
    } catch {
      return false;
    }
  }

  private async verifyReCaptcha(secretKey: string, token: string): Promise<boolean> {
    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: secretKey, response: token }),
      });
      const data = (await response.json()) as { success?: boolean };
      return !!data.success;
    } catch {
      return false;
    }
  }

  private async verifyTurnstile(secretKey: string, token: string): Promise<boolean> {
    try {
      const response = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ secret: secretKey, response: token }),
        },
      );
      const data = (await response.json()) as { success?: boolean };
      return !!data.success;
    } catch {
      return false;
    }
  }
}
