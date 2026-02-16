import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobilePageHeaderProps {
  subtitle?: string;
  title: string;
  actions?: ReactNode;
  mobileActions?: ReactNode; // Simplified actions for mobile
}

export function MobilePageHeader({
  subtitle,
  title,
  actions,
  mobileActions
}: MobilePageHeaderProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="mb-4">
        {subtitle && (
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            {subtitle}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
          {mobileActions || actions}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {subtitle && (
        <p className="page-subtitle">{subtitle}</p>
      )}
      <div className="flex items-center justify-between">
        <h1 className="page-title">{title}</h1>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
