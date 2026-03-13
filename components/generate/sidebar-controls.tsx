"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { ModeTabs } from "./mode-tabs";
import { ModelSelector } from "./model-selector";
import { PromptInput } from "./prompt-input";
import { AspectRatioSelector } from "./aspect-ratio-selector";
import { ImageCountSelector } from "./image-count-selector";
import { DurationSelector } from "./duration-selector";
import { ResolutionSelector } from "./resolution-selector";
import type { ModelData } from "@/hooks/use-models";

interface SidebarControlsProps {
  mode: string;
  models: ModelData[];
  selectedModel: string;
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
  imageCount: number;
  duration: string;
  resolution: string;
  generating: boolean;
  activeCount: number;
  onModeChange: (val: string) => void;
  onModelChange: (val: string) => void;
  onPromptChange: (val: string) => void;
  onNegativePromptChange: (val: string) => void;
  onAspectRatioChange: (val: string) => void;
  onImageCountChange: (val: number) => void;
  onDurationChange: (val: string) => void;
  onResolutionChange: (val: string) => void;
  onGenerate: () => void;
}

export function SidebarControls(props: SidebarControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const hasModel = !!props.selectedModel;
  const isMedia = props.mode === "image" || props.mode === "video";

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <ModeTabs mode={props.mode} onModeChange={props.onModeChange} />
        <ModelSelector models={props.models} value={props.selectedModel} onChange={props.onModelChange} />
        <PromptInput
          prompt={props.prompt}
          negativePrompt={props.negativePrompt}
          onPromptChange={props.onPromptChange}
          onNegativePromptChange={props.onNegativePromptChange}
        />
        {hasModel && isMedia && (
          <AspectRatioSelector value={props.aspectRatio} onChange={props.onAspectRatioChange} />
        )}
        {hasModel && isMedia && (
          <ResolutionSelector value={props.resolution} onChange={props.onResolutionChange} />
        )}
        {hasModel && props.mode === "image" && (
          <ImageCountSelector value={props.imageCount} onChange={props.onImageCountChange} />
        )}
        {hasModel && props.mode === "video" && (
          <DurationSelector value={props.duration} onChange={props.onDurationChange} />
        )}
        {hasModel && (
          <AdvancedSection mode={props.mode} show={showAdvanced} onToggle={() => setShowAdvanced(!showAdvanced)} />
        )}
      </div>
      <div className="p-4 border-t border-border">
        <Button
          className="w-full h-10 font-medium"
          onClick={props.onGenerate}
          disabled={!props.prompt.trim() || !props.selectedModel}
        >
          <Sparkles className="h-4 w-4" /> Generate
        </Button>
      </div>
    </div>
  );
}

function AdvancedSection({ mode, show, onToggle }: { mode: string; show: boolean; onToggle: () => void }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Advanced
      </button>
      {show && (
        <div className="mt-3 space-y-3">
          {(mode === "image") && (
            <>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">Seed</Label>
                <Input type="number" placeholder="Random" className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">Guidance Scale</Label>
                <Input type="number" step="0.5" defaultValue="7.5" className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">Steps</Label>
                <Input type="number" defaultValue="30" className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">Output Format</Label>
                <Input type="text" defaultValue="png" placeholder="png, jpeg, webp" className="h-8 text-xs" />
              </div>
            </>
          )}
          {mode === "video" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">FPS</Label>
                <Input type="number" defaultValue="24" className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">Seed</Label>
                <Input type="number" placeholder="Random" className="h-8 text-xs" />
              </div>
            </>
          )}
          {mode === "audio" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">Voice</Label>
                <Input type="text" placeholder="Default" className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">Speed</Label>
                <Input type="number" step="0.1" defaultValue="1.0" className="h-8 text-xs" />
              </div>
            </>
          )}
          {mode === "3d" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">Output Format</Label>
                <Input type="text" defaultValue="glb" placeholder="glb, obj, usdz" className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">Seed</Label>
                <Input type="number" placeholder="Random" className="h-8 text-xs" />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
