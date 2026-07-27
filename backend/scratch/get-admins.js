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
async function test() {
  const admins = await prisma.superAdmin.findMany();
  console.log('Admins:', admins);
}
test().catch(console.error).finally(() => prisma.$disconnect());
