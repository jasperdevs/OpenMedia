"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { ModalMedia } from "./modal-media";
import { ModalInfo } from "./modal-info";
import { ModalOutputs } from "./modal-outputs";
import { DeleteConfirm } from "./delete-confirm";
import type { GenerationData } from "@/hooks/use-generations";

interface GalleryModalProps {
  generation: GenerationData | null;
  allGenerations: GenerationData[];
  open: boolean;
  onClose: () => void;
  onSelect: (gen: GenerationData) => void;
  onDelete: (id: string) => void;
}

export function GalleryModal({
  generation, allGenerations, open, onClose, onSelect, onDelete,
}: GalleryModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Find siblings and current index
  const siblings = useMemo(() => {
    if (!generation) return [];
    return allGenerations.filter(
      (g) => g.prompt === generation.prompt && g.model_name === generation.model_name
    );
  }, [generation, allGenerations]);

  const currentIdx = useMemo(() => {
    if (!generation) return -1;
    return siblings.findIndex((g) => g.id === generation.id);
  }, [generation, siblings]);

  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < siblings.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onSelect(siblings[currentIdx - 1]);
  }, [hasPrev, siblings, currentIdx, onSelect]);

  const goNext = useCallback(() => {
    if (hasNext) onSelect(siblings[currentIdx + 1]);
  }, [hasNext, siblings, currentIdx, onSelect]);

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, goPrev, goNext]);

  if (!generation) return null;

  const handleDelete = () => {
    onDelete(generation.id);
    setConfirmDelete(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[96vw] max-h-[94vh] p-0 gap-0 overflow-hidden">
        <VisuallyHidden><DialogTitle>Generation Details</DialogTitle></VisuallyHidden>

        <DialogClose className="absolute right-3 top-3 z-10 rounded-full bg-background/80 backdrop-blur p-1.5 border border-border hover:bg-accent transition-colors">
          <X className="h-4 w-4" />
        </DialogClose>

        {/* Navigation arrows - outside the image area */}
        {siblings.length > 1 && (
          <>
            {hasPrev && (
              <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur p-2 border border-border hover:bg-accent transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {hasNext && (
              <button onClick={goNext} className="absolute right-[396px] top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur p-2 border border-border hover:bg-accent transition-colors hidden md:flex">
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
            {hasNext && (
              <button onClick={goNext} className="absolute right-3 bottom-3 z-10 rounded-full bg-background/80 backdrop-blur p-2 border border-border hover:bg-accent transition-colors md:hidden">
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </>
        )}

        <div className="flex flex-col md:flex-row h-full max-h-[94vh]">
          <ModalMedia generation={generation} />
          <div className="md:w-[380px] md:shrink-0 flex flex-col border-l border-border overflow-y-auto">
            <ModalInfo generation={generation} onDelete={() => setConfirmDelete(true)} />
            <ModalOutputs current={generation} allGenerations={allGenerations} onSelect={onSelect} />
          </div>
        </div>

        <DeleteConfirm open={confirmDelete} onCancel={() => setConfirmDelete(false)} onConfirm={handleDelete} />
      </DialogContent>
    </Dialog>
  );
}
