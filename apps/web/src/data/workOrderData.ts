// Work Order data types and mock data

export interface WorkOrderChecklistItem {
  id: string;
  order: number;
  task: string;
  standard: string;
  method: string;
  content: string;
  result: 'ok' | 'ng' | 'na' | null;
  notes: string;
  imageUrl: string | null;
  required: boolean;
  requireImage: boolean;
}

export interface WorkOrder {
  id: string;
  code: string;
  type: 'pm' | 'corrective';
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentGroup: string;
  machineType: string;
  checklistId: string;
  checklistName: string;
  plannedDate: string;
  assignee: string;
  factoryId: string;
  factoryName: string;
  status: 'new' | 'in-progress' | 'completed';
  startTime: string | null;
  endTime: string | null;
  totalNotes: string;
  items: WorkOrderChecklistItem[];
  createdAt: string;
  pmPlanId: string;
}

export const WO_STATUS_LABELS = {
  'new': 'Mới',
  'in-progress': 'Đang làm',
  'completed': 'Hoàn thành'
};

export const WO_TYPE_LABELS = {
  'pm': 'Bảo dưỡng định kỳ',
  'corrective': 'Sửa chữa'
};

export const RESULT_LABELS = {
  'ok': 'OK',
  'ng': 'NG',
  'na': 'N/A'
};

// Mock Work Orders
export const workOrders: WorkOrder[] = [
  {
    id: 'wo-001',
    code: 'WO-012026-001',
    type: 'pm',
    equipmentId: 'imm-01',
    equipmentCode: 'IMM-01',
    equipmentName: 'Máy ép nhựa 280T',
    equipmentGroup: 'Máy ép nhựa',
    machineType: 'Injection Molding Machine',
    checklistId: 'cl-inj-001',
    checklistName: 'Injection Machine – Bảo dưỡng tháng',
    plannedDate: '2026-01-05',
    assignee: 'Nguyễn Văn A',
    factoryId: 'f01',
    factoryName: 'Nhà máy A',
    status: 'new',
    startTime: null,
    endTime: null,
    totalNotes: '',
    pmPlanId: 'pm-012026',
    createdAt: '2025-12-25',
    items: [
      {
        id: 'woi-001',
        order: 1,
        task: 'Kiểm tra tổng thể máy',
        standard: 'Không có tiếng ồn bất thường, rò rỉ dầu',
        method: 'Quan sát, lắng nghe',
        content: 'Kiểm tra tổng quan tình trạng máy',
        result: null,
        notes: '',
        imageUrl: null,
        required: true,
        requireImage: false
      },
      {
        id: 'woi-002',
        order: 2,
        task: 'Kiểm tra hệ thống điện',
        standard: 'Đèn báo hoạt động bình thường, không có dây điện hở',
        method: 'Quan sát, đo điện áp',
        content: 'Kiểm tra tủ điện, dây điện, đèn báo',
        result: null,
        notes: '',
        imageUrl: null,
        required: true,
        requireImage: true
      },
      {
        id: 'woi-003',
        order: 3,
        task: 'Kiểm tra hệ thống bôi trơn',
        standard: 'Mức dầu đạt chuẩn, không rò rỉ',
        method: 'Quan sát, kiểm tra mức dầu',
        content: 'Kiểm tra mức dầu, bơm dầu, đường ống',
        result: null,
        notes: '',
        imageUrl: null,
        required: true,
        requireImage: false
      },
      {
        id: 'woi-004',
        order: 4,
        task: 'Kiểm tra an toàn vận hành',
        standard: 'Các nút dừng khẩn cấp hoạt động tốt',
        method: 'Thử nghiệm thực tế',
        content: 'Kiểm tra nút E-Stop, cửa an toàn',
        result: null,
        notes: '',
        imageUrl: null,
        required: true,
        requireImage: true
      }
    ]
  },
  {
    id: 'wo-002',
    code: 'WO-012026-002',
    type: 'pm',
    equipmentId: 'imm-02',
    equipmentCode: 'IMM-02',
    equipmentName: 'Máy ép nhựa 180T',
    equipmentGroup: 'Máy ép nhựa',
    machineType: 'Injection Molding Machine',
    checklistId: 'cl-inj-001',
    checklistName: 'Injection Machine – Bảo dưỡng tháng',
    plannedDate: '2026-01-10',
    assignee: 'Trần Văn B',
    factoryId: 'f01',
    factoryName: 'Nhà máy A',
    status: 'in-progress',
    startTime: '2026-01-10T08:30:00',
    endTime: null,
    totalNotes: '',
    pmPlanId: 'pm-012026',
    createdAt: '2025-12-25',
    items: [
      {
        id: 'woi-005',
        order: 1,
        task: 'Kiểm tra tổng thể máy',
        standard: 'Không có tiếng ồn bất thường',
        method: 'Quan sát, lắng nghe',
        content: 'Kiểm tra tổng quan tình trạng máy',
        result: 'ok',
        notes: '',
        imageUrl: null,
        required: true,
        requireImage: false
      },
      {
        id: 'woi-006',
        order: 2,
        task: 'Kiểm tra hệ thống điện',
        standard: 'Đèn báo hoạt động bình thường',
        method: 'Quan sát, đo điện áp',
        content: 'Kiểm tra tủ điện, dây điện, đèn báo',
        result: 'ng',
        notes: 'Phát hiện dây điện hở tại tủ điều khiển',
        imageUrl: null,
        required: true,
        requireImage: true
      },
      {
        id: 'woi-007',
        order: 3,
        task: 'Kiểm tra hệ thống bôi trơn',
        standard: 'Mức dầu đạt chuẩn',
        method: 'Quan sát, kiểm tra mức dầu',
        content: 'Kiểm tra mức dầu, bơm dầu',
        result: null,
        notes: '',
        imageUrl: null,
        required: true,
        requireImage: false
      }
    ]
  },
  {
    id: 'wo-003',
    code: 'WO-012026-003',
    type: 'pm',
    equipmentId: 'cnc-01',
    equipmentCode: 'CNC-01',
    equipmentName: 'Trung tâm gia công CNC',
    equipmentGroup: 'Máy gia công & Đo lường khuôn',
    machineType: 'CNC Machining Center',
    checklistId: 'cl-cnc-001',
    checklistName: 'CNC Machine – Bảo dưỡng tháng',
    plannedDate: '2026-01-15',
    assignee: 'Lê Thị C',
    factoryId: 'f01',
    factoryName: 'Nhà máy A',
    status: 'completed',
    startTime: '2026-01-15T07:00:00',
    endTime: '2026-01-15T09:30:00',
    totalNotes: 'Hoàn thành đúng tiến độ',
    pmPlanId: 'pm-012026',
    createdAt: '2025-12-25',
    items: [
      {
        id: 'woi-008',
        order: 1,
        task: 'Vệ sinh khu vực làm việc',
        standard: 'Sạch sẽ, không phoi bám',
        method: 'Quan sát',
        content: 'Vệ sinh bàn máy, rãnh T',
        result: 'ok',
        notes: '',
        imageUrl: null,
        required: true,
        requireImage: false
      },
      {
        id: 'woi-009',
        order: 2,
        task: 'Kiểm tra trục chính',
        standard: 'Không rung, nhiệt độ bình thường',
        method: 'Đo rung động, đo nhiệt',
        content: 'Kiểm tra độ rung và nhiệt độ trục chính',
        result: 'ok',
        notes: '',
        imageUrl: null,
        required: true,
        requireImage: true
      }
    ]
  },
  {
    id: 'wo-004',
    code: 'WO-012026-004',
    type: 'pm',
    equipmentId: 'cmm-01',
    equipmentCode: 'CMM-01',
    equipmentName: 'Máy đo tọa độ CMM',
    equipmentGroup: 'Máy gia công & Đo lường khuôn',
    machineType: 'CMM (Coordinate Measuring Machine)',
    checklistId: 'cl-cmm-001',
    checklistName: 'CMM – Bảo dưỡng tháng',
    plannedDate: '2026-01-20',
    assignee: 'Phạm Văn D',
    factoryId: 'f01',
    factoryName: 'Nhà máy A',
    status: 'new',
    startTime: null,
    endTime: null,
    totalNotes: '',
    pmPlanId: 'pm-012026',
    createdAt: '2025-12-25',
    items: [
      {
        id: 'woi-010',
        order: 1,
        task: 'Kiểm tra độ chính xác máy',
        standard: 'Sai số trong phạm vi cho phép',
        method: 'Đo bằng mẫu chuẩn',
        content: 'Đo và so sánh với mẫu chuẩn',
        result: null,
        notes: '',
        imageUrl: null,
        required: true,
        requireImage: true
      }
    ]
  }
];

export function generateWorkOrderCode(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const sequence = Math.floor(Math.random() * 999) + 1;
  return `WO-${month}${year}-${sequence.toString().padStart(3, '0')}`;
}

export function calculateProgress(items: WorkOrderChecklistItem[]): number {
  const completed = items.filter(i => i.result !== null).length;
  return Math.round((completed / items.length) * 100);
}

export function calculateDuration(start: string | null, end: string | null): string {
  if (!start) return '-';
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const diffMs = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}
