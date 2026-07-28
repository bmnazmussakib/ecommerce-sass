import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { DigitalProductService } from './digital-product.service';
import { SetDigitalFileDto } from './dto/digital-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - Digital Products')
@ApiHeader({ name: 'x-tenant-id', required: true })
@Controller('api/tenant/digital-products')
export class DigitalProductController {
  constructor(private readonly digitalProductService: DigitalProductService) {}

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':variantId/set-file')
  @ApiOperation({ summary: 'Set digital file URL for a variant (Admin)' })
  setDigitalFile(
    @Param('variantId') variantId: string,
    @Body() dto: SetDigitalFileDto,
  ) {
    return this.digitalProductService.setDigitalFile(variantId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('generate-tokens/:orderId')
  @ApiOperation({
    summary: 'Generate download tokens for digital items in an order (Admin)',
  })
  generateTokens(@Param('orderId') orderId: string) {
    return this.digitalProductService.generateDownloadTokens(orderId);
  }

  @Get('download')
  @ApiOperation({
    summary: 'Download a digital file using a one-time token (Public)',
  })
  @ApiQuery({ name: 'token', required: true })
  async download(@Query('token') token: string) {
    return this.digitalProductService.downloadByToken(token);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get download tokens for a specific order (Admin)' })
  getOrderDownloads(@Param('orderId') orderId: string) {
    return this.digitalProductService.getOrderDownloads(orderId);
  }

  @Get('my-downloads')
  @ApiOperation({
    summary: 'Get all digital downloads for a customer by phone (Public)',
  })
  @ApiQuery({ name: 'phone', required: true })
  getCustomerDownloads(@Query('phone') phone: string) {
    return this.digitalProductService.getCustomerDownloads(phone);
  }
}
