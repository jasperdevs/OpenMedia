"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { getProviderLogoUrl } from "@/lib/model-branding";
import type { ModelData } from "@/hooks/use-models";

interface ModelRowProps {
  model: ModelData;
  onCategoryChange: (id: string, category: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onCostChange: (id: string, cost: number) => void;
}

export function ModelRow({ model, onCategoryChange, onToggle, onCostChange }: ModelRowProps) {
  const [cost, setCost] = useState(String(model.cost_per_gen || ""));
  const logo = getProviderLogoUrl(model.meta_json);

  const handleCostBlur = () => {
    const val = parseFloat(cost) || 0;
    onCostChange(model.id, val);
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      {logo ? (
        <img src={logo} alt="" className="h-6 w-6 rounded object-cover shrink-0" />
      ) : (
        <div className="h-6 w-6 rounded bg-secondary shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{model.name}</p>
        <p className="text-[11px] text-muted-foreground truncate">{model.id}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="$"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          onBlur={handleCostBlur}
          className="w-20 h-8 text-xs text-right"
        />
        <Select value={model.category} onValueChange={(val) => onCategoryChange(model.id, val)}>
          <SelectTrigger className="w-[110px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="3d">3D</SelectItem>
            <SelectItem value="unclassified">Unclassified</SelectItem>
          </SelectContent>
        </Select>
        <Switch checked={model.enabled === 1} onCheckedChange={(checked) => onToggle(model.id, checked)} />
      </div>
    </div>
  );
}
