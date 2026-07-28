import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { FlashSaleService } from './flash-sale.service';
import { CreateFlashSaleDto, UpdateFlashSaleDto } from './dto/flash-sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - Flash Sales')
@ApiHeader({ name: 'x-tenant-id', required: true })
@Controller('api/tenant/flash-sales')
export class FlashSaleController {
  constructor(private readonly flashSaleService: FlashSaleService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create a new flash sale campaign (Admin)' })
  create(@Body() createFlashSaleDto: CreateFlashSaleDto) {
    return this.flashSaleService.create(createFlashSaleDto);
  }

  @Get()
  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all flash sale campaigns (Admin)' })
  findAll() {
    return this.flashSaleService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active ongoing flash sales (Public API)' })
  findActive() {
    return this.flashSaleService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a flash sale (Public/Admin)' })
  findOne(@Param('id') id: string) {
    return this.flashSaleService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update flash sale details (Admin)' })
  update(@Param('id') id: string, @Body() updateFlashSaleDto: UpdateFlashSaleDto) {
    return this.flashSaleService.update(id, updateFlashSaleDto as any);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete a flash sale campaign (Admin)' })
  remove(@Param('id') id: string) {
    return this.flashSaleService.remove(id);
  }
}
