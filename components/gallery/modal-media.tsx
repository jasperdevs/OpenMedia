"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import type { GenerationData } from "@/hooks/use-generations";

interface ModalMediaProps {
  generation: GenerationData;
}

export function ModalMedia({ generation }: ModalMediaProps) {
  const fileUrl = `/api/files/${generation.file_name}`;
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Reset zoom when image changes
  useEffect(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, [generation.id]);

  const resetZoom = useCallback(() => { setScale(1); setPos({ x: 0, y: 0 }); }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(Math.max(s * (e.deltaY > 0 ? 0.9 : 1.1), 0.5), 8));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, [scale]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    setPos((p) => ({ x: p.x + e.clientX - lastPos.current.x, y: p.y + e.clientY - lastPos.current.y }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => { dragging.current = false; }, []);

  const handleDoubleClick = useCallback(() => {
    if (scale > 1) resetZoom();
    else setScale(2);
  }, [scale, resetZoom]);

  return (
    <div
      className="flex-1 relative flex items-center justify-center bg-black min-h-[300px] md:min-h-0 overflow-hidden select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: scale > 1 ? "grab" : "zoom-in" }}
    >
      {/* Reset zoom button */}
      {scale !== 1 && (
        <button
          onClick={resetZoom}
          className="absolute top-3 right-3 z-10 rounded-full bg-background/80 backdrop-blur p-1.5 border border-border hover:bg-accent transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}

      {generation.media_type === "image" && (
        <img
          src={fileUrl}
          alt={generation.prompt}
          className="max-w-full max-h-[90vh] object-contain"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transition: dragging.current ? "none" : "transform 0.15s ease-out",
          }}
          onDoubleClick={handleDoubleClick}
          draggable={false}
        />
      )}
      {generation.media_type === "video" && (
        <video src={fileUrl} controls autoPlay className="max-w-full max-h-[90vh] rounded" />
      )}
      {generation.media_type === "audio" && (
        <div className="p-8 w-full max-w-md">
          <div className="rounded-xl bg-card border border-border p-6 space-y-4">
            <div className="flex items-center justify-center text-3xl text-muted-foreground">♪</div>
            <audio src={fileUrl} controls className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
