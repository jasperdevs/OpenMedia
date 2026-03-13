import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";
import { generateImage, generateVideo, generateAudio } from "@/lib/api-client";
import { createGeneration, getGenerations } from "@/lib/db-generations";
import { GENERATIONS_DIR } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const media_type = searchParams.get("media_type") ?? undefined;
    const model_id = searchParams.get("model_id") ?? undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;
    const generations = getGenerations({ media_type, model_id, limit, offset });
    return NextResponse.json({ generations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch generations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { media_type, model, model_name, prompt, negative_prompt, n, size, duration } = body;

    if (!model) {
      return NextResponse.json({ error: "Model is required" }, { status: 400 });
    }

    let results: Array<{ b64_json?: string; url?: string }> = [];

    // Use the appropriate generation endpoint based on media type
    // Fall through to image generation as default for unknown types
    if (media_type === "video") {
      const response = await generateVideo({ model, prompt: prompt || "", size, duration });
      results = response.data;
    } else if (media_type === "audio") {
      const response = await generateAudio({ model, prompt: prompt || "" });
      results = response.data;
    } else {
      // image, 3d, or any other type — use the image/generations fallback chain
      const response = await generateImage({
        model,
        prompt: prompt || "",
        n: n ?? 1,
        size: size ?? "1024x1024",
        response_format: "b64_json",
        negative_prompt,
      });
      results = response.data;
    }

    const saved: Array<{ id: string; file_name: string; file_path: string }> = [];

    for (const item of results) {
      const id = uuid();
      const ext = media_type === "audio" ? "mp3" : media_type === "video" ? "mp4" : media_type === "3d" ? "glb" : "png";
      const fileName = `${id}.${ext}`;
      const filePath = path.join(GENERATIONS_DIR, fileName);

      if (item.b64_json) {
        fs.writeFileSync(filePath, Buffer.from(item.b64_json, "base64"));
      } else if (item.url) {
        const resp = await fetch(item.url);
        fs.writeFileSync(filePath, Buffer.from(await resp.arrayBuffer()));
      }

      const [w, h] = (size ?? "1024x1024").split("x").map(Number);

      const gen = createGeneration({
        id,
        media_type: media_type || "image",
        model_id: model,
        model_name: model_name ?? model,
        prompt: prompt || "",
        negative_prompt,
        settings_json: JSON.stringify({ size, n, duration }),
        file_path: filePath,
        file_name: fileName,
        width: (media_type === "image" || media_type === "3d") ? w : undefined,
        height: (media_type === "image" || media_type === "3d") ? h : undefined,
      });

      saved.push({ id: gen.id, file_name: gen.file_name, file_path: gen.file_path });
    }

    return NextResponse.json({ success: true, generations: saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
