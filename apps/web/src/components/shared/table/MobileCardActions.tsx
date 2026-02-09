import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileCardActionsProps {
  onView?: (e: React.MouseEvent) => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  className?: string;
}

export function MobileCardActions({
  onView,
  onEdit,
  onDelete,
  viewLabel = 'Xem',
  editLabel = 'Sửa',
  deleteLabel = 'Xóa',
  className
}: MobileCardActionsProps) {
  const handleAction = (e: React.MouseEvent, action?: (e: React.MouseEvent) => void, vibrateMs = 5) => {
    e.stopPropagation();
    if (action) {
      if (window.navigator.vibrate) window.navigator.vibrate(vibrateMs);
      action(e);
    }
  };

  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {onView && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => handleAction(e, onView, 5)}
          className="h-11 w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary active:scale-95 transition-all font-bold rounded-xl"
        >
          <Eye className="h-4 w-4" />
          <span className="truncate">{viewLabel}</span>
        </Button>
      )}
      
      {onEdit && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => handleAction(e, onEdit, 5)}
          className="h-11 w-full flex items-center justify-center gap-2 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 hover:text-orange-700 active:scale-95 transition-all font-bold rounded-xl"
        >
          <Pencil className="h-4 w-4" />
          <span className="truncate">{editLabel}</span>
        </Button>
      )}
      
      {onDelete && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => handleAction(e, onDelete, 10)}
          className="h-11 w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive active:scale-95 transition-all font-bold rounded-xl"
        >
          <Trash2 className="h-4 w-4" />
          <span className="truncate">{deleteLabel}</span>
        </Button>
      )}
    </div>
  );
}
