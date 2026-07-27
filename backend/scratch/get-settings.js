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
  const settings = await prisma.storeSetting.findFirst();
  console.log('Current Store Settings in tenant_template DB:', settings);
}

run().catch(console.error).finally(() => prisma.$disconnect());
