import { IsString, IsOptional, IsHexColor, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({ description: 'The name of the store', required: false })
  @IsString()
  @IsOptional()
  storeName?: string;

  @ApiProperty({ description: 'URL for the store logo', required: false })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ description: 'Primary brand color', required: false })
  @IsHexColor()
  @IsOptional()
  brandColor?: string;

  @ApiProperty({ description: 'Theme configuration JSON object', required: false })
  @IsObject()
  @IsOptional()
  themeConfig?: object;

  @ApiProperty({ description: 'Custom CSS', required: false })
  @IsString()
  @IsOptional()
  customCss?: string;

  @ApiProperty({ description: 'Custom JS', required: false })
  @IsString()
  @IsOptional()
  customJs?: string;
}
