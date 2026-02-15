import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';

interface ResponsivePageHeaderProps {
  title: string;
  subtitle?: string;
  mobileActions?: ReactNode;
  desktopActions?: ReactNode;
}

export function ResponsivePageHeader({
  title,
  subtitle,
  mobileActions,
  desktopActions
}: ResponsivePageHeaderProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobilePageHeader
        title={title}
        actions={mobileActions}
      />
    );
  }

  return (
    <div className="mb-6">
      {subtitle && <p className="page-subtitle uppercase text-muted-foreground text-sm font-semibold tracking-wide mb-1">{subtitle}</p>}
      <div className="flex items-center justify-between">
        <h1 className="page-title text-2xl font-bold">{title}</h1>
        {desktopActions && (
          <div className="flex items-center gap-2">
            {desktopActions}
          </div>
        )}
      </div>
    </div>
  );
}
