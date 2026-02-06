import { cn } from '@/lib/utils';

interface TableSkeletonProps {
  rows?: number;
  className?: string;
}

/**
 * Skeleton loader for table/list data
 * 
 * Shows structure while data is loading (better UX than spinners)
 * 
 * @param rows - Number of skeleton rows to show (default: 5)
 * @param className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * {isLoading ? (
 *   <TableSkeleton rows={5} />
 * ) : (
 *   <ResponsiveTable data={data} />
 * )}
 * ```
 */
export function TableSkeleton({ rows = 5, className }: TableSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border bg-card p-4 animate-pulse"
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left side: Primary and secondary info */}
            <div className="flex-1 space-y-2">
              {/* Primary info (e.g., code) */}
              <div className="h-4 w-24 bg-muted rounded" />
              {/* Secondary info (e.g., name) */}
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
            
            {/* Right side: Status/Actions */}
            <div className="flex items-center gap-2">
              {/* Status badge */}
              <div className="h-6 w-16 bg-muted rounded-full" />
              {/* Action button */}
              <div className="h-8 w-8 bg-muted rounded" />
            </div>
          </div>
          
          {/* Additional info (mobile view) */}
          <div className="mt-3 flex items-center gap-4">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
