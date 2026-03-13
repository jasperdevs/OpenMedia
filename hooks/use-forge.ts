import { useState, useEffect, useCallback } from "react";
import { useModels, type ModelData } from "./use-models";
import { useGenerations, type GenerateRequest } from "./use-generations";
import { aspectRatioToSize } from "@/components/generate/aspect-ratio-selector";

const LS_KEY = "openmedia_state";

interface SavedState {
  mode: string;
  selectedModel: string;
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
  imageCount: number;
  duration: string;
  resolution: string;
}

function loadState(): Partial<SavedState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveState(state: SavedState) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* */ }
}

type MediaMode = "image" | "video" | "audio" | "3d";

export function useForge() {
  const [mode, setMode] = useState<MediaMode>("image");
  const [selectedModel, setSelectedModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageCount, setImageCount] = useState(1);
  const [duration, setDuration] = useState("4");
  const [resolution, setResolution] = useState("1K");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const { models, fetchModels } = useModels();
  const {
    generations, generating, activeCount, loading: galleryLoading,
    fetchGenerations, generate, deleteGeneration,
  } = useGenerations();

  useEffect(() => {
    const saved = loadState();
    if (saved.mode) setMode(saved.mode as MediaMode);
    if (saved.selectedModel) setSelectedModel(saved.selectedModel);
    if (saved.prompt) setPrompt(saved.prompt);
    if (saved.negativePrompt) setNegativePrompt(saved.negativePrompt);
    if (saved.aspectRatio) setAspectRatio(saved.aspectRatio);
    if (saved.imageCount) setImageCount(saved.imageCount);
    if (saved.duration) setDuration(saved.duration);
    if (saved.resolution) setResolution(saved.resolution);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState({ mode, selectedModel, prompt, negativePrompt, aspectRatio, imageCount, duration, resolution });
  }, [mode, selectedModel, prompt, negativePrompt, aspectRatio, imageCount, duration, resolution, hydrated]);

  useEffect(() => { fetchModels(mode); }, [mode, fetchModels]);
  useEffect(() => { fetchGenerations(mode); }, [mode, fetchGenerations]);
  useEffect(() => { setSelectedModel(""); }, [mode]);
  useEffect(() => {
    if (models.length > 0 && !selectedModel) setSelectedModel(models[0].id);
  }, [models, selectedModel]);

  const handleModeChange = useCallback((m: string) => setMode(m as MediaMode), []);

  const handleGenerate = useCallback(async () => {
    const modelData = models.find((m: ModelData) => m.id === selectedModel);
    const size = aspectRatioToSize(aspectRatio);
    const request: GenerateRequest = {
      media_type: mode,
      model: selectedModel,
      model_name: modelData?.name ?? selectedModel,
      prompt,
      negative_prompt: negativePrompt || undefined,
      n: mode === "image" ? imageCount : undefined,
      size: mode !== "audio" ? size : undefined,
      duration: mode === "video" ? parseInt(duration) : undefined,
      resolution,
    };
    const result = await generate(request);
    if (result) {
      await fetchGenerations(mode);
      setSidebarOpen(false);
    }
  }, [mode, selectedModel, prompt, negativePrompt, imageCount, aspectRatio, duration, resolution, models, generate, fetchGenerations]);

  return {
    mode, models, selectedModel, prompt, negativePrompt,
    aspectRatio, imageCount, duration, resolution,
    generating, activeCount, generations, galleryLoading, sidebarOpen,
    setMode: handleModeChange, setSelectedModel, setPrompt, setNegativePrompt,
    setAspectRatio, setImageCount, setDuration, setResolution,
    setSidebarOpen, handleGenerate, deleteGeneration,
  };
}
