import { cn } from '@/lib/utils';

export interface ChipOption {
  value: string;
  label: string;
  color?: string; // Optional coloring class (e.g., bg-red-500)
}

interface ChipFilterProps {
  options: ChipOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

export function ChipFilter({
  options,
  selected,
  onToggle
}: ChipFilterProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onToggle(option.value)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
            selected.includes(option.value)
              ? cn(option.color || "bg-primary", "text-white border-transparent shadow-sm")
              : "bg-secondary/50 text-muted-foreground border-border/50 hover:bg-secondary hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
