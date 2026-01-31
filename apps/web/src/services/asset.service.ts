import { factories, equipments, Factory, Equipment } from '@/api/mock/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const assetService = {
  // Factory Operations
  getFactories: async (): Promise<Factory[]> => {
    await delay(500);
    return factories;
  },

  getFactoryById: async (id: string): Promise<Factory | undefined> => {
    await delay(300);
    return factories.find(f => f.id === id);
  },

  // Equipment Operations
  getEquipments: async (): Promise<Equipment[]> => {
    await delay(500);
    return equipments;
  },

  getEquipmentById: async (id: string): Promise<Equipment | undefined> => {
    await delay(300);
    return equipments.find(e => e.id === id);
  },

  createEquipment: async (data: Partial<Equipment>): Promise<Equipment> => {
    await delay(600);
    console.log('Creating Equipment:', data);
    // Mock return with a generated ID
    return { ...equipments[0], ...data, id: `eq-new-${Date.now()}` } as Equipment;
  },

  updateEquipment: async (id: string, data: Partial<Equipment>): Promise<Equipment> => {
    await delay(600);
    console.log('Updating Equipment:', id, data);
    return { ...equipments[0], ...data, id } as Equipment;
  }
};