import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6", className)}
    >
      <Link
        to="/"
        className="flex items-center hover:text-primary transition-colors duration-200"
      >
        <Home className="h-3.5 w-3.5 md:h-4 md:w-4" />
      </Link>

      {items.map((item) => (
        <div key={item.label} className="flex items-center space-x-1">
          <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 opacity-50" />
          {item.href && !item.active ? (
            <Link
              to={item.href}
              className="hover:text-primary transition-colors duration-200 font-medium whitespace-nowrap"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              "font-semibold whitespace-nowrap",
              item.active ? "text-foreground" : ""
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
