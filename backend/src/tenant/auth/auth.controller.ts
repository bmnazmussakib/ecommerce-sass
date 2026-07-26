import { Controller, Post, Body, UseGuards, Req, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, Enable2FaDto, Verify2FaDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Tenant - Staff Auth')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@Controller('api/tenant/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new staff member' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login staff member' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('2fa/generate')
  @ApiOperation({ summary: 'Generate 2FA Secret and QR Code' })
  generate2FaSecret(@Req() req: any) {
    return this.authService.generate2FactorSecret(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('2fa/enable')
  @ApiOperation({ summary: 'Enable 2FA using OTP token' })
  enable2Fa(@Req() req: any, @Body() body: Enable2FaDto) {
    return this.authService.enable2Factor(req.user.id, body.token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('2fa/disable')
  @ApiOperation({ summary: 'Disable 2FA' })
  disable2Fa(@Req() req: any) {
    return this.authService.disable2Factor(req.user.id);
  }

  @Post('2fa/verify')
  @ApiOperation({ summary: 'Verify 2FA token to complete login challenge' })
  verify2Fa(@Body() body: Verify2FaDto) {
    return this.authService.verify2FactorLogin(body);
  }
}
