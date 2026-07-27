import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { SuperJwtAuthGuard } from '../auth/super-jwt-auth.guard';

@ApiTags('Master Administration - Tenants')
@ApiBearerAuth()
@UseGuards(SuperJwtAuthGuard)
@Controller('api/master/tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully.' })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tenant by ID' })
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Post(':id/impersonate')
  @ApiOperation({ summary: 'Impersonate a tenant (View-as-Vendor)' })
  impersonate(@Param('id') id: string) {
    return this.tenantService.impersonate(id);
  }

  @Get(':id/store-data/products')
  @ApiOperation({ summary: 'Get all products of a specific tenant (Super Admin)' })
  getProducts(@Param('id') id: string) {
    return this.tenantService.getTenantProducts(id);
  }

  @Get(':id/store-data/orders')
  @ApiOperation({ summary: 'Get all orders of a specific tenant (Super Admin)' })
  getOrders(@Param('id') id: string) {
    return this.tenantService.getTenantOrders(id);
  }

  @Get(':id/store-data/staff')
  @ApiOperation({ summary: 'Get all staff members of a specific tenant (Super Admin)' })
  getStaff(@Param('id') id: string) {
    return this.tenantService.getTenantStaff(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tenant' })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tenant' })
  remove(@Param('id') id: string) {
    return this.tenantService.remove(id);
  }
}
