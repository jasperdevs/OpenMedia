"use client";

import { Copy } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ProviderBadge } from "./provider-badge";
import type { GenerationData } from "@/hooks/use-generations";

interface Group {
  key: string;
  prompt: string;
  model_name: string;
  model_meta_json?: string;
  created_at: string;
  items: GenerationData[];
}

interface GalleryGroupProps {
  group: Group;
  onView: (gen: GenerationData) => void;
  onDelete: (id: string) => void;
}

export function GalleryGroup({ group, onView }: GalleryGroupProps) {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(group.prompt);
    toast({ title: "Copied" });
  };

  return (
    <div className="py-4 border-b border-border last:border-b-0">
      {/* Metadata row */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
        <ProviderBadge modelName={group.model_name} modelMetaJson={group.model_meta_json} />
        <span className="text-muted-foreground/30">·</span>
        <span className="truncate">{group.model_name}</span>
        <span className="text-muted-foreground/30">·</span>
        <span className="whitespace-nowrap">{formatDate(group.created_at)}</span>
      </div>

      {/* Prompt */}
      <div className="flex items-start gap-2 mb-3">
        <button onClick={handleCopy} className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors">
          <Copy className="h-3.5 w-3.5" />
        </button>
        <p className="text-sm leading-relaxed">{group.prompt}</p>
      </div>

      {/* Images row */}
      <div className="flex flex-wrap gap-3">
        {group.items.map((gen) => (
          <GroupItem key={gen.id} generation={gen} onView={onView} />
        ))}
      </div>
    </div>
  );
}

function GroupItem({ generation, onView }: { generation: GenerationData; onView: (g: GenerationData) => void }) {
  const fileUrl = `/api/files/${generation.file_name}`;

  return (
    <button
      onClick={() => onView(generation)}
      className="rounded-lg overflow-hidden border border-border hover:border-muted-foreground/50 transition-colors"
    >
      {generation.media_type === "image" && (
        <img src={fileUrl} alt="" className="h-80 w-auto max-w-[520px] object-cover" loading="lazy" />
      )}
      {generation.media_type === "video" && (
        <video src={fileUrl} className="h-80 w-auto max-w-[520px] object-cover" muted />
      )}
      {generation.media_type === "audio" && (
        <div className="h-28 w-44 flex items-center justify-center bg-secondary text-xl text-muted-foreground">♪</div>
      )}
    </button>
  );
}
