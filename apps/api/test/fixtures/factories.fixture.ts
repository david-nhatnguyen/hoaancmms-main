import { Factory, FactoryStatus } from '@prisma/generated/prisma';

/**
 * Create a factory fixture for testing
 */
export function factoryFixture(overrides: Partial<Factory> = {}): Factory {
  return {
    id: overrides.id || 'test-factory-id-' + Math.random().toString(36).substr(2, 9),
    code: overrides.code || 'F01',
    name: overrides.name || 'Test Factory',
    location: overrides.location || 'Test Location',
    status: overrides.status || FactoryStatus.ACTIVE,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    ...overrides,
  };
}

/**
 * Create multiple factory fixtures
 */
export function factoryListFixture(count: number = 3): Factory[] {
  return Array.from({ length: count }, (_, i) =>
    factoryFixture({
      code: `F${String(i + 1).padStart(2, '0')}`,
      name: `Test Factory ${i + 1}`,
    }),
  );
}
