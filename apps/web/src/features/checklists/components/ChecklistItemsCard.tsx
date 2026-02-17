import React from 'react';
import { FileQuestion, ListTodo } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChecklistTemplateItem } from '../types/checklist.types';
import { ChecklistItemCard } from './ChecklistItemCard';
import { cn } from '@/lib/utils';

interface ChecklistItemsCardProps {
    items?: ChecklistTemplateItem[];
    className?: string;
}

/**
 * ChecklistItemsCard Component
 * Displays the list of checklist items in a Card container, matching the style of ChecklistItemsTable.
 * Handles the empty state and rendering of individual item cards.
 */
export const ChecklistItemsCard: React.FC<ChecklistItemsCardProps> = ({
    items = [],
    className
}) => {
    const hasItems = items.length > 0;

    return (
        <Card className={cn("border border-border/60 shadow-sm bg-card transition-all hover:shadow-md", className)}>
            <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <ListTodo className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                        <CardTitle className="text-lg">Danh sách hạng mục kiểm tra</CardTitle>
                        <p className="text-sm text-muted-foreground">Chi tiết các bước thực hiện bảo dưỡng</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {hasItems ? (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                            >
                                <ChecklistItemCard item={item} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-border/60 rounded-lg bg-muted/10">
                        <div className="p-4 bg-muted/50 rounded-full mb-3">
                            <FileQuestion className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium text-foreground">Chưa có hạng mục kiểm tra</p>
                        <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">
                            Checklist này chưa được định nghĩa các hạng mục công việc.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
