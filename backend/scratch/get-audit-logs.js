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
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  console.log('Recent Audit Logs:', JSON.stringify(logs, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
