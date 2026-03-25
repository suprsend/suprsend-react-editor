import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from '@/assets/icons'

import { cn } from "@/lib/utils"
import { usePortalContainer } from "@/lib/PortalContext"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "suprsend-flex suprsend-h-9 suprsend-w-full suprsend-items-center suprsend-justify-between suprsend-whitespace-nowrap suprsend-rounded-md suprsend-border suprsend-border-input suprsend-bg-transparent suprsend-px-3 suprsend-py-2 suprsend-text-sm suprsend-shadow-sm suprsend-ring-offset-background data-[placeholder]:suprsend-text-muted-foreground focus:suprsend-outline-none focus:suprsend-ring-1 focus:suprsend-ring-ring disabled:suprsend-cursor-not-allowed disabled:suprsend-opacity-50 [&>span]:suprsend-line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="suprsend-h-4 suprsend-w-4 suprsend-opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "suprsend-flex suprsend-cursor-default suprsend-items-center suprsend-justify-center suprsend-py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="suprsend-h-4 suprsend-w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "suprsend-flex suprsend-cursor-default suprsend-items-center suprsend-justify-center suprsend-py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="suprsend-h-4 suprsend-w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => {
  const container = usePortalContainer();
  return (
  <SelectPrimitive.Portal container={container}>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "suprsend-relative suprsend-z-50 suprsend-max-h-[--radix-select-content-available-height] suprsend-min-w-[8rem] suprsend-overflow-y-auto suprsend-overflow-x-hidden suprsend-rounded-md suprsend-border suprsend-bg-popover suprsend-text-sm suprsend-text-popover-foreground suprsend-shadow-md data-[state=open]:suprsend-animate-in data-[state=closed]:suprsend-animate-out data-[state=closed]:suprsend-fade-out-0 data-[state=open]:suprsend-fade-in-0 data-[state=closed]:suprsend-zoom-out-95 data-[state=open]:suprsend-zoom-in-95 data-[side=bottom]:suprsend-slide-in-from-top-2 data-[side=left]:suprsend-slide-in-from-right-2 data-[side=right]:suprsend-slide-in-from-left-2 data-[side=top]:suprsend-slide-in-from-bottom-2 suprsend-origin-[--radix-select-content-transform-origin]",
        position === "popper" &&
          "data-[side=bottom]:suprsend-translate-y-1 data-[side=left]:suprsend--translate-x-1 data-[side=right]:suprsend-translate-x-1 data-[side=top]:suprsend--translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "suprsend-p-1",
          position === "popper" &&
            "suprsend-h-[var(--radix-select-trigger-height)] suprsend-w-full suprsend-min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
  );
})
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("suprsend-px-2 suprsend-py-1.5 suprsend-text-sm suprsend-font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "suprsend-relative suprsend-flex suprsend-w-full suprsend-cursor-default suprsend-select-none suprsend-items-center suprsend-rounded-sm suprsend-py-1.5 suprsend-pl-2 suprsend-pr-8 suprsend-text-sm suprsend-outline-none focus:suprsend-bg-accent focus:suprsend-text-accent-foreground data-[disabled]:suprsend-pointer-events-none data-[disabled]:suprsend-opacity-50",
      className
    )}
    {...props}
  >
    <span className="suprsend-absolute suprsend-right-2 suprsend-flex suprsend-h-3.5 suprsend-w-3.5 suprsend-items-center suprsend-justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="suprsend-h-4 suprsend-w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("suprsend--mx-1 suprsend-my-1 suprsend-h-px suprsend-bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
