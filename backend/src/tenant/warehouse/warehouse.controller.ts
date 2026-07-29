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
import { WarehouseService } from './warehouse.service';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  SetWarehouseStockDto,
  TransferStockDto,
} from './dto/warehouse.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - Multi-Warehouse Stock Management')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@Controller('api/tenant/warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new warehouse / fulfillment hub' })
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehouseService.create(dto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN', 'STAFF')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Get all warehouses' })
  findAll() {
    return this.warehouseService.findAll();
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN', 'STAFF')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('variant/:variantId')
  @ApiOperation({ summary: 'Get multi-warehouse stock breakdown for a product variant' })
  getVariantStocks(@Param('variantId') variantId: string) {
    return this.warehouseService.getVariantStocks(variantId);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN', 'STAFF')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse details by ID' })
  findOne(@Param('id') id: string) {
    return this.warehouseService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update warehouse details' })
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehouseService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete warehouse' })
  remove(@Param('id') id: string) {
    return this.warehouseService.remove(id);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('stock')
  @ApiOperation({ summary: 'Set variant stock quantity in specific warehouse' })
  setStock(@Body() dto: SetWarehouseStockDto) {
    return this.warehouseService.setStock(dto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('transfer')
  @ApiOperation({ summary: 'Transfer stock between warehouses' })
  transferStock(@Body() dto: TransferStockDto) {
    return this.warehouseService.transferStock(dto);
  }
}
