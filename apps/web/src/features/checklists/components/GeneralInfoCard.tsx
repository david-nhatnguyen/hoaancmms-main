import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { EquipmentQuickView } from './EquipmentQuickView';
import { Equipment } from '../types/checklist.types';
import { ClipboardList, FileText, Building2, Tag } from 'lucide-react';

interface GeneralInfoCardProps {
    title?: string;
    subtitle?: string;
    items: {
        label: string;
        value: React.ReactNode;
        icon?: React.ReactNode;
        isFullWidth?: boolean;
        className?: string;
    }[];
    equipment?: Equipment;
    className?: string;
    headerAction?: React.ReactNode;
}

/**
 * GeneralInfoCard Component
 * Refactored to match the system's "ChecklistGeneralInfo" standard styling.
 * Uses a clean header with icon, distinct zones for information, and consistent spacing.
 */
export const GeneralInfoCard: React.FC<GeneralInfoCardProps> = ({
    title = "Thông tin chung",
    subtitle = "Chi tiết và ngữ cảnh của checklist",
    items,
    equipment,
    className,
    headerAction,
}) => {
    return (
        <Card className={cn("border border-border/60 shadow-sm bg-card transition-all hover:shadow-md", className)}>
            <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10 text-primary">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5">
                            <CardTitle className="text-lg">{title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{subtitle}</p>
                        </div>
                    </div>
                    {headerAction}
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {/* Zone 1: Key Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.filter(item => !item.isFullWidth).map((item, index) => (
                        <div key={index} className={cn("space-y-1.5", item.className)}>
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                {item.icon || <Tag className="h-3.5 w-3.5 opacity-70" />}
                                <span>{item.label}</span>
                            </div>
                            <div className="text-base font-medium text-foreground">
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Zone 2: Full Width Items (Description, Notes) */}
                {items.some(item => item.isFullWidth) && (
                    <div className="space-y-4 pt-4 border-t border-border/40">
                        {items.filter(item => item.isFullWidth).map((item, index) => (
                            <div key={`full-${index}`} className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    {item.icon || <FileText className="h-3.5 w-3.5 opacity-70" />}
                                    <span>{item.label}</span>
                                </div>
                                <div className="text-sm text-foreground/90 leading-relaxed bg-muted/20 p-3 rounded-md border border-border/30">
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Zone 3: Equipment Context */}
                {equipment && (
                    <div className="pt-6 border-t border-border/40">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                            <Building2 className="h-4 w-4 text-primary" />
                            <span>Thiết bị áp dụng</span>
                        </div>
                        <div className="bg-muted/10 rounded-lg overflow-hidden">
                            <EquipmentQuickView equipment={equipment} isCompact={false} />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
