import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode | LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

/**
 * Empty state component with illustration and call-to-action
 * 
 * Shows when there's no data to display
 * Provides helpful guidance and action button
 * 
 * @param icon - Icon or illustration component
 * @param title - Main heading
 * @param description - Helpful description text
 * @param action - Optional CTA button config
 * @param className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<Building2 className="h-12 w-12" />}
 *   title="Chưa có nhà máy nào"
 *   description="Bắt đầu bằng cách thêm nhà máy đầu tiên"
 *   action={{
 *     label: "Thêm nhà máy đầu tiên",
 *     onClick: () => form.openDialog(),
 *     icon: <Plus className="h-4 w-4" />
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon: IconComponent,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {/* Icon/Illustration */}
      {IconComponent && (
        <div className="rounded-full bg-muted/50 p-6 mb-4">
          {typeof IconComponent === 'function' ? (
            <IconComponent className="h-12 w-12 text-muted-foreground/50" />
          ) : (
            IconComponent
          )}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        {description}
      </p>

      {/* Action Button */}
      {action && (
        <Button onClick={action.onClick} size="lg">
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </div>
  );
}
