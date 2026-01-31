import { defaultSettings, SystemSettings } from '@/api/mock/systemData';

// Giả lập delay mạng
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const settingsService = {
  getSettings: async (): Promise<SystemSettings> => {
    await delay(500); // Mock loading time
    return defaultSettings;
  },

  updateSettings: async (newSettings: SystemSettings): Promise<SystemSettings> => {
    await delay(800); // Mock saving time
    console.log('Saved settings to backend:', newSettings);
    return newSettings;
  }
};