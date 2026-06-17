import { PartialType } from '@nestjs/mapped-types';
import { CreateIntegrationDto } from './create-integration.dto';
import { IsJSON, IsObject, IsBoolean, IsOptional } from 'class-validator';

export class UpdateIntegrationDto extends PartialType(CreateIntegrationDto) {
  @IsObject()
  @IsOptional()
  keysJson?: object;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
