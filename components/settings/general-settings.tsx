"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LS_GENERAL = "openmedia_general";

interface GeneralState {
  defaultImageCount: number;
  defaultAspectRatio: string;
  defaultResolution: string;
  galleryColumns: string;
  autoSavePrompt: boolean;
  confirmDelete: boolean;
  showCostInGallery: boolean;
  imageHeight: string;
}

const defaults: GeneralState = {
  defaultImageCount: 1,
  defaultAspectRatio: "1:1",
  defaultResolution: "1K",
  galleryColumns: "auto",
  autoSavePrompt: true,
  confirmDelete: true,
  showCostInGallery: true,
  imageHeight: "320",
};

function load(): GeneralState {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(LS_GENERAL);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch { return defaults; }
}

function save(state: GeneralState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_GENERAL, JSON.stringify(state));
}

export function GeneralSettings() {
  const [state, setState] = useState(defaults);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setState(load()); setMounted(true); }, []);

  const update = (patch: Partial<GeneralState>) => {
    setState((s) => {
      const next = { ...s, ...patch };
      save(next);
      return next;
    });
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Defaults</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Default image count</Label>
            <Input
              type="number" min={1} max={8} value={state.defaultImageCount}
              onChange={(e) => update({ defaultImageCount: parseInt(e.target.value) || 1 })}
              className="w-20 h-8 text-sm text-right"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Default aspect ratio</Label>
            <Select value={state.defaultAspectRatio} onValueChange={(v) => update({ defaultAspectRatio: v })}>
              <SelectTrigger className="w-28 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["1:1","16:9","9:16","4:3","3:4","3:2","2:3","21:9"].map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Default resolution</Label>
            <Select value={state.defaultResolution} onValueChange={(v) => update({ defaultResolution: v })}>
              <SelectTrigger className="w-28 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["0.5K","1K","2K","4K"].map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Gallery</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Image preview height</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Height in pixels for gallery thumbnails</p>
            </div>
            <Input
              type="number" min={100} max={600} step={20} value={state.imageHeight}
              onChange={(e) => update({ imageHeight: e.target.value })}
              className="w-20 h-8 text-sm text-right"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Show cost in gallery</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Display generation cost per item</p>
            </div>
            <Switch checked={state.showCostInGallery} onCheckedChange={(v) => update({ showCostInGallery: v })} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Behavior</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Remember last prompt</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Keep your prompt when switching modes</p>
            </div>
            <Switch checked={state.autoSavePrompt} onCheckedChange={(v) => update({ autoSavePrompt: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Confirm before deleting</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Show confirmation dialog when deleting generations</p>
            </div>
            <Switch checked={state.confirmDelete} onCheckedChange={(v) => update({ confirmDelete: v })} />
          </div>
        </div>
      </div>
    </div>
  );
}
