import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@ecomize.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password!: string;
}

export class Verify2FaDto {
  @ApiProperty({ example: 'admin@ecomize.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  token!: string;
}

export class Enable2FaDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  token!: string;
}

