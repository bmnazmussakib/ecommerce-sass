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

    // Upsert bKash integration
    const integration = await tenantPrisma.integration.upsert({
      where: { provider: 'BKASH' },
      update: {
        keysJson: {
          app_key: '4f6o0cjiki2rfm34kfdadl1eqq',
          app_secret: '2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b',
          username: 'sandboxTokenizedUser02',
          password: 'sandboxTokenizedUser02@12345'
        },
        isActive: true,
      },
      create: {
        provider: 'BKASH',
        keysJson: {
          app_key: '4f6o0cjiki2rfm34kfdadl1eqq',
          app_secret: '2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b',
          username: 'sandboxTokenizedUser02',
          password: 'sandboxTokenizedUser02@12345'
        },
        isActive: true,
      },
    });

    console.log('\n--- bKash Integration Configured Successfully ---');
    console.log(`Provider: ${integration.provider}`);
    console.log(`Is Active: ${integration.isActive}`);
    console.log(`Keys: ${JSON.stringify(integration.keysJson, null, 2)}`);
    console.log('--------------------------------------------------\n');

  } catch (error) {
    console.error('Error configuring bKash:', error);
  } finally {
    await masterPrisma.$disconnect();
  }
}

main();
