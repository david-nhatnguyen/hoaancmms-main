// Mock data for Asset Master module - Vietnamese language

export interface Factory {
  id: string;
  code: string;
  name: string;
  location: string;
  equipmentCount: number;
  status: 'active' | 'inactive';
}

export interface Equipment {
  id: string;
  code: string;
  name: string;
  groupId: 'injection' | 'mold-manufacturing';
  machineType: string;
  factoryId: string;
  factoryName: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  yearInService: number;
  department: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'maintenance' | 'inactive';
  notes?: string;
}

export const EQUIPMENT_GROUPS = {
  injection: {
    id: 'injection',
    name: 'Máy ép nhựa',
    machineTypes: ['Injection Molding Machine']
  },
  'mold-manufacturing': {
    id: 'mold-manufacturing',
    name: 'Máy gia công & Đo lường khuôn',
    machineTypes: ['CNC Machining Center', 'CMM (Coordinate Measuring Machine)', 'Milling Machine', 'Grinding Machine', 'Lathe Machine', 'EDM Machine', 'Wire EDM']
  }
};

export const MACHINE_TYPES: Record<string, string[]> = {
  injection: ['Injection Molding Machine'],
  'mold-manufacturing': ['CNC Machining Center', 'CMM (Coordinate Measuring Machine)', 'Milling Machine', 'Grinding Machine', 'Lathe Machine', 'EDM Machine', 'Wire EDM']
};

export const STATUS_LABELS = {
  active: 'Hoạt động',
  maintenance: 'Bảo trì',
  inactive: 'Ngừng hoạt động'
};

export const PRIORITY_LABELS = {
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp'
};

export const factories: Factory[] = [
  {
    id: 'f01',
    code: 'F01',
    name: 'Nhà máy A',
    location: 'Bình Dương',
    equipmentCount: 12,
    status: 'active'
  },
  {
    id: 'f02',
    code: 'F02',
    name: 'Nhà máy B',
    location: 'Đồng Nai',
    equipmentCount: 8,
    status: 'active'
  },
  {
    id: 'f03',
    code: 'F03',
    name: 'Nhà máy C',
    location: 'Long An',
    equipmentCount: 5,
    status: 'inactive'
  }
];

export const equipments: Equipment[] = [
  {
    id: 'imm-01',
    code: 'IMM-01',
    name: 'Máy ép nhựa 280T',
    groupId: 'injection',
    machineType: 'Injection Molding Machine',
    factoryId: 'f01',
    factoryName: 'Nhà máy A',
    manufacturer: 'Haitian',
    model: 'MA2800III',
    serialNumber: 'HT2023-001',
    yearInService: 2021,
    department: 'Xưởng ép nhựa 1',
    priority: 'high',
    status: 'active',
    notes: 'Máy chính cho sản phẩm lớn'
  },
  {
    id: 'imm-02',
    code: 'IMM-02',
    name: 'Máy ép nhựa 180T',
    groupId: 'injection',
    machineType: 'Injection Molding Machine',
    factoryId: 'f01',
    factoryName: 'Nhà máy A',
    manufacturer: 'Sumitomo',
    model: 'SE180EV',
    serialNumber: 'SM2022-045',
    yearInService: 2020,
    department: 'Xưởng ép nhựa 1',
    priority: 'medium',
    status: 'maintenance'
  },
  {
    id: 'imm-03',
    code: 'IMM-03',
    name: 'Máy ép nhựa 450T',
    groupId: 'injection',
    machineType: 'Injection Molding Machine',
    factoryId: 'f02',
    factoryName: 'Nhà máy B',
    manufacturer: 'Haitian',
    model: 'MA4500III',
    serialNumber: 'HT2022-088',
    yearInService: 2022,
    department: 'Xưởng ép nhựa 2',
    priority: 'high',
    status: 'active'
  },
  {
    id: 'cnc-01',
    code: 'CNC-01',
    name: 'Trung tâm gia công CNC',
    groupId: 'mold-manufacturing',
    machineType: 'CNC Machining Center',
    factoryId: 'f01',
    factoryName: 'Nhà máy A',
    manufacturer: 'Makino',
    model: 'V33i',
    serialNumber: 'MK2021-112',
    yearInService: 2019,
    department: 'Xưởng khuôn',
    priority: 'high',
    status: 'active',
    notes: 'Độ chính xác cao, ưu tiên cho chi tiết phức tạp'
  },
  {
    id: 'cmm-01',
    code: 'CMM-01',
    name: 'Máy đo tọa độ CMM',
    groupId: 'mold-manufacturing',
    machineType: 'CMM (Coordinate Measuring Machine)',
    factoryId: 'f01',
    factoryName: 'Nhà máy A',
    manufacturer: 'Zeiss',
    model: 'CONTURA G2',
    serialNumber: 'ZS2020-034',
    yearInService: 2020,
    department: 'Phòng QC',
    priority: 'high',
    status: 'active'
  },
  {
    id: 'mill-01',
    code: 'MILL-01',
    name: 'Máy phay vạn năng',
    groupId: 'mold-manufacturing',
    machineType: 'Milling Machine',
    factoryId: 'f02',
    factoryName: 'Nhà máy B',
    manufacturer: 'Bridgeport',
    model: 'Series I',
    serialNumber: 'BP2018-067',
    yearInService: 2018,
    department: 'Xưởng cơ khí',
    priority: 'low',
    status: 'active'
  },
  {
    id: 'grind-01',
    code: 'GRIND-01',
    name: 'Máy mài phẳng',
    groupId: 'mold-manufacturing',
    machineType: 'Grinding Machine',
    factoryId: 'f01',
    factoryName: 'Nhà máy A',
    manufacturer: 'Okamoto',
    model: 'ACC-63ST',
    serialNumber: 'OK2019-023',
    yearInService: 2019,
    department: 'Xưởng khuôn',
    priority: 'medium',
    status: 'active'
  },
  {
    id: 'edm-01',
    code: 'EDM-01',
    name: 'Máy xung điện EDM',
    groupId: 'mold-manufacturing',
    machineType: 'EDM Machine',
    factoryId: 'f02',
    factoryName: 'Nhà máy B',
    manufacturer: 'Sodick',
    model: 'AG40L',
    serialNumber: 'SD2021-089',
    yearInService: 2021,
    department: 'Xưởng khuôn',
    priority: 'high',
    status: 'inactive'
  }
];
