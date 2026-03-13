"use client";

import { ModelRow } from "./model-row";
import type { ModelData } from "@/hooks/use-models";

interface ModelListProps {
  models: ModelData[];
  tab: string;
  onCategoryChange: (id: string, category: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onCostChange: (id: string, cost: number) => void;
}

export function ModelList({ models, tab, onCategoryChange, onToggle, onCostChange }: ModelListProps) {
  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto">
      {models.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {tab === "unclassified"
            ? "All models classified."
            : "No models in this category."}
        </p>
      )}
      {models.map((model) => (
        <ModelRow
          key={model.id}
          model={model}
          onCategoryChange={onCategoryChange}
          onToggle={onToggle}
          onCostChange={onCostChange}
        />
      ))}
    </div>
  );
}
