"use client";

import { getProviderLabel, getProviderLogoUrl } from "@/lib/model-branding";

interface ProviderBadgeProps {
  modelName: string;
  modelMetaJson?: string;
}

export function ProviderBadge({ modelName, modelMetaJson }: ProviderBadgeProps) {
  const label = getProviderLabel(modelName, modelMetaJson);
  const logo = getProviderLogoUrl(modelMetaJson);

  if (!label) return null;

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      {logo ? (
        <img src={logo} alt={label} className="h-3.5 w-3.5 rounded-sm object-cover shrink-0" />
      ) : (
        <div className="h-3.5 w-3.5 rounded-sm border border-border bg-secondary shrink-0" />
      )}
      <span className="truncate">{label}</span>
    </div>
  );
}
