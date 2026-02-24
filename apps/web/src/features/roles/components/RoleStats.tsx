import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { StatsGrid } from '@/components/shared/layout/StatsGrid';

interface RoleStatsProps {
    total: number;
    system: number;
    custom: number;
    isLoading?: boolean;
}

export function RoleStats({ total, system, custom, isLoading = false }: RoleStatsProps) {
    const statsData = [
        {
            label: 'Tổng vai trò',
            value: total,
            icon: <Shield className="h-5 w-5 text-primary" />,
            iconBgClass: 'bg-primary/20',
        },
        {
            label: 'Hệ thống',
            value: system,
            icon: <ShieldCheck className="h-5 w-5 text-status-active" />,
            iconBgClass: 'bg-status-active/20',
            valueClass: 'text-[hsl(var(--status-active))]',
        },
        {
            label: 'Tùy chỉnh',
            value: custom,
            icon: <ShieldAlert className="h-5 w-5 text-status-maintenance" />,
            iconBgClass: 'bg-status-maintenance/20',
            valueClass: 'text-[hsl(var(--status-maintenance))]',
        },
    ];

    return (
        <StatsGrid
            stats={statsData}
            loading={isLoading}
            columns={{ mobile: 3, tablet: 3, desktop: 3 }}
        />
    );
}
