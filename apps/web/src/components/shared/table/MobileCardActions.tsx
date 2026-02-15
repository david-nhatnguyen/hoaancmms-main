import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { triggerHapticFeedback } from './handlers/mobile-card.handler';

export type ActionVariant = 'default' | 'primary' | 'warning' | 'destructive' | 'outline' | 'ghost' | 'secondary';

export interface MobileAction {
  key: string;               // Unique identifier
  label: string;             // Button text
  icon?: ReactNode;          // Button icon
  onClick: (e: React.MouseEvent) => void;
  variant?: ActionVariant;   // Styling preset
  disabled?: boolean;
}

export interface MobileCardActionsProps {
  actions: MobileAction[];
  className?: string;
}

export function MobileCardActions({
  actions,
  className
}: MobileCardActionsProps) {

  const handleAction = (e: React.MouseEvent, onClick: (e: React.MouseEvent) => void, variant?: ActionVariant) => {
    e.stopPropagation();
    
    // Coordination with centralized haptic logic
    const intensity = variant === 'destructive' ? 'medium' : 'light';
    triggerHapticFeedback(intensity);
    
    onClick(e);
  };

  const getVariantStyles = (variant: ActionVariant = 'default') => {
    switch (variant) {
      case 'primary':
        return "text-primary bg-primary/5 hover:bg-primary/10 active:bg-primary/20";
      case 'warning':
        return "text-orange-600 bg-orange-500/5 hover:bg-orange-500/10 active:bg-orange-500/20";
      case 'destructive':
        return "text-destructive bg-destructive/5 hover:bg-destructive/10 active:bg-destructive/20";
      case 'secondary':
        return "text-muted-foreground bg-muted/30 hover:bg-muted/50 active:bg-muted/70";
      default:
        return "text-foreground hover:bg-muted active:bg-muted/80";
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col gap-1 w-full", 
        className
      )}
    >
      {actions.map((action) => (
        <Button
          key={action.key}
          size="sm"
          variant="ghost" 
          disabled={action.disabled}
          onClick={(e) => handleAction(e, action.onClick, action.variant)}
          className={cn(
            "h-14 w-full flex items-center justify-start gap-4 px-4 transition-all font-bold text-sm rounded-2xl active:scale-[0.98]",
            getVariantStyles(action.variant)
          )}
        >
          {action.icon && (
            <div className={cn(
              "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-background shadow-sm border border-border/20",
              action.variant === 'destructive' && "text-destructive",
              action.variant === 'primary' && "text-primary",
              action.variant === 'warning' && "text-orange-500"
            )}>
              {action.icon}
            </div>
          )}
          <span className="truncate flex-1 text-left">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
