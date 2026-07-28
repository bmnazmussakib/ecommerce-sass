import { Controller, Get, Put, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto, ToggleStoreDto } from './dto/settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - Store Settings')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@Controller('api/tenant/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current store settings' })
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get store open/closed status (public — for storefront)' })
  getStoreStatus() {
    return this.settingsService.getStoreStatus();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put()
  @ApiOperation({ summary: 'Update store settings (Admin)' })
  updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(updateSettingsDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Patch('toggle-store')
  @ApiOperation({ summary: 'Enable or disable the store (Owner/Admin only)' })
  toggleStore(@Body() dto: ToggleStoreDto) {
    return this.settingsService.toggleStore(dto);
  }
}
