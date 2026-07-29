import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { UpdateSocialSettingDto } from './dto/social.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - Social Media & Auto-Sharing')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@Controller('api/tenant/social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get()
  @ApiOperation({ summary: 'Get store social profile links & sharing settings (Public)' })
  getSettings() {
    return this.socialService.getSettings();
  }

  @Get('share-links')
  @ApiOperation({ summary: 'Generate social sharing links for a target URL (Public)' })
  generateShareLinks(
    @Query('url') url: string,
    @Query('title') title?: string,
    @Query('message') message?: string,
    @Req() req?: any,
  ) {
    const host = req?.headers['host'] || 'localhost:3000';
    const protocol = req?.protocol || 'http';
    const targetUrl = url || `${protocol}://${host}`;
    return this.socialService.generateShareUrls(targetUrl, title, message);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch()
  @ApiOperation({ summary: 'Update store social profile links and sharing configuration' })
  updateSettings(@Body() dto: UpdateSocialSettingDto) {
    return this.socialService.updateSettings(dto);
  }
}
