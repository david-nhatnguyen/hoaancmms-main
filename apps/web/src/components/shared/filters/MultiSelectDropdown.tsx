import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { FilterCheckbox } from './FilterCheckbox';

interface MultiSelectDropdownProps {
  label: string;
  icon?: React.ReactNode;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  searchable?: boolean;
}

export function MultiSelectDropdown({ 
  label, 
  icon, 
  options, 
  selected, 
  onToggle, 
  searchable = false 
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedLabels = options.filter(o => selected.includes(o.value)).map(o => o.label);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 px-3 gap-2 font-normal border-border/50 bg-secondary/30 transition-all",
            selected.length > 0 && "text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 hover:text-primary font-medium"
          )}
        >
          {icon}
          <span className="text-sm">
            {selected.length === 0 ? label : selected.length === 1 ? selectedLabels[0] : `${label} (${selected.length})`}
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 opacity-50 transition-transform duration-200", open && "rotate-180")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 shadow-xl border-border/50 rounded-xl" align="start">
        <Command className="bg-popover">
          {searchable && <CommandInput placeholder={`Tìm ${label.toLowerCase()}...`} className="h-10 border-none focus:ring-0" />}
          <CommandList className="max-h-72 overflow-y-auto no-scrollbar">
            <CommandEmpty className="py-6 text-sm text-center text-muted-foreground">Không tìm thấy kết quả.</CommandEmpty>
            <CommandGroup className="p-1.5">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => onToggle(option.value)}
                  className="rounded-lg py-2 pl-3 pr-2 cursor-pointer transition-colors hover:bg-secondary"
                >
                  <FilterCheckbox checked={selected.includes(option.value)} className="mr-2.5" />
                  <span className="flex-1 text-sm font-medium">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
