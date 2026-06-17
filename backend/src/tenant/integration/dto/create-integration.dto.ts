import { IsEnum, IsObject, IsBoolean, IsOptional } from 'class-validator';
import { IntProviderType } from '@prisma/tenant-client';

export class CreateIntegrationDto {
  @IsEnum(IntProviderType)
  provider!: IntProviderType;

  @IsObject()
  keysJson!: object;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
