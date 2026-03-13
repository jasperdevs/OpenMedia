import { useState, useCallback, useRef } from "react";
import { toast } from "./use-toast";

export interface GenerationData {
  id: string;
  media_type: string;
  model_id: string;
  model_name: string;
  model_meta_json?: string;
  prompt: string;
  negative_prompt: string;
  settings_json: string;
  file_path: string;
  file_name: string;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface GenerateRequest {
  media_type: string;
  model: string;
  model_name: string;
  prompt: string;
  negative_prompt?: string;
  n?: number;
  size?: string;
  duration?: number;
  resolution?: string;
}

export function useGenerations() {
  const [generations, setGenerations] = useState<GenerationData[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const lastGenTime = useRef(0);

  const fetchGenerations = useCallback(async (mediaType?: string) => {
    setLoading(true);
    try {
      const url = mediaType
        ? `/api/generations?media_type=${mediaType}&limit=100`
        : "/api/generations?limit=100";
      const res = await fetch(url);
      const data = await res.json();
      setGenerations(data.generations ?? []);
    } catch {
      toast({ title: "Error", description: "Failed to load gallery", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  const generate = useCallback(async (request: GenerateRequest) => {
    // Debounce: 500ms between generations
    const now = Date.now();
    if (now - lastGenTime.current < 500) return null;
    lastGenTime.current = now;

    setActiveCount((c) => c + 1);
    try {
      const res = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      toast({ title: "Done", description: `${data.generations.length} result(s)` });
      return data;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Generation failed";
      toast({ title: "Generation failed", description: msg, variant: "destructive" });
      return null;
    } finally {
      setActiveCount((c) => c - 1);
    }
  }, []);

  const deleteGeneration = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/generations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setGenerations((prev) => prev.filter((g) => g.id !== id));
      toast({ title: "Deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  }, []);

  return {
    generations,
    generating: activeCount > 0,
    activeCount,
    loading,
    fetchGenerations,
    generate,
    deleteGeneration,
  };
}
