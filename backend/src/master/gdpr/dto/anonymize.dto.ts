import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnonymizeCustomerDto {
  @ApiProperty({ description: 'The subdomain of the vendor/tenant store' })
  @IsString()
  tenantSubdomain!: string;

  @ApiProperty({ description: 'The email address of the customer to anonymize' })
  @IsEmail()
  customerEmail!: string;
}
