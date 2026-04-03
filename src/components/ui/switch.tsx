import * as React from "react"

import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked: checkedProp, defaultChecked = false, onCheckedChange, onClick, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
    const isControlled = checkedProp !== undefined
    const checked = isControlled ? checkedProp : internalChecked

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
          "suprsend-peer suprsend-inline-flex suprsend-h-5 suprsend-w-9 suprsend-shrink-0 suprsend-cursor-pointer suprsend-items-center suprsend-rounded-full suprsend-border-2 suprsend-border-transparent suprsend-shadow-sm suprsend-transition-colors focus-visible:suprsend-outline-none focus-visible:suprsend-ring-2 focus-visible:suprsend-ring-ring focus-visible:suprsend-ring-offset-2 focus-visible:suprsend-ring-offset-background disabled:suprsend-cursor-not-allowed disabled:suprsend-opacity-50 data-[state=checked]:suprsend-bg-primary data-[state=unchecked]:suprsend-bg-input",
          className
        )}
        ref={ref}
        {...props}
        onClick={(e) => {
          if (props.disabled) return
          const next = !checked
          if (!isControlled) setInternalChecked(next)
          onCheckedChange?.(next)
          onClick?.(e)
        }}
      >
        <span
          className={cn(
            "suprsend-pointer-events-none suprsend-block suprsend-h-4 suprsend-w-4 suprsend-rounded-full suprsend-bg-background suprsend-shadow-lg suprsend-ring-0 suprsend-transition-transform data-[state=checked]:suprsend-translate-x-4 data-[state=unchecked]:suprsend-translate-x-0"
          )}
          data-state={checked ? "checked" : "unchecked"}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
