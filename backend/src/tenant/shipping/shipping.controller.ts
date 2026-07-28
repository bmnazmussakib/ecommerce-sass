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
import {
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
} from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import {
  CreateShippingZoneDto,
  UpdateShippingZoneDto,
  CreateShippingRateDto,
  UpdateShippingRateDto,
} from './dto/shipping.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - Shipping')
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: true })
@UseGuards(JwtAuthGuard)
@Controller('api/tenant/shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  // --- Zones ---

  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  @Post('zones')
  @ApiOperation({ summary: 'Create a shipping zone' })
  createZone(@Body() dto: CreateShippingZoneDto) {
    return this.shippingService.createZone(dto);
  }

  @Get('zones')
  @ApiOperation({ summary: 'Get all shipping zones' })
  findAllZones() {
    return this.shippingService.findAllZones();
  }

  @Get('zones/:id')
  @ApiOperation({ summary: 'Get a shipping zone by id' })
  findOneZone(@Param('id') id: string) {
    return this.shippingService.findOneZone(id);
  }

  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  @Patch('zones/:id')
  @ApiOperation({ summary: 'Update a shipping zone' })
  updateZone(@Param('id') id: string, @Body() dto: UpdateShippingZoneDto) {
    return this.shippingService.updateZone(id, dto);
  }

  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  @Delete('zones/:id')
  @ApiOperation({ summary: 'Delete a shipping zone' })
  removeZone(@Param('id') id: string) {
    return this.shippingService.removeZone(id);
  }

  // --- Rates ---

  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  @Post('rates')
  @ApiOperation({ summary: 'Create a shipping rate' })
  createRate(@Body() dto: CreateShippingRateDto) {
    return this.shippingService.createRate(dto);
  }

  @Get('rates')
  @ApiOperation({ summary: 'Get all shipping rates' })
  findAllRates() {
    return this.shippingService.findAllRates();
  }

  @Get('rates/:id')
  @ApiOperation({ summary: 'Get a shipping rate by id' })
  findOneRate(@Param('id') id: string) {
    return this.shippingService.findOneRate(id);
  }

  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  @Patch('rates/:id')
  @ApiOperation({ summary: 'Update a shipping rate' })
  updateRate(@Param('id') id: string, @Body() dto: UpdateShippingRateDto) {
    return this.shippingService.updateRate(id, dto);
  }

  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  @Delete('rates/:id')
  @ApiOperation({ summary: 'Delete a shipping rate' })
  removeRate(@Param('id') id: string) {
    return this.shippingService.removeRate(id);
  }
}
