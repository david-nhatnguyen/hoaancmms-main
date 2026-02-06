import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Maximum width constraint
   * @default 'full' - no max width
   */
  maxWidth?: 'full' | '4xl' | '6xl' | '7xl';
  /**
   * Disable fade-in animation
   * @default false
   */
  noAnimation?: boolean;
  /**
   * Custom mobile padding
   * @default 'px-4 py-3'
   */
  mobilePadding?: string;
  /**
   * Custom desktop padding
   * @default 'p-6'
   */
  desktopPadding?: string;
}

/**
 * PageContainer - Consistent wrapper for all page content
 * 
 * Provides:
 * - Responsive padding (mobile vs desktop)
 * - Fade-in animation
 * - Overflow handling
 * - Optional max-width constraints
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <PageContainer>
 *   <h1>Page Title</h1>
 *   <p>Content...</p>
 * </PageContainer>
 * 
 * // With max width
 * <PageContainer maxWidth="4xl">
 *   <FormContent />
 * </PageContainer>
 * 
 * // Custom padding
 * <PageContainer mobilePadding="p-4 pb-24">
 *   <ListContent />
 * </PageContainer>
 * ```
 */
export function PageContainer({
  children,
  className,
  maxWidth = 'full',
  noAnimation = false,
  mobilePadding = 'px-4 py-3',
  desktopPadding = 'p-6',
}: PageContainerProps) {
  const isMobile = useIsMobile();

  const maxWidthClasses = {
    full: '',
    '4xl': 'max-w-4xl mx-auto',
    '6xl': 'max-w-6xl mx-auto',
    '7xl': 'max-w-7xl mx-auto',
  };

  return (
    <div
      className={cn(
        // Animation
        !noAnimation && 'animate-fade-in',
        // Responsive padding
        isMobile ? mobilePadding : desktopPadding,
        // Overflow handling
        'max-w-full overflow-x-hidden',
        // Max width
        maxWidthClasses[maxWidth],
        // Custom classes
        className
      )}
    >
      {children}
    </div>
  );
}
