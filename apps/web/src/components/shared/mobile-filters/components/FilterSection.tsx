
import { type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface FilterSectionProps {
  id: string;
  label: string;
  content: ReactNode;
  activeCount?: number;
  isOpen: boolean;
  onToggle: (id: string) => void;
}

export function FilterSection({
  id,
  label,
  content,
  activeCount,
  isOpen,
  onToggle
}: FilterSectionProps) {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={() => onToggle(id)}
      className="border rounded-lg bg-card/50 overflow-hidden"
    >
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{label}</span>
            <Badge 
              variant="secondary" 
              className={cn(
                "bg-primary/20 text-primary h-5 px-1.5 text-[10px] transition-all duration-300 origin-left",
                activeCount && activeCount > 0 ? "opacity-100 scale-100" : "opacity-0 scale-50 w-0 p-0 border-none overflow-hidden"
              )}
            >
              {activeCount}
            </Badge>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 pt-0 border-t border-dashed">
            <div className="pt-4">
                {content}
            </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
