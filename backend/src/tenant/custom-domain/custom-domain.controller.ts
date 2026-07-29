import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { CustomDomainService } from './custom-domain.service';
import { AddCustomDomainDto } from './dto/custom-domain.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tenant - Custom Domain & Auto-SSL')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@ApiBearerAuth()
@Roles('OWNER', 'ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/tenant/custom-domain')
export class CustomDomainController {
  constructor(private readonly customDomainService: CustomDomainService) {}

  @Post()
  @ApiOperation({ summary: 'Add or bind custom domain to store (Admin)' })
  addCustomDomain(
    @Headers('x-tenant-id') tenantSubdomain: string,
    @Body() dto: AddCustomDomainDto,
  ) {
    return this.customDomainService.addCustomDomain(tenantSubdomain || 'default', dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get connected custom domain status & DNS instructions (Admin)' })
  getStatus(@Headers('x-tenant-id') tenantSubdomain: string) {
    return this.customDomainService.getCustomDomainStatus(tenantSubdomain || 'default');
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify real DNS CNAME/A records for custom domain (Admin)' })
  verifyDns(@Headers('x-tenant-id') tenantSubdomain: string) {
    return this.customDomainService.verifyDns(tenantSubdomain || 'default');
  }

  @Post('ssl')
  @ApiOperation({ summary: 'Trigger automatic SSL/TLS certificate provisioning (Admin)' })
  provisionSsl(@Headers('x-tenant-id') tenantSubdomain: string) {
    return this.customDomainService.provisionSsl(tenantSubdomain || 'default');
  }

  @Delete()
  @ApiOperation({ summary: 'Unbind / Remove custom domain (Admin)' })
  removeCustomDomain(@Headers('x-tenant-id') tenantSubdomain: string) {
    return this.customDomainService.removeCustomDomain(tenantSubdomain || 'default');
  }
}
