import React from 'react';
import { Copy, Pencil, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChecklistTemplate, CYCLE_LABELS, STATUS_LABELS } from '../types/checklist.types';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';

interface ChecklistDetailHeaderProps {
  checklist: ChecklistTemplate;
  onGoBack: () => void;
  onCopy: () => void;
  onEdit: () => void;
}

/**
 * ChecklistDetailHeader component
 * Uses REAL API ChecklistTemplate type with ENUM values
 */
export const ChecklistDetailHeader: React.FC<ChecklistDetailHeaderProps> = ({
  checklist,
  onGoBack,
  onCopy,
  onEdit,
}) => {
  return (
    <PageHeader
      title={checklist.name}
      subtitle="THƯ VIỆN CHECKLIST"
      onGoBack={onGoBack}
      icon={<ClipboardList className="h-6 w-6 text-primary" />}
      badges={
        <div className="flex items-center gap-2 flex-wrap animate-in fade-in zoom-in-95 duration-300 delay-200">
          <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
            {checklist.code}
          </span>
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full border',
            checklist.status === 'ACTIVE' && 'bg-status-active/10 text-status-active border-status-active/20',
            checklist.status === 'DRAFT' && 'bg-muted text-muted-foreground border-border',
            checklist.status === 'INACTIVE' && 'bg-status-inactive/10 text-status-inactive border-status-inactive/20'
          )}>
            {STATUS_LABELS[checklist.status]}
          </span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">v{checklist.version}</span>
          <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded border border-border/50">
            {CYCLE_LABELS[checklist.cycle]}
          </span>
        </div>
      }
      actions={
        <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0 animate-in fade-in slide-in-from-right-4 duration-500 delay-300">
          <Button variant="outline" onClick={onCopy} className="flex-1 sm:flex-none gap-2">
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Sao chép</span>
            <span className="sm:hidden">Sao chép</span>
          </Button>
          <Button onClick={onEdit} className="flex-1 sm:flex-none gap-2 min-w-[100px]">
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Chỉnh sửa</span>
            <span className="sm:hidden">Sửa</span>
          </Button>
        </div>
      }
    />
  );
};
