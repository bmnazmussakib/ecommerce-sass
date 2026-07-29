import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSocialSettingDto {
  @ApiProperty({ example: 'https://facebook.com/mystore', required: false })
  @IsString()
  @IsOptional()
  facebookUrl?: string;

  @ApiProperty({ example: 'https://instagram.com/mystore', required: false })
  @IsString()
  @IsOptional()
  instagramUrl?: string;

  @ApiProperty({ example: 'https://twitter.com/mystore', required: false })
  @IsString()
  @IsOptional()
  twitterUrl?: string;

  @ApiProperty({ example: '+8801700000000', required: false })
  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @ApiProperty({ example: 'https://youtube.com/@mystore', required: false })
  @IsString()
  @IsOptional()
  youtubeUrl?: string;

  @ApiProperty({ example: 'https://linkedin.com/company/mystore', required: false })
  @IsString()
  @IsOptional()
  linkedinUrl?: string;

  @ApiProperty({ example: 'https://pinterest.com/mystore', required: false })
  @IsString()
  @IsOptional()
  pinterestUrl?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  enableShareButtons?: boolean;

  @ApiProperty({ example: 'Check out this awesome product!', required: false })
  @IsString()
  @IsOptional()
  autoShareMessage?: string;
}
