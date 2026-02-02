import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, UserRole } from '../generated/prisma/client'
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Create Default Factory
  const factory = await prisma.factory.upsert({
    where: { id: 'default-factory-01' }, // ID cố định để tránh tạo trùng
    update: {},
    create: {
      id: 'default-factory-01',
      name: 'Nhà máy Hòa An (Hà Nội)',
      address: 'Khu Công Nghiệp Thăng Long, Hà Nội',
    },
  });
  console.log(`🏭 Factory created: ${factory.name}`);

  // 2. Create Admin User
  // Password mặc định: password123
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: UserRole.ADMIN,
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