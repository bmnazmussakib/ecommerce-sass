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
import { LanguageService } from './language.service';
import {
  CreateLanguageDto,
  UpdateLanguageDto,
  UpsertTranslationDto,
} from './dto/language.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - Storefront Multi-Language (i18n)')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@Controller('api/tenant/languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  @ApiOperation({ summary: 'Get active store languages (Public Storefront)' })
  findAll() {
    return this.languageService.findAll();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get UI translation dictionary for language code (Public Storefront)' })
  findOne(@Param('code') code: string) {
    return this.languageService.findOne(code);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Add a new store language (Admin)' })
  create(@Body() dto: CreateLanguageDto) {
    return this.languageService.create(dto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':code')
  @ApiOperation({ summary: 'Update store language settings (Admin)' })
  update(@Param('code') code: string, @Body() dto: UpdateLanguageDto) {
    return this.languageService.update(code, dto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':code/translations')
  @ApiOperation({ summary: 'Upsert UI translation dictionary keys (Admin)' })
  upsertTranslations(
    @Param('code') code: string,
    @Body() dto: UpsertTranslationDto,
  ) {
    return this.languageService.upsertTranslations(code, dto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':code')
  @ApiOperation({ summary: 'Delete store language (Admin)' })
  remove(@Param('code') code: string) {
    return this.languageService.remove(code);
  }
}
