import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCustomDomainDto {
  @ApiProperty({ example: 'store.mybrand.com', description: 'Custom domain or subdomain to bind' })
  @IsString()
  @IsNotEmpty()
  domain!: string;
}
