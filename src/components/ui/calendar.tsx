import * as React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from '@/assets/icons';
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      style={{ '--cell-size': '2.5rem' } as React.CSSProperties}
      className={cn(
        'suprsend-bg-background suprsend-group/calendar suprsend-p-3 [[data-slot=card-content]_&]:suprsend-bg-transparent [[data-slot=popover-content]_&]:suprsend-bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('suprsend-w-fit', defaultClassNames.root),
        months: cn(
          'suprsend-relative suprsend-flex suprsend-flex-col suprsend-gap-4 md:suprsend-flex-row',
          defaultClassNames.months
        ),
        month: cn(
          'suprsend-flex suprsend-w-full suprsend-flex-col suprsend-gap-4',
          defaultClassNames.month
        ),
        nav: cn(
          'suprsend-absolute suprsend-inset-x-0 suprsend-top-0 suprsend-flex suprsend-w-full suprsend-items-center suprsend-justify-between suprsend-gap-1',
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'suprsend-h-[--cell-size] suprsend-w-[--cell-size] suprsend-select-none suprsend-p-0 aria-disabled:suprsend-opacity-50',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'suprsend-h-[--cell-size] suprsend-w-[--cell-size] suprsend-select-none suprsend-p-0 aria-disabled:suprsend-opacity-50',
          defaultClassNames.button_next
        ),
        month_caption: cn(
          'suprsend-flex suprsend-h-[--cell-size] suprsend-w-full suprsend-items-center suprsend-justify-center suprsend-px-[--cell-size]',
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          'suprsend-flex suprsend-h-[--cell-size] suprsend-w-full suprsend-items-center suprsend-justify-center suprsend-gap-1.5 suprsend-text-sm suprsend-font-medium',
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          'has-focus:suprsend-border-ring suprsend-border-input suprsend-shadow-xs has-focus:suprsend-ring-ring/50 has-focus:suprsend-ring-[3px] suprsend-relative suprsend-rounded-md suprsend-border',
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          'suprsend-bg-popover suprsend-absolute suprsend-inset-0 suprsend-opacity-0',
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          'suprsend-select-none suprsend-font-medium',
          captionLayout === 'label'
            ? 'suprsend-text-sm'
            : '[&>svg]:suprsend-text-muted-foreground suprsend-flex suprsend-h-8 suprsend-items-center suprsend-gap-1 suprsend-rounded-md suprsend-pl-2 suprsend-pr-1 suprsend-text-sm [&>svg]:suprsend-size-3.5',
          defaultClassNames.caption_label
        ),
        table: 'suprsend-w-full suprsend-border-collapse',
        weekdays: cn('suprsend-flex', defaultClassNames.weekdays),
        weekday: cn(
          'suprsend-text-muted-foreground suprsend-flex-1 suprsend-select-none suprsend-rounded-md suprsend-text-[0.8rem] suprsend-font-normal suprsend-text-center suprsend-h-[--cell-size] suprsend-leading-[--cell-size]',
          defaultClassNames.weekday
        ),
        week: cn(
          'suprsend-mt-1 suprsend-flex suprsend-w-full',
          defaultClassNames.week
        ),
        week_number_header: cn(
          'suprsend-w-[--cell-size] suprsend-select-none',
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          'suprsend-text-muted-foreground suprsend-select-none suprsend-text-[0.8rem]',
          defaultClassNames.week_number
        ),
        day: cn(
          'suprsend-group/day suprsend-relative suprsend-flex-1 suprsend-flex suprsend-items-center suprsend-justify-center suprsend-select-none suprsend-p-0 suprsend-text-center [&:first-child[data-selected=true]_button]:suprsend-rounded-l-md [&:last-child[data-selected=true]_button]:suprsend-rounded-r-md',
          defaultClassNames.day
        ),
        range_start: cn(
          'suprsend-bg-accent suprsend-rounded-l-md',
          defaultClassNames.range_start
        ),
        range_middle: cn(
          'suprsend-rounded-none',
          defaultClassNames.range_middle
        ),
        range_end: cn(
          'suprsend-bg-accent suprsend-rounded-r-md',
          defaultClassNames.range_end
        ),
        today: cn(
          'suprsend-bg-accent suprsend-text-accent-foreground suprsend-rounded-md data-[selected=true]:suprsend-rounded-none',
          defaultClassNames.today
        ),
        outside: cn(
          'suprsend-text-muted-foreground aria-selected:suprsend-text-muted-foreground',
          defaultClassNames.outside
        ),
        disabled: cn(
          'suprsend-text-muted-foreground suprsend-opacity-50',
          defaultClassNames.disabled
        ),
        hidden: cn('suprsend-invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              style={{ minWidth: 'calc(7 * var(--cell-size) + 1rem)' }}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeft
                className={cn('suprsend-size-4', className)}
                {...props}
              />
            );
          }

          if (orientation === 'right') {
            return (
              <ChevronRight
                className={cn('suprsend-size-4', className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDown
              className={cn('suprsend-size-4', className)}
              {...props}
            />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="suprsend-flex suprsend-size-[--cell-size] suprsend-items-center suprsend-justify-center suprsend-text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'data-[selected-single=true]:suprsend-bg-primary data-[selected-single=true]:suprsend-text-primary-foreground data-[range-middle=true]:suprsend-bg-accent data-[range-middle=true]:suprsend-text-accent-foreground data-[range-start=true]:suprsend-bg-primary data-[range-start=true]:suprsend-text-primary-foreground data-[range-end=true]:suprsend-bg-primary data-[range-end=true]:suprsend-text-primary-foreground group-data-[focused=true]/day:suprsend-border-ring group-data-[focused=true]/day:suprsend-ring-ring/50 suprsend-flex suprsend-aspect-square suprsend-h-[--cell-size] suprsend-w-[--cell-size] suprsend-flex-col suprsend-gap-1 suprsend-font-normal suprsend-leading-none data-[range-end=true]:suprsend-rounded-md data-[range-middle=true]:suprsend-rounded-none data-[range-start=true]:suprsend-rounded-md group-data-[focused=true]/day:suprsend-relative group-data-[focused=true]/day:suprsend-z-10 group-data-[focused=true]/day:suprsend-ring-[3px] [&>span]:suprsend-text-xs [&>span]:suprsend-opacity-70',
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
