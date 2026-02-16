import { PanelLeft, PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarLogoProps {
    isCollapsed: boolean;
    onToggle: () => void;
    showToggle?: boolean;
}

export function SidebarLogo({ isCollapsed, onToggle, showToggle = true }: SidebarLogoProps) {
    return (
        <div className={cn(
            "h-16 flex items-center justify-between px-3 border-b border-sidebar-border transition-all duration-300 bg-sidebar/50 backdrop-blur-md sticky top-0 z-20",
            isCollapsed ? "justify-center" : "px-4"
        )}>
            <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 transition-transform active:scale-90">
                    <span className="text-primary-foreground font-black text-xs">CM</span>
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="font-bold text-sidebar-accent-foreground text-sm tracking-tight truncate">CMMS PRO</span>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Asset Management</span>
                    </div>
                )}
            </div>

            {showToggle && !isCollapsed && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className="h-8 w-8 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all rounded-lg active:scale-90"
                >
                    <PanelLeftClose className="h-4 w-4" />
                </Button>
            )}

            {showToggle && isCollapsed && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className="h-8 w-8 absolute -right-4 top-4 bg-sidebar border border-sidebar-border rounded-full shadow-md z-30 hover:bg-primary hover:text-primary-foreground transition-all active:scale-90 hidden lg:flex"
                >
                    <PanelLeft className="h-3 w-3" />
                </Button>
            )}
        </div>
    );
}
