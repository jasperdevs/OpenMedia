import { getSettings } from "./db-settings";

// Raw model object from API — keep everything
export type RawModel = Record<string, unknown> & { id: string };

export interface FetchModelsResponse {
  data: RawModel[];
}

export interface ImageGenerationRequest {
  model: string;
  prompt: string;
  n?: number;
  size?: string;
  response_format?: string;
  negative_prompt?: string;
}

export interface ImageGenerationResponse {
  data: Array<{
    b64_json?: string;
    url?: string;
    revised_prompt?: string;
  }>;
}

function sizeToAspectRatio(size?: string): string | undefined {
  if (!size || !size.includes("x")) return undefined;
  const [wRaw, hRaw] = size.split("x");
  const w = Number(wRaw);
  const h = Number(hRaw);
  if (!w || !h) return undefined;

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(w, h);
  const ratio = `${w / d}:${h / d}`;
  const supported = new Set(["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21", "3:2", "2:3", "4:5", "5:4"]);
  return supported.has(ratio) ? ratio : undefined;
}

function sizeToResolution(size?: string): "1K" | "2K" | "4K" | undefined {
  if (!size || !size.includes("x")) return undefined;
  const [wRaw, hRaw] = size.split("x");
  const maxSide = Math.max(Number(wRaw), Number(hRaw));
  if (!maxSide) return undefined;
  if (maxSide >= 3000) return "4K";
  if (maxSide >= 1400) return "2K";
  return "1K";
}

async function postJson(
  url: string,
  apiKey: string,
  body: Record<string, unknown>
): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function normalizeMediaResponse(payload: unknown): ImageGenerationResponse | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;

  const output = obj.output as Record<string, unknown> | undefined;
  if (output && Array.isArray(output.images)) {
    const normalized = (output.images as Array<Record<string, unknown>>)
      .map((item) => ({
        url: typeof item.url === "string" ? item.url : undefined,
        b64_json: typeof item.b64_json === "string" ? item.b64_json : typeof item.base64 === "string" ? item.base64 : undefined,
      }))
      .filter((item) => item.url || item.b64_json);
    if (normalized.length > 0) return { data: normalized };
  }

  if (Array.isArray(obj.data)) {
    const data = obj.data as Array<Record<string, unknown>>;
    const normalized = data
      .map((item) => ({
        b64_json: typeof item.b64_json === "string" ? item.b64_json : undefined,
        url: typeof item.url === "string" ? item.url : typeof item.image_url === "string" ? item.image_url : undefined,
        revised_prompt: typeof item.revised_prompt === "string" ? item.revised_prompt : undefined,
      }))
      .filter((item) => item.b64_json || item.url);
    if (normalized.length > 0) return { data: normalized };
  }

  if (Array.isArray(obj.output)) {
    const found: Array<{ b64_json?: string; url?: string; revised_prompt?: string }> = [];
    for (const entry of obj.output as Array<Record<string, unknown>>) {
      if (Array.isArray(entry.content)) {
        for (const content of entry.content as Array<Record<string, unknown>>) {
          const url = typeof content.image_url === "string" ? content.image_url : typeof content.url === "string" ? content.url : undefined;
          const b64 = typeof content.b64_json === "string" ? content.b64_json : typeof content.base64 === "string" ? content.base64 : undefined;
          if (url || b64) found.push({ url, b64_json: b64 });
        }
      }
    }
    if (found.length > 0) return { data: found };
  }

  if (Array.isArray(obj.choices)) {
    for (const choice of obj.choices as Array<Record<string, unknown>>) {
      const message = choice.message as Record<string, unknown> | undefined;
      const content = message?.content;
      if (Array.isArray(content)) {
        const found = content
          .map((part) => part as Record<string, unknown>)
          .map((part) => ({
            url: typeof part.image_url === "string" ? part.image_url : typeof part.url === "string" ? part.url : undefined,
            b64_json: typeof part.b64_json === "string" ? part.b64_json : undefined,
          }))
          .filter((part) => part.url || part.b64_json);
        if (found.length > 0) return { data: found };
      }
    }
  }

  return null;
}

function getApiConfig() {
  const settings = getSettings();
  if (!settings.apiEndpoint) {
    throw new Error("API endpoint not configured. Please go to Settings.");
  }
  return settings;
}

function normalizeEndpoint(endpoint: string): string {
  let url = endpoint.replace(/\/+$/, "");
  if (!url.endsWith("/v1")) {
    url += "/v1";
  }
  url = url.replace(/\/v1\/v1$/, "/v1");
  return url;
}

export async function fetchModels(): Promise<FetchModelsResponse> {
  const { apiEndpoint, apiKey } = getApiConfig();
  const baseUrl = normalizeEndpoint(apiEndpoint);

  const response = await fetch(`${baseUrl}/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch models: ${response.status} ${text}`);
  }

  return response.json();
}

export async function generateImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  const { apiEndpoint, apiKey } = getApiConfig();
  const baseUrl = normalizeEndpoint(apiEndpoint);

  const primaryBody = {
    model: request.model,
    prompt: request.prompt,
    n: request.n ?? 1,
    size: request.size ?? "1024x1024",
    response_format: request.response_format ?? "b64_json",
    ...(request.negative_prompt ? { negative_prompt: request.negative_prompt } : {}),
  };

  const attempts: Array<{ name: string; response: Response }> = [];

  attempts.push({
    name: "/images/generations",
    response: await postJson(`${baseUrl}/images/generations`, apiKey, primaryBody),
  });

  if (!attempts[0].response.ok && attempts[0].response.status === 404) {
    attempts.push({
      name: "/generations",
      response: await postJson(`${baseUrl}/generations`, apiKey, {
        model: request.model,
        input: {
          prompt: request.prompt,
          ...(sizeToAspectRatio(request.size) ? { aspect_ratio: sizeToAspectRatio(request.size) } : {}),
          ...(sizeToResolution(request.size) ? { resolution: sizeToResolution(request.size) } : {}),
          ...(request.n ? { num_images: request.n } : {}),
          output_format: "png",
          ...(request.negative_prompt ? { negative_prompt: request.negative_prompt } : {}),
        },
        sync: true,
      }),
    });
  }

  if (attempts.at(-1)?.response.status === 404) {
    attempts.push({
      name: "/responses",
      response: await postJson(`${baseUrl}/responses`, apiKey, {
        model: request.model,
        input: request.prompt,
        modalities: ["image"],
        size: request.size ?? "1024x1024",
      }),
    });
  }

  if (attempts.at(-1)?.response.status === 404) {
    attempts.push({
      name: "/chat/completions",
      response: await postJson(`${baseUrl}/chat/completions`, apiKey, {
        model: request.model,
        messages: [
          {
            role: "user",
            content: `Generate an image for this prompt and return actual media, not text only: ${request.prompt}`,
          },
        ],
      }),
    });
  }

  const errors: string[] = [];
  for (const attempt of attempts) {
    const text = await attempt.response.text();
    if (!attempt.response.ok) {
      errors.push(`${attempt.name}: ${attempt.response.status} ${text}`);
      continue;
    }
    try {
      const parsed = JSON.parse(text);
      const normalized = normalizeMediaResponse(parsed);
      if (normalized) return normalized;
      errors.push(`${attempt.name}: provider returned success but no media payload`);
    } catch {
      errors.push(`${attempt.name}: provider returned non-JSON response`);
    }
  }

  throw new Error(
    `This provider/model does not expose a supported image generation response. Tried ${attempts.map((a) => a.name).join(", ")}. ${errors.join(" | ")}`
  );
}

export async function generateVideo(request: {
  model: string;
  prompt: string;
  size?: string;
  duration?: number;
}): Promise<ImageGenerationResponse> {
  const { apiEndpoint, apiKey } = getApiConfig();
  const baseUrl = normalizeEndpoint(apiEndpoint);

  const response = await fetch(`${baseUrl}/videos/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Video generation failed: ${response.status} ${text}`);
  }

  return response.json();
}

export async function generateAudio(request: {
  model: string;
  prompt: string;
}): Promise<ImageGenerationResponse> {
  const { apiEndpoint, apiKey } = getApiConfig();
  const baseUrl = normalizeEndpoint(apiEndpoint);

  const response = await fetch(`${baseUrl}/audio/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Audio generation failed: ${response.status} ${text}`);
  }

  return response.json();
}

export async function testConnection(): Promise<{
  success: boolean;
  rawModels: RawModel[];
  error?: string;
}> {
  try {
    const result = await fetchModels();
    return { success: true, rawModels: result.data };
  } catch (error) {
    return {
      success: false,
      rawModels: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
