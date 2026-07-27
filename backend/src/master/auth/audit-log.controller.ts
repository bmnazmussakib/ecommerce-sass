import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MasterPrismaService } from '../../core/database/master-prisma.service';
import { SuperJwtAuthGuard } from '../auth/super-jwt-auth.guard';

@ApiTags('Master Administration - Audit Logs')
@ApiBearerAuth()
@UseGuards(SuperJwtAuthGuard)
@Controller('api/master/audit-logs')
export class AuditLogController {
  constructor(private readonly prisma: MasterPrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent audit logs (Super Admin)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of logs to return (default 50)' })
  async getLogs(@Query('limit') limit?: string) {
    const take = limit ? parseInt(limit, 10) : 50;

    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take,
    });
  }
}
