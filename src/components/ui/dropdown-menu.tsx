import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from '@/assets/icons'

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "suprsend-flex suprsend-cursor-default suprsend-select-none suprsend-items-center suprsend-gap-2 suprsend-rounded-sm suprsend-px-2 suprsend-py-1.5 suprsend-text-sm suprsend-outline-none focus:suprsend-bg-accent data-[state=open]:suprsend-bg-accent [&_svg]:suprsend-pointer-events-none [&_svg]:suprsend-size-4 [&_svg]:suprsend-shrink-0",
      inset && "suprsend-pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="suprsend-ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "suprsend-z-50 suprsend-min-w-[8rem] suprsend-overflow-hidden suprsend-rounded-md suprsend-border suprsend-bg-popover suprsend-p-1 suprsend-text-popover-foreground suprsend-shadow-lg data-[state=open]:suprsend-animate-in data-[state=closed]:suprsend-animate-out data-[state=closed]:suprsend-fade-out-0 data-[state=open]:suprsend-fade-in-0 data-[state=closed]:suprsend-zoom-out-95 data-[state=open]:suprsend-zoom-in-95 data-[side=bottom]:suprsend-slide-in-from-top-2 data-[side=left]:suprsend-slide-in-from-right-2 data-[side=right]:suprsend-slide-in-from-left-2 data-[side=top]:suprsend-slide-in-from-bottom-2 suprsend-origin-[--radix-dropdown-menu-content-transform-origin]",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "suprsend-z-50 suprsend-max-h-[var(--radix-dropdown-menu-content-available-height)] suprsend-min-w-[8rem] suprsend-overflow-y-auto suprsend-overflow-x-hidden suprsend-rounded-md suprsend-border suprsend-bg-popover suprsend-p-1 suprsend-text-popover-foreground suprsend-shadow-md",
        "data-[state=open]:suprsend-animate-in data-[state=closed]:suprsend-animate-out data-[state=closed]:suprsend-fade-out-0 data-[state=open]:suprsend-fade-in-0 data-[state=closed]:suprsend-zoom-out-95 data-[state=open]:suprsend-zoom-in-95 data-[side=bottom]:suprsend-slide-in-from-top-2 data-[side=left]:suprsend-slide-in-from-right-2 data-[side=right]:suprsend-slide-in-from-left-2 data-[side=top]:suprsend-slide-in-from-bottom-2 suprsend-origin-[--radix-dropdown-menu-content-transform-origin]",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "suprsend-relative suprsend-flex suprsend-cursor-default suprsend-select-none suprsend-items-center suprsend-gap-2 suprsend-rounded-sm suprsend-px-2 suprsend-py-1.5 suprsend-text-sm suprsend-outline-none suprsend-transition-colors focus:suprsend-bg-accent focus:suprsend-text-accent-foreground data-[disabled]:suprsend-pointer-events-none data-[disabled]:suprsend-opacity-50 [&>svg]:suprsend-size-4 [&>svg]:suprsend-shrink-0",
      inset && "suprsend-pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "suprsend-relative suprsend-flex suprsend-cursor-default suprsend-select-none suprsend-items-center suprsend-rounded-sm suprsend-py-1.5 suprsend-pl-8 suprsend-pr-2 suprsend-text-sm suprsend-outline-none suprsend-transition-colors focus:suprsend-bg-accent focus:suprsend-text-accent-foreground data-[disabled]:suprsend-pointer-events-none data-[disabled]:suprsend-opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="suprsend-absolute suprsend-left-2 suprsend-flex suprsend-h-3.5 suprsend-w-3.5 suprsend-items-center suprsend-justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="suprsend-h-4 suprsend-w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "suprsend-relative suprsend-flex suprsend-cursor-default suprsend-select-none suprsend-items-center suprsend-rounded-sm suprsend-py-1.5 suprsend-pl-8 suprsend-pr-2 suprsend-text-sm suprsend-outline-none suprsend-transition-colors focus:suprsend-bg-accent focus:suprsend-text-accent-foreground data-[disabled]:suprsend-pointer-events-none data-[disabled]:suprsend-opacity-50",
      className
    )}
    {...props}
  >
    <span className="suprsend-absolute suprsend-left-2 suprsend-flex suprsend-h-3.5 suprsend-w-3.5 suprsend-items-center suprsend-justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="suprsend-h-2 suprsend-w-2 suprsend-fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "suprsend-px-2 suprsend-py-1.5 suprsend-text-sm suprsend-font-semibold",
      inset && "suprsend-pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("suprsend--mx-1 suprsend-my-1 suprsend-h-px suprsend-bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("suprsend-ml-auto suprsend-text-xs suprsend-tracking-widest suprsend-opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
