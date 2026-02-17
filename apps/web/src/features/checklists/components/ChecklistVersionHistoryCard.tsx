import React from 'react';
import { History } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChecklistTemplate, STATUS_LABELS } from '../types/checklist.types';
import { cn } from '@/lib/utils';

interface ChecklistVersionHistoryCardProps {
    checklist: ChecklistTemplate;
    className?: string;
}

/**
 * ChecklistVersionHistoryCard Component
 * Displays the version history of a checklist template.
 * Highlights the active version and shows previous versions if applicable.
 */
export const ChecklistVersionHistoryCard: React.FC<ChecklistVersionHistoryCardProps> = ({
    checklist,
    className
}) => {
    return (
        <Card className={cn("border border-border/60 shadow-sm bg-card transition-all hover:shadow-md", className)}>
            <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <History className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                        <CardTitle className="text-lg">Lịch sử phiên bản</CardTitle>
                        <p className="text-sm text-muted-foreground">Theo dõi các thay đổi của checklist</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-4">
                    {/* Current Version */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20 transition-colors hover:bg-primary/10">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-primary flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold text-primary-foreground">v{checklist.version}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-foreground">Phiên bản hiện tại</p>
                                <span className={cn(
                                    'px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide border',
                                    checklist.status === 'ACTIVE' && 'bg-green-100 text-green-700 border-green-200',
                                    checklist.status === 'DRAFT' && 'bg-slate-100 text-slate-700 border-slate-200',
                                    checklist.status === 'INACTIVE' && 'bg-red-100 text-red-700 border-red-200'
                                )}>
                                    {STATUS_LABELS[checklist.status]}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Cập nhật lần cuối: {new Date(checklist.updatedAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>

                    {/* Previous Version (Placeholder/Logic based on current version > 1) */}
                    {checklist.version > 1 && (
                        <div className="relative pl-5 ml-5 border-l-2 border-border/60 space-y-6 py-2">
                            <div className="flex items-center gap-4 group">
                                <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-muted-foreground/30 bg-background group-hover:border-primary/50 transition-colors" />
                                <div className="h-9 w-9 shrink-0 rounded-full bg-muted flex items-center justify-center border border-border">
                                    <span className="text-xs font-bold text-muted-foreground">v{checklist.version - 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-sm font-medium text-muted-foreground">Phiên bản trước</p>
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground border border-border/50">
                                            Đã lưu trữ
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Đã tạo: {new Date(checklist.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
