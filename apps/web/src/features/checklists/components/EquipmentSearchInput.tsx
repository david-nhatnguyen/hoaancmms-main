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
              "w-full justify-between h-auto min-h-[72px] py-3 px-3 items-center text-left relative overflow-hidden transition-all duration-300",
              "flex [&>span]:flex-1 [&>span]:w-full",
              error && "border-destructive text-destructive",
              value && "bg-primary/5 hover:bg-primary/10 border-primary/20 shadow-sm"
            )}
          >
            {/* Selected State */}
            <div className={cn(
              "flex flex-1 min-w-0 transition-all duration-300 transform",
              value ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 absolute inset-x-3 pointer-events-none"
            )}>
              {value && <EquipmentQuickView equipment={value} isCompact showImage={true} />}
            </div>

            {/* Empty State / Placeholder */}
            <div className={cn(
              "flex flex-1 min-w-0 items-center gap-2 transition-all duration-300 transform",
              !value ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 absolute inset-x-3 pointer-events-none"
            )}>
              <div className="p-2 rounded-lg bg-muted/50">
                <Building2 className="h-5 w-5 text-muted-foreground opacity-50" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm text-foreground/80">
                  {`Tìm thiết bị${required ? ' *' : ''}`}
                </span>
                <span className="text-[10px] text-muted-foreground">Nhấp để tìm kiếm và chọn thiết bị</span>
              </div>
            </div>

            <div className="flex items-center ml-2 shrink-0 self-center z-10">
              <div className={cn(
                "flex items-center transition-all duration-300",
                value ? "opacity-100 scale-100 w-auto" : "opacity-0 scale-50 w-0 overflow-hidden pointer-events-none"
              )}>
                <div
                  onClick={handleClear}
                  className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-full mr-1 transition-colors"
                  title="Gỡ bỏ lựa chọn"
                >
                  <X className="h-4 w-4" />
                </div>
              </div>
              <div className="p-1 rounded-md bg-muted/30 ml-1">
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </div>
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
            <CommandList className="max-h-[400px] min-h-[200px] transition-all duration-300">
              {isLoading && (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 items-start p-3">
                      <Skeleton className="h-14 w-14 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-3 w-32" />
                        <div className="flex gap-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!isLoading && equipments.length === 0 && (
                <CommandEmpty className="py-16 flex flex-col items-center justify-center gap-3 leading-none transition-all animate-in fade-in zoom-in-95">
                  <div className="p-4 rounded-full bg-muted/50 border border-border/20 shadow-inner">
                    <Building2 className="h-8 w-8 text-muted-foreground opacity-30" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-foreground/80">Không tìm thấy thiết bị nào</p>
                    <p className="text-[11px] text-muted-foreground">Thử tìm kiếm với tên hoặc mã khác</p>
                  </div>
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
