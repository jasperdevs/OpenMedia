"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProviderLogoUrl } from "@/lib/model-branding";
import type { ModelData } from "@/hooks/use-models";

interface ModelSelectorProps {
  models: ModelData[];
  value: string;
  onChange: (val: string) => void;
}

export function ModelSelector({ models, value, onChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = models.find((m) => m.id === value);

  const filtered = useMemo(() => {
    if (!query.trim()) return models;
    const q = query.toLowerCase();
    return models.filter((m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
  }, [models, query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label className="text-xs font-medium text-muted-foreground">Model</Label>
      <div className="relative">
        <button
          type="button"
          onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 0); }}
          className={cn(
            "flex w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-colors",
            "hover:border-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring",
            open && "ring-1 ring-ring"
          )}
        >
          {selected && <ModelLogo metaJson={selected.meta_json} />}
          <span className="flex-1 text-left truncate">
            {selected ? selected.name : <span className="text-muted-foreground">Select a model</span>}
          </span>
          {value ? (
            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground shrink-0" onClick={(e) => { e.stopPropagation(); onChange(""); setQuery(""); setOpen(false); }} />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          )}
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input ref={inputRef} type="text" placeholder="Search models..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" autoFocus />
            </div>
            <div className="max-h-[280px] overflow-y-auto p-1">
              {models.length === 0 && <p className="px-3 py-4 text-xs text-muted-foreground text-center">No models. Go to Settings.</p>}
              {models.length > 0 && filtered.length === 0 && <p className="px-3 py-4 text-xs text-muted-foreground text-center">No match for &quot;{query}&quot;</p>}
              {filtered.map((m) => (
                <button key={m.id} onClick={() => { onChange(m.id); setOpen(false); setQuery(""); }} className={cn("flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm transition-colors", m.id === value ? "bg-accent text-accent-foreground" : "hover:bg-accent/50")}>
                  <ModelLogo metaJson={m.meta_json} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{m.name}</p>
                    {m.name !== m.id && <p className="truncate text-[11px] text-muted-foreground">{m.id}</p>}
                  </div>
                  {m.cost_per_gen > 0 && (
                    <span className="shrink-0 text-[10px] text-muted-foreground">${m.cost_per_gen.toFixed(2)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModelLogo({ metaJson }: { metaJson?: string }) {
  const url = getProviderLogoUrl(metaJson);
  if (!url) return <div className="h-5 w-5 rounded bg-secondary shrink-0" />;
  return <img src={url} alt="" className="h-5 w-5 rounded object-cover shrink-0" />;
}
