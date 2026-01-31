// System Admin Module Data

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  roleId: string;
  factories: string[];
  factoryNames: string[];
  status: 'active' | 'locked';
  lastLogin?: string;
  createdAt: string;
  notes?: string;
  forcePasswordChange: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isSystem: boolean; // System roles cannot be deleted
  permissions: Permission[];
}

export interface Permission {
  moduleId: string;
  moduleName: string;
  actions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
    approve: boolean;
    lock: boolean;
  };
}

export interface SystemLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'lock' | 'unlock' | 'login' | 'logout' | 'export' | 'approve';
  module: string;
  objectId?: string;
  objectName?: string;
  details: string;
  ipAddress?: string;
  device?: string;
  beforeData?: string;
  afterData?: string;
}

// Permission Modules
export const PERMISSION_MODULES = [
  { id: 'asset', name: 'Quản lý tài sản', description: 'Nhà máy, Thiết bị' },
  { id: 'checklist', name: 'Thư viện Checklist', description: 'Mẫu checklist' },
  { id: 'pm-plan', name: 'Kế hoạch PM', description: 'Lập kế hoạch bảo dưỡng' },
  { id: 'work-order', name: 'Work Order', description: 'Phiếu công việc' },
  { id: 'corrective', name: 'Bảo trì sự cố', description: 'Báo hỏng, sửa chữa' },
  { id: 'dashboard', name: 'Dashboard & KPI', description: 'Báo cáo, thống kê' },
  { id: 'system', name: 'Hệ thống', description: 'Người dùng, Vai trò, Cài đặt' },
];

export const ACTION_LABELS: Record<string, string> = {
  view: 'Xem',
  create: 'Tạo',
  edit: 'Sửa',
  delete: 'Xóa',
  export: 'Xuất',
  approve: 'Duyệt',
  lock: 'Khóa',
};

// Default Roles
export const roles: Role[] = [
  {
    id: 'admin',
    name: 'Quản trị hệ thống',
    description: 'Toàn quyền truy cập và quản lý hệ thống',
    userCount: 1,
    isSystem: true,
    permissions: PERMISSION_MODULES.map(m => ({
      moduleId: m.id,
      moduleName: m.name,
      actions: { view: true, create: true, edit: true, delete: true, export: true, approve: true, lock: true }
    }))
  },
  {
    id: 'maintenance-manager',
    name: 'Quản lý bảo trì',
    description: 'Quản lý toàn bộ hoạt động bảo trì, duyệt kế hoạch',
    userCount: 2,
    isSystem: true,
    permissions: PERMISSION_MODULES.map(m => ({
      moduleId: m.id,
      moduleName: m.name,
      actions: { 
        view: true, 
        create: m.id !== 'system', 
        edit: m.id !== 'system', 
        delete: m.id !== 'system' && m.id !== 'asset', 
        export: true, 
        approve: m.id === 'pm-plan' || m.id === 'work-order',
        lock: false 
      }
    }))
  },
  {
    id: 'planner',
    name: 'Kế hoạch bảo trì',
    description: 'Lập kế hoạch PM, tạo Work Order',
    userCount: 3,
    isSystem: true,
    permissions: PERMISSION_MODULES.map(m => ({
      moduleId: m.id,
      moduleName: m.name,
      actions: { 
        view: true, 
        create: ['pm-plan', 'work-order', 'checklist'].includes(m.id), 
        edit: ['pm-plan', 'work-order', 'checklist'].includes(m.id), 
        delete: false, 
        export: true, 
        approve: false,
        lock: false 
      }
    }))
  },
  {
    id: 'technician',
    name: 'Kỹ thuật viên',
    description: 'Thực hiện công việc bảo trì, cập nhật tiến độ',
    userCount: 8,
    isSystem: true,
    permissions: PERMISSION_MODULES.map(m => ({
      moduleId: m.id,
      moduleName: m.name,
      actions: { 
        view: m.id !== 'system', 
        create: m.id === 'corrective', 
        edit: ['work-order', 'corrective'].includes(m.id), 
        delete: false, 
        export: false, 
        approve: false,
        lock: false 
      }
    }))
  },
  {
    id: 'production-manager',
    name: 'Quản lý sản xuất',
    description: 'Theo dõi tình trạng thiết bị, xem báo cáo',
    userCount: 2,
    isSystem: true,
    permissions: PERMISSION_MODULES.map(m => ({
      moduleId: m.id,
      moduleName: m.name,
      actions: { 
        view: true, 
        create: m.id === 'corrective', 
        edit: false, 
        delete: false, 
        export: true, 
        approve: false,
        lock: false 
      }
    }))
  },
  {
    id: 'operator',
    name: 'Người vận hành',
    description: 'Báo hỏng thiết bị, xem thông tin cơ bản',
    userCount: 15,
    isSystem: true,
    permissions: PERMISSION_MODULES.map(m => ({
      moduleId: m.id,
      moduleName: m.name,
      actions: { 
        view: ['asset', 'corrective'].includes(m.id), 
        create: m.id === 'corrective', 
        edit: false, 
        delete: false, 
        export: false, 
        approve: false,
        lock: false 
      }
    }))
  },
  {
    id: 'viewer',
    name: 'Chỉ xem',
    description: 'Chỉ xem thông tin, không thể thao tác',
    userCount: 5,
    isSystem: true,
    permissions: PERMISSION_MODULES.map(m => ({
      moduleId: m.id,
      moduleName: m.name,
      actions: { 
        view: m.id !== 'system', 
        create: false, 
        edit: false, 
        delete: false, 
        export: false, 
        approve: false,
        lock: false 
      }
    }))
  },
];

// Mock Users
export const users: User[] = [
  {
    id: 'u1',
    fullName: 'Nguyễn Văn Admin',
    email: 'admin@factory.com',
    phone: '0901234567',
    role: 'Quản trị hệ thống',
    roleId: 'admin',
    factories: ['all'],
    factoryNames: ['Tất cả nhà máy'],
    status: 'active',
    lastLogin: '18/01/2026 08:30',
    createdAt: '01/01/2025',
    forcePasswordChange: false,
  },
  {
    id: 'u2',
    fullName: 'Trần Thị Kế Hoạch',
    email: 'plannerA@factory.com',
    phone: '0912345678',
    role: 'Kế hoạch bảo trì',
    roleId: 'planner',
    factories: ['factory-a'],
    factoryNames: ['Nhà máy A'],
    status: 'active',
    lastLogin: '18/01/2026 07:45',
    createdAt: '15/03/2025',
    forcePasswordChange: false,
  },
  {
    id: 'u3',
    fullName: 'Lê Văn Kỹ Thuật',
    email: 'tech01@factory.com',
    phone: '0923456789',
    role: 'Kỹ thuật viên',
    roleId: 'technician',
    factories: ['factory-a'],
    factoryNames: ['Nhà máy A'],
    status: 'active',
    lastLogin: '18/01/2026 06:00',
    createdAt: '20/04/2025',
    forcePasswordChange: false,
  },
  {
    id: 'u4',
    fullName: 'Phạm Văn Vận Hành',
    email: 'op01@factory.com',
    phone: '0934567890',
    role: 'Người vận hành',
    roleId: 'operator',
    factories: ['factory-a'],
    factoryNames: ['Nhà máy A'],
    status: 'active',
    lastLogin: '17/01/2026 22:00',
    createdAt: '01/05/2025',
    forcePasswordChange: true,
  },
  {
    id: 'u5',
    fullName: 'Hoàng Thị Quản Lý',
    email: 'manager@factory.com',
    phone: '0945678901',
    role: 'Quản lý bảo trì',
    roleId: 'maintenance-manager',
    factories: ['factory-a', 'factory-b'],
    factoryNames: ['Nhà máy A', 'Nhà máy B'],
    status: 'active',
    lastLogin: '18/01/2026 08:00',
    createdAt: '10/02/2025',
    forcePasswordChange: false,
  },
  {
    id: 'u6',
    fullName: 'Võ Văn Sản Xuất',
    email: 'production@factory.com',
    phone: '0956789012',
    role: 'Quản lý sản xuất',
    roleId: 'production-manager',
    factories: ['factory-b'],
    factoryNames: ['Nhà máy B'],
    status: 'locked',
    lastLogin: '10/01/2026 14:30',
    createdAt: '01/06/2025',
    notes: 'Tài khoản đã bị khóa do nghỉ việc',
    forcePasswordChange: false,
  },
];

// Mock System Logs
export const systemLogs: SystemLog[] = [
  {
    id: 'log1',
    timestamp: '18/01/2026 08:30:15',
    userId: 'u1',
    userName: 'Nguyễn Văn Admin',
    action: 'login',
    module: 'Hệ thống',
    details: 'Đăng nhập thành công',
    ipAddress: '192.168.1.100',
    device: 'Chrome / Windows',
  },
  {
    id: 'log2',
    timestamp: '18/01/2026 08:10:22',
    userId: 'u3',
    userName: 'Lê Văn Kỹ Thuật',
    action: 'update',
    module: 'Work Order',
    objectId: 'WO-012026-001',
    objectName: 'Phiếu bảo dưỡng IMM-01',
    details: 'Cập nhật tiến độ: 67% → 100%',
    ipAddress: '192.168.1.50',
    device: 'Mobile / Android',
  },
  {
    id: 'log3',
    timestamp: '18/01/2026 09:30:45',
    userId: 'u2',
    userName: 'Trần Thị Kế Hoạch',
    action: 'approve',
    module: 'Kế hoạch PM',
    objectId: 'PM-012026',
    objectName: 'Kế hoạch PM tháng 01/2026',
    details: 'Áp dụng kế hoạch cho 15 thiết bị',
    ipAddress: '192.168.1.30',
    device: 'Firefox / Windows',
  },
  {
    id: 'log4',
    timestamp: '18/01/2026 10:05:12',
    userId: 'u4',
    userName: 'Phạm Văn Vận Hành',
    action: 'create',
    module: 'Bảo trì sự cố',
    objectId: 'CM-012026-003',
    objectName: 'Sự cố máy CNC-01',
    details: 'Báo hỏng: Máy CNC-01 - Lỗi trục chính',
    ipAddress: '192.168.1.80',
    device: 'Mobile / iOS',
  },
  {
    id: 'log5',
    timestamp: '17/01/2026 16:45:30',
    userId: 'u1',
    userName: 'Nguyễn Văn Admin',
    action: 'lock',
    module: 'Hệ thống',
    objectId: 'u6',
    objectName: 'Võ Văn Sản Xuất',
    details: 'Khóa tài khoản: Nghỉ việc',
    ipAddress: '192.168.1.100',
    device: 'Chrome / Windows',
  },
  {
    id: 'log6',
    timestamp: '17/01/2026 14:20:00',
    userId: 'u5',
    userName: 'Hoàng Thị Quản Lý',
    action: 'export',
    module: 'Dashboard',
    details: 'Xuất báo cáo hiệu suất bảo trì tháng 12/2025',
    ipAddress: '192.168.1.40',
    device: 'Chrome / MacOS',
  },
  {
    id: 'log7',
    timestamp: '17/01/2026 11:30:00',
    userId: 'u2',
    userName: 'Trần Thị Kế Hoạch',
    action: 'create',
    module: 'Work Order',
    objectId: 'WO-012026-005',
    objectName: 'Phiếu bảo dưỡng IMM-03',
    details: 'Tạo phiếu công việc từ kế hoạch PM',
    ipAddress: '192.168.1.30',
    device: 'Firefox / Windows',
  },
  {
    id: 'log8',
    timestamp: '16/01/2026 09:00:00',
    userId: 'u1',
    userName: 'Nguyễn Văn Admin',
    action: 'update',
    module: 'Hệ thống',
    objectId: 'settings',
    objectName: 'Cài đặt hệ thống',
    details: 'Thay đổi: Bắt buộc ảnh khi WO có NG → Bật',
    ipAddress: '192.168.1.100',
    device: 'Chrome / Windows',
  },
];

// System Settings
export interface SystemSettings {
  general: {
    language: string;
    timezone: string;
    dateFormat: string;
    timeUnit: string;
    companyName: string;
  };
  operations: {
    allowEditAppliedPM: boolean;
    allowDragDropPM: boolean;
    requirePhotoOnNG: boolean;
    requireNoteOnNG: boolean;
    allowReopenIncident: boolean;
  };
  workOrder: {
    defaultStatus: string;
    allowConfirmComplete: boolean;
    requireApproverOnClose: boolean;
  };
  corrective: {
    requireImpactLevel: boolean;
    requireCauseBeforeClose: boolean;
  };
  notifications: {
    enableOverdueAlert: boolean;
    enableSevereIncidentAlert: boolean;
    pmReminderDays: number;
  };
}

export const defaultSettings: SystemSettings = {
  general: {
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'DD/MM/YYYY',
    timeUnit: 'Giờ',
    companyName: 'Công ty TNHH Sản Xuất ABC',
  },
  operations: {
    allowEditAppliedPM: false,
    allowDragDropPM: true,
    requirePhotoOnNG: true,
    requireNoteOnNG: true,
    allowReopenIncident: false,
  },
  workOrder: {
    defaultStatus: 'new',
    allowConfirmComplete: true,
    requireApproverOnClose: true,
  },
  corrective: {
    requireImpactLevel: true,
    requireCauseBeforeClose: true,
  },
  notifications: {
    enableOverdueAlert: true,
    enableSevereIncidentAlert: true,
    pmReminderDays: 1,
  },
};
