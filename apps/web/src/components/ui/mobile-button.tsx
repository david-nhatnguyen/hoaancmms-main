import * as React from 'react';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';

/**
 * Mobile-optimized button with proper touch target sizes
 * 
 * Ensures minimum 44x44px touch targets (iOS HIG standard)
 * Adds visual feedback on tap
 * 
 * @example
 * ```tsx
 * <MobileButton onClick={handleClick}>
 *   <Plus className="h-5 w-5" />
 *   Add
 * </MobileButton>
 * ```
 */
export const MobileButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          // Ensure minimum touch target size (iOS HIG: 44x44px)
          'min-h-[44px] min-w-[44px]',
          // Add active state for visual feedback
          'active:scale-95 active:brightness-90 transition-transform duration-100',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

MobileButton.displayName = 'MobileButton';
