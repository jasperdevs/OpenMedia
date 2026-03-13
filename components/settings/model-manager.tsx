"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useModels } from "@/hooks/use-models";
import { ModelList } from "./model-list";

const TABS = [
  { value: "unclassified", label: "Unclassified" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "3d", label: "3D" },
];

export function ModelManager() {
  const { models, loading, fetchModels, updateModel } = useModels();
  const [tab, setTab] = useState("unclassified");
  const [search, setSearch] = useState("");
  const [reclassifying, setReclassifying] = useState(false);
  const [initializedTab, setInitializedTab] = useState(false);

  useEffect(() => { fetchModels("all"); }, [fetchModels]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const m of models) c[m.category] = (c[m.category] ?? 0) + 1;
    return c;
  }, [models]);

  useEffect(() => {
    if (!initializedTab && models.length > 0) {
      if ((counts["unclassified"] ?? 0) > 0) setTab("unclassified");
      else {
        const first = TABS.find((t) => (counts[t.value] ?? 0) > 0);
        if (first) setTab(first.value);
      }
      setInitializedTab(true);
    } else if (models.length > 0 && !counts[tab]) {
      const first = TABS.find((t) => (counts[t.value] ?? 0) > 0);
      if (first) setTab(first.value);
    }
  }, [models, counts, tab, initializedTab]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return models.filter((m) => {
      if (m.category !== tab) return false;
      if (q && !m.id.toLowerCase().includes(q) && !m.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [models, tab, search]);

  const handleReclassify = useCallback(async () => {
    setReclassifying(true);
    try {
      const res = await fetch("/api/models/reclassify", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Reclassified", description: `${data.total} models updated` });
        fetchModels("all");
      }
    } catch {
      toast({ title: "Error", description: "Reclassify failed", variant: "destructive" });
    } finally {
      setReclassifying(false);
    }
  }, [fetchModels]);

  const handleCat = async (id: string, cat: string) => { await updateModel(id, { category: cat }); fetchModels("all"); };
  const handleTog = async (id: string, en: boolean) => { await updateModel(id, { enabled: en }); fetchModels("all"); };
  const handleCost = async (id: string, c: number) => { await updateModel(id, { cost_per_gen: c }); };

  if (loading && models.length === 0) {
    return <Card><CardHeader><CardTitle>Model Manager</CardTitle><CardDescription>Loading...</CardDescription></CardHeader></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Model Manager</CardTitle>
            <CardDescription className="mt-1">
              {models.length === 0
                ? "No models found. Test your connection first."
                : `${models.length} models. ${counts["unclassified"] ?? 0} unclassified.`}
            </CardDescription>
          </div>
          {models.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleReclassify} disabled={reclassifying}>
              <RefreshCw className={`h-3.5 w-3.5 ${reclassifying ? "animate-spin" : ""}`} />
              Reclassify
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="flex-1 min-w-0">
                {t.label}{counts[t.value] ? ` (${counts[t.value]})` : ""}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search models..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <ModelList models={filtered} tab={tab} onCategoryChange={handleCat} onToggle={handleTog} onCostChange={handleCost} />
      </CardContent>
    </Card>
  );
}
