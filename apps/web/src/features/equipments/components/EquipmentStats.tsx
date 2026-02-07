import { Cpu, CheckCircle, AlertTriangle } from 'lucide-react';
import { MobileStatsGrid } from '@/components/shared/MobileStatsGrid';
import type { EquipmentStats as EquipmentStatsType } from '@/api/types/equipment.types';

interface EquipmentStatsProps {
  stats?: EquipmentStatsType;
  isLoading?: boolean;
}

export function EquipmentStats({ stats, isLoading }: EquipmentStatsProps) {
  const statsData = [
    {
      label: 'Tổng số thiết bị',
      value: stats?.totalEquipments || 0,
      icon: <Cpu className="h-5 w-5 text-primary" />,
      iconBgClass: 'bg-primary/20',
      isLoading
    },
    {
      label: 'Hoạt động tốt',
      value: stats?.active || 0,
      icon: <CheckCircle className="h-5 w-5 text-status-active" />,
      iconBgClass: 'bg-status-active/20',
      valueClass: 'text-[hsl(var(--status-active))]',
      isLoading
    },
    {
      label: 'Đang bảo trì',
      value: stats?.maintenance || 0,
      icon: <AlertTriangle className="h-5 w-5 text-[hsl(var(--status-maintenance))]" />,
      iconBgClass: 'bg-status-maintenance/20',
      valueClass: 'text-[hsl(var(--status-maintenance))]',
      isLoading
    },
    {
      label: 'Ngừng hoạt động',
      value: stats?.inactive || 0,
      icon: <Cpu className="h-5 w-5 text-status-inactive" />,
      iconBgClass: 'bg-status-inactive/20',
      valueClass: 'text-[hsl(var(--status-inactive))]',
      isLoading
    }
  ];

  return <MobileStatsGrid stats={statsData} />;
}
