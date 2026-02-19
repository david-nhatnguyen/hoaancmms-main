import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider // Ensure this is imported if available, or rely on global provider
} from '@/components/ui/tooltip';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';



interface CellTooltipProps {
    children: React.ReactNode;
    value?: string | number;
    className?: string;
    truncate?: boolean;
}

export function CellTooltip({ children, value, className, truncate = true }: CellTooltipProps) {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);

    // If no value to tooltip, just render children
    if (value === undefined || value === null || value === '') {
        return <div className={cn(truncate && "truncate", className)}>{children}</div>;
    }

    const stringValue = String(value);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(stringValue);
        setCopied(true);
        // toast.success("Đã sao chép vào clipboard"); // Optional
        setTimeout(() => {
            setCopied(false);
            setOpen(false);
        }, 1000);
    };

    return (
        <TooltipProvider>
            <Tooltip delayDuration={200} open={open} onOpenChange={setOpen}>
                <TooltipTrigger asChild>
                    <div
                        className={cn(truncate && "truncate", "cursor-default w-full", className)}
                        onClick={(e) => e.stopPropagation()} // Prevent row click when copying? No, trigger handles hover mainly.
                    >
                        {children}
                    </div>
                </TooltipTrigger>
                <TooltipContent
                    className="max-w-[320px] p-0 overflow-hidden shadow-xl border-border/50 bg-popover/95 backdrop-blur-sm z-[9999]"
                    side="top"
                    align="start"
                >
                    <div className="p-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap font-medium text-foreground/90">
                            {stringValue}
                        </p>
                    </div>
                    <div className="bg-muted/30 p-1.5 border-t border-border/10 flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-7 text-xs flex items-center gap-1.5 hover:bg-background hover:text-primary transition-colors",
                                copied && "text-green-600 hover:text-green-700 bg-green-50/50"
                            )}
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3.5 w-3.5" />}
                            <span className="font-medium">{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                        </Button>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
