import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "suprsend-peer suprsend-inline-flex suprsend-h-5 suprsend-w-9 suprsend-shrink-0 suprsend-cursor-pointer suprsend-items-center suprsend-rounded-full suprsend-border-2 suprsend-border-transparent suprsend-shadow-sm suprsend-transition-colors focus-visible:suprsend-outline-none focus-visible:suprsend-ring-2 focus-visible:suprsend-ring-ring focus-visible:suprsend-ring-offset-2 focus-visible:suprsend-ring-offset-background disabled:suprsend-cursor-not-allowed disabled:suprsend-opacity-50 data-[state=checked]:suprsend-bg-primary data-[state=unchecked]:suprsend-bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "suprsend-pointer-events-none suprsend-block suprsend-h-4 suprsend-w-4 suprsend-rounded-full suprsend-bg-background suprsend-shadow-lg suprsend-ring-0 suprsend-transition-transform data-[state=checked]:suprsend-translate-x-4 data-[state=unchecked]:suprsend-translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
