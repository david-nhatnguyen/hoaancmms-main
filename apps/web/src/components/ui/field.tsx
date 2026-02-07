import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
));
Field.displayName = "Field";

const FieldLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, children, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn("flex items-center text-sm font-medium", className)}
    {...props}
  >
    {children}
  </Label>
));
FieldLabel.displayName = "FieldLabel";

export { Field, FieldLabel };
