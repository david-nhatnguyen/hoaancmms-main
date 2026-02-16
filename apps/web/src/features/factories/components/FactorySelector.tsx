import * as React from "react"
import { Check, ChevronsUpDown, Loader2, Factory } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

export interface FactoryOption {
    id: string;
    name: string;
}

interface FactorySelectorProps {
    value?: string
    onChange: (value: string) => void
    factories: FactoryOption[]
    isLoading?: boolean
    disabled?: boolean
    className?: string
    placeholder?: string
}

export function FactorySelector({
    value,
    onChange,
    factories = [],
    isLoading,
    disabled,
    className,
    placeholder = "Chọn nhà máy",
}: FactorySelectorProps) {
    const [open, setOpen] = React.useState(false)
    const isMobile = useIsMobile()

    // Find selected factory label
    const selectedLabel = React.useMemo(() => {
        return factories.find((factory) => factory.id === value)?.name
    }, [value, factories])

    // Shared content for Command List
    // Optimization: Memoize the list component to avoid re-renders if not needed, 
    // though typically this is light enough.
    const factoryListContent = (
        <Command>
            <CommandInput placeholder="Tìm kiếm nhà máy..." autoFocus={!isMobile} />
            <CommandList>
                <CommandEmpty>Không tìm thấy nhà máy.</CommandEmpty>
                <CommandGroup>
                    {factories.map((factory) => (
                        <CommandItem
                            key={factory.id}
                            value={`${factory.name}-${factory.id}`}
                            onSelect={() => {
                                onChange(factory.id)
                                setOpen(false)
                            }}
                        >
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    value === factory.id ? "opacity-100" : "opacity-0"
                                )}
                            />
                            {factory.name}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    )

    const triggerButton = (
        <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
                "w-full flex justify-between font-normal hover:border-primary/50 transition-colors",
                !value && "text-muted-foreground",
                className
            )}
            disabled={disabled || isLoading}
            type="button"
        >
            <div className="flex items-center gap-2 truncate">
                <Factory className="h-4 w-4 shrink-0 opacity-70" />
                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <span className="truncate">
                    {!isLoading && (selectedLabel || placeholder)}
                </span>
            </div>
        </Button>
    )

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    {triggerButton}
                </DrawerTrigger>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle>Chọn nhà máy</DrawerTitle>
                            <DrawerDescription>
                                Tìm kiếm và chọn một nhà máy từ danh sách bên dưới.
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="px-4 pb-4">
                            {factoryListContent}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {triggerButton}
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                {factoryListContent}
            </PopoverContent>
        </Popover>
    )
}
