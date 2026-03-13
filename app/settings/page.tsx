"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsForm } from "@/components/settings/settings-form";
import { ModelManager } from "@/components/settings/model-manager";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-4 px-4 max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <SettingsForm />
        <ModelManager />
      </main>
    </div>
  );
}
