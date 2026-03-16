import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from '@/lib/utils';

function FieldGroup({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        'suprsend-flex suprsend-gap-2',
        className
      )}
      {...props}
    />
  );
}

function Field({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field"
      className={cn('suprsend-flex suprsend-flex-col suprsend-gap-1.5', className)}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="field-label"
      className={cn(
        'suprsend-text-sm suprsend-font-medium suprsend-leading-none',
        className
      )}
      {...props}
    />
  );
}

export { Field, FieldGroup, FieldLabel };
