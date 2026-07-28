import { IsString, IsOptional, IsHexColor, IsObject, IsBoolean } from 'class-validator';
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

  @ApiProperty({ description: 'Tax rate percentage', required: false })
  @IsOptional()
  taxRate?: number;

  @ApiProperty({ description: 'Custom CSS', required: false })
  @IsString()
  @IsOptional()
  customCss?: string;

  @ApiProperty({ description: 'Custom JS', required: false })
  @IsString()
  @IsOptional()
  customJs?: string;

  @ApiProperty({ description: 'Store open/closed toggle', required: false })
  @IsBoolean()
  @IsOptional()
  isStoreOpen?: boolean;

  @ApiProperty({ description: 'Message shown to customers when store is closed', required: false })
  @IsString()
  @IsOptional()
  maintenanceMessage?: string;
}

export class ToggleStoreDto {
  @ApiProperty({ description: 'true = open, false = closed', example: false })
  @IsBoolean()
  isStoreOpen!: boolean;

  @ApiProperty({ description: 'Message shown when closed', required: false, example: "We are closed for maintenance. Back at 9AM!" })
  @IsString()
  @IsOptional()
  maintenanceMessage?: string;
}
