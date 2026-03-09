import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Premium compact input
 * - Sharp edges (2px radius)
 * - Dense height
 * - Subtle focus state
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full border border-input bg-background px-3 py-1.5 text-sm text-foreground transition-colors",
          "placeholder:text-muted-foreground/60",
          "focus:outline-none focus:border-primary/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
