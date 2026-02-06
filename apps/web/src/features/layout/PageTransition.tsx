import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div 
      className={cn(
        "animate-in fade-in-0 slide-in-from-right-2 duration-200 ease-out",
        className
      )}
    >
      {children}
    </div>
  );
}
