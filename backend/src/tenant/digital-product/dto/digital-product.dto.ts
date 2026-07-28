import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class SetDigitalFileDto {
  @ApiProperty({ description: 'URL to the digital file (e.g. Cloudinary URL)' })
  @IsString()
  fileUrl!: string;

  @ApiProperty({
    description: 'Mark variant as digital',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;
}

export class DownloadResponseDto {
  @ApiProperty()
  token!: string;

  @ApiProperty()
  fileUrl!: string;

  @ApiProperty()
  variantId!: string;

  @ApiProperty()
  productTitle!: string;

  @ApiProperty()
  expiresAt!: Date;

  @ApiProperty({ required: false })
  downloadedAt?: Date;
}
