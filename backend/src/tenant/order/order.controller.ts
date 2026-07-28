import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  FulfillOrderDto,
  RefundOrderDto,
} from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InvoiceService } from './invoice.service';
import { StoreClosedGuard } from '../settings/store-closed.guard';
import * as express from 'express';

@ApiTags('Tenant - Orders')
@ApiHeader({ name: 'x-tenant-id', required: true })
@Controller('api/tenant/orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly invoiceService: InvoiceService,
  ) {}

  @Post('checkout')
  @UseGuards(StoreClosedGuard)
  @ApiOperation({
    summary: 'Place a new order (Public API) — blocked when store is closed',
  })
  checkout(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: express.Request,
  ) {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'default';
    // Use APP_URL env var for public callback URL (set to ngrok URL in local dev)
    const protocol = req.secure ? 'https' : 'http';
    const host = req.headers.host || 'localhost:8888';
    const origin = process.env.APP_URL || `${protocol}://${host}`;
    return this.orderService.checkout(createOrderDto, tenantId, origin);
  }

  @Get('bkash-callback')
  @ApiOperation({ summary: 'bKash payment callback (Public API)' })
  async bkashCallback(
    @Query('orderId') orderId: string,
    @Query('paymentID') paymentID: string,
    @Query('status') status: string,
    @Res() res: express.Response,
  ) {
    try {
      const result = await this.orderService.verifyBkashPayment(
        orderId,
        paymentID,
        status,
      );
      if (result.success) {
        return res.json({
          message: 'Payment successful',
          orderId: result.orderId,
        });
      } else {
        return res.status(400).json({
          message: 'Payment failed',
          orderId: result.orderId,
          reason: (result as any).reason,
        });
      }
    } catch (err: any) {
      return res.status(500).json({
        message: 'Payment verification failed with server error',
        error: err.message,
      });
    }
  }

  @Post('ssl-callback')
  @ApiOperation({ summary: 'SSLCommerz payment callback IPN (Public API)' })
  async sslCallback(
    @Query('orderId') orderId: string,
    @Query('status') status: string,
    @Body() body: any,
    @Res() res: express.Response,
  ) {
    try {
      const valId = body.val_id;
      const result = await this.orderService.verifySslCommerzPayment(
        orderId,
        valId,
        status,
      );
      if (result.success) {
        return res.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:8889'}/payment-success?orderId=${orderId}`,
        );
      } else {
        return res.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:8889'}/payment-failed?orderId=${orderId}&reason=${result.reason}`,
        );
      }
    } catch (err: any) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:8889'}/payment-failed?orderId=${orderId}&error=${err.message}`,
      );
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all orders (Admin)' })
  findAll() {
    return this.orderService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get single order details (Admin)' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/invoice')
  @ApiOperation({ summary: 'Download order PDF invoice' })
  async getInvoice(@Param('id') id: string, @Res() res: express.Response) {
    const order = await this.orderService.findOne(id);
    return this.invoiceService.generateInvoicePdf(order, res);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order payment/shipping status (Admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, updateOrderStatusDto);
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/fulfill')
  @ApiOperation({
    summary: 'Fulfill order using Steadfast/Pathao Courier (Admin)',
  })
  fulfill(@Param('id') id: string, @Body() fulfillDto: FulfillOrderDto) {
    return this.orderService.fulfillOrder(
      id,
      fulfillDto.courier,
      fulfillDto.metadata,
    );
  }

  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/refund')
  @ApiOperation({
    summary:
      'Refund/return an order — restocks items and marks as REFUNDED (Admin)',
  })
  refundOrder(@Param('id') id: string, @Body() refundDto: RefundOrderDto) {
    return this.orderService.refundOrder(id, refundDto);
  }
}
