const fs = require('fs');
const path = require('path');
const { PrismaClient: MasterClient } = require('./dist/generated/master');
const { PrismaClient: TenantClient } = require('./dist/generated/tenant');

// Load environment variables manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  for (const line of envConfig.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  }
}

async function main() {
  if (!process.env.MASTER_DATABASE_URL) {
    console.error('MASTER_DATABASE_URL not found in .env');
    return;
  }

  const masterPrisma = new MasterClient({
    datasources: {
      db: {
        url: process.env.MASTER_DATABASE_URL,
      },
    },
  });

  try {
    const tenant = await masterPrisma.tenant.findFirst({
      where: { subdomain: 'default', status: 'ACTIVE' },
    });

    if (!tenant) {
      console.error('Tenant default not found or inactive');
      return;
    }

    console.log(`Found tenant db: ${tenant.dbConnectionString}`);

    const tenantPrisma = new TenantClient({
      datasources: {
        db: {
          url: tenant.dbConnectionString,
        },
      },
    });

    const variants = await tenantPrisma.productVariant.findMany({
      include: {
        product: true,
      },
    });

    if (variants.length === 0) {
      console.log('No variants found in tenant database');
    } else {
      console.log('\n--- Active Product Variants ---');
      variants.forEach(v => {
        console.log(`Product: ${v.product.title}`);
        console.log(`SKU: ${v.sku}`);
        console.log(`Variant ID: ${v.id}`);
        console.log(`Stock: ${v.stock}`);
        console.log(`Price: ${v.price}`);
        console.log('-------------------------------\n');
      });
    }
  } catch (error) {
    console.error('Error querying databases:', error);
  } finally {
    await masterPrisma.$disconnect();
  }
}

main();
