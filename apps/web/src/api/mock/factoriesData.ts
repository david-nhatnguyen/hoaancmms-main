export interface Factory {
  id: string;
  code: string;
  name: string;
  location: string;
  equipmentCount: number;
  status: 'active' | 'inactive';
}

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
