import { Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function BulkActionsToolbar({ 
  selectedCount, 
  onClear, 
  onDelete,
  isDeleting 
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={cn(
        "flex items-center gap-4 min-w-[300px] md:min-w-[400px] px-4 py-3 rounded-2xl shadow-2xl border",
        "bg-popover/95 dark:bg-slate-900/95 backdrop-blur-md",
        "text-popover-foreground dark:text-slate-50 border-border dark:border-slate-800"
      )}>
        <div className="flex items-center gap-2 border-r border-border dark:border-slate-800 pr-4">
          <Badge 
            variant="default" 
            className="bg-primary hover:bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center p-0 font-bold"
          >
            {selectedCount}
          </Badge>
          <span className="text-sm font-semibold whitespace-nowrap">Đã chọn</span>
        </div>
        
        <div className="flex-1 flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDelete}
            disabled={isDeleting}
            className={cn(
              "gap-2 h-9 px-3 rounded-xl transition-colors font-medium",
              "text-red-500 dark:text-red-400",
              "hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
            )}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Xóa mục đã chọn</span>
            <span className="sm:hidden">Xóa</span>
          </Button>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-full h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
