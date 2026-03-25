import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';
import { usePortalContainer } from '@/lib/PortalContext';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const container = usePortalContainer();
  return (
  <TooltipPrimitive.Portal container={container}>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'suprsend-z-50 suprsend-overflow-hidden suprsend-rounded-md suprsend-bg-foreground suprsend-px-3 suprsend-py-1.5 suprsend-text-xs suprsend-text-background suprsend-animate-in suprsend-fade-in-0 suprsend-zoom-in-95 data-[state=closed]:suprsend-animate-out data-[state=closed]:suprsend-fade-out-0 data-[state=closed]:suprsend-zoom-out-95 data-[side=bottom]:suprsend-slide-in-from-top-2 data-[side=left]:suprsend-slide-in-from-right-2 data-[side=right]:suprsend-slide-in-from-left-2 data-[side=top]:suprsend-slide-in-from-bottom-2 suprsend-origin-[--radix-tooltip-content-transform-origin]',
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
