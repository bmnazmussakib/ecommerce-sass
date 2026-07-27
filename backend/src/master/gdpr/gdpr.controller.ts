import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GdprService } from './gdpr.service';
import { AnonymizeCustomerDto } from './dto/anonymize.dto';
import { SuperJwtAuthGuard } from '../auth/super-jwt-auth.guard';

@ApiTags('Master Administration - GDPR Compliance')
@ApiBearerAuth()
@UseGuards(SuperJwtAuthGuard)
@Controller('api/master/gdpr')
export class GdprController {
  constructor(private readonly gdprService: GdprService) {}

  @Post('anonymize')
  @ApiOperation({ summary: 'Anonymize customer PII data (GDPR Compliance)' })
  @ApiResponse({ status: 200, description: 'Customer data successfully anonymized.' })
  async anonymize(@Body() dto: AnonymizeCustomerDto) {
    return this.gdprService.anonymizeCustomerData(dto.tenantSubdomain, dto.customerEmail);
  }
}
