const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../src/generated/tenant/index.js'));
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TENANT_DATABASE_TEMPLATE_URL
    }
  }
});

async function run() {
  // Insert a test order with customer email to anonymize
  const order = await prisma.order.create({
    data: {
      customerName: 'Sakib GDPR Test',
      customerEmail: 'customer-to-anonymize@test.com',
      customerPhone: '01712345678',
      shippingAddress: 'Dhaka, Bangladesh',
      totalPrice: 2500.00,
      shippingCharge: 100.00,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      shippingStatus: 'PENDING',
      fingerprint: 'test-fingerprint-sig-12345'
    }
  });

  console.log('Inserted Mock Order for Anonymize Test:', order);
}

run().catch(console.error).finally(() => prisma.$disconnect());
