// Mock data for Checklist Library module - Vietnamese language

export interface ChecklistItem {
  id: string;
  order: number;
  maintenanceTask: string;
  standard: string;
  method: string;
  content: string;
  expectedResult: string;
  isRequired: boolean;
  requiresImage: boolean;
}

export interface ChecklistTemplate {
  id: string;
  code: string;
  name: string;
  equipmentGroupId: 'injection' | 'mold-manufacturing';
  machineType: string;
  cycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  version: number;
  status: 'draft' | 'active' | 'inactive';
  notes?: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export const CYCLE_LABELS = {
  daily: 'Ngày',
  weekly: 'Tuần',
  monthly: 'Tháng',
  quarterly: 'Quý',
  yearly: 'Năm'
};

export const CHECKLIST_STATUS_LABELS = {
  draft: 'Nháp',
  active: 'Áp dụng',
  inactive: 'Ngừng sử dụng'
};

export const checklistTemplates: ChecklistTemplate[] = [
  {
    id: 'cl-001',
    code: 'CL-INJ-001',
    name: 'Injection Machine – Bảo dưỡng tháng',
    equipmentGroupId: 'injection',
    machineType: 'Injection Molding Machine',
    cycle: 'monthly',
    version: 1,
    status: 'active',
    notes: 'Checklist bảo dưỡng định kỳ cho máy ép nhựa',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    items: [
      {
        id: 'item-001',
        order: 1,
        maintenanceTask: 'Kiểm tra tổng thể máy',
        standard: 'Không có tiếng ồn bất thường, rung động quá mức',
        method: 'Quan sát và lắng nghe',
        content: 'Kiểm tra bên ngoài máy, các bộ phận cơ khí',
        expectedResult: 'OK',
        isRequired: true,
        requiresImage: false
      },
      {
        id: 'item-002',
        order: 2,
        maintenanceTask: 'Kiểm tra hệ thống điện',
        standard: 'Không có dây điện hở, cháy, chập',
        method: 'Quan sát trực quan',
        content: 'Kiểm tra tủ điện, dây cáp, công tắc',
        expectedResult: 'OK',
        isRequired: true,
        requiresImage: true
      },
      {
        id: 'item-003',
        order: 3,
        maintenanceTask: 'Kiểm tra hệ thống bôi trơn',
        standard: 'Mức dầu trong phạm vi cho phép',
        method: 'Đo mức dầu bằng que thăm',
        content: 'Kiểm tra mức dầu, thay dầu nếu cần',
        expectedResult: 'Mức dầu ≥ 70%',
        isRequired: true,
        requiresImage: false
      },
      {
        id: 'item-004',
        order: 4,
        maintenanceTask: 'Kiểm tra an toàn vận hành',
        standard: 'Các cơ cấu an toàn hoạt động bình thường',
        method: 'Test từng cơ cấu an toàn',
        content: 'Kiểm tra nút dừng khẩn cấp, cửa bảo vệ',
        expectedResult: 'OK',
        isRequired: true,
        requiresImage: true
      },
      {
        id: 'item-005',
        order: 5,
        maintenanceTask: 'Kiểm tra hệ thống làm mát',
        standard: 'Nhiệt độ nước làm mát 20-25°C',
        method: 'Đo nhiệt độ bằng nhiệt kế',
        content: 'Kiểm tra bơm, đường ống, nhiệt độ nước',
        expectedResult: '20-25°C',
        isRequired: false,
        requiresImage: false
      }
    ]
  },
  {
    id: 'cl-002',
    code: 'CL-INJ-002',
    name: 'Injection Machine – Bảo dưỡng tuần',
    equipmentGroupId: 'injection',
    machineType: 'Injection Molding Machine',
    cycle: 'weekly',
    version: 2,
    status: 'active',
    createdAt: '2024-01-10',
    updatedAt: '2024-02-05',
    items: [
      {
        id: 'item-101',
        order: 1,
        maintenanceTask: 'Vệ sinh bề mặt máy',
        standard: 'Sạch sẽ, không dính dầu mỡ',
        method: 'Lau chùi bằng khăn',
        content: 'Vệ sinh toàn bộ bề mặt máy',
        expectedResult: 'OK',
        isRequired: true,
        requiresImage: false
      },
      {
        id: 'item-102',
        order: 2,
        maintenanceTask: 'Kiểm tra áp suất thủy lực',
        standard: '100-150 bar',
        method: 'Đọc đồng hồ áp suất',
        content: 'Kiểm tra áp suất hệ thống thủy lực',
        expectedResult: '100-150 bar',
        isRequired: true,
        requiresImage: false
      }
    ]
  },
  {
    id: 'cl-003',
    code: 'CL-CNC-001',
    name: 'CNC Machine – Bảo dưỡng tháng',
    equipmentGroupId: 'mold-manufacturing',
    machineType: 'CNC Machining Center',
    cycle: 'monthly',
    version: 1,
    status: 'active',
    notes: 'Checklist cho máy CNC gia công khuôn',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
    items: [
      {
        id: 'item-201',
        order: 1,
        maintenanceTask: 'Vệ sinh khu vực làm việc',
        standard: 'Không có phoi, dầu tràn',
        method: 'Quan sát và vệ sinh',
        content: 'Vệ sinh bàn máy, khu vực gia công',
        expectedResult: 'OK',
        isRequired: true,
        requiresImage: true
      },
      {
        id: 'item-202',
        order: 2,
        maintenanceTask: 'Kiểm tra trục chính',
        standard: 'Không rung, không có tiếng ồn',
        method: 'Chạy thử và lắng nghe',
        content: 'Kiểm tra ổ bi, độ đảo trục chính',
        expectedResult: 'OK',
        isRequired: true,
        requiresImage: false
      },
      {
        id: 'item-203',
        order: 3,
        maintenanceTask: 'Kiểm tra hệ thống làm mát',
        standard: 'Dung dịch làm mát đủ, không bị bẩn',
        method: 'Kiểm tra bể chứa',
        content: 'Kiểm tra mức dung dịch, bộ lọc',
        expectedResult: 'Mức dung dịch ≥ 80%',
        isRequired: true,
        requiresImage: false
      },
      {
        id: 'item-204',
        order: 4,
        maintenanceTask: 'Kiểm tra độ chính xác máy',
        standard: 'Sai số ≤ 0.01mm',
        method: 'Đo bằng đồng hồ so',
        content: 'Kiểm tra độ song song, độ vuông góc',
        expectedResult: '≤ 0.01mm',
        isRequired: true,
        requiresImage: true
      }
    ]
  },
  {
    id: 'cl-004',
    code: 'CL-CMM-001',
    name: 'CMM – Bảo dưỡng tháng',
    equipmentGroupId: 'mold-manufacturing',
    machineType: 'CMM (Coordinate Measuring Machine)',
    cycle: 'monthly',
    version: 1,
    status: 'draft',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
    items: [
      {
        id: 'item-301',
        order: 1,
        maintenanceTask: 'Vệ sinh bàn đá granite',
        standard: 'Sạch, không có bụi bẩn',
        method: 'Lau bằng khăn sạch',
        content: 'Vệ sinh bề mặt bàn đo',
        expectedResult: 'OK',
        isRequired: true,
        requiresImage: false
      },
      {
        id: 'item-302',
        order: 2,
        maintenanceTask: 'Kiểm tra đầu dò',
        standard: 'Đầu dò không bị mòn, cong',
        method: 'Quan sát trực quan',
        content: 'Kiểm tra các đầu dò stylus',
        expectedResult: 'OK',
        isRequired: true,
        requiresImage: true
      }
    ]
  },
  {
    id: 'cl-005',
    code: 'CL-EDM-001',
    name: 'EDM Machine – Bảo dưỡng quý',
    equipmentGroupId: 'mold-manufacturing',
    machineType: 'EDM Machine',
    cycle: 'quarterly',
    version: 1,
    status: 'inactive',
    createdAt: '2023-11-15',
    updatedAt: '2024-01-10',
    items: [
      {
        id: 'item-401',
        order: 1,
        maintenanceTask: 'Thay dầu điện cực',
        standard: 'Dầu mới, sạch',
        method: 'Thay thế hoàn toàn',
        content: 'Xả dầu cũ, thay dầu mới',
        expectedResult: 'OK',
        isRequired: true,
        requiresImage: true
      }
    ]
  }
];

// Helper to generate new checklist code
export const generateChecklistCode = (groupId: string): string => {
  const prefix = groupId === 'injection' ? 'CL-INJ' : 'CL-MFG';
  const num = String(Math.floor(Math.random() * 900) + 100);
  return `${prefix}-${num}`;
};

// Empty checklist item template
export const createEmptyItem = (order: number): ChecklistItem => ({
  id: `item-${Date.now()}-${order}`,
  order,
  maintenanceTask: '',
  standard: '',
  method: '',
  content: '',
  expectedResult: '',
  isRequired: false,
  requiresImage: false
});
