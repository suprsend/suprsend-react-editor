import { GripVertical } from '@/assets/icons'
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "suprsend-flex suprsend-h-full suprsend-w-full data-[panel-group-direction=vertical]:suprsend-flex-col",
      className
    )}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "suprsend-relative suprsend-flex suprsend-w-px suprsend-items-center suprsend-justify-center suprsend-bg-border after:suprsend-absolute after:suprsend-inset-y-0 after:suprsend-left-1/2 after:suprsend-w-1 after:suprsend--translate-x-1/2 focus-visible:suprsend-outline-none focus-visible:suprsend-ring-1 focus-visible:suprsend-ring-ring focus-visible:suprsend-ring-offset-1 data-[panel-group-direction=vertical]:suprsend-h-px data-[panel-group-direction=vertical]:suprsend-w-full data-[panel-group-direction=vertical]:after:suprsend-left-0 data-[panel-group-direction=vertical]:after:suprsend-h-1 data-[panel-group-direction=vertical]:after:suprsend-w-full data-[panel-group-direction=vertical]:after:suprsend--translate-y-1/2 data-[panel-group-direction=vertical]:after:suprsend-translate-x-0 [&[data-panel-group-direction=vertical]>div]:suprsend-rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="suprsend-z-10 suprsend-flex suprsend-h-4 suprsend-w-3 suprsend-items-center suprsend-justify-center suprsend-rounded-sm suprsend-border suprsend-bg-border">
        <GripVertical className="suprsend-h-2.5 suprsend-w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
