import React from 'react';
import { Camera, CheckCircle, XCircle, MinusCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChecklistTemplateItem } from '../types/checklist.types';

interface ChecklistItemCardProps {
  item: ChecklistTemplateItem;
}

/**
 * ChecklistItemCard component
 * Displays a single checklist item with all maintenance details
 * Uses REAL API field names: judgmentStandard, inspectionMethod, maintenanceContent
 * Refactored for cleaner UI and mobile responsiveness
 */
export const ChecklistItemCard: React.FC<ChecklistItemCardProps> = ({ item }) => {
  return (
    <Card className="group border-border/60 hover:border-primary/50 shadow-sm transition-all bg-card">
      <div className="flex flex-col">
        {/* Header like MobileChecklistItem */}
        <div className="flex items-center justify-between p-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">
              #{item.order}
            </span>
            <div className="flex gap-1">
              {item.isRequired && (
                <span className="text-[10px] font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/20 tracking-wide">
                  Bắt buộc
                </span>
              )}
              {item.requiresImage && (
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 tracking-wide flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  Yêu cầu ảnh
                </span>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Task Name - Prominent */}
          <div>
            <span className="text-xs font-semibold text-muted-foreground block mb-1">
              Hạng mục bảo dưỡng
            </span>
            <p className="text-base font-medium text-foreground leading-normal">
              {item.maintenanceTask}
            </p>
          </div>

          {/* Details Grid - Matching Form Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {item.judgmentStandard && (
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-1">
                  Tiêu chuẩn phán định
                </span>
                <p className="text-sm text-foreground/90">{item.judgmentStandard}</p>
              </div>
            )}

            {item.inspectionMethod && (
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-1">
                  Phương pháp kiểm tra
                </span>
                <p className="text-sm text-foreground/90">{item.inspectionMethod}</p>
              </div>
            )}

            {item.maintenanceContent && (
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-1">
                  Nội dung chi tiết bảo dưỡng
                </span>
                <p className="text-sm text-foreground/90">{item.maintenanceContent}</p>
              </div>
            )}

            {item.expectedResult && (
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-1">
                  Kết quả mong đợi
                </span>
                <p className="text-sm text-foreground/90 text-primary font-semibold">{item.expectedResult}</p>
              </div>
            )}
          </div>

          {/* Preview Interaction Section - Clean Footer */}
          {/* <div className="pt-4 border-t border-border/60">
            <span className="text-xs font-semibold text-muted-foreground block mb-3">
              Thao tác mẫu (Preview)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 px-4 gap-2 border-green-200 hover:bg-green-50 hover:text-green-700 text-muted-foreground hover:border-green-300">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Đạt</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9 px-4 gap-2 border-red-200 hover:bg-red-50 hover:text-red-700 text-muted-foreground hover:border-red-300">
                <XCircle className="h-4 w-4 text-red-600" />
                <span>Không đạt</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9 px-4 gap-2 hover:bg-muted text-muted-foreground">
                <MinusCircle className="h-4 w-4" />
                <span>N/A</span>
              </Button>

              <div className="w-px h-6 bg-border mx-2 hidden sm:block" />

              <div className="flex items-center gap-1 ml-auto sm:ml-0">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                {item.requiresImage && (
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5">
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div> */}
        </CardContent>
      </div>
    </Card>
  );
};
