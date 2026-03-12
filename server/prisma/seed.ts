import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = [
    {
      name: 'System Admin',
      code: 'SYSTEM_ADMIN',
      description: 'Full system access',
    },
    {
      name: 'Distribution Agent',
      code: 'AGENT',
      description: 'Agent access',
    },
    {
      name: 'Distribution Driver',
      code: 'DRIVER',
      description: 'Driver access',
    },
    {
      name: 'Shop Client',
      code: 'SHOP',
      description: 'Shop portal access',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {
        name: role.name,
        description: role.description,
      },
      create: role,
    });
  }

  const adminRole = await prisma.role.findUnique({
    where: { code: 'SYSTEM_ADMIN' },
  });

  if (!adminRole) {
    throw new Error('SYSTEM_ADMIN role not found');
  }

  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@dairy.local' },
    update: {
      fullName: 'System Admin',
      passwordHash: adminPasswordHash,
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
    create: {
      fullName: 'System Admin',
      email: 'admin@dairy.local',
      passwordHash: adminPasswordHash,
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });