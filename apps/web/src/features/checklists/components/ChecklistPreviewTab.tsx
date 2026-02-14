import React from 'react';
import { ChecklistTemplate } from '../types/checklist.types';
import { ChecklistInfoBanner } from './ChecklistInfoBanner';
import { ChecklistItemCard } from './ChecklistItemCard';

interface ChecklistPreviewTabProps {
  checklist: ChecklistTemplate;
}

/**
 * ChecklistPreviewTab component
 * Uses REAL API ChecklistTemplate type
 */
export const ChecklistPreviewTab: React.FC<ChecklistPreviewTabProps> = ({ checklist }) => {
  return (
    <div className="max-w-3xl">
      {/* Info banner */}
      <ChecklistInfoBanner checklist={checklist} />

      {/* Checklist items - Mobile friendly vertical layout */}
      <div className="space-y-4">
        {checklist.items?.map((item, index) => (
          <ChecklistItemCard key={item.id} item={item} index={index} />
        )) || null}
      </div>
    </div>
  );
};
