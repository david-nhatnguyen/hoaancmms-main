import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, FactoryStatus } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Create Default Factory
  const factory = await prisma.factory.upsert({
    where: { code: 'F01' },
    update: {},
    create: {
      code: 'F01',
      name: 'Nhà máy Hòa An (Hà Nội)',
      location: 'Khu Công Nghiệp Thăng Long, Hà Nội',
      status: FactoryStatus.ACTIVE,
    },
  });
  console.log(`🏭 Factory created: ${factory.name}`);

  // 2. Create System Admin Role
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'System administrator with full access',
      isSystem: true,
    },
  });
  console.log(`🔐 Admin role created: ${adminRole.name}`);

  // 3. Create Admin User linked to the Admin Role
  // Default password: password123
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      fullName: 'System Administrator',
      roleId: adminRole.id,
    },
  });
  console.log(`👤 Admin user created: ${admin.username}`);

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
