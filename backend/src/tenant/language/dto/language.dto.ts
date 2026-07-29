import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLanguageDto {
  @ApiProperty({ example: 'bn', description: 'ISO 639-1 language code (e.g. en, bn, es, ar)' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Bengali' })
  @IsString()
  name!: string;

  @ApiProperty({ example: false, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: { cart: 'ঝুড়ি', checkout: 'চেকআউট', buy_now: 'এখনই কিনুন' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  translations?: Record<string, string>;
}

export class UpdateLanguageDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpsertTranslationDto {
  @ApiProperty({
    example: { cart: 'ঝুড়ি', checkout: 'চেকআউট', search: 'সন্ধান করুন' },
    description: 'Key-value dictionary mapping UI keys to localized strings',
  })
  @IsObject()
  translations!: Record<string, string>;
}
