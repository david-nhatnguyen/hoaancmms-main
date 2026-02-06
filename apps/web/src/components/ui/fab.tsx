import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-center';
  className?: string;
}

/**
 * Floating Action Button (FAB) for mobile
 * 
 * Primary action button that floats above content
 * Follows Material Design guidelines
 * 
 * Features:
 * - Fixed positioning
 * - Haptic feedback
 * - Visual feedback on tap
 * - Optional label
 * - Customizable position
 * 
 * @param onClick - Click handler
 * @param icon - Icon component (default: Plus)
 * @param label - Optional text label
 * @param position - Position on screen
 * @param className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * <FAB
 *   onClick={() => form.openDialog()}
 *   icon={<Plus className="h-6 w-6" />}
 *   label="Thêm"
 * />
 * ```
 */
export function FAB({
  onClick,
  icon,
  label,
  position = 'bottom-right',
  className,
}: FABProps) {
  const handleClick = () => {
    // Haptic feedback
    if (window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        // Base styles
        'fixed z-50 flex items-center justify-center',
        'bg-primary text-primary-foreground',
        'rounded-full shadow-lg',
        'transition-all duration-200',
        'hover:shadow-xl hover:scale-105',
        'active:scale-95',
        // Focus styles
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        // Size
        label ? 'h-14 px-6 gap-2' : 'h-14 w-14',
        // Position
        position === 'bottom-right' && 'bottom-6 right-6',
        position === 'bottom-center' && 'bottom-6 left-1/2 -translate-x-1/2',
        className
      )}
      aria-label={label || 'Add'}
    >
      {icon || <Plus className="h-6 w-6" />}
      {label && <span className="font-medium text-sm">{label}</span>}
    </button>
  );
}
