"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ModeTabsProps {
  mode: string;
  onModeChange: (mode: string) => void;
}

export function ModeTabs({ mode, onModeChange }: ModeTabsProps) {
  return (
    <div className="space-y-2">
      <Tabs value={mode} onValueChange={onModeChange}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="3d">3D</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
