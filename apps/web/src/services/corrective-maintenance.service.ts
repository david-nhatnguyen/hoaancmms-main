import { correctiveMaintenances, CorrectiveMaintenance } from '@/api/mock/correctiveMaintenanceData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const correctiveMaintenanceService = {
  getAll: async (): Promise<CorrectiveMaintenance[]> => {
    await delay(500);
    return correctiveMaintenances;
  },

  getById: async (id: string): Promise<CorrectiveMaintenance | undefined> => {
    await delay(300);
    return correctiveMaintenances.find(cm => cm.id === id);
  },

  create: async (data: Partial<CorrectiveMaintenance>): Promise<CorrectiveMaintenance> => {
    await delay(600);
    console.log('Creating CM:', data);
    return { 
      ...correctiveMaintenances[0], 
      ...data, 
      id: `cm-new-${Date.now()}`,
      code: `CM-${Date.now()}`
    } as CorrectiveMaintenance;
  },

  update: async (id: string, data: Partial<CorrectiveMaintenance>): Promise<CorrectiveMaintenance> => {
    await delay(600);
    console.log('Updating CM:', id, data);
    return { ...correctiveMaintenances[0], ...data, id } as CorrectiveMaintenance;
  }
};