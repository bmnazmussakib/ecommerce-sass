import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { Response } from 'express';


@Injectable()
export class InvoiceService {
  generateInvoicePdf(order: any, res: Response) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Stream PDF directly to Express response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.id.substring(0, 8)}.pdf`);
    doc.pipe(res);

    // 1. Header Section
    doc
      .fillColor('#444444')
      .fontSize(20)
      .text('Ecomize SaaS Platform', 50, 57)
      .fontSize(10)
      .text('Merchant Storefront Invoice', 50, 80)
      .text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 95)
      .text(`Order ID: ${order.id}`, 50, 110)
      .moveDown();

    // 2. Billing & Shipping Info
    doc
      .fontSize(12)
      .text('Bill To:', 50, 150, { underline: true })
      .fontSize(10)
      .text(`Name: ${order.customerName}`, 50, 170)
      .text(`Phone: ${order.customerPhone}`, 50, 185)
      .text(`Email: ${order.customerEmail || 'N/A'}`, 50, 200)
      .text(`Address: ${order.shippingAddress}`, 50, 215)
      .moveDown();

    // 3. Payment Status Table Header
    doc
      .fontSize(12)
      .text('Payment & Shipping Summary', 50, 250, { underline: true })
      .fontSize(10)
      .text(`Method: ${order.paymentMethod}`, 50, 270)
      .text(`Payment Status: ${order.paymentStatus}`, 50, 285)
      .text(`Shipping Status: ${order.shippingStatus}`, 50, 300)
      .moveDown();

    // 4. Line Items Table Header
    const tableTop = 340;
    doc.font('Helvetica-Bold');
    doc.text('Product Name / SKU', 50, tableTop);
    doc.text('Qty', 350, tableTop, { width: 50, align: 'right' });
    doc.text('Price', 400, tableTop, { width: 80, align: 'right' });
    doc.text('Total', 480, tableTop, { width: 80, align: 'right' });
    doc.font('Helvetica');

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(560, tableTop + 15)
      .stroke();

    // 5. Line Items Rows
    let position = tableTop + 25;
    let subtotal = 0;

    for (const item of order.orderItems) {
      const productName = item.variant?.product?.title || 'Unknown Product';
      const sku = item.variant?.sku || 'N/A';
      const itemTotal = Number(item.price) * item.quantity;
      subtotal += itemTotal;

      doc.text(`${productName} (${sku})`, 50, position, { width: 280 });
      doc.text(item.quantity.toString(), 350, position, { width: 50, align: 'right' });
      doc.text(Number(item.price).toFixed(2), 400, position, { width: 80, align: 'right' });
      doc.text(itemTotal.toFixed(2), 480, position, { width: 80, align: 'right' });

      position += 25;
    }

    doc
      .moveTo(50, position + 5)
      .lineTo(560, position + 5)
      .stroke();

    position += 15;

    // 6. Summary Totals
    const shipping = Number(order.shippingCharge);
    const taxPaid = Number(order.taxPaid || 0);
    const total = Number(order.totalPrice);
    const discount = subtotal + shipping + taxPaid - total;

    doc.text('Subtotal:', 380, position, { width: 100, align: 'right' });
    doc.text(subtotal.toFixed(2), 480, position, { width: 80, align: 'right' });

    position += 15;
    doc.text('Discount:', 380, position, { width: 100, align: 'right' });
    doc.text(discount > 0 ? `-${discount.toFixed(2)}` : '0.00', 480, position, { width: 80, align: 'right' });

    position += 15;
    doc.text('Tax (VAT/GST):', 380, position, { width: 100, align: 'right' });
    doc.text(taxPaid.toFixed(2), 480, position, { width: 80, align: 'right' });

    position += 15;
    doc.text('Shipping Charge:', 380, position, { width: 100, align: 'right' });
    doc.text(shipping.toFixed(2), 480, position, { width: 80, align: 'right' });

    position += 15;
    doc.font('Helvetica-Bold');
    doc.text('Grand Total:', 380, position, { width: 100, align: 'right' });
    doc.text(total.toFixed(2), 480, position, { width: 80, align: 'right' });

    doc.end();
  }
}
