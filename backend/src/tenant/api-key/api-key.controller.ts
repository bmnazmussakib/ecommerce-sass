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
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto/api-key.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - API Key & Developer Throttling')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@ApiBearerAuth()
@Roles('OWNER', 'ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/tenant/api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new API Key with custom rate limit (Admin)' })
  create(@Body() dto: CreateApiKeyDto) {
    return this.apiKeyService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all API Keys for store (Admin)' })
  findAll() {
    return this.apiKeyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get API Key details by ID (Admin)' })
  findOne(@Param('id') id: string) {
    return this.apiKeyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update API Key active status or per-minute rate limit (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateApiKeyDto) {
    return this.apiKeyService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke / Delete API Key (Admin)' })
  remove(@Param('id') id: string) {
    return this.apiKeyService.remove(id);
  }
}
