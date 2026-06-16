import { IsString, IsEmail, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StaffRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export class LoginDto {
  @ApiProperty({ description: 'Staff email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Staff password' })
  @IsString()
  password!: string;
}

export class RegisterDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ enum: StaffRole, required: false })
  @IsEnum(StaffRole)
  @IsOptional()
  role?: StaffRole;
}
