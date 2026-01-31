import { workOrders, WorkOrder } from '@/api/mock/workOrderData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const workOrderService = {
  getAll: async (): Promise<WorkOrder[]> => {
    await delay(500);
    return workOrders;
  },

  getById: async (id: string): Promise<WorkOrder | undefined> => {
    await delay(300);
    return workOrders.find(wo => wo.id === id);
  },

  create: async (data: Partial<WorkOrder>): Promise<WorkOrder> => {
    await delay(600);
    console.log('Creating WO:', data);
    return { ...workOrders[0], ...data } as WorkOrder; // Mock return
  }
};