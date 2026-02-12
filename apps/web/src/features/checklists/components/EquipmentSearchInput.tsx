import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
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

  return (
    <div className="flex flex-col gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-auto min-h-10 py-2",
              !value && "text-muted-foreground",
              error && "border-destructive text-destructive"
            )}
          >
            {value ? (
              <div className="flex flex-col items-start gap-0.5 text-left">
                <span className="font-medium flex items-center gap-2">
                  {value.code}
                  <span className="font-normal text-muted-foreground hidden sm:inline-block">
                    - {value.name}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  {value.category}
                </span>
              </div>
            ) : (
              <span>{`Tìm kiếm thiết bị${required ? ' *' : ''}...`}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Tìm kiếm theo mã hoặc tên..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Đang tìm kiếm...
                </div>
              )}
              {!isLoading && equipments.length === 0 && (
                <CommandEmpty>Không tìm thấy thiết bị nào.</CommandEmpty>
              )}
              <CommandGroup>
                {equipments.map((equipment: Equipment) => (
                  <CommandItem
                    key={equipment.id}
                    value={equipment.id}
                    onSelect={() => handleSelect(equipment)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary">{equipment.code}</span>
                        <span>{equipment.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{equipment.category}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        value?.id === equipment.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <span className="text-sm font-medium text-destructive">{error}</span>}
      
      {/* Hidden dependency to CSS file to delete it later or ignore it */}
    </div>
  );
};
