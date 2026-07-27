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
  // Update taxRate setting to 15%
  const updated = await prisma.storeSetting.updateMany({
    data: {
      taxRate: 15.00
    }
  });

  console.log('Updated StoreSetting taxRate to 15%');
}

run().catch(console.error).finally(() => prisma.$disconnect());
