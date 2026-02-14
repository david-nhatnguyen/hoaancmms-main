import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChecklistTemplate, CYCLE_LABELS, STATUS_LABELS } from '../types/checklist.types';
import { cn } from '@/lib/utils';

interface ChecklistInfoTabProps {
  checklist: ChecklistTemplate;
}

/**
 * ChecklistInfoTab component
 * Uses REAL API ChecklistTemplate type
 * Displays equipment relation data and version history
 */
export const ChecklistInfoTab: React.FC<ChecklistInfoTabProps> = ({ checklist }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* General Info */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Mã checklist</span>
            <span className="font-mono text-primary">{checklist.code}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Thiết bị</span>
            <span>{checklist.equipment?.name || 'Chưa gắn thiết bị'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Loại thiết bị</span>
            <span>{checklist.equipment?.category || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Chu kỳ</span>
            <span>{CYCLE_LABELS[checklist.cycle]}</span>
          </div>
          {checklist.department && (
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Bộ phận</span>
              <span>{checklist.department}</span>
            </div>
          )}

          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Phiên bản</span>
            <span>v{checklist.version}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Ngày cập nhật</span>
            <span>{new Date(checklist.updatedAt).toLocaleDateString('vi-VN')}</span>
          </div>
          {checklist.notes && (
            <div className="pt-3 border-t border-border/50">
              <span className="text-muted-foreground text-sm">Ghi chú:</span>
              <p className="mt-1 text-sm">{checklist.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Version History */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lịch sử phiên bản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">v{checklist.version}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Phiên bản hiện tại</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(checklist.updatedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <span className={cn(
                'status-badge text-xs',
                checklist.status === 'ACTIVE' && 'bg-status-active/20 text-status-active',
                checklist.status === 'DRAFT' && 'bg-muted text-muted-foreground',
                checklist.status === 'INACTIVE' && 'bg-status-inactive/20 text-status-inactive'
              )}>
                {STATUS_LABELS[checklist.status]}
              </span>
            </div>
            
            {checklist.version > 1 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground">v{checklist.version - 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Phiên bản cũ</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(checklist.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <span className="status-badge text-xs bg-status-inactive/20 text-status-inactive">
                  Đã thay thế
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
