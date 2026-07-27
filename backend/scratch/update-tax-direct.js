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
  const result = await prisma.storeSetting.updateMany({
    data: {
      taxRate: 15.00
    }
  });
  console.log('Successfully set default tenant taxRate to 15%. Updated:', result.count);
}

run().catch(console.error).finally(() => prisma.$disconnect());
