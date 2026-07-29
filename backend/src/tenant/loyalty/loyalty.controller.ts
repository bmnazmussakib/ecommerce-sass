import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import {
  UpdateLoyaltySettingDto,
  AdjustPointsDto,
  CalculateRedemptionDto,
} from './dto/loyalty.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - Loyalty Points & Rewards System')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@Controller('api/tenant/loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get loyalty program settings' })
  getSettings() {
    return this.loyaltyService.getSettings();
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('settings')
  @ApiOperation({ summary: 'Update loyalty program settings' })
  updateSettings(@Body() dto: UpdateLoyaltySettingDto) {
    return this.loyaltyService.updateSettings(dto);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get customer loyalty points balance & transaction history' })
  getCustomerBalance(@Param('customerId') customerId: string) {
    return this.loyaltyService.getCustomerBalance(customerId);
  }

  @Post('calculate-discount')
  @ApiOperation({ summary: 'Calculate checkout discount for points redemption' })
  calculateRedemption(@Body() dto: CalculateRedemptionDto) {
    return this.loyaltyService.calculateRedemptionDiscount(
      dto.customerId,
      dto.pointsToRedeem,
    );
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('adjust')
  @ApiOperation({ summary: 'Manual merchant loyalty points adjustment' })
  adjustPoints(@Body() dto: AdjustPointsDto) {
    return this.loyaltyService.adjustPoints(dto);
  }
}
