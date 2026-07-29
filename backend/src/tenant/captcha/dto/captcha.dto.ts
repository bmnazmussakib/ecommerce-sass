import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CaptchaProvider {
  RECAPTCHA_V2 = 'RECAPTCHA_V2',
  RECAPTCHA_V3 = 'RECAPTCHA_V3',
  TURNSTILE = 'TURNSTILE',
  MATH = 'MATH',
}

export class UpdateCaptchaSettingDto {
  @ApiProperty({ enum: CaptchaProvider, default: CaptchaProvider.MATH })
  @IsEnum(CaptchaProvider)
  @IsOptional()
  provider?: CaptchaProvider;

  @ApiProperty({ example: '6Ld...', required: false })
  @IsString()
  @IsOptional()
  siteKey?: string;

  @ApiProperty({ example: '6Ld_secret...', required: false })
  @IsString()
  @IsOptional()
  secretKey?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  enableOnLogin?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  enableOnCheckout?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  enableOnContactForm?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}

export class VerifyCaptchaDto {
  @ApiProperty({ example: 'eyJhbGciOi...', description: 'Math captcha token or reCAPTCHA response token' })
  @IsString()
  captchaToken!: string;

  @ApiProperty({ example: '12', required: false, description: 'Answer for Math CAPTCHA equation' })
  @IsString()
  @IsOptional()
  captchaAnswer?: string;
}
