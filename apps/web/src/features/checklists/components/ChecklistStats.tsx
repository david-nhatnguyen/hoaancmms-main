import { ClipboardList, CheckCircle2 } from 'lucide-react';
import { StatsGrid } from '@/components/shared/layout/StatsGrid';

interface ChecklistStatsProps {
    total: number;
    active: number;
    draft: number;
    isLoading?: boolean;
}

export function ChecklistStats({ total, active, draft, isLoading = false }: ChecklistStatsProps) {
    const statsData = [
        {
            label: 'Tổng số chu trình',
            value: total,
            icon: <ClipboardList className="h-5 w-5 text-primary" />,
            iconBgClass: 'bg-primary/20',
        },
        {
            label: 'Đang áp dụng',
            value: active,
            icon: <CheckCircle2 className="h-5 w-5 text-status-active" />,
            iconBgClass: 'bg-status-active/20',
            valueClass: 'text-[hsl(var(--status-active))]',
        },
        {
            label: 'Bản nháp',
            value: draft,
            icon: <ClipboardList className="h-5 w-5 text-muted-foreground" />,
            iconBgClass: 'bg-muted',
            valueClass: 'text-muted-foreground',
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
