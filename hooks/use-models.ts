import { useState, useCallback } from "react";
import { toast } from "./use-toast";

export interface ModelData {
  id: string;
  name: string;
  category: string;
  enabled: number;
  cost_per_gen: number;
  meta_json: string;
  created_at: string;
}

export function useModels() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(false);

  /** Fetch models. Pass category for generation UI, pass "all" for settings page. */
  const fetchModels = useCallback(async (category?: string) => {
    setLoading(true);
    try {
      let url: string;
      if (category === "all") {
        url = "/api/models?all=1";
      } else if (category) {
        url = `/api/models?category=${category}`;
      } else {
        url = "/api/models";
      }
      const res = await fetch(url);
      const data = await res.json();
      setModels(data.models ?? []);
    } catch {
      toast({ title: "Error", description: "Failed to load models", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateModel = useCallback(
    async (id: string, updates: { category?: string; enabled?: boolean; cost_per_gen?: number }) => {
      try {
        const res = await fetch("/api/models", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...updates }),
        });
        if (!res.ok) throw new Error("Update failed");
      } catch {
        toast({ title: "Error", description: "Failed to update model", variant: "destructive" });
      }
    },
    []
  );

  return { models, loading, fetchModels, updateModel };
}
