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
  // Delete all settings and insert a single clean one
  await prisma.storeSetting.deleteMany();
  const settings = await prisma.storeSetting.create({
    data: {
      storeName: 'My Awesome Default Store',
      themeConfig: { color: 'blue' },
      taxRate: 15.00
    }
  });

  console.log('Cleaned up duplicate store settings. Inserted single clean record:', settings);
}

run().catch(console.error).finally(() => prisma.$disconnect());
