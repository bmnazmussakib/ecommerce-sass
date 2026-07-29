import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Query,
  UseGuards,
  Header,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { SeoService } from './seo.service';
import { UpsertSeoSettingDto } from './dto/seo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - SEO Management')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@Controller('api/tenant/seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  @ApiOperation({ summary: 'Get dynamic XML sitemap for store' })
  async getSitemap(@Req() req: any) {
    const host = req.headers['host'] || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;
    return this.seoService.generateSitemapXml(baseUrl);
  }

  @Get('meta')
  @ApiOperation({ summary: 'Get page metadata and Open Graph tags for path (Public)' })
  getMetaTags(@Query('path') path: string = '/', @Req() req: any) {
    const host = req.headers['host'] || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;
    return this.seoService.getMetaTags(path, baseUrl);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Upsert per-page SEO setting' })
  upsert(@Body() dto: UpsertSeoSettingDto) {
    return this.seoService.upsert(dto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Get all custom SEO settings' })
  findAll() {
    return this.seoService.findAll();
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('setting')
  @ApiOperation({ summary: 'Get SEO setting by path' })
  findByPath(@Query('path') path: string) {
    return this.seoService.findByPath(path);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete()
  @ApiOperation({ summary: 'Delete SEO setting by path' })
  remove(@Query('path') path: string) {
    return this.seoService.removeByPath(path);
  }
}
