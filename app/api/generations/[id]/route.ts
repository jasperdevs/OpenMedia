import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getGeneration, deleteGeneration } from "@/lib/db-generations";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const generation = getGeneration(id);

    if (!generation) {
      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 }
      );
    }

    // Delete file from disk
    if (fs.existsSync(generation.file_path)) {
      fs.unlinkSync(generation.file_path);
    }

    // Delete from database
    deleteGeneration(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete generation" },
      { status: 500 }
    );
  }
}
