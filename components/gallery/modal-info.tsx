"use client";

import { Button } from "@/components/ui/button";
import { Download, Trash2, Copy, Image as ImageIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { GenerationData } from "@/hooks/use-generations";
import { ProviderBadge } from "./provider-badge";

interface ModalInfoProps {
  generation: GenerationData;
  onDelete: () => void;
}

export function ModalInfo({ generation, onDelete }: ModalInfoProps) {
  const fileUrl = `/api/files/${generation.file_name}`;
  const settings = JSON.parse(generation.settings_json || "{}");
  const referenceImages: string[] = Array.isArray(settings.reference_images)
    ? settings.reference_images.filter((item: unknown) => typeof item === "string")
    : [];

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = generation.file_name;
    a.click();
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generation.prompt);
    toast({ title: "Prompt copied" });
  };

  const handleCopyFullPrompt = () => {
    const payload = JSON.stringify(
      {
        prompt: generation.prompt,
        reference_images: referenceImages,
      },
      null,
      2
    );
    navigator.clipboard.writeText(payload);
    toast({ title: "Prompt and references copied" });
  };

  return (
    <div className="p-4 space-y-4 flex-1">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <h3 className="text-sm font-semibold truncate">{generation.model_name}</h3>
          <div className="text-xs text-muted-foreground">
            <ProviderBadge
              modelName={generation.model_name}
              modelMetaJson={generation.model_meta_json}
            />
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyPrompt}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {settings.size && (
        <p className="text-xs text-muted-foreground">{settings.size}</p>
      )}

      <div className="rounded-lg bg-secondary p-3">
        <p className="text-sm leading-relaxed">{generation.prompt}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleCopyPrompt}>
          <Copy className="h-3.5 w-3.5" />
          Copy Prompt
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyFullPrompt}>
          <Copy className="h-3.5 w-3.5" />
          Copy Prompt + Images
        </Button>
      </div>

      {referenceImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Reference Images
          </p>
          <div className="grid grid-cols-3 gap-2">
            {referenceImages.map((src, index) => (
              <a
                key={`${src}-${index}`}
                href={src}
                target="_blank"
                rel="noreferrer"
                className="aspect-square rounded-lg border border-border bg-secondary overflow-hidden flex items-center justify-center"
              >
                {src.startsWith("http") ? (
                  <img src={src} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {generation.negative_prompt && (
        <div className="rounded-lg bg-secondary p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Negative
          </p>
          <p className="text-sm text-muted-foreground">{generation.negative_prompt}</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {formatDate(generation.created_at)}
      </p>
    </div>
  );
}
