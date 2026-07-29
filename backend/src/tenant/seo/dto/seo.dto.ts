import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertSeoSettingDto {
  @ApiProperty({ example: '/about', description: 'Relative path of the page' })
  @IsString()
  pagePath!: string;

  @ApiProperty({ example: 'About Us | My Store' })
  @IsString()
  metaTitle!: string;

  @ApiProperty({ example: 'Learn more about our store mission and values.', required: false })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiProperty({ example: 'ecommerce, store, about us', required: false })
  @IsString()
  @IsOptional()
  metaKeywords?: string;

  @ApiProperty({ example: 'About My Store', required: false })
  @IsString()
  @IsOptional()
  ogTitle?: string;

  @ApiProperty({ example: 'Discover our story and mission.', required: false })
  @IsString()
  @IsOptional()
  ogDescription?: string;

  @ApiProperty({ example: 'https://example.com/images/og-about.jpg', required: false })
  @IsString()
  @IsOptional()
  ogImage?: string;

  @ApiProperty({ example: 'https://example.com/about', required: false })
  @IsString()
  @IsOptional()
  canonicalUrl?: string;

  @ApiProperty({ example: false, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  noIndex?: boolean;
}
