// Dashboard & KPI Data

export interface KPICard {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  previousValue?: number;
  trend: 'up' | 'down' | 'stable';
  status: 'success' | 'warning' | 'danger';
  trendValue?: string;
}

export interface RiskEquipment {
  id: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentGroup: string;
  pmOverdue: number;
  incidents: number;
  downtime: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
}

export interface ActionItem {
  id: string;
  type: 'pm-overdue' | 'high-risk' | 'incident-open';
  equipmentCode: string;
  equipmentName: string;
  issue: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  actions: { label: string; url: string }[];
}

export interface PerformanceData {
  month: string;
  pmCompletion: number;
  pmOnTime: number;
  pmLate: number;
}

export interface IncidentTrend {
  month: string;
  low: number;
  medium: number;
  high: number;
  total: number;
}

export interface DowntimeData {
  equipmentCode: string;
  equipmentName: string;
  equipmentGroup: string;
  totalDowntime: number;
  incidents: number;
  trend: 'up' | 'down' | 'stable';
  recommendation?: string;
}

// Mock KPI Data for December 2026
export const kpiCards: KPICard[] = [
  {
    id: 'pm-completion',
    label: 'Tỷ lệ hoàn thành PM',
    value: 91,
    unit: '%',
    previousValue: 93,
    trend: 'down',
    status: 'warning',
    trendValue: '↓ 2%'
  },
  {
    id: 'pm-overdue',
    label: 'PM quá hạn',
    value: 5,
    trend: 'up',
    status: 'danger',
    trendValue: '↑ 2'
  },
  {
    id: 'incidents',
    label: 'Sự cố trong kỳ',
    value: 8,
    trend: 'up',
    status: 'warning',
    trendValue: '↑ 3'
  },
  {
    id: 'downtime',
    label: 'Tổng Downtime',
    value: 18,
    unit: 'giờ',
    previousValue: 14,
    trend: 'up',
    status: 'danger',
    trendValue: '↑ 4h'
  },
  {
    id: 'high-risk',
    label: 'Thiết bị rủi ro cao',
    value: 3,
    trend: 'stable',
    status: 'danger',
    trendValue: '→ 0'
  }
];

// Risk Equipment Data
export const riskEquipments: RiskEquipment[] = [
  {
    id: 'eq-1',
    equipmentCode: 'IMM-01',
    equipmentName: 'Injection Molding Machine 280T',
    equipmentGroup: 'Máy ép nhựa',
    pmOverdue: 2,
    incidents: 3,
    downtime: 6,
    riskLevel: 'high',
    riskScore: 85
  },
  {
    id: 'eq-2',
    equipmentCode: 'CNC-01',
    equipmentName: 'CNC Machining Center',
    equipmentGroup: 'Máy gia công khuôn & Đo lường',
    pmOverdue: 1,
    incidents: 2,
    downtime: 5.5,
    riskLevel: 'high',
    riskScore: 78
  },
  {
    id: 'eq-3',
    equipmentCode: 'IMM-02',
    equipmentName: 'Injection Molding Machine 350T',
    equipmentGroup: 'Máy ép nhựa',
    pmOverdue: 1,
    incidents: 1,
    downtime: 3,
    riskLevel: 'high',
    riskScore: 65
  },
  {
    id: 'eq-4',
    equipmentCode: 'CNC-02',
    equipmentName: 'CNC Wire EDM',
    equipmentGroup: 'Máy gia công khuôn & Đo lường',
    pmOverdue: 1,
    incidents: 1,
    downtime: 2,
    riskLevel: 'medium',
    riskScore: 48
  },
  {
    id: 'eq-5',
    equipmentCode: 'CMM-01',
    equipmentName: 'CMM Coordinate Measuring',
    equipmentGroup: 'Máy gia công khuôn & Đo lường',
    pmOverdue: 0,
    incidents: 1,
    downtime: 1.5,
    riskLevel: 'medium',
    riskScore: 35
  },
  {
    id: 'eq-6',
    equipmentCode: 'IMM-03',
    equipmentName: 'Injection Molding Machine 200T',
    equipmentGroup: 'Máy ép nhựa',
    pmOverdue: 0,
    incidents: 0,
    downtime: 0,
    riskLevel: 'low',
    riskScore: 10
  }
];

// Action Items
export const actionItems: ActionItem[] = [
  {
    id: 'action-1',
    type: 'pm-overdue',
    equipmentCode: 'IMM-01',
    equipmentName: 'Injection Molding Machine 280T',
    issue: '2 PM quá hạn 5 ngày',
    priority: 'critical',
    dueDate: '2026-12-10',
    actions: [
      { label: 'Xem Work Order', url: '/work-orders' },
      { label: 'Tạo PM bổ sung', url: '/pm-plans/new' }
    ]
  },
  {
    id: 'action-2',
    type: 'high-risk',
    equipmentCode: 'CNC-01',
    equipmentName: 'CNC Machining Center',
    issue: 'Rủi ro cao - 2 sự cố trong tháng',
    priority: 'high',
    actions: [
      { label: 'Xem chi tiết', url: '/corrective-maintenance' },
      { label: 'Yêu cầu kiểm tra', url: '/pm-plans/new' }
    ]
  },
  {
    id: 'action-3',
    type: 'incident-open',
    equipmentCode: 'IMM-02',
    equipmentName: 'Injection Molding Machine 350T',
    issue: '1 sự cố chưa đóng',
    priority: 'high',
    actions: [
      { label: 'Xem sự cố', url: '/corrective-maintenance' }
    ]
  },
  {
    id: 'action-4',
    type: 'pm-overdue',
    equipmentCode: 'CNC-02',
    equipmentName: 'CNC Wire EDM',
    issue: '1 PM quá hạn 2 ngày',
    priority: 'medium',
    dueDate: '2026-12-13',
    actions: [
      { label: 'Xem Work Order', url: '/work-orders' }
    ]
  }
];

// Performance Chart Data (Last 6 months)
export const performanceData: PerformanceData[] = [
  { month: 'T7', pmCompletion: 95, pmOnTime: 45, pmLate: 3 },
  { month: 'T8', pmCompletion: 92, pmOnTime: 42, pmLate: 4 },
  { month: 'T9', pmCompletion: 94, pmOnTime: 44, pmLate: 3 },
  { month: 'T10', pmCompletion: 96, pmOnTime: 46, pmLate: 2 },
  { month: 'T11', pmCompletion: 93, pmOnTime: 44, pmLate: 4 },
  { month: 'T12', pmCompletion: 91, pmOnTime: 43, pmLate: 5 }
];

// Performance by Equipment Group
export const performanceByGroup = [
  { group: 'Máy ép nhựa', onTime: 28, late: 3 },
  { group: 'Máy gia công khuôn', onTime: 15, late: 2 }
];

// Incident Trend Data
export const incidentTrends: IncidentTrend[] = [
  { month: 'T7', low: 2, medium: 1, high: 0, total: 3 },
  { month: 'T8', low: 1, medium: 2, high: 1, total: 4 },
  { month: 'T9', low: 2, medium: 1, high: 0, total: 3 },
  { month: 'T10', low: 1, medium: 1, high: 1, total: 3 },
  { month: 'T11', low: 2, medium: 2, high: 1, total: 5 },
  { month: 'T12', low: 3, medium: 3, high: 2, total: 8 }
];

// Incident by Cause
export const incidentsByCause = [
  { cause: 'Hỏng linh kiện cơ khí', count: 12, percentage: 35 },
  { cause: 'Hỏng linh kiện điện', count: 8, percentage: 24 },
  { cause: 'Rò rỉ dầu/khí', count: 6, percentage: 18 },
  { cause: 'Lỗi phần mềm', count: 4, percentage: 12 },
  { cause: 'Khác', count: 4, percentage: 11 }
];

// Downtime Data
export const downtimeData: DowntimeData[] = [
  {
    equipmentCode: 'IMM-01',
    equipmentName: 'Injection Molding 280T',
    equipmentGroup: 'Máy ép nhựa',
    totalDowntime: 6,
    incidents: 3,
    trend: 'up',
    recommendation: 'Cần xem xét đại tu'
  },
  {
    equipmentCode: 'CNC-01',
    equipmentName: 'CNC Machining Center',
    equipmentGroup: 'Máy gia công khuôn',
    totalDowntime: 5.5,
    incidents: 2,
    trend: 'up',
    recommendation: 'Tăng tần suất PM'
  },
  {
    equipmentCode: 'IMM-02',
    equipmentName: 'Injection Molding 350T',
    equipmentGroup: 'Máy ép nhựa',
    totalDowntime: 3,
    incidents: 1,
    trend: 'stable'
  },
  {
    equipmentCode: 'CNC-02',
    equipmentName: 'CNC Wire EDM',
    equipmentGroup: 'Máy gia công khuôn',
    totalDowntime: 2,
    incidents: 1,
    trend: 'down'
  },
  {
    equipmentCode: 'CMM-01',
    equipmentName: 'CMM Measuring',
    equipmentGroup: 'Máy gia công khuôn',
    totalDowntime: 1.5,
    incidents: 1,
    trend: 'stable'
  }
];

// Downtime by Group
export const downtimeByGroup = [
  { group: 'Máy ép nhựa', downtime: 9, percentage: 50 },
  { group: 'Máy gia công khuôn', downtime: 9, percentage: 50 }
];

// Management Insights
export const managementInsights = {
  performance: [
    'Tỷ lệ hoàn thành PM giảm 2% so với tháng trước',
    'Nhóm Máy ép nhựa có 3 PM trễ hạn',
    'Factory HCM có số PM trễ cao nhất'
  ],
  incidents: [
    'Sự cố mức độ nặng tăng trong 2 tháng liên tiếp',
    'Hỏng linh kiện cơ khí chiếm 35% nguyên nhân',
    'CNC-01 có số sự cố cao nhất trong kỳ'
  ],
  downtime: [
    'IMM-01 chiếm 33% tổng downtime',
    'Downtime tăng 28% so với tháng trước',
    'Cần xem xét kế hoạch đại tu cho 2 thiết bị'
  ]
};
