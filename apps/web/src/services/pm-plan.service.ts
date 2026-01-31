import { pmPlans, PMPlan, getDaysInMonth, getFirstDayOfMonth } from '@/api/mock/pmPlanData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const pmPlanService = {
  getAll: async (): Promise<PMPlan[]> => {
    await delay(500);
    return pmPlans;
  },

  getById: async (id: string): Promise<PMPlan | undefined> => {
    await delay(300);
    return pmPlans.find(p => p.id === id);
  },

  // Helper functions (Business Logic)
  // Trong thực tế, logic này có thể nằm ở Backend hoặc Utility shared
  utils: {
    getDaysInMonth,
    getFirstDayOfMonth
  }
};

export type { PMPlan };