import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useUserSearch } from '../hooks';
import { User } from '../types/checklist.types';
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

interface UserSearchInputProps {
  value?: User | null;
  onChange: (user: User | null) => void;
  error?: string;
}

export const UserSearchInput: React.FC<UserSearchInputProps> = ({
  value,
  onChange,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: users = [], isLoading } = useUserSearch(searchQuery);

  const handleSelect = (user: User) => {
    onChange(user);
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
                <span className="font-medium">{value.fullName}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  @{value.username}
                </span>
              </div>
            ) : (
              <span>Tìm kiếm người phụ trách...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Tìm kiếm theo tên hoặc username..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Đang tìm kiếm...
                </div>
              )}
              {!isLoading && users.length === 0 && (
                <CommandEmpty>Không tìm thấy người dùng.</CommandEmpty>
              )}
              <CommandGroup>
                {users.map((user: User) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => handleSelect(user)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-primary">{user.fullName}</span>
                      <span className="text-xs text-muted-foreground">@{user.username}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        value?.id === user.id ? "opacity-100" : "opacity-0"
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
