import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { SupplyBatchService } from './supply-batch.service';
import { CreateSupplyBatchDto, UpdateSupplyBatchDto } from './dto/supply-batch.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - Supply Batches')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/tenant/supply-batches')
export class SupplyBatchController {
  constructor(private readonly supplyBatchService: SupplyBatchService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a supply batch (stock entry)' })
  create(@Body() createSupplyBatchDto: CreateSupplyBatchDto) {
    return this.supplyBatchService.create(createSupplyBatchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all supply batches' })
  findAll() {
    return this.supplyBatchService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supply batch by ID' })
  findOne(@Param('id') id: string) {
    return this.supplyBatchService.findOne(id);
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a supply batch' })
  update(@Param('id') id: string, @Body() updateSupplyBatchDto: UpdateSupplyBatchDto) {
    return this.supplyBatchService.update(id, updateSupplyBatchDto);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete a supply batch' })
  remove(@Param('id') id: string) {
    return this.supplyBatchService.remove(id);
  }

  @Get('variants/:variantId/costing')
  @ApiOperation({ summary: 'Get average costing for a variant' })
  getCosting(@Param('variantId') variantId: string) {
    return this.supplyBatchService.getCosting(variantId);
  }
}
