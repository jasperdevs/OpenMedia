import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/db-settings";

export async function GET() {
  try {
    const settings = getSettings();
    // Mask the API key for the frontend
    return NextResponse.json({
      apiEndpoint: settings.apiEndpoint,
      apiKey: settings.apiKey ? "••••••••" + settings.apiKey.slice(-4) : "",
      hasKey: !!settings.apiKey,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiEndpoint, apiKey } = body;

    if (!apiEndpoint) {
      return NextResponse.json(
        { error: "API endpoint is required" },
        { status: 400 }
      );
    }

    // If the key is masked, keep the existing one
    const currentSettings = getSettings();
    const finalKey =
      apiKey && !apiKey.startsWith("••••") ? apiKey : currentSettings.apiKey;

    saveSettings({ apiEndpoint, apiKey: finalKey });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save settings" },
      { status: 500 }
    );
  }
}
