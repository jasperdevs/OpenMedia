"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ASPECT_RATIOS = [
  { label: "1:1", value: "1:1", size: "1024x1024" },
  { label: "16:9", value: "16:9", size: "1280x720" },
  { label: "9:16", value: "9:16", size: "720x1280" },
  { label: "4:3", value: "4:3", size: "1024x768" },
  { label: "3:4", value: "3:4", size: "768x1024" },
  { label: "3:2", value: "3:2", size: "1152x768" },
  { label: "2:3", value: "2:3", size: "768x1152" },
  { label: "21:9", value: "21:9", size: "1344x576" },
];

export function aspectRatioToSize(ratio: string): string {
  return ASPECT_RATIOS.find((r) => r.value === ratio)?.size ?? "1024x1024";
}

interface AspectRatioSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  const selected = ASPECT_RATIOS.find((r) => r.value === value);

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">Aspect Ratio</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9">
          <SelectValue>
            {selected ? `${selected.label}  (${selected.size})` : "Select"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {ASPECT_RATIOS.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label} &nbsp; <span className="text-muted-foreground text-[11px]">{r.size}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
