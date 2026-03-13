"use client";

import { useState, useMemo } from "react";
import { GalleryGroup } from "./gallery-group";
import { GalleryModal } from "./gallery-modal";
import { GeneratingSkeleton } from "./generating-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import type { GenerationData } from "@/hooks/use-generations";

interface GalleryGridProps {
  generations: GenerationData[];
  loading: boolean;
  generating: boolean;
  onDelete: (id: string) => void;
}

interface Group {
  key: string;
  prompt: string;
  model_name: string;
  model_meta_json?: string;
  created_at: string;
  items: GenerationData[];
}

function groupGenerations(gens: GenerationData[]): Group[] {
  const groups: Group[] = [];
  for (const gen of gens) {
    const last = groups[groups.length - 1];
    if (last && last.prompt === gen.prompt && last.model_name === gen.model_name) {
      last.items.push(gen);
    } else {
      groups.push({
        key: gen.id,
        prompt: gen.prompt,
        model_name: gen.model_name,
        model_meta_json: gen.model_meta_json,
        created_at: gen.created_at,
        items: [gen],
      });
    }
  }
  return groups;
}

export function GalleryGrid({ generations, loading, generating, onDelete }: GalleryGridProps) {
  const [viewItem, setViewItem] = useState<GenerationData | null>(null);
  const groups = useMemo(() => groupGenerations(generations), [generations]);

  if (loading && generations.length === 0) {
    return (
      <div className="p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-xl my-4" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        {generating && <GeneratingSkeleton />}
        {groups.map((g) => (
          <GalleryGroup key={g.key} group={g} onView={setViewItem} onDelete={onDelete} />
        ))}
      </div>
      {generations.length === 0 && !loading && !generating && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No generations yet</p>
          <p className="text-sm mt-1">Write a prompt and hit Generate</p>
        </div>
      )}
      <GalleryModal
        generation={viewItem}
        allGenerations={generations}
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        onSelect={setViewItem}
        onDelete={onDelete}
      />
    </>
  );
}
