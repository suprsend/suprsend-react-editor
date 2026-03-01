import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "suprsend-inline-flex suprsend-items-center suprsend-justify-center suprsend-gap-2 suprsend-whitespace-nowrap suprsend-rounded-md suprsend-text-sm suprsend-font-medium suprsend-transition-colors focus-visible:suprsend-outline-none focus-visible:suprsend-ring-1 focus-visible:suprsend-ring-ring disabled:suprsend-pointer-events-none disabled:suprsend-opacity-50 [&_svg]:suprsend-pointer-events-none [&_svg]:suprsend-size-4 [&_svg]:suprsend-shrink-0",
  {
    variants: {
      variant: {
        default:
          "suprsend-bg-primary suprsend-text-primary-foreground suprsend-shadow hover:suprsend-bg-primary/90",
        destructive:
          "suprsend-bg-destructive suprsend-text-destructive-foreground suprsend-shadow-sm hover:suprsend-bg-destructive/90",
        outline:
          "suprsend-border suprsend-border-input suprsend-bg-background suprsend-shadow-sm hover:suprsend-bg-accent hover:suprsend-text-accent-foreground",
        secondary:
          "suprsend-bg-secondary suprsend-text-secondary-foreground suprsend-shadow-sm hover:suprsend-bg-secondary/80",
        ghost: "hover:suprsend-bg-accent hover:suprsend-text-accent-foreground",
        link: "suprsend-text-primary suprsend-underline-offset-4 hover:suprsend-underline",
      },
      size: {
        default: "suprsend-h-9 suprsend-px-4 suprsend-py-2",
        sm: "suprsend-h-8 suprsend-rounded-md suprsend-px-3 suprsend-text-xs",
        lg: "suprsend-h-10 suprsend-rounded-md suprsend-px-8",
        icon: "suprsend-h-9 suprsend-w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
