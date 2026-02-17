import React from 'react';
import { Settings, Tag, ListTodo } from 'lucide-react';
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
 * - Responsive Grid Layout
 */
export const ChecklistInfoBanner: React.FC<ChecklistInfoBannerProps> = ({ checklist }) => {
  const equipmentCategory = checklist.equipment?.category || 'Chưa xác định';
  const equipmentName = checklist.equipment?.name || 'Chưa gắn thiết bị';
  const itemCount = checklist.items?.length || 0;

  return (
    <Card className="bg-primary/5 border-primary/20 mb-6 shadow-sm">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Thiết bị</p>
              <p className="text-sm font-semibold truncate" title={equipmentName}>{equipmentName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:border-l sm:border-border/50 sm:pl-4">
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Loại máy</p>
              <p className="text-sm font-semibold truncate" title={equipmentCategory}>{equipmentCategory}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:border-l sm:border-border/50 sm:pl-4">
            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
              <ListTodo className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Số hạng mục</p>
              <p className="text-sm font-semibold">{itemCount} hạng mục</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
