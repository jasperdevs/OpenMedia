/**
 * Extract pricing from raw model metadata.
 * Works with any OpenAI-compatible API — checks all common pricing field patterns:
 * - pricing.completion, pricing.image, pricing.prompt (OpenRouter style)
 * - cost, price, cost_per_token, cost_per_image
 * - Any nested field containing "price" or "cost"
 */

export function extractPrice(raw: Record<string, unknown>): number {
  // Direct fields
  for (const key of [
    "cost",
    "price",
    "cost_per_generation",
    "cost_per_image",
    "price_per_image",
    "cost_per_request",
    "price_per_request",
  ]) {
    const val = toNumber(raw[key]);
    if (val > 0) return val;
  }

  // Nested pricing object (OpenRouter, ModelRouter, etc.)
  const pricing = raw["pricing"] as Record<string, unknown> | undefined;
  if (pricing && typeof pricing === "object") {
    // Prefer image-specific pricing
    for (const key of ["image", "completion", "generation", "output", "request"]) {
      const val = toNumber(pricing[key]);
      if (val > 0) return val;
    }
    // Fallback: any numeric value in pricing
    for (const val of Object.values(pricing)) {
      const n = toNumber(val);
      if (n > 0) return n;
    }
  }

  // Deep search: look for any field with "price" or "cost" in its name
  const found = deepFindPrice(raw, 0);
  if (found > 0) return found;

  return 0;
}

function deepFindPrice(obj: unknown, depth: number): number {
  if (depth > 3) return 0;
  if (!obj || typeof obj !== "object") return 0;

  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const k = key.toLowerCase();
    if ((k.includes("price") || k.includes("cost")) && !k.includes("input") && !k.includes("prompt")) {
      const n = toNumber(val);
      if (n > 0) return n;
    }
    if (val && typeof val === "object") {
      const found = deepFindPrice(val, depth + 1);
      if (found > 0) return found;
    }
  }
  return 0;
}

function toNumber(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = parseFloat(val);
    if (!isNaN(n)) return n;
  }
  return 0;
}
