import React from 'react';
import { Calendar, Layers, Tag, FileText } from 'lucide-react';
import { ChecklistTemplate, CYCLE_LABELS } from '../types/checklist.types';
import { GeneralInfoCard } from './GeneralInfoCard';
import { ChecklistItemsCard } from './ChecklistItemsCard';

interface ChecklistPreviewTabProps {
  checklist: ChecklistTemplate;
}

/**
 * ChecklistPreviewTab component
 * Uses REAL API ChecklistTemplate type
 * Refactored for better UX, empty states, and animations
 */
export const ChecklistPreviewTab: React.FC<ChecklistPreviewTabProps> = ({ checklist }) => {
  const generalInfoItems: React.ComponentProps<typeof GeneralInfoCard>['items'] = [
    {
      label: 'Mã checklist',
      value: <span className="font-mono text-primary">{checklist.code}</span>,
      icon: <Tag className="h-3.5 w-3.5 opacity-70" />
    },
    {
      label: 'Tên checklist',
      value: checklist.name,
      icon: <FileText className="h-3.5 w-3.5 opacity-70" />
    },
    {
      label: 'Chu kỳ',
      value: CYCLE_LABELS[checklist.cycle],
      icon: <Calendar className="h-3.5 w-3.5 opacity-70" />
    },
    {
      label: 'Bộ phận',
      value: checklist.department || '-',
      icon: <Layers className="h-3.5 w-3.5 opacity-70" />
    },
    {
      label: 'Phiên bản',
      value: `v${checklist.version}`,
      icon: <Tag className="h-3.5 w-3.5 opacity-70" />
    },
    {
      label: 'Ngày cập nhật',
      value: new Date(checklist.updatedAt).toLocaleDateString('vi-VN'),
      icon: <Calendar className="h-3.5 w-3.5 opacity-70" />
    },
  ];

  if (checklist.notes) {
    generalInfoItems.push({
      label: 'Ghi chú',
      value: checklist.notes,
      isFullWidth: true,
      icon: <FileText className="h-3.5 w-3.5 opacity-70" />
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* General Info */}
      <div className="animate-in fade-in slide-in-from-top-2 duration-500">
        <GeneralInfoCard
          title="Thông tin cơ bản"
          subtitle="Chi tiết và ngữ cảnh của checklist"
          items={generalInfoItems}
          equipment={checklist.equipment as any}
        />
      </div>

      {/* Checklist items */}
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-150">
        <ChecklistItemsCard items={checklist.items} />
      </div>
    </div>
  );
};
