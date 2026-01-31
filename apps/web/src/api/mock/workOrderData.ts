export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical';
export type WorkOrderStatus = 'new' | 'in-progress' | 'pending' | 'completed' | 'cancelled';

export interface WorkOrder {
  id: string;
  code: string;
  title: string;
  description?: string;
  equipmentId: string;
  equipmentName: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignee?: string;
  dueDate: string;
  createdAt: string;
  type: 'PM' | 'CM'; // Preventive or Corrective
}

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  new: 'Mới',
  'in-progress': 'Đang thực hiện',
  pending: 'Chờ vật tư',
  completed: 'Hoàn thành',
  cancelled: 'Hủy'
};

export const WORK_ORDER_PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  critical: 'Khẩn cấp'
};

export const workOrders: WorkOrder[] = [
  {
    id: 'wo-001',
    code: 'WO-202401-001',
    title: 'Bảo dưỡng định kỳ Máy ép nhựa 280T',
    equipmentId: 'imm-01',
    equipmentName: 'Máy ép nhựa 280T',
    priority: 'medium',
    status: 'in-progress',
    assignee: 'Lê Văn Kỹ Thuật',
    dueDate: '2024-01-25',
    createdAt: '2024-01-20',
    type: 'PM'
  },
  {
    id: 'wo-002',
    code: 'WO-202401-002',
    title: 'Sửa chữa lỗi trục chính CNC',
    equipmentId: 'cnc-01',
    equipmentName: 'Trung tâm gia công CNC',
    priority: 'high',
    status: 'new',
    assignee: 'Trần Thị Kế Hoạch',
    dueDate: '2024-01-22',
    createdAt: '2024-01-21',
    type: 'CM'
  },
  {
    id: 'wo-003',
    code: 'WO-202401-003',
    title: 'Kiểm tra định kỳ CMM',
    equipmentId: 'cmm-01',
    equipmentName: 'Máy đo tọa độ CMM',
    priority: 'low',
    status: 'completed',
    assignee: 'Nguyễn Văn Admin',
    dueDate: '2024-01-15',
    createdAt: '2024-01-10',
    type: 'PM'
  }
];