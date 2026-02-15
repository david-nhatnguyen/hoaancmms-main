
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MobileFilterTriggerProps {
  activeCount: number;
  onClick: () => void;
  className?: string;
}

export function MobileFilterTrigger({
  activeCount,
  onClick,
  className
}: MobileFilterTriggerProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className={cn(
        "h-10 w-10 shrink-0 relative transition-colors",
        activeCount > 0 && "border-primary bg-primary/10 text-primary hover:bg-primary/20",
        className
      )}
    >
      <Filter className="h-4 w-4" />
      {activeCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-sm border border-background">
          {activeCount}
        </span>
      )}
      <span className="sr-only">Open filters</span>
    </Button>
  );
}
