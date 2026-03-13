"use client";

import { Loader2 } from "lucide-react";

export function GeneratingSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="h-4 w-3/4 rounded bg-secondary animate-pulse" />
      <div className="h-3 w-1/3 rounded bg-secondary animate-pulse" />
      <div className="flex gap-2">
        <div className="h-40 w-40 rounded-lg bg-secondary flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
