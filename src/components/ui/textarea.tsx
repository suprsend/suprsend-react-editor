import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "suprsend-flex suprsend-min-h-[60px] suprsend-w-full suprsend-rounded-md suprsend-border suprsend-border-input suprsend-bg-transparent suprsend-px-3 suprsend-py-2 suprsend-text-base suprsend-shadow-sm placeholder:suprsend-text-muted-foreground focus-visible:suprsend-outline-none focus-visible:suprsend-ring-1 focus-visible:suprsend-ring-ring disabled:suprsend-cursor-not-allowed disabled:suprsend-bg-muted md:suprsend-text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
