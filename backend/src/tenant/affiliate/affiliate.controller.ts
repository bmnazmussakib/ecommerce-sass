import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { AffiliateService } from './affiliate.service';
import {
  CreateAffiliatePartnerDto,
  UpdateAffiliatePartnerDto,
  CreatePayoutDto,
} from './dto/affiliate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - Affiliate & Referral System')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@Controller('api/tenant/affiliates')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Get('validate/:code')
  @ApiOperation({ summary: 'Validate affiliate referral code (Public)' })
  validateCode(@Param('code') code: string) {
    return this.affiliateService.validateCode(code);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('stats')
  @ApiOperation({ summary: 'Get affiliate system analytics' })
  getStats() {
    return this.affiliateService.getStats();
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Register a new affiliate partner' })
  createPartner(@Body() dto: CreateAffiliatePartnerDto) {
    return this.affiliateService.createPartner(dto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Get all affiliate partners' })
  findAllPartners() {
    return this.affiliateService.findAllPartners();
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('conversions')
  @ApiOperation({ summary: 'Get all referral conversions' })
  getConversions(@Query('affiliateId') affiliateId?: string) {
    return this.affiliateService.getConversions(affiliateId);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('payouts')
  @ApiOperation({ summary: 'Process payout to an affiliate partner' })
  createPayout(@Body() dto: CreatePayoutDto) {
    return this.affiliateService.createPayout(dto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('payouts')
  @ApiOperation({ summary: 'Get payout history' })
  getPayouts(@Query('affiliateId') affiliateId?: string) {
    return this.affiliateService.getPayouts(affiliateId);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get affiliate partner details by ID' })
  findOnePartner(@Param('id') id: string) {
    return this.affiliateService.findOnePartner(id);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update affiliate partner details' })
  updatePartner(@Param('id') id: string, @Body() dto: UpdateAffiliatePartnerDto) {
    return this.affiliateService.updatePartner(id, dto);
  }
}
