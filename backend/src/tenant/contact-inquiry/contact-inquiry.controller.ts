import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { ContactInquiryService } from './contact-inquiry.service';
import {
  CreateContactInquiryDto,
  UpdateContactInquiryDto,
} from './dto/contact-inquiry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InquiryStatus } from '@prisma/tenant-client';

@ApiTags('Tenant - Contact Form & Inquiries')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@Controller('api/tenant/contact')
export class ContactInquiryController {
  constructor(private readonly inquiryService: ContactInquiryService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a customer contact inquiry (Public)' })
  create(@Body() dto: CreateContactInquiryDto) {
    return this.inquiryService.create(dto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN', 'STAFF')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Get all contact inquiries' })
  findAll(@Query('status') status?: InquiryStatus) {
    return this.inquiryService.findAll(status);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN', 'STAFF')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get contact inquiry by ID' })
  findOne(@Param('id') id: string) {
    return this.inquiryService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN', 'STAFF')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update inquiry status or internal notes' })
  update(@Param('id') id: string, @Body() dto: UpdateContactInquiryDto) {
    return this.inquiryService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact inquiry' })
  remove(@Param('id') id: string) {
    return this.inquiryService.remove(id);
  }
}
