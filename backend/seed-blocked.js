const { PrismaClient } = require('./dist/generated/tenant');
const dotenv = require('dotenv');
dotenv.config();

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TENANT_DATABASE_TEMPLATE_URL,
      },
    },
  });

  try {
    await prisma.$connect();
    console.log('Connected to template DB.');

    const blocked = await prisma.blockedContact.upsert({
      where: { value: '01711223344' },
      update: {},
      create: {
        value: '01711223344',
        type: 'PHONE',
        reason: 'Spammer test account',
      },
    });

    console.log('Successfully seeded blocked contact:', blocked);
  } catch (error) {
    console.error('Error seeding blocked contact:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
