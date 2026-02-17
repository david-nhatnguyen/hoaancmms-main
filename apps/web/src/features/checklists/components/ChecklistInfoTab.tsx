import React from 'react';
import { Tag, FileText, Calendar, Layers } from 'lucide-react';
import { ChecklistTemplate, CYCLE_LABELS } from '../types/checklist.types';
import { GeneralInfoCard } from './GeneralInfoCard';
import { ChecklistVersionHistoryCard } from './ChecklistVersionHistoryCard';

interface ChecklistInfoTabProps {
  checklist: ChecklistTemplate;
}

/**
 * ChecklistInfoTab component
 * Uses REAL API ChecklistTemplate type
 * Displays equipment relation data and version history using reusable components.
 */
export const ChecklistInfoTab: React.FC<ChecklistInfoTabProps> = ({ checklist }) => {
  const generalInfoItems: React.ComponentProps<typeof GeneralInfoCard>['items'] = [
    {
      label: 'Mã checklist',
      value: <span className="font-mono text-primary">{checklist.code}</span>,
      icon: <Tag className="h-3.5 w-3.5 opacity-70" />
    },
    {
      label: 'Tên checklist', // Added context if available, though typically handled via parent/header
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* General Info - Takes 2/3 space */}
      <div className="col-span-1 lg:col-span-2 animate-in fade-in slide-in-from-left-4 duration-500">
        <GeneralInfoCard
          title="Thông tin chung"
          subtitle="Chi tiết và ngữ cảnh của checklist"
          items={generalInfoItems}
          equipment={checklist.equipment as any}
        />
      </div>

      {/* Version History - Takes 1/3 space */}
      <div className="col-span-1 animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
        <ChecklistVersionHistoryCard checklist={checklist} />
      </div>
    </div>
  );
};
