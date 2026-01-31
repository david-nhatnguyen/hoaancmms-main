import { checklistTemplates, ChecklistTemplate } from '@/api/mock/checklistData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const checklistService = {
  getAll: async (): Promise<ChecklistTemplate[]> => {
    await delay(500);
    return checklistTemplates;
  },

  getById: async (id: string): Promise<ChecklistTemplate | undefined> => {
    await delay(300);
    return checklistTemplates.find(c => c.id === id);
  },

  create: async (data: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> => {
    await delay(600);
    console.log('Creating Checklist:', data);
    return { 
      ...checklistTemplates[0], 
      ...data, 
      id: `cl-new-${Date.now()}` 
    } as ChecklistTemplate;
  },

  update: async (id: string, data: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> => {
    await delay(600);
    console.log('Updating Checklist:', id, data);
    return { ...checklistTemplates[0], ...data, id } as ChecklistTemplate;
  }
};