"use client";

import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { X, ExternalLink } from "lucide-react";
import { SettingsForm } from "./settings-form";
import { ModelManager } from "./model-manager";
import { GeneralSettings } from "./general-settings";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[92vw] max-h-[88vh] p-0 gap-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <DialogTitle className="text-base font-semibold">Settings</DialogTitle>
          <div className="flex items-center gap-1">
            <a
              href="/settings"
              target="_blank"
              rel="noreferrer"
              className="rounded-full p-1.5 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <DialogClose className="rounded-full p-1.5 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(88vh-65px)]">
          <Tabs defaultValue="api" className="w-full">
            <div className="px-6 pt-4">
              <TabsList>
                <TabsTrigger value="api">API</TabsTrigger>
                <TabsTrigger value="models">Models</TabsTrigger>
                <TabsTrigger value="general">General</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="api" className="p-6 pt-4">
              <SettingsForm />
            </TabsContent>
            <TabsContent value="models" className="p-6 pt-4">
              <ModelManager />
            </TabsContent>
            <TabsContent value="general" className="p-6 pt-4">
              <GeneralSettings />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
