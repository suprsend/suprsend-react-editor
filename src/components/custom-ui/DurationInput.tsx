import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

function parseDurationString(duration: string) {
  const matches = Array.from(duration.matchAll(/(\d+)([dhms])/g) || []);
  return matches.reduce(
    (acc, [, num, unit]) => {
      acc[unit as 'd' | 'h' | 'm' | 's'] = parseInt(num, 10);
      return acc;
    },
    { d: 0, h: 0, m: 0, s: 0 }
  );
}

const daysOpts = Array.from({ length: 30 }, (_, i) => i);
const hoursOpts = Array.from({ length: 24 }, (_, i) => i);
const minutesOpts = Array.from({ length: 60 }, (_, i) => i);
const secondsOpts = Array.from({ length: 60 }, (_, i) => i);

interface DurationSelectProps {
  label: string;
  value: number;
  options: number[];
  getLabel: (n: number) => string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function DurationSelect({
  label,
  value,
  options,
  getLabel,
  onChange,
  disabled,
}: DurationSelectProps) {
  return (
    <div className="suprsend-space-y-1">
      <Label className="suprsend-text-xs suprsend-font-normal">{label}</Label>
      <Select
        value={String(value)}
        onValueChange={(val) => onChange(Number(val))}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={String(opt)}>
              {getLabel(opt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface DurationInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function DurationInput({ value, onChange, disabled }: DurationInputProps) {
  const { d: days, h: hours, m: minutes, s: seconds } = parseDurationString(value);

  return (
    <div className="suprsend-grid suprsend-grid-cols-4 suprsend-gap-2">
      <DurationSelect
        label="Days"
        value={days}
        options={daysOpts}
        getLabel={(n) => `${n} days`}
        onChange={(newValue) =>
          onChange(`${newValue}d${hours}h${minutes}m${seconds}s`)
        }
        disabled={disabled}
      />
      <DurationSelect
        label="Hours"
        value={hours}
        options={hoursOpts}
        getLabel={(n) => `${n} hrs`}
        onChange={(newValue) =>
          onChange(`${days}d${newValue}h${minutes}m${seconds}s`)
        }
        disabled={disabled}
      />
      <DurationSelect
        label="Minutes"
        value={minutes}
        options={minutesOpts}
        getLabel={(n) => `${n} min`}
        onChange={(newValue) =>
          onChange(`${days}d${hours}h${newValue}m${seconds}s`)
        }
        disabled={disabled}
      />
      <DurationSelect
        label="Seconds"
        value={seconds}
        options={secondsOpts}
        getLabel={(n) => `${n} sec`}
        onChange={(newValue) =>
          onChange(`${days}d${hours}h${minutes}m${newValue}s`)
        }
        disabled={disabled}
      />
    </div>
  );
}
