import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { PopupCampaignService } from './popup-campaign.service';
import {
  CreatePopupCampaignDto,
  UpdatePopupCampaignDto,
} from './dto/popup-campaign.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - Popup Campaigns & Exit Intent')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@Controller('api/tenant/popups')
export class PopupCampaignController {
  constructor(private readonly popupService: PopupCampaignService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get active popup campaigns for storefront widget (Public)' })
  findActive() {
    return this.popupService.findActive();
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Create a popup campaign' })
  create(@Body() dto: CreatePopupCampaignDto) {
    return this.popupService.create(dto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Get all popup campaigns' })
  findAll() {
    return this.popupService.findAll();
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get popup campaign by ID' })
  findOne(@Param('id') id: string) {
    return this.popupService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a popup campaign' })
  update(@Param('id') id: string, @Body() dto: UpdatePopupCampaignDto) {
    return this.popupService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a popup campaign' })
  remove(@Param('id') id: string) {
    return this.popupService.remove(id);
  }
}
