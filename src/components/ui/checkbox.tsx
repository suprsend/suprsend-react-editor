import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from '@/assets/icons'

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "suprsend-grid suprsend-place-content-center suprsend-peer suprsend-h-4 suprsend-w-4 suprsend-shrink-0 suprsend-rounded-sm suprsend-border suprsend-border-primary suprsend-shadow focus-visible:suprsend-outline-none focus-visible:suprsend-ring-1 focus-visible:suprsend-ring-ring disabled:suprsend-cursor-not-allowed disabled:suprsend-opacity-50 data-[state=checked]:suprsend-bg-primary data-[state=checked]:suprsend-text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("suprsend-grid suprsend-place-content-center suprsend-text-current")}
    >
      <Check className="suprsend-h-4 suprsend-w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
