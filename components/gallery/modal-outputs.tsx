"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { GenerationData } from "@/hooks/use-generations";

interface ModalOutputsProps {
  current: GenerationData;
  allGenerations: GenerationData[];
  onSelect: (gen: GenerationData) => void;
}

export function ModalOutputs({ current, allGenerations, onSelect }: ModalOutputsProps) {
  // Find siblings: same prompt within 60 seconds
  const siblings = useMemo(() => {
    const t = new Date(current.created_at).getTime();
    return allGenerations.filter((g) => {
      const gt = new Date(g.created_at).getTime();
      return g.prompt === current.prompt && Math.abs(gt - t) < 60000;
    });
  }, [current, allGenerations]);

  if (siblings.length <= 1) return null;

  return (
    <div className="border-t border-border p-4">
      <p className="text-xs text-muted-foreground mb-3">
        All outputs ({siblings.length})
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {siblings.map((gen) => {
          const url = `/api/files/${gen.file_name}`;
          const isActive = gen.id === current.id;
          return (
            <button
              key={gen.id}
              onClick={() => onSelect(gen)}
              className={cn(
                "shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                isActive ? "border-foreground" : "border-transparent hover:border-muted-foreground"
              )}
            >
              {gen.media_type === "image" ? (
                <img src={url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                  {gen.media_type}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
