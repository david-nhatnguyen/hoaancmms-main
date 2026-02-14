import React, { useState } from 'react';
import { 
  Check, 
  ChevronsUpDown, 
  Building2, 
  X, 
} from 'lucide-react';
import { useEquipmentSearch } from '../hooks';
import { Equipment } from '../types/checklist.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { EquipmentQuickView } from './EquipmentQuickView';

interface EquipmentSearchInputProps {
  value?: Equipment | null;
  onChange: (equipment: Equipment | null) => void;
  error?: string;
  required?: boolean;
}



export const EquipmentSearchInput: React.FC<EquipmentSearchInputProps> = ({
  value,
  onChange,
  error,
  required = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: equipments = [], isLoading } = useEquipmentSearch(searchQuery);

  const handleSelect = (equipment: Equipment) => {
    onChange(equipment);
    setOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-auto min-h-12 py-3 px-3 items-start text-left",
              !value && "items-center",
              error && "border-destructive text-destructive",
              value && "bg-accent/10 hover:bg-accent/20 border-primary/10 transition-colors"
            )}
          >
            {value ? (
              <div className="flex-1 min-w-0 text-left">
                <EquipmentQuickView equipment={value} isCompact showImage={true} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 opacity-50" />
                <span>{`Tìm thiết bị${required ? ' *' : ''}...`}</span>
              </div>
            )}
            
            <div className="flex items-center ml-2 shrink-0 self-center">
              {value && (
                <div 
                  onClick={handleClear}
                  className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-full mr-1 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </div>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0 shadow-xl border-border/40" 
          align="start"
          sideOffset={8}
        >
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <CommandInput 
                placeholder="Nhập mã hoặc tên thiết bị..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="border-none focus:ring-0"
              />
            </div>
            <CommandList className="max-h-[400px]">
              {isLoading && (
                <div className="p-4 space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-16 w-16 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!isLoading && equipments.length === 0 && (
                <CommandEmpty className="py-10 flex flex-col items-center justify-center gap-2 leading-none">
                  <div className="p-3 rounded-full bg-muted">
                    <Building2 className="h-6 w-6 text-muted-foreground opacity-20" />
                  </div>
                  <p className="text-sm text-muted-foreground">Không tìm thấy thiết bị nào.</p>
                </CommandEmpty>
              )}
              <CommandGroup className="p-2">
                {equipments.map((equipment: Equipment) => (
                  <CommandItem
                    key={equipment.id}
                    value={equipment.id}
                    onSelect={() => handleSelect(equipment)}
                    className="flex items-start gap-4 p-3 rounded-xl cursor-pointer data-[selected='true']:bg-primary/5 transition-all mb-1 last:mb-0 hover:bg-primary/5 group"
                  >
                    <EquipmentQuickView equipment={equipment} />
                    {/* Check Indicator */}
                    {value?.id === equipment.id && (
                      <div className="self-center bg-primary/10 text-primary p-1 rounded-full shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
