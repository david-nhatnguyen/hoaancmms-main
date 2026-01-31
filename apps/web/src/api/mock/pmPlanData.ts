// PM Planning data types and mock data

export interface PMPlanItem {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentGroup: string;
  machineType: string;
  checklistId: string | null;
  checklistName: string | null;
  plannedDate: string | null;
  assignee: string | null;
  notes: string;
  status: 'pending' | 'scheduled' | 'work-order-created';
}

export interface PMPlan {
  id: string;
  code: string;
  name: string;
  month: number;
  year: number;
  factoryId: string;
  factoryName: string;
  status: 'draft' | 'active' | 'locked';
  items: PMPlanItem[];
  createdAt: string;
  updatedAt: string;
}

export const PM_STATUS_LABELS = {
  draft: 'Nháp',
  active: 'Áp dụng',
  locked: 'Đã khóa'
};

export const PM_ITEM_STATUS_LABELS = {
  pending: 'Chờ lên lịch',
  scheduled: 'Đã lên lịch',
  'work-order-created': 'Đã tạo WO'
};

export const ASSIGNEES = [
  'Nguyễn Văn A',
  'Trần Văn B',
  'Lê Thị C',
  'Phạm Văn D',
  'Hoàng Văn E'
];

export const MONTHS = [
  { value: 1, label: 'Tháng 1' },
  { value: 2, label: 'Tháng 2' },
  { value: 3, label: 'Tháng 3' },
  { value: 4, label: 'Tháng 4' },
  { value: 5, label: 'Tháng 5' },
  { value: 6, label: 'Tháng 6' },
  { value: 7, label: 'Tháng 7' },
  { value: 8, label: 'Tháng 8' },
  { value: 9, label: 'Tháng 9' },
  { value: 10, label: 'Tháng 10' },
  { value: 11, label: 'Tháng 11' },
  { value: 12, label: 'Tháng 12' }
];

// Mock PM Plans
export const pmPlans: PMPlan[] = [
  {
    id: 'pm-012026',
    code: 'PM-012026',
    name: 'Kế hoạch bảo dưỡng tháng 01/2026',
    month: 1,
    year: 2026,
    factoryId: 'f01',
    factoryName: 'Nhà máy A',
    status: 'active',
    createdAt: '2025-12-20',
    updatedAt: '2025-12-25',
    items: [
      {
        id: 'pmi-001',
        equipmentId: 'imm-01',
        equipmentCode: 'IMM-01',
        equipmentName: 'Máy ép nhựa 280T',
        equipmentGroup: 'Máy ép nhựa',
        machineType: 'Injection Molding Machine',
        checklistId: 'cl-inj-001',
        checklistName: 'Injection Machine – Bảo dưỡng tháng',
        plannedDate: '2026-01-05',
        assignee: 'Nguyễn Văn A',
        notes: '',
        status: 'scheduled'
      },
      {
        id: 'pmi-002',
        equipmentId: 'imm-02',
        equipmentCode: 'IMM-02',
        equipmentName: 'Máy ép nhựa 180T',
        equipmentGroup: 'Máy ép nhựa',
        machineType: 'Injection Molding Machine',
        checklistId: 'cl-inj-001',
        checklistName: 'Injection Machine – Bảo dưỡng tháng',
        plannedDate: '2026-01-10',
        assignee: 'Trần Văn B',
        notes: '',
        status: 'scheduled'
      },
      {
        id: 'pmi-003',
        equipmentId: 'cnc-01',
        equipmentCode: 'CNC-01',
        equipmentName: 'Trung tâm gia công CNC',
        equipmentGroup: 'Máy gia công & Đo lường khuôn',
        machineType: 'CNC Machining Center',
        checklistId: 'cl-cnc-001',
        checklistName: 'CNC Machine – Bảo dưỡng tháng',
        plannedDate: '2026-01-15',
        assignee: 'Lê Thị C',
        notes: 'Kiểm tra độ chính xác trục',
        status: 'scheduled'
      },
      {
        id: 'pmi-004',
        equipmentId: 'cmm-01',
        equipmentCode: 'CMM-01',
        equipmentName: 'Máy đo tọa độ CMM',
        equipmentGroup: 'Máy gia công & Đo lường khuôn',
        machineType: 'CMM (Coordinate Measuring Machine)',
        checklistId: 'cl-cmm-001',
        checklistName: 'CMM – Bảo dưỡng tháng',
        plannedDate: '2026-01-20',
        assignee: 'Phạm Văn D',
        notes: '',
        status: 'scheduled'
      }
    ]
  },
  {
    id: 'pm-122025',
    code: 'PM-122025',
    name: 'Kế hoạch bảo dưỡng tháng 12/2025',
    month: 12,
    year: 2025,
    factoryId: 'f01',
    factoryName: 'Nhà máy A',
    status: 'locked',
    createdAt: '2025-11-20',
    updatedAt: '2025-12-01',
    items: [
      {
        id: 'pmi-005',
        equipmentId: 'imm-01',
        equipmentCode: 'IMM-01',
        equipmentName: 'Máy ép nhựa 280T',
        equipmentGroup: 'Máy ép nhựa',
        machineType: 'Injection Molding Machine',
        checklistId: 'cl-inj-001',
        checklistName: 'Injection Machine – Bảo dưỡng tháng',
        plannedDate: '2025-12-05',
        assignee: 'Nguyễn Văn A',
        notes: '',
        status: 'work-order-created'
      }
    ]
  },
  {
    id: 'pm-022026',
    code: 'PM-022026',
    name: 'Kế hoạch bảo dưỡng tháng 02/2026',
    month: 2,
    year: 2026,
    factoryId: 'f02',
    factoryName: 'Nhà máy B',
    status: 'draft',
    createdAt: '2026-01-15',
    updatedAt: '2026-01-15',
    items: [
      {
        id: 'pmi-006',
        equipmentId: 'imm-03',
        equipmentCode: 'IMM-03',
        equipmentName: 'Máy ép nhựa 450T',
        equipmentGroup: 'Máy ép nhựa',
        machineType: 'Injection Molding Machine',
        checklistId: null,
        checklistName: null,
        plannedDate: null,
        assignee: null,
        notes: '',
        status: 'pending'
      },
      {
        id: 'pmi-007',
        equipmentId: 'edm-01',
        equipmentCode: 'EDM-01',
        equipmentName: 'Máy xung điện EDM',
        equipmentGroup: 'Máy gia công & Đo lường khuôn',
        machineType: 'EDM Machine',
        checklistId: null,
        checklistName: null,
        plannedDate: '2026-02-10',
        assignee: 'Hoàng Văn E',
        notes: '',
        status: 'pending'
      }
    ]
  }
];

export function generatePMPlanCode(month: number, year: number): string {
  const monthStr = month.toString().padStart(2, '0');
  return `PM-${monthStr}${year}`;
}

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfMonth(month: number, year: number): number {
  return new Date(year, month - 1, 1).getDay();
}
