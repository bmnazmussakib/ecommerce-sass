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

    const tenantPrisma = new TenantClient({
      datasources: {
        db: {
          url: tenant.dbConnectionString,
        },
      },
    });

    // Create a category
    const category = await tenantPrisma.category.upsert({
      where: { slug: 'test-category' },
      update: {},
      create: {
        name: 'Test Category',
        slug: 'test-category',
        isActive: true,
      },
    });

    // Create a product
    const product = await tenantPrisma.product.create({
      data: {
        title: 'Test Premium T-Shirt',
        description: 'High-quality cotton premium t-shirt.',
        basePrice: 500.00,
        comparePrice: 600.00,
        status: 'ACTIVE',
        categoryId: category.id,
        variants: {
          create: {
            sku: 'TSHIRT-L-RED',
            price: 500.00,
            stock: 100,
            size: 'L',
            color: 'Red',
          },
        },
      },
      include: {
        variants: true,
      },
    });

    console.log('\n--- Mock Product Seeded Successfully ---');
    console.log(`Product: ${product.title}`);
    console.log(`Category: ${category.name}`);
    console.log(`Variant ID: ${product.variants[0].id}`);
    console.log(`SKU: ${product.variants[0].sku}`);
    console.log(`Stock: ${product.variants[0].stock}`);
    console.log(`Price: ${product.variants[0].price}`);
    console.log('-----------------------------------------\n');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await masterPrisma.$disconnect();
  }
}

main();
