import { 
  LayoutDashboard, 
  Factory, 
  Cpu, 
  ClipboardList, 
  Wrench, 
  FileText, 
  AlertTriangle, 
  Users, 
  Shield, 
  ScrollText, 
  Cog 
} from 'lucide-react';
import React from 'react';

export interface MenuItem {
  label: string;
  path?: string;
  icon: React.ElementType;
  children?: { label: string; path: string }[];
  badge?: number;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Mock incident count - in real app this would come from a store or API
const INCIDENT_COUNT = 3;

export const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'DASHBOARD',
    items: [
      {
        label: 'Dashboard & KPI',
        path: '/',
        icon: LayoutDashboard,
      }
    ]
  },
  {
    title: 'TÀI SẢN',
    items: [
      {
        label: 'Nhà máy',
        path: '/factories',
        icon: Factory,
      },
      {
        label: 'Thiết bị',
        path: '/equipments',
        icon: Cpu,
      }
    ]
  },
  {
    title: 'BẢO DƯỠNG',
    items: [
      {
        label: 'Thư viện Checklist',
        path: '/checklists',
        icon: ClipboardList,
      },
      {
        label: 'Kế hoạch PM',
        path: '/pm-plans',
        icon: Wrench,
      },
      {
        label: 'Work Orders',
        path: '/work-orders',
        icon: FileText,
      }
    ]
  },
  {
    title: 'GIÁM SÁT',
    items: [
      {
        label: 'Bảo trì sự cố',
        path: '/corrective-maintenance',
        icon: AlertTriangle,
        badge: INCIDENT_COUNT,
      }
    ]
  },
  {
    title: 'HỆ THỐNG',
    items: [
      {
        label: 'Người dùng',
        path: '/system/users',
        icon: Users,
      },
      {
        label: 'Vai trò & Phân quyền',
        path: '/system/roles',
        icon: Shield,
      },
      {
        label: 'Nhật ký hệ thống',
        path: '/system/logs',
        icon: ScrollText,
      },
      {
        label: 'Cài đặt chung',
        path: '/system/settings',
        icon: Cog,
      }
    ]
  }
];

/**
 * Checks if a path is active based on the current pathname
 */
export const isPathActive = (pathname: string, path?: string) => {
  if (!path) return false;
  if (path === '/') return pathname === '/';
  return pathname.startsWith(path);
};
