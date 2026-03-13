import { NextRequest, NextResponse } from "next/server";
import {
  getAllModels,
  getMediaModels,
  getModelsByCategory,
  updateModelCategory,
  updateModelEnabled,
  updateModelCost,
} from "@/lib/db-models";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const includeAll = searchParams.get("all") === "1";

    let models;
    if (includeAll) {
      models = getAllModels();
    } else if (category) {
      models = getModelsByCategory(category);
    } else {
      models = getMediaModels();
    }

    return NextResponse.json({ models });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch models" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, category, enabled, cost_per_gen } = body;

    if (!id) {
      return NextResponse.json({ error: "Model ID is required" }, { status: 400 });
    }

    if (category !== undefined) updateModelCategory(id, category);
    if (enabled !== undefined) updateModelEnabled(id, enabled);
    if (cost_per_gen !== undefined) updateModelCost(id, cost_per_gen);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update model" },
      { status: 500 }
    );
  }
}
