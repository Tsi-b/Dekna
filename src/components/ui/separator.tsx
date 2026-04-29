import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

interface SeparatorProps extends
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  variant?: "default" | "muted" | "accent" | "gradient" | "shadow"
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    { className, orientation = "horizontal", decorative = true, variant = "default", ...props },
    ref
  ) => {
    // Shadow variant (custom render)
    if (variant === "shadow") {
      return (
        <div className="relative h-16 w-full">
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-black/[0.02] dark:to-white/[0.02]" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-transparent to-black/[0.02] dark:to-white/[0.02]" />
        </div>
      );
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0",
          variant === "default" && "bg-border",
          variant === "muted" && "bg-muted",
          variant === "accent" && "bg-primary/30",
          variant === "gradient" && "bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )}
        {...props}
      />
    )
  }
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
