import { Controller, Post, Get, Body, Param, UseGuards, Req, Res, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { InitiateGatewayPaymentDto, SubmitManualPaymentDto, ReviewPaymentDto } from './dto/billing.dto';
import { JwtAuthGuard } from '../../tenant/auth/jwt-auth.guard';
import { SuperJwtAuthGuard } from '../auth/super-jwt-auth.guard';
import * as express from 'express';

@ApiTags('Master Administration - Billing')
@Controller('api/master/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @UseGuards(JwtAuthGuard)
  @Post('checkout/gateway')
  @ApiOperation({ summary: 'Initiate gateway subscription payment (Merchant)' })
  checkoutGateway(
    @Req() req: express.Request & { user: any },
    @Body() dto: InitiateGatewayPaymentDto,
  ) {
    // Resolve tenant DB id using the request or custom parameter
    const tenantId = req.headers['x-tenant-id'] as string || 'default';
    const protocol = req.secure ? 'https' : 'http';
    const host = req.headers.host || 'localhost:8889';
    const origin = process.env.APP_URL || `${protocol}://${host}`;
    return this.billingService.initiateGatewayPayment(tenantId, dto.planId, origin);
  }

  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @UseGuards(JwtAuthGuard)
  @Post('checkout/manual')
  @ApiOperation({ summary: 'Submit manual MFS payment details (Merchant)' })
  checkoutManual(
    @Req() req: express.Request & { user: any },
    @Body() dto: SubmitManualPaymentDto,
  ) {
    const tenantId = req.headers['x-tenant-id'] as string || 'default';
    return this.billingService.submitManualPayment(tenantId, dto.planId, dto.transactionId, dto.senderNumber);
  }

  @Post('ssl-callback')
  @ApiOperation({ summary: 'SSLCommerz master callback (Public)' })
  async sslCallback(
    @Query('paymentId') paymentId: string,
    @Query('status') status: string,
    @Body() body: any,
    @Res() res: express.Response,
  ) {
    try {
      const valId = body.val_id;
      const result = await this.billingService.verifyGatewayPayment(paymentId, valId, status);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8889';
      if (result.success) {
        return res.redirect(`${frontendUrl}/billing-success?paymentId=${paymentId}`);
      } else {
        return res.redirect(`${frontendUrl}/billing-failed?paymentId=${paymentId}`);
      }
    } catch (err: any) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8889';
      return res.redirect(`${frontendUrl}/billing-failed?error=${err.message}`);
    }
  }

  @ApiBearerAuth()
  @UseGuards(SuperJwtAuthGuard)
  @Post('payments/:id/review')
  @ApiOperation({ summary: 'Approve or Reject manual payment (Super Admin)' })
  reviewPayment(
    @Param('id') id: string,
    @Body() dto: ReviewPaymentDto,
  ) {
    return this.billingService.reviewManualPayment(id, dto.status, dto.notes);
  }

  @ApiBearerAuth()
  @UseGuards(SuperJwtAuthGuard)
  @Get('payments')
  @ApiOperation({ summary: 'List all subscription payments (Super Admin)' })
  getPayments() {
    return this.billingService.getPayments();
  }
}
