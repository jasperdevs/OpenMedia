"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PromptInputProps {
  prompt: string;
  negativePrompt: string;
  onPromptChange: (val: string) => void;
  onNegativePromptChange: (val: string) => void;
}

export function PromptInput({
  prompt, negativePrompt, onPromptChange, onNegativePromptChange,
}: PromptInputProps) {
  const [showNegative, setShowNegative] = useState(false);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Prompt</Label>
        <Textarea
          placeholder="Describe what you want to generate..."
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>
      <div>
        <button
          type="button"
          onClick={() => setShowNegative(!showNegative)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showNegative ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          Negative prompt
        </button>
        {showNegative && (
          <Textarea
            placeholder="What to avoid in the generation..."
            value={negativePrompt}
            onChange={(e) => onNegativePromptChange(e.target.value)}
            className="mt-2 min-h-[60px] resize-none"
          />
        )}
      </div>
    </div>
  );
}
