import { NextResponse } from "next/server";
import { testConnection } from "@/lib/api-client";
import { upsertModelsFromApi, getMediaModels, getUnclassifiedModels } from "@/lib/db-models";

export async function POST() {
  try {
    const result = await testConnection();

    if (result.success) {
      upsertModelsFromApi(result.rawModels);
      const media = getMediaModels();
      const unclassified = getUnclassifiedModels();

      return NextResponse.json({
        success: true,
        totalFetched: result.rawModels.length,
        mediaModelCount: media.length,
        unclassifiedCount: unclassified.length,
      });
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Connection test failed",
      },
      { status: 500 }
    );
  }
}
