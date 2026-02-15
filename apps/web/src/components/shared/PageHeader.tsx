import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string | React.ReactNode;
  breadcrumbs?: React.ReactNode;
  description?: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  onGoBack?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  description,
  badges,
  actions,
  onGoBack,
  className,
  icon,
}) => {
  return (
    <div className={cn("space-y-4 mb-6", className)}>
      {/* Back Button & Breadcrumbs */}
      {(onGoBack || breadcrumbs) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-left-2 duration-300">
          {onGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoBack}
              className="-ml-2 h-8 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại
            </Button>
          )}
          {onGoBack && breadcrumbs && <span className="text-muted-foreground/40">/</span>}
          {breadcrumbs}
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        <div className="flex items-start gap-4">
          {icon && (
             <div className="hidden md:flex h-12 w-12 rounded-xl bg-primary/10 items-center justify-center shrink-0 border border-primary/20">
                {icon}
             </div>
          )}
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Subtitle / Context */}
            {subtitle && (
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {subtitle}
              </div>
            )}
            
            {/* Title & Badges */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl leading-tight">
                {title}
              </h1>
              {badges && (
                <div className="flex items-center gap-2 flex-wrap text-sm">
                   {/* Separator on desktop if needed, or just standard gap */}
                   {badges}
                </div>
              )}
            </div>

            {/* Description */}
            {description && (
              <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 md:self-start pt-1 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
