import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { GENERATIONS_DIR } from "@/lib/db";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Sanitize filename to prevent directory traversal
    const sanitized = path.basename(filename);
    const filePath = path.join(GENERATIONS_DIR, sanitized);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ext = path.extname(sanitized).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
    const buffer = fs.readFileSync(filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to serve file" },
      { status: 500 }
    );
  }
}
