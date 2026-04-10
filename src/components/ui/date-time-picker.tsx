import * as React from 'react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { ChevronDown } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

/* ------------------------------------------------------------------ */
/*  TimeField – single input that looks like HH : MM                   */
/* ------------------------------------------------------------------ */

function TimeField({
  value,
  onChange,
  disabled,
}: {
  value: Date | undefined;
  onChange: (date: Date) => void;
  disabled?: boolean;
}) {
  const [hourText, setHourText] = React.useState(
    value ? String(value.getHours()).padStart(2, '0') : '00'
  );
  const [minText, setMinText] = React.useState(
    value ? String(value.getMinutes()).padStart(2, '0') : '00'
  );
  const minRef = React.useRef<HTMLInputElement>(null);

  // Sync local state when value changes externally
  React.useEffect(() => {
    setHourText(value ? String(value.getHours()).padStart(2, '0') : '00');
    setMinText(value ? String(value.getMinutes()).padStart(2, '0') : '00');
  }, [value?.getHours(), value?.getMinutes()]);

  function commitHour(raw: string) {
    const num = raw === '' ? 0 : Math.min(parseInt(raw, 10) || 0, 23);
    setHourText(String(num).padStart(2, '0'));
    const next = new Date(value ?? new Date());
    next.setHours(num);
    onChange(next);
  }

  function commitMinute(raw: string) {
    const num = raw === '' ? 0 : Math.min(parseInt(raw, 10) || 0, 59);
    setMinText(String(num).padStart(2, '0'));
    const next = new Date(value ?? new Date());
    next.setMinutes(num);
    onChange(next);
  }

  return (
    <div className={cn("suprsend-inline-flex suprsend-h-9 suprsend-w-[70px] suprsend-items-center suprsend-justify-center suprsend-rounded-md suprsend-border suprsend-border-input suprsend-bg-transparent suprsend-shadow-sm focus-within:suprsend-ring-1 focus-within:suprsend-ring-ring", disabled && "suprsend-bg-muted suprsend-cursor-not-allowed")}>
      <input
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={hourText}
        disabled={disabled}
        placeholder="HH"
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '');
          setHourText(raw);
          if (raw.length === 2) {
            commitHour(raw);
            minRef.current?.focus();
            minRef.current?.select();
          }
        }}
        onBlur={(e) => commitHour(e.target.value)}
        onFocus={(e) => e.target.select()}
        className="suprsend-w-6 suprsend-border-0 suprsend-bg-transparent suprsend-p-0 suprsend-text-center suprsend-text-sm suprsend-tabular-nums suprsend-outline-none"
      />
      <span className="suprsend-text-sm suprsend-text-muted-foreground">:</span>
      <input
        ref={minRef}
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={minText}
        disabled={disabled}
        placeholder="mm"
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '');
          setMinText(raw);
          if (raw.length === 2) {
            commitMinute(raw);
          }
        }}
        onBlur={(e) => commitMinute(e.target.value)}
        onFocus={(e) => e.target.select()}
        className="suprsend-w-6 suprsend-border-0 suprsend-bg-transparent suprsend-p-0 suprsend-text-center suprsend-text-sm suprsend-tabular-nums suprsend-outline-none"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DateTimePicker                                                     */
/* ------------------------------------------------------------------ */

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  dateLabel?: string;
  timeLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  calendarProps?: Omit<
    React.ComponentProps<typeof Calendar>,
    'mode' | 'selected' | 'onSelect'
  >;
}

function DateTimePicker({
  value,
  onChange,
  dateLabel = 'Date',
  timeLabel = 'Time',
  placeholder = 'Select date',
  disabled = false,
  className,
  calendarProps,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  function handleDateSelect(selected: Date | undefined) {
    if (!selected) {
      onChange?.(undefined);
      return;
    }
    const next = new Date(selected);
    if (value) {
      next.setHours(value.getHours());
      next.setMinutes(value.getMinutes());
    }
    onChange?.(next);
    setOpen(false);
  }

  function handleTimeChange(date: Date) {
    onChange?.(date);
  }

  return (
    <FieldGroup className={cn('suprsend-flex-row suprsend-items-end', className)}>
      <Field>
        <FieldLabel>{dateLabel}</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                'suprsend-w-[180px] suprsend-justify-between suprsend-font-normal disabled:suprsend-bg-muted disabled:suprsend-opacity-100',
                !value && 'suprsend-text-muted-foreground'
              )}
            >
              {value ? format(value, 'PPP') : placeholder}
              <ChevronDown className="suprsend-size-4 suprsend-opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="suprsend-w-auto suprsend-overflow-hidden suprsend-p-0"
            align="start"
          >
            <Calendar
              mode="single"
              selected={value}
              captionLayout="dropdown"
              defaultMonth={value}
              onSelect={handleDateSelect}
              {...calendarProps}
            />
          </PopoverContent>
        </Popover>
      </Field>
      <Field>
        <FieldLabel>{timeLabel}</FieldLabel>
        <TimeField
          value={value}
          onChange={handleTimeChange}
          disabled={disabled}
        />
      </Field>
    </FieldGroup>
  );
}

/* ------------------------------------------------------------------ */
/*  DatePicker – date-only variant                                     */
/* ------------------------------------------------------------------ */

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  displayFormat?: string;
  disabled?: boolean;
  className?: string;
  calendarProps?: Omit<
    React.ComponentProps<typeof Calendar>,
    'mode' | 'selected' | 'onSelect'
  >;
}

function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  displayFormat = 'PPP',
  disabled = false,
  className,
  calendarProps,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'suprsend-w-full suprsend-justify-start suprsend-text-left suprsend-font-normal disabled:suprsend-bg-muted disabled:suprsend-opacity-100',
            !value && 'suprsend-text-muted-foreground',
            className
          )}
        >
          {value ? format(value, displayFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="suprsend-w-auto suprsend-p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            onChange?.(d);
            setOpen(false);
          }}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DateTimePicker, DatePicker };
export type { DateTimePickerProps, DatePickerProps };
