import { IsEnum, IsObject, IsBoolean, IsOptional } from 'class-validator';
import { IntProviderType as PrismaIntProviderType } from '@prisma/tenant-client';

export const IntProviderType = PrismaIntProviderType || {
  BKASH: 'BKASH',
  NAGAD: 'NAGAD',
  PATHAO: 'PATHAO',
  STEADFAST: 'STEADFAST',
  MAILCHIMP: 'MAILCHIMP',
  HOTJAR: 'HOTJAR',
  CLARITY: 'CLARITY',
  FACEBOOK_PIXEL: 'FACEBOOK_PIXEL',
  GOOGLE_ANALYTICS: 'GOOGLE_ANALYTICS',
};

export type IntProviderType = PrismaIntProviderType;

export class CreateIntegrationDto {
  @IsEnum(IntProviderType)
  provider!: PrismaIntProviderType;

  @IsObject()
  keysJson!: object;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
