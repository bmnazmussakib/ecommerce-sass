import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { CaptchaService } from './captcha.service';
import { UpdateCaptchaSettingDto, VerifyCaptchaDto } from './dto/captcha.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - CAPTCHA & Bot Protection')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@Controller('api/tenant/captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get active CAPTCHA settings & site key (Public Storefront)' })
  async getPublicSettings() {
    const settings = await this.captchaService.getSettings();
    return {
      provider: settings.provider,
      siteKey: settings.siteKey,
      enableOnLogin: settings.enableOnLogin,
      enableOnCheckout: settings.enableOnCheckout,
      enableOnContactForm: settings.enableOnContactForm,
      isEnabled: settings.isEnabled,
    };
  }

  @Get('math')
  @ApiOperation({ summary: 'Get zero-dependency Math CAPTCHA challenge (Public Storefront)' })
  getMathChallenge() {
    return this.captchaService.generateMathCaptcha();
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify CAPTCHA token/answer (Public Storefront)' })
  async verify(@Body() dto: VerifyCaptchaDto) {
    const isValid = await this.captchaService.verify(dto);
    return { success: isValid };
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('settings')
  @ApiOperation({ summary: 'Update CAPTCHA configuration & keys (Admin)' })
  updateSettings(@Body() dto: UpdateCaptchaSettingDto) {
    return this.captchaService.updateSettings(dto);
  }
}
