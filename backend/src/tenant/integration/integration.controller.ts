import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { IntegrationService } from './integration.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IntProviderType } from '@prisma/tenant-client';

@ApiTags('Tenant - Integrations')
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: true })
@Controller('api/tenant/integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update integration configuration (Admin)' })
  create(@Body() createIntegrationDto: CreateIntegrationDto) {
    return this.integrationService.create(createIntegrationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all integration configurations (Admin)' })
  findAll() {
    return this.integrationService.findAll();
  }

  @Get(':provider')
  @ApiOperation({ summary: 'Get details of a specific integration (Admin)' })
  findOne(@Param('provider') provider: IntProviderType) {
    return this.integrationService.findOne(provider);
  }

  @Patch(':provider')
  @ApiOperation({ summary: 'Update integration status or keys (Admin)' })
  update(@Param('provider') provider: IntProviderType, @Body() updateIntegrationDto: UpdateIntegrationDto) {
    return this.integrationService.update(provider, updateIntegrationDto);
  }

  @Delete(':provider')
  @ApiOperation({ summary: 'Remove an integration configuration (Admin)' })
  remove(@Param('provider') provider: IntProviderType) {
    return this.integrationService.remove(provider);
  }
}
