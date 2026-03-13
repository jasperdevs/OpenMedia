// Map owned_by values to their known domains for favicon lookup
const PROVIDER_DOMAINS: Record<string, string> = {};

function getProviderDomain(ownedBy: string): string | null {
  const key = ownedBy.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Check cache first
  if (PROVIDER_DOMAINS[key]) return PROVIDER_DOMAINS[key];

  // Common patterns: "openai" -> "openai.com", "x-ai" -> "x.ai"
  const known: Record<string, string> = {
    openai: "openai.com",
    google: "google.com",
    anthropic: "anthropic.com",
    meta: "meta.com",
    xai: "x.ai",
    deepseek: "deepseek.com",
    mistral: "mistral.ai",
    stability: "stability.ai",
    stabilityai: "stability.ai",
    bytedance: "bytedance.com",
    baidu: "baidu.com",
    alibaba: "alibaba.com",
    tencent: "tencent.com",
    minimax: "minimax.io",
    elevenlabs: "elevenlabs.io",
    runwayml: "runwayml.com",
    midjourney: "midjourney.com",
    ideogram: "ideogram.ai",
    blackforestlabs: "blackforestlabs.ai",
    zhipu: "zhipuai.cn",
    zai: "x.ai",
    kuaishou: "kuaishou.com",
    recraft: "recraft.ai",
    luma: "lumalabs.ai",
    fal: "fal.ai",
    replicate: "replicate.com",
    together: "together.ai",
    fireworks: "fireworks.ai",
    groq: "groq.com",
    cohere: "cohere.com",
    ai21: "ai21.com",
    huggingface: "huggingface.co",
    suno: "suno.ai",
  };

  if (known[key]) {
    PROVIDER_DOMAINS[key] = known[key];
    return known[key];
  }

  // Try: "some-company" -> "some-company.com"
  const cleaned = ownedBy.toLowerCase().replace(/\s+/g, "");
  if (/^[a-z0-9-]+$/.test(cleaned)) {
    const domain = `${cleaned}.com`;
    PROVIDER_DOMAINS[key] = domain;
    return domain;
  }

  return null;
}

export function getProviderLabel(modelName: string, modelMetaJson?: string): string | null {
  if (modelMetaJson) {
    try {
      const meta = JSON.parse(modelMetaJson) as Record<string, unknown>;
      if (typeof meta.owned_by === "string" && meta.owned_by) return meta.owned_by;
    } catch { /* */ }
  }
  const prefix = modelName.split(/[\/-]/)[0]?.trim();
  return prefix || null;
}

export function getProviderLogoUrl(modelMetaJson?: string): string | null {
  if (!modelMetaJson) return null;

  try {
    const meta = JSON.parse(modelMetaJson) as Record<string, unknown>;

    // 1. Direct logo fields from API
    for (const key of ["icon_url", "logo_url", "image_url", "avatar_url"]) {
      const val = meta[key];
      if (typeof val === "string" && val.startsWith("http")) return val;
    }

    // 2. Favicon from provider domain
    const ownedBy = typeof meta.owned_by === "string" ? meta.owned_by : null;
    if (ownedBy) {
      const domain = getProviderDomain(ownedBy);
      if (domain) {
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
      }
    }
  } catch { /* */ }

  return null;
}
