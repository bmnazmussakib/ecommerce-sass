const { PrismaClient } = require('../src/generated/tenant/index.js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.TENANT_DATABASE_TEMPLATE_URL || process.env.DATABASE_URL },
  },
});

async function main() {
  const existing = await prisma.staffUser.findMany({ select: { email: true, role: true } });
  console.log('Existing users:', existing);

  if (existing.find(u => u.email === 'admin@test.com')) {
    console.log('admin@test.com already exists. Updating password...');
    const hash = await bcrypt.hash('admin123', 10);
    await prisma.staffUser.update({
      where: { email: 'admin@test.com' },
      data: { password: hash, isActive: true }
    });
    console.log('Password updated.');
    return;
  }

  const hash = await bcrypt.hash('admin123', 10);
  const user = await prisma.staffUser.create({
    data: {
      email: 'admin@test.com',
      password: hash,
      name: 'Test Admin',
      role: 'OWNER',
      isActive: true,
    },
  });
  console.log('Created:', user.email, user.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
