import React from 'react';
import { ArrowLeft, Copy, Pencil, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChecklistTemplate, CYCLE_LABELS, STATUS_LABELS } from '../types/checklist.types';
import { cn } from '@/lib/utils';

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
    <div className="mb-6">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onGoBack}
        className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <ClipboardList className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="page-subtitle">THƯ VIỆN CHECKLIST</p>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold">{checklist.name}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-primary bg-primary/20 px-2.5 py-1 rounded-lg">
                {checklist.code}
              </span>
              <span className={cn(
                'status-badge',
                checklist.status === 'ACTIVE' && 'bg-status-active/20 text-status-active',
                checklist.status === 'DRAFT' && 'bg-muted text-muted-foreground',
                checklist.status === 'INACTIVE' && 'bg-status-inactive/20 text-status-inactive'
              )}>
                {STATUS_LABELS[checklist.status]}
              </span>
              <span className="text-sm text-muted-foreground">v{checklist.version}</span>
              <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium">
                {CYCLE_LABELS[checklist.cycle]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCopy} className="action-btn-secondary">
            <Copy className="h-4 w-4" />
            Sao chép
          </Button>
          <Button onClick={onEdit} className="action-btn-primary">
            <Pencil className="h-4 w-4" />
            Sửa
          </Button>
        </div>
      </div>
    </div>
  );
};
