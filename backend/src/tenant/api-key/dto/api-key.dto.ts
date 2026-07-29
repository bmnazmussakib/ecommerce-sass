import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({ example: 'Zapier Integration Key' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 100, description: 'Requests per minute allowed for this key', default: 100 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  rateLimit?: number;
}

export class UpdateApiKeyDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, description: 'Requests per minute allowed' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  rateLimit?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
