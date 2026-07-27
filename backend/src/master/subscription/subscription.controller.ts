import { Controller, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { UpdateSubscriptionDto } from './dto/subscription.dto';
import { SuperJwtAuthGuard } from '../auth/super-jwt-auth.guard';

@ApiTags('Master Administration - Subscriptions')
@ApiBearerAuth()
@UseGuards(SuperJwtAuthGuard)
@Controller('api/master/subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active subscriptions (Super Admin)' })
  findAll() {
    return this.subscriptionService.findAll();
  }

  @Get(':tenantId')
  @ApiOperation({ summary: 'Get a specific tenant subscription (Super Admin)' })
  findOne(@Param('tenantId') tenantId: string) {
    return this.subscriptionService.findOne(tenantId);
  }

  @Put(':tenantId')
  @ApiOperation({ summary: 'Manually override/update a tenant subscription (Super Admin)' })
  update(@Param('tenantId') tenantId: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionService.update(tenantId, updateSubscriptionDto);
  }

  @Delete(':tenantId')
  @ApiOperation({ summary: 'Manually delete/cancel a tenant subscription (Super Admin)' })
  remove(@Param('tenantId') tenantId: string) {
    return this.subscriptionService.remove(tenantId);
  }
}
