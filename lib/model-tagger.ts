export type ModelCategory = "image" | "video" | "audio" | "3d" | "unclassified";

interface RuleLike {
  pattern: string;
  category: string;
}

export function classifyModel(raw: Record<string, unknown>, rules: RuleLike[] = []): ModelCategory {
  const blob = extractTextBlob(raw).toLowerCase();

  // 1. Explicit API metadata fields
  const explicit = checkExplicitFields(raw);
  if (explicit) return explicit;

  // 2. DB-stored pattern rules
  const fromRules = matchRules(blob, rules);
  if (fromRules) return fromRules;

  // 3. Hardcoded compound terms
  const fromText = classifyFromText(blob);
  if (fromText !== "unclassified") return fromText;

  // 4. Word-level inference on model ID
  //    Split model ID into tokens and check if any token IS a media keyword.
  //    "wan-2.6-image" -> tokens: [wan, 2, 6, image] -> "image" matches
  const id = typeof raw.id === "string" ? raw.id : "";
  return classifyFromTokens(id);
}

function matchRules(blob: string, rules: RuleLike[]): ModelCategory | null {
  for (const rule of rules) {
    if (blob.includes(rule.pattern.toLowerCase())) {
      return rule.category as ModelCategory;
    }
  }
  return null;
}

function checkExplicitFields(raw: Record<string, unknown>): ModelCategory | null {
  const type = strField(raw, "type");
  if (type) { const cat = matchCategory(type); if (cat) return cat; }

  for (const key of ["modality", "output_modality", "input_modality"]) {
    const val = strField(raw, key);
    if (val) { const cat = matchCategory(val); if (cat) return cat; }
  }

  const caps = raw["capabilities"];
  if (caps) {
    const capsText = JSON.stringify(caps).toLowerCase();
    if (capsText.includes("image") && (capsText.includes("generat") || capsText.includes("creat"))) return "image";
    if (capsText.includes("video")) return "video";
    if (capsText.includes("audio") || capsText.includes("speech") || capsText.includes("tts")) return "audio";
    if (capsText.includes("3d") || capsText.includes("mesh")) return "3d";
  }

  const pipeline = strField(raw, "pipeline_tag");
  if (pipeline) {
    if (pipeline.includes("text-to-image") || pipeline.includes("image-generation")) return "image";
    if (pipeline.includes("text-to-video")) return "video";
    if (pipeline.includes("text-to-audio") || pipeline.includes("text-to-speech")) return "audio";
    if (pipeline.includes("text-to-3d")) return "3d";
  }

  return null;
}

function matchCategory(text: string): ModelCategory | null {
  const t = text.toLowerCase();
  if (t.includes("image") || t.includes("diffusion")) return "image";
  if (t.includes("video")) return "video";
  if (t.includes("audio") || t.includes("speech") || t.includes("tts") || t.includes("music")) return "audio";
  if (t.includes("3d") || t.includes("mesh")) return "3d";
  return null;
}

function classifyFromText(blob: string): ModelCategory {
  if (hasAny(blob, ["text-to-video", "video-generation", "txt2vid", "video-gen"])) return "video";
  if (hasAny(blob, ["text-to-speech", "tts", "text-to-audio", "audio-generation", "speech-synthesis"])) return "audio";
  if (hasAny(blob, ["text-to-3d", "3d-generation", "mesh-generation"])) return "3d";
  if (hasAny(blob, ["text-to-image", "image-generation", "image-gen", "txt2img", "img-gen"])) return "image";
  return "unclassified";
}

/** Split model ID into tokens and check if any token is a known media keyword */
function classifyFromTokens(id: string): ModelCategory {
  // Normalize: "wan-2.6-image/image-to-image" -> ["wan","2","6","image","image","to","image"]
  const tokens = id.toLowerCase().split(/[\-_\/\.]+/);

  // Check for "to-video", "to-image" etc. patterns first (stronger signal)
  const joined = tokens.join("-");
  if (joined.includes("to-video") || joined.includes("to-vid")) return "video";
  if (joined.includes("to-image") || joined.includes("to-img")) return "image";
  if (joined.includes("to-audio") || joined.includes("to-speech")) return "audio";
  if (joined.includes("to-3d")) return "3d";

  // Single-token media keywords (only match if the token IS the keyword, not a substring)
  const videoTokens = new Set(["video", "vid"]);
  const imageTokens = new Set(["image", "img", "imagine"]);
  const audioTokens = new Set(["audio", "speech", "voice", "music", "tts", "dubbing", "scribe"]);
  const threeDTokens = new Set(["3d", "mesh"]);

  // Video before image (some video models contain "image" for image-to-video)
  for (const t of tokens) {
    if (videoTokens.has(t)) return "video";
  }
  for (const t of tokens) {
    if (imageTokens.has(t)) return "image";
  }
  for (const t of tokens) {
    if (audioTokens.has(t)) return "audio";
  }
  for (const t of tokens) {
    if (threeDTokens.has(t)) return "3d";
  }

  return "unclassified";
}

function hasAny(blob: string, terms: string[]): boolean {
  return terms.some((t) => blob.includes(t));
}

function strField(obj: Record<string, unknown>, key: string): string | null {
  const val = obj[key];
  if (typeof val === "string" && val.length > 0) return val;
  return null;
}

function extractTextBlob(obj: unknown, depth = 0): string {
  if (depth > 4) return "";
  if (typeof obj === "string") return obj + " ";
  if (Array.isArray(obj)) return obj.map((v) => extractTextBlob(v, depth + 1)).join(" ");
  if (obj && typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>)
      .map(([k, v]) => k + " " + extractTextBlob(v, depth + 1))
      .join(" ");
  }
  return "";
}
