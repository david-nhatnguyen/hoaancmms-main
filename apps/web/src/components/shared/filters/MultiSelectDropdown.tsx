import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onToggle: (value: string) => void;
  searchable?: boolean;
  icon?: React.ReactNode;
}

export function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
  searchable = false,
  icon
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedLabels = options
    .filter(o => selected.includes(o.value))
    .map(o => o.label);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-2 border-border/50 bg-secondary/50 hover:bg-secondary",
            selected.length > 0 && "border-primary/50 bg-primary/10"
          )}
        >
          {icon}
          <span className="text-sm">
            {selected.length === 0 
              ? label 
              : selected.length === 1 
                ? selectedLabels[0]
                : `${label} (${selected.length})`
            }
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 bg-popover border-border z-50" align="start">
        <Command className="bg-transparent">
          {searchable && <CommandInput placeholder={`Tìm ${label.toLowerCase()}...`} className="h-9" />}
          <CommandList>
            <CommandEmpty>Không tìm thấy.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => onToggle(option.value)}
                  className="cursor-pointer"
                >
                  <div className={cn(
                    "mr-2 h-4 w-4 rounded border border-primary flex items-center justify-center",
                    selected.includes(option.value) ? "bg-primary" : "bg-transparent"
                  )}>
                    {selected.includes(option.value) && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
