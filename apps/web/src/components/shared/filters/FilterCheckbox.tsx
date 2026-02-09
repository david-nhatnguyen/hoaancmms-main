import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterCheckboxProps {
  checked: boolean;
  className?: string;
}

export function FilterCheckbox({ checked, className }: FilterCheckboxProps) {
  return (
    <div className={cn(
      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-primary/30 transition-all text-white",
      checked ? "bg-primary border-primary scale-100" : "bg-transparent border-muted-foreground/30 scale-90",
      className
    )}>
      {checked && <Check className="h-3 w-3 stroke-[3]" />}
    </div>
  );
}
