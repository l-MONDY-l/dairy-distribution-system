import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
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
      name: 'Agent',
      code: 'AGENT',
      description: 'Agent access',
    },
    {
      name: 'Driver',
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

  const permissions = [
    // Region & Territory Management
    { name: 'Create region', code: 'REGION_CREATE', module: 'Region & Territory' },
    { name: 'Update region', code: 'REGION_UPDATE', module: 'Region & Territory' },
    { name: 'Delete region', code: 'REGION_DELETE', module: 'Region & Territory' },
    { name: 'Assign agents & drivers', code: 'REGION_ASSIGN_STAFF', module: 'Region & Territory' },
    // Clients
    { name: 'Create client', code: 'CLIENT_CREATE', module: 'Clients' },
    { name: 'Update client', code: 'CLIENT_UPDATE', module: 'Clients' },
    { name: 'Delete client', code: 'CLIENT_DELETE', module: 'Clients' },
    // Agents
    { name: 'Create agent', code: 'AGENT_CREATE', module: 'Agents' },
    { name: 'Update agent', code: 'AGENT_UPDATE', module: 'Agents' },
    { name: 'Delete agent', code: 'AGENT_DELETE', module: 'Agents' },
    // Drivers
    { name: 'Create driver', code: 'DRIVER_CREATE', module: 'Drivers' },
    { name: 'Update driver', code: 'DRIVER_UPDATE', module: 'Drivers' },
    { name: 'Delete driver', code: 'DRIVER_DELETE', module: 'Drivers' },
    // Orders
    { name: 'View orders', code: 'ORDER_VIEW', module: 'Orders' },
    { name: 'Create order', code: 'ORDER_CREATE', module: 'Orders' },
    { name: 'Approve / reject orders', code: 'ORDER_APPROVE', module: 'Orders' },
    // Returns
    { name: 'View returns', code: 'RETURN_VIEW', module: 'Returns' },
    { name: 'Approve / reject returns', code: 'RETURN_APPROVE', module: 'Returns' },
    // Sales & Target
    { name: 'View sales & target', code: 'SALES_TARGET_VIEW', module: 'Sales & Target' },
    // Payments & Invoices
    { name: 'View payments & invoices', code: 'PAYMENT_VIEW', module: 'Payments & Invoices' },
    // Reports
    { name: 'View reports', code: 'REPORT_VIEW', module: 'Reports & Export' },
    // Activity Logs
    { name: 'View logs', code: 'ACTIVITY_LOG_VIEW', module: 'Activity Logs' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        name: perm.name,
        module: perm.module,
      },
      create: perm,
    });
  }

  const adminRole = await prisma.role.findUnique({
    where: { code: 'SYSTEM_ADMIN' },
  });

  if (!adminRole) {
    throw new Error('SYSTEM_ADMIN role not found');
  }

  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Company settings (single row)
  await prisma.companySetting.upsert({
    where: { id: 'default-company' },
    update: {},
    create: {
      id: 'default-company',
      name: 'Vills Dairy',
      email: 'info@villsdairy.local',
      phone: '0780000000',
      country: 'Sri Lanka',
    },
  });

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