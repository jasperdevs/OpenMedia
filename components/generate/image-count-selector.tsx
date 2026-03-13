"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface ImageCountSelectorProps {
  value: number;
  onChange: (val: number) => void;
}

export function ImageCountSelector({ value, onChange }: ImageCountSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Image Count
      </Label>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="text-lg font-semibold w-8 text-center">{value}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(Math.min(4, value + 1))}
          disabled={value >= 4}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
