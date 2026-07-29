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
import { BogoOfferService } from './bogo-offer.service';
import { CreateBogoOfferDto, UpdateBogoOfferDto } from './dto/bogo-offer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - BOGO Offers')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@Controller('api/tenant/bogo-offers')
export class BogoOfferController {
  constructor(private readonly bogoOfferService: BogoOfferService) {}

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Create a BOGO offer' })
  create(@Body() dto: CreateBogoOfferDto) {
    return this.bogoOfferService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all BOGO offers' })
  findAll() {
    return this.bogoOfferService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get BOGO offer by ID' })
  findOne(@Param('id') id: string) {
    return this.bogoOfferService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a BOGO offer' })
  update(@Param('id') id: string, @Body() dto: UpdateBogoOfferDto) {
    return this.bogoOfferService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a BOGO offer' })
  remove(@Param('id') id: string) {
    return this.bogoOfferService.remove(id);
  }
}
