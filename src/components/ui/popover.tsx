import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'suprsend-z-50 suprsend-w-72 suprsend-rounded-md suprsend-border suprsend-bg-popover suprsend-p-4 suprsend-text-popover-foreground suprsend-shadow-md suprsend-outline-none data-[state=open]:suprsend-animate-in data-[state=closed]:suprsend-animate-out data-[state=closed]:suprsend-fade-out-0 data-[state=open]:suprsend-fade-in-0 data-[state=closed]:suprsend-zoom-out-95 data-[state=open]:suprsend-zoom-in-95 data-[side=bottom]:suprsend-slide-in-from-top-2 data-[side=left]:suprsend-slide-in-from-right-2 data-[side=right]:suprsend-slide-in-from-left-2 data-[side=top]:suprsend-slide-in-from-bottom-2 suprsend-origin-[--radix-popover-content-transform-origin]',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };

