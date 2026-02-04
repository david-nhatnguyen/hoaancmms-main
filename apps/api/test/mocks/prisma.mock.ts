export const mockPrismaService = () => {
    const mock = {
        client: {
            factory: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                count: jest.fn(),
            },
            equipment: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                createMany: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                count: jest.fn(),
            },
            user: {
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $transaction: jest.fn(),
    };

    return mock;
};

export type MockPrismaService = ReturnType<typeof mockPrismaService>;
