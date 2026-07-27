import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, Verify2FaDto, Enable2FaDto } from './dto/auth.dto';
import { SuperJwtAuthGuard } from './super-jwt-auth.guard';
import * as express from 'express';

@ApiTags('Master Administration - Auth')
@Controller('api/master/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Super Admin Login' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('2fa/verify')
  @ApiOperation({ summary: 'Verify 2FA to complete Super Admin login' })
  verify2Fa(@Body() verifyDto: Verify2FaDto) {
    return this.authService.verify2FactorLogin(verifyDto);
  }

  @ApiBearerAuth()
  @UseGuards(SuperJwtAuthGuard)
  @Post('2fa/generate')
  @ApiOperation({ summary: 'Generate 2FA secret for Super Admin' })
  generate2Fa(@Req() req: express.Request & { user: any }) {
    return this.authService.generate2FactorSecret(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(SuperJwtAuthGuard)
  @Post('2fa/enable')
  @ApiOperation({ summary: 'Enable 2FA for Super Admin' })
  enable2Fa(@Req() req: express.Request & { user: any }, @Body() enableDto: Enable2FaDto) {
    return this.authService.enable2Factor(req.user.id, enableDto.token);
  }

  @ApiBearerAuth()
  @UseGuards(SuperJwtAuthGuard)
  @Post('2fa/disable')
  @ApiOperation({ summary: 'Disable 2FA for Super Admin' })
  disable2Fa(@Req() req: express.Request & { user: any }) {
    return this.authService.disable2Factor(req.user.id);
  }
}

