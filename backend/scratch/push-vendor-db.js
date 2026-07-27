const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../src/generated/master/index.js'));
const { execSync } = require('child_process');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MASTER_DATABASE_URL
    }
  }
});

async function run() {
  const tenant = await prisma.tenant.findFirst({
    where: { subdomain: 'vendor-test-subdomain' }
  });
  
  if (tenant && tenant.dbConnectionString) {
    console.log(`Pushing schema to: ${tenant.dbConnectionString}`);
    execSync(`npx prisma db push --schema=prisma/tenant.prisma`, {
      env: { ...process.env, TENANT_DATABASE_TEMPLATE_URL: tenant.dbConnectionString },
      stdio: 'inherit'
    });
    console.log('Success.');
  } else {
    console.log('Tenant vendor-test-subdomain not found.');
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
