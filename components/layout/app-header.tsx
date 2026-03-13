"use client";

import { Settings, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onOpenSettings: () => void;
}

export function AppHeader({ onToggleSidebar, onOpenSettings }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-12 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={onToggleSidebar}>
            <PanelLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold tracking-tight">OpenMedia</span>
        </div>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground" onClick={onOpenSettings}>
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">Settings</span>
        </Button>
      </div>
    </header>
  );
}
