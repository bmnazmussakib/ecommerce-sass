import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGlobalThemeDto {
  @ApiProperty({ description: 'Theme display name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Unique code identifier (e.g. classic, dark-premium)' })
  @IsString()
  codeIdentifier!: string;

  @ApiProperty({ description: 'Preview image or page URL' })
  @IsString()
  previewUrl!: string;

  @ApiProperty({ description: 'Is the theme active/selectable', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateGlobalThemeDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  codeIdentifier?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  previewUrl?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
