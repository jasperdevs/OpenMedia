"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { SidebarControls } from "@/components/generate/sidebar-controls";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { useForge } from "@/hooks/use-forge";

export default function HomePage() {
  const forge = useForge();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const sidebarContent = (
    <SidebarControls
      mode={forge.mode}
      models={forge.models}
      selectedModel={forge.selectedModel}
      prompt={forge.prompt}
      negativePrompt={forge.negativePrompt}
      aspectRatio={forge.aspectRatio}
      imageCount={forge.imageCount}
      duration={forge.duration}
      resolution={forge.resolution}
      generating={forge.generating}
      activeCount={forge.activeCount}
      onModeChange={forge.setMode}
      onModelChange={forge.setSelectedModel}
      onPromptChange={forge.setPrompt}
      onNegativePromptChange={forge.setNegativePrompt}
      onAspectRatioChange={forge.setAspectRatio}
      onImageCountChange={forge.setImageCount}
      onDurationChange={forge.setDuration}
      onResolutionChange={forge.setResolution}
      onGenerate={forge.handleGenerate}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        onToggleSidebar={() => forge.setSidebarOpen(!forge.sidebarOpen)}
        sidebarOpen={forge.sidebarOpen}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <MobileSidebar open={forge.sidebarOpen} onClose={() => forge.setSidebarOpen(false)}>
        <div className="pt-12 h-full">{sidebarContent}</div>
      </MobileSidebar>
      <div className="flex">
        <aside className="hidden md:flex md:w-[300px] md:shrink-0 md:flex-col border-r border-border h-[calc(100vh-49px)] sticky top-[49px]">
          {sidebarContent}
        </aside>
        <main className="flex-1 min-h-[calc(100vh-49px)]">
          <GalleryGrid
            generations={forge.generations}
            loading={forge.galleryLoading}
            generating={forge.generating}
            onDelete={forge.deleteGeneration}
          />
        </main>
      </div>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
