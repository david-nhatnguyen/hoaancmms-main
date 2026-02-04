import { PrismaService } from '@/database/prisma.service';
import { FactoryStatus } from '@prisma/generated/prisma';

/**
 * Clean all data from test database
 * Order matters due to foreign key constraints
 */
export async function cleanDatabase(prisma: PrismaService) {
    await prisma.client.equipment.deleteMany();
    await prisma.client.factory.deleteMany();
    await prisma.client.user.deleteMany();
}

/**
 * Seed a factory for testing
 */
export async function seedFactory(
    prisma: PrismaService,
    data: Partial<{
        code: string;
        name: string;
        location: string;
        status: FactoryStatus;
    }> = {}
) {
    return prisma.client.factory.create({
        data: {
            code: data.code || `F${Date.now()}`,
            name: data.name || 'Test Factory',
            location: data.location || 'Test Location',
            status: data.status || FactoryStatus.ACTIVE,
        },
    });
}

/**
 * Seed multiple factories
 */
export async function seedFactories(
    prisma: PrismaService,
    count: number = 3
) {
    const factories = [];
    for (let i = 0; i < count; i++) {
        factories.push(
            await seedFactory(prisma, {
                code: `F${i + 1}`,
                name: `Test Factory ${i + 1}`,
            })
        );
    }
    return factories;
}
