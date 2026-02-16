import { cn } from "@/lib/utils";

interface PageHeaderTitleProps {
    children: React.ReactNode;
    className?: string;
    isMobile?: boolean;
}

export function PageHeaderTitle({ children, className, isMobile }: PageHeaderTitleProps) {
    return (
        <h1 className={cn(
            "font-bold tracking-tight text-foreground transition-all duration-300",
            isMobile ? "text-lg truncate" : "text-2xl lg:text-3xl",
            className
        )}>
            {children}
        </h1>
    );
}
