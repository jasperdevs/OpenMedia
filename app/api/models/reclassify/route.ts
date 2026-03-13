import { NextResponse } from "next/server";
import { reclassifyAllModels, getAllModels } from "@/lib/db-models";

export async function POST() {
  try {
    reclassifyAllModels();
    const models = getAllModels();
    const counts: Record<string, number> = {};
    for (const m of models) counts[m.category] = (counts[m.category] ?? 0) + 1;

    return NextResponse.json({ success: true, counts, total: models.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Reclassify failed" },
      { status: 500 }
    );
  }
}
