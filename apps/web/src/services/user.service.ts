
import { users, User } from '@/api/mock/systemData';

// Giả lập độ trễ mạng (Network Latency) để giống thật
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const userService = {
  getAll: async (): Promise<User[]> => {
    await delay(300); // Mock latency
    return users;
  },

  getById: async (id: string): Promise<User | undefined> => {
    await delay(200);
    return users.find(u => u.id === id);
  },

  getCurrentUser: async (): Promise<User> => {
    // Mock lấy user hiện tại (thường là từ token)
    await delay(200);
    return users[0]; // Trả về admin mặc định
  },
  
  // Sau này khi có API thật, bạn chỉ cần sửa logic trong hàm này
  // Interface trả về (Promise<User[]>) vẫn giữ nguyên -> UI không bị ảnh hưởng
};
