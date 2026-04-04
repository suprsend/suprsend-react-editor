import * as React from "react"
import { Check } from '@/assets/icons'

import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked: checkedProp, defaultChecked = false, onCheckedChange, onClick, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
    const isControlled = checkedProp !== undefined
    const checked = isControlled ? checkedProp : internalChecked

    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
          "suprsend-grid suprsend-place-content-center suprsend-peer suprsend-h-4 suprsend-w-4 suprsend-shrink-0 suprsend-rounded-sm suprsend-border suprsend-border-primary suprsend-shadow focus-visible:suprsend-outline-none focus-visible:suprsend-ring-1 focus-visible:suprsend-ring-ring disabled:suprsend-cursor-not-allowed disabled:suprsend-opacity-50 data-[state=checked]:suprsend-bg-primary data-[state=checked]:suprsend-text-primary-foreground",
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
        {checked && (
          <span className={cn("suprsend-grid suprsend-place-content-center suprsend-text-current")}>
            <Check className="suprsend-h-4 suprsend-w-4" />
          </span>
        )}
      </button>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
