import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "suprsend-inline-flex suprsend-h-9 suprsend-items-center suprsend-justify-center suprsend-rounded-lg suprsend-bg-muted suprsend-p-1 suprsend-text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "suprsend-inline-flex suprsend-items-center suprsend-justify-center suprsend-whitespace-nowrap suprsend-rounded-md suprsend-px-3 suprsend-py-1 suprsend-text-sm suprsend-font-medium suprsend-ring-offset-background suprsend-transition-all focus-visible:suprsend-outline-none focus-visible:suprsend-ring-2 focus-visible:suprsend-ring-ring focus-visible:suprsend-ring-offset-2 disabled:suprsend-pointer-events-none disabled:suprsend-opacity-50 data-[state=active]:suprsend-bg-background data-[state=active]:suprsend-text-foreground data-[state=active]:suprsend-shadow",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "suprsend-mt-2 suprsend-ring-offset-background focus-visible:suprsend-outline-none focus-visible:suprsend-ring-2 focus-visible:suprsend-ring-ring focus-visible:suprsend-ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
