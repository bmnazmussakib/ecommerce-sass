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
import { TaxRuleService } from './tax-rule.service';
import { CreateTaxRuleDto, UpdateTaxRuleDto } from './dto/tax-rule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - Tax Rules')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@Controller('api/tenant/tax-rules')
export class TaxRuleController {
  constructor(private readonly taxRuleService: TaxRuleService) {}

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Create a tax rule' })
  create(@Body() dto: CreateTaxRuleDto) {
    return this.taxRuleService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tax rules' })
  findAll() {
    return this.taxRuleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tax rule by ID' })
  findOne(@Param('id') id: string) {
    return this.taxRuleService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a tax rule' })
  update(@Param('id') id: string, @Body() dto: UpdateTaxRuleDto) {
    return this.taxRuleService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tax rule' })
  remove(@Param('id') id: string) {
    return this.taxRuleService.remove(id);
  }
}
