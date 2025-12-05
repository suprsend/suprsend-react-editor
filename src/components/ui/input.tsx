import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "suprsend-flex suprsend-h-9 suprsend-w-full suprsend-rounded-md suprsend-border suprsend-border-input suprsend-bg-transparent suprsend-px-3 suprsend-py-1 suprsend-text-base suprsend-shadow-sm suprsend-transition-colors file:suprsend-border-0 file:suprsend-bg-transparent file:suprsend-text-sm file:suprsend-font-medium file:suprsend-text-foreground placeholder:suprsend-text-muted-foreground focus-visible:suprsend-outline-none focus-visible:suprsend-ring-1 focus-visible:suprsend-ring-ring disabled:suprsend-cursor-not-allowed disabled:suprsend-opacity-50 md:suprsend-text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
