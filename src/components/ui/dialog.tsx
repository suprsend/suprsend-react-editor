import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from '@/assets/icons'

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "suprsend-fixed suprsend-inset-0 suprsend-z-50 suprsend-bg-black/80 suprsend- data-[state=open]:suprsend-animate-in data-[state=closed]:suprsend-animate-out data-[state=closed]:suprsend-fade-out-0 data-[state=open]:suprsend-fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "suprsend-fixed suprsend-left-[50%] suprsend-top-[50%] suprsend-z-50 suprsend-grid suprsend-w-full suprsend-max-w-lg suprsend-translate-x-[-50%] suprsend-translate-y-[-50%] suprsend-gap-4 suprsend-border suprsend-bg-background suprsend-p-6 suprsend-shadow-lg suprsend-duration-200 suprsend-text-sm data-[state=open]:suprsend-animate-in data-[state=closed]:suprsend-animate-out data-[state=closed]:suprsend-fade-out-0 data-[state=open]:suprsend-fade-in-0 data-[state=closed]:suprsend-zoom-out-95 data-[state=open]:suprsend-zoom-in-95 data-[state=closed]:suprsend-slide-out-to-left-1/2 data-[state=closed]:suprsend-slide-out-to-top-[48%] data-[state=open]:suprsend-slide-in-from-left-1/2 data-[state=open]:suprsend-slide-in-from-top-[48%] sm:suprsend-rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="suprsend-absolute suprsend-right-4 suprsend-top-4 suprsend-rounded-sm suprsend-opacity-70 suprsend-ring-offset-background suprsend-transition-opacity hover:suprsend-opacity-100 focus:suprsend-outline-none focus:suprsend-ring-2 focus:suprsend-ring-ring focus:suprsend-ring-offset-2 disabled:suprsend-pointer-events-none data-[state=open]:suprsend-bg-accent data-[state=open]:suprsend-text-muted-foreground">
        <X className="suprsend-h-4 suprsend-w-4" />
        <span className="suprsend-sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "suprsend-flex suprsend-flex-col suprsend-space-y-1.5 suprsend-text-center sm:suprsend-text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "suprsend-flex suprsend-flex-col-reverse sm:suprsend-flex-row sm:suprsend-justify-end sm:suprsend-space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "suprsend-text-lg suprsend-font-semibold suprsend-leading-none suprsend-tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("suprsend-text-sm suprsend-text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
