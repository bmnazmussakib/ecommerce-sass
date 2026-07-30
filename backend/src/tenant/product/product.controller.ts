import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FeatureToggle } from '../../core/decorators/feature-toggle.decorator';
import { FeatureToggleGuard } from '../../core/guards/feature-toggle.guard';


@ApiTags('Tenant - Products')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@Controller('api/tenant/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Create a product' })
  create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.productService.create(createProductDto, tenantId);
  }


  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, FeatureToggleGuard)
  @FeatureToggle('bulk_csv_import')
  @Post('bulk-upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Bulk upload products via CSV' })
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
  }))
  async bulkUpload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    const csvContent = file.buffer.toString('utf-8');
    return this.productService.addCsvImportJob(csvContent, tenantId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products using Meilisearch (Public)' })
  async search(
    @Query('q') query: string,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.productService.search(query, tenantId);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('publish-scheduled')
  @ApiOperation({ summary: 'Check and publish scheduled products due for release' })
  publishScheduled(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.productService.checkAndPublishScheduledProducts(tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  findAll(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.productService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.productService.update(id, updateProductDto, tenantId);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  remove(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.productService.remove(id, tenantId);
  }
}


