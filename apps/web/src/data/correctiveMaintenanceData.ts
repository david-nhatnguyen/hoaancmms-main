// Corrective Maintenance (Bảo trì sự cố) Data

export interface CorrectiveMaintenance {
  id: string;
  code: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentGroup: string;
  machineType: string;
  factoryId: string;
  factoryName: string;
  
  // Incident info
  reportedAt: string;
  reportedBy: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  images: string[];
  
  // Repair info
  cause?: string;
  causeDescription?: string;
  correctionAction?: string;
  repairResult?: 'fixed' | 'temporary' | 'pending';
  repairImages?: string[];
  
  // Time tracking
  repairStartTime?: string;
  repairEndTime?: string;
  totalRepairTime?: string;
  totalDowntime?: string;
  
  // Confirmation
  confirmedBy?: string;
  equipmentCondition?: string;
  confirmNotes?: string;
  
  status: 'new' | 'in-progress' | 'completed' | 'closed';
}

export const CM_STATUS_LABELS: Record<CorrectiveMaintenance['status'], string> = {
  'new': 'Mới',
  'in-progress': 'Đang xử lý',
  'completed': 'Hoàn thành',
  'closed': 'Đã đóng'
};

export const SEVERITY_LABELS: Record<CorrectiveMaintenance['severity'], string> = {
  'low': 'Nhẹ',
  'medium': 'Trung bình',
  'high': 'Nặng'
};

export const SEVERITY_DESCRIPTIONS: Record<CorrectiveMaintenance['severity'], string> = {
  'low': 'Máy vẫn chạy',
  'medium': 'Giảm năng suất',
  'high': 'Dừng máy'
};

export const REPAIR_RESULT_LABELS: Record<string, string> = {
  'fixed': 'Đã khắc phục',
  'temporary': 'Khắc phục tạm thời',
  'pending': 'Chưa xử lý xong'
};

export const COMMON_CAUSES = [
  'Hỏng linh kiện điện',
  'Hỏng linh kiện cơ khí',
  'Lỗi phần mềm/điều khiển',
  'Mất nguồn/điện',
  'Rò rỉ dầu/khí',
  'Quá tải',
  'Lỗi thao tác vận hành',
  'Nguyên nhân khác'
];

// Mock data
export const correctiveMaintenances: CorrectiveMaintenance[] = [
  {
    id: 'cm-1',
    code: 'CM-012025-001',
    equipmentId: 'eq-cnc-01',
    equipmentCode: 'CNC-01',
    equipmentName: 'CNC Machining Center',
    equipmentGroup: 'Máy gia công khuôn & Đo lường',
    machineType: 'CNC 5-axis',
    factoryId: 'factory-hcm',
    factoryName: 'Nhà máy HCM',
    reportedAt: '2025-01-15T08:30:00',
    reportedBy: 'Trần Văn B',
    description: 'Trục chính phát tiếng ồn bất thường khi chạy tốc độ cao',
    severity: 'medium',
    images: [],
    cause: 'Hỏng linh kiện cơ khí',
    causeDescription: 'Bạc đạn trục chính bị mòn',
    correctionAction: 'Thay mới bạc đạn trục chính',
    repairResult: 'fixed',
    repairStartTime: '2025-01-15T09:00:00',
    repairEndTime: '2025-01-15T14:30:00',
    totalRepairTime: '5 giờ 30 phút',
    totalDowntime: '6 giờ',
    status: 'completed'
  },
  {
    id: 'cm-2',
    code: 'CM-012025-002',
    equipmentId: 'eq-imm-02',
    equipmentCode: 'IMM-02',
    equipmentName: 'Injection Molding Machine 350T',
    equipmentGroup: 'Máy ép nhựa',
    machineType: 'Hydraulic 350T',
    factoryId: 'factory-hn',
    factoryName: 'Nhà máy Hà Nội',
    reportedAt: '2025-01-16T14:20:00',
    reportedBy: 'Nguyễn Văn C',
    description: 'Rò rỉ dầu thủy lực ở xy lanh kẹp khuôn',
    severity: 'high',
    images: [],
    cause: 'Rò rỉ dầu/khí',
    causeDescription: 'Phốt xy lanh bị hỏng',
    status: 'in-progress',
    repairStartTime: '2025-01-16T15:00:00'
  },
  {
    id: 'cm-3',
    code: 'CM-012025-003',
    equipmentId: 'eq-cmm-01',
    equipmentCode: 'CMM-01',
    equipmentName: 'CMM Coordinate Measuring Machine',
    equipmentGroup: 'Máy gia công khuôn & Đo lường',
    machineType: 'Bridge CMM',
    factoryId: 'factory-hcm',
    factoryName: 'Nhà máy HCM',
    reportedAt: '2025-01-17T10:45:00',
    reportedBy: 'Lê Thị D',
    description: 'Lỗi hiển thị trên màn hình điều khiển, báo lỗi encoder trục X',
    severity: 'low',
    images: [],
    status: 'new'
  },
  {
    id: 'cm-4',
    code: 'CM-012025-004',
    equipmentId: 'eq-imm-01',
    equipmentCode: 'IMM-01',
    equipmentName: 'Injection Molding Machine 280T',
    equipmentGroup: 'Máy ép nhựa',
    machineType: 'Hydraulic 280T',
    factoryId: 'factory-hcm',
    factoryName: 'Nhà máy HCM',
    reportedAt: '2025-01-14T16:00:00',
    reportedBy: 'Phạm Văn E',
    description: 'Nhiệt độ barrel không đạt, gia nhiệt chậm',
    severity: 'medium',
    images: [],
    cause: 'Hỏng linh kiện điện',
    causeDescription: 'Heater band zone 2 bị cháy',
    correctionAction: 'Thay heater band mới',
    repairResult: 'fixed',
    repairStartTime: '2025-01-14T16:30:00',
    repairEndTime: '2025-01-14T18:00:00',
    totalRepairTime: '1 giờ 30 phút',
    totalDowntime: '2 giờ',
    confirmedBy: 'Nguyễn Văn A',
    equipmentCondition: 'Thiết bị hoạt động bình thường',
    status: 'closed'
  },
  {
    id: 'cm-5',
    code: 'CM-012025-005',
    equipmentId: 'eq-cnc-02',
    equipmentCode: 'CNC-02',
    equipmentName: 'CNC Wire EDM',
    equipmentGroup: 'Máy gia công khuôn & Đo lường',
    machineType: 'Wire EDM',
    factoryId: 'factory-hn',
    factoryName: 'Nhà máy Hà Nội',
    reportedAt: '2025-01-17T08:00:00',
    reportedBy: 'Hoàng Văn F',
    description: 'Dây cắt liên tục bị đứt, không ổn định',
    severity: 'high',
    images: [],
    status: 'new'
  }
];

export function generateCMCode(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const seq = String(correctiveMaintenances.length + 1).padStart(3, '0');
  return `CM-${month}${year}-${seq}`;
}

export function calculateDowntime(reportedAt: string, endTime?: string): string {
  const start = new Date(reportedAt);
  const end = endTime ? new Date(endTime) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  }
  return `${minutes} phút`;
}

export function calculateRepairDuration(startTime?: string, endTime?: string): string {
  if (!startTime) return '-';
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  }
  return `${minutes} phút`;
}
