import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChecklistTemplate } from '../types/checklist.types';

interface ChecklistInfoBannerProps {
  checklist: ChecklistTemplate;
}

/**
 * ChecklistInfoBanner component
 * Displays summary information using REAL API data structure
 * - Uses equipment.category for machine type
 * - Uses equipment.name for equipment name
 */
export const ChecklistInfoBanner: React.FC<ChecklistInfoBannerProps> = ({ checklist }) => {
  const equipmentCategory = checklist.equipment?.category || 'Chưa xác định';
  const equipmentName = checklist.equipment?.name || 'Chưa gắn thiết bị';
  
  return (
    <Card className="bg-primary/10 border-primary/30 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Thiết bị: </span>
            <span className="font-medium">{equipmentName}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div>
            <span className="text-muted-foreground">Loại máy: </span>
            <span className="font-medium">{equipmentCategory}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div>
            <span className="text-muted-foreground">Số hạng mục: </span>
            <span className="font-medium">{checklist.items?.length || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
