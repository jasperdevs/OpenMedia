"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RESOLUTIONS = [
  { label: "0.5K", value: "0.5K", desc: "~512px" },
  { label: "1K", value: "1K", desc: "~1024px" },
  { label: "2K", value: "2K", desc: "~1536px" },
  { label: "4K", value: "4K", desc: "~3072px" },
];

interface ResolutionSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export function ResolutionSelector({ value, onChange }: ResolutionSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">Resolution</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RESOLUTIONS.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              <span className="flex items-center gap-2">
                <span>{r.label}</span>
                <span className="text-muted-foreground text-[10px]">{r.desc}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
