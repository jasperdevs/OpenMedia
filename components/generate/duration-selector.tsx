"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DURATIONS = [
  { label: "2 seconds", value: "2" },
  { label: "4 seconds", value: "4" },
  { label: "6 seconds", value: "6" },
  { label: "8 seconds", value: "8" },
  { label: "10 seconds", value: "10" },
];

interface DurationSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export function DurationSelector({ value, onChange }: DurationSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Duration
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DURATIONS.map((d) => (
            <SelectItem key={d.value} value={d.value}>
              {d.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
