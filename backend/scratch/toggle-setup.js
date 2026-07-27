const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../src/generated/master/index.js'));
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MASTER_DATABASE_URL
    }
  }
});

async function run() {
  const subdomain = 'vendor-test-subdomain';
  
  // Set featureToggles JSON value for this tenant
  const updated = await prisma.tenant.update({
    where: { subdomain },
    data: {
      featureToggles: {
        bulk_csv_import: false
      }
    }
  });
  
  console.log('Updated Tenant featureToggles:', updated.featureToggles);
}

run().catch(console.error).finally(() => prisma.$disconnect());
