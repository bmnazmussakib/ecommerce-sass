import { PrismaClient as MasterClient } from './src/generated/master';
import { PrismaClient as TenantClient } from './src/generated/tenant';
import * as dotenv from 'dotenv';

dotenv.config();

const masterPrisma = new MasterClient({
  datasources: { db: { url: process.env.MASTER_DATABASE_URL } },
});

const tenantPrisma = new TenantClient({
  datasources: { db: { url: process.env.TENANT_DATABASE_TEMPLATE_URL } },
});

async function main() {
  console.log('Seeding default tenant...');
  
  // 1. Create Tenant in Master DB
  const tenant = await masterPrisma.tenant.upsert({
    where: { subdomain: 'default' },
    update: {},
    create: {
      subdomain: 'default',
      status: 'ACTIVE',
      dbConnectionString: process.env.TENANT_DATABASE_TEMPLATE_URL!,
    },
  });
  console.log('Master DB Tenant:', tenant);

  // 2. Create Store Setting in Tenant DB
  const storeSetting = await tenantPrisma.storeSetting.create({
    data: {
      storeName: 'My Awesome Default Store',
      themeConfig: { color: 'blue' },
    },
  });
  console.log('Tenant DB Store Setting:', storeSetting);
  
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await masterPrisma.$disconnect();
    await tenantPrisma.$disconnect();
  });
