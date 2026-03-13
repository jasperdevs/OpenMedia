"use client";

import { Copy } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { GenerationData } from "@/hooks/use-generations";
import { ProviderBadge } from "./provider-badge";

interface GalleryCardProps {
  generation: GenerationData;
  onDelete: (id: string) => void;
  onView: (generation: GenerationData) => void;
}

export function GalleryCard({ generation, onView }: GalleryCardProps) {
  const fileUrl = `/api/files/${generation.file_name}`;

  const handleCopy = (event: React.MouseEvent<SVGSVGElement>) => {
    event.stopPropagation();
    navigator.clipboard.writeText(generation.prompt);
    toast({ title: "Prompt copied" });
  };

  return (
    <div
      className="break-inside-avoid cursor-pointer group"
      onClick={() => onView(generation)}
    >
      <div className="rounded-xl overflow-hidden border border-border bg-card transition-all hover:border-muted-foreground/40">
        {generation.media_type === "image" && (
          <img
            src={fileUrl}
            alt={generation.prompt}
            className="w-full object-cover"
            loading="lazy"
          />
        )}
        {generation.media_type === "video" && (
          <video src={fileUrl} className="w-full object-cover" muted />
        )}
        {generation.media_type === "audio" && (
          <div className="aspect-square flex items-center justify-center bg-secondary">
            <span className="text-4xl text-muted-foreground">♪</span>
          </div>
        )}
      </div>
      <div className="px-1 pt-2 pb-4">
        <div className="flex items-start gap-2">
          <Copy
            className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
            onClick={handleCopy}
          />
          <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">
            {generation.prompt}
          </p>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="max-w-[55%]">
            <ProviderBadge
              modelName={generation.model_name}
              modelMetaJson={generation.model_meta_json}
            />
          </div>
          <span className="text-muted-foreground/60">•</span>
          <span>{formatDate(generation.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
