import React from 'react';
import { Camera, CheckCircle, XCircle, MinusCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChecklistTemplateItem } from '../types/checklist.types';

interface ChecklistItemCardProps {
  item: ChecklistTemplateItem;
  index: number;
}

/**
 * ChecklistItemCard component
 * Displays a single checklist item with all maintenance details
 * Uses REAL API field names: judgmentStandard, inspectionMethod, maintenanceContent
 */
export const ChecklistItemCard: React.FC<ChecklistItemCardProps> = ({ item, index }) => {
  return (
    <Card className="bg-secondary/30 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Order number */}
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="font-bold text-primary">{item.order}</span>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            {/* Task name */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium">{item.maintenanceTask}</h4>
              <div className="flex items-center gap-1.5">
                {item.isRequired && (
                  <span className="text-xs px-2 py-0.5 rounded bg-destructive/20 text-destructive">Bắt buộc</span>
                )}
                {item.requiresImage && (
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    Ảnh
                  </span>
                )}
              </div>
            </div>

            {/* Details grid - Using REAL API field names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {item.judgmentStandard && (
                <div>
                  <span className="text-muted-foreground">Tiêu chuẩn: </span>
                  <span>{item.judgmentStandard}</span>
                </div>
              )}
              {item.inspectionMethod && (
                <div>
                  <span className="text-muted-foreground">Phương pháp: </span>
                  <span>{item.inspectionMethod}</span>
                </div>
              )}
              {item.maintenanceContent && (
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Nội dung: </span>
                  <span>{item.maintenanceContent}</span>
                </div>
              )}
              {item.expectedResult && (
                <div>
                  <span className="text-muted-foreground">Kết quả mong đợi: </span>
                  <span className="font-medium text-primary">{item.expectedResult}</span>
                </div>
              )}
            </div>

            {/* Result placeholder (for preview) */}
            <div className="pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Kết quả kiểm tra:</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 border-status-active text-status-active hover:bg-status-active/20">
                  <CheckCircle className="h-4 w-4" />
                  OK
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 border-destructive text-destructive hover:bg-destructive/20">
                  <XCircle className="h-4 w-4" />
                  NG
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 border-muted-foreground text-muted-foreground hover:bg-muted">
                  <MinusCircle className="h-4 w-4" />
                  N/A
                </Button>
                <div className="flex-1" />
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  Ghi chú
                </Button>
                {item.requiresImage && (
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                    <Camera className="h-4 w-4" />
                    Chụp ảnh
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
