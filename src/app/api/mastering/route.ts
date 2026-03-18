import { NextRequest, NextResponse } from "next/server";
import { MASTERING_PRESETS, getPresetById, analyzeLoudness } from "@/lib/mastering";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: MASTERING_PRESETS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { presetId, currentLevel } = body as {
      presetId?: string;
      currentLevel?: number;
    };

    if (presetId) {
      const preset = getPresetById(presetId);
      if (!preset) {
        return NextResponse.json(
          { success: false, error: "Preset not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: {
          preset,
          analysis: analyzeLoudness(currentLevel ?? -14),
        },
      });
    }

    // Analyze current mix and recommend a preset
    const level = currentLevel ?? -14;
    const analysis = analyzeLoudness(level);

    let recommendedPresetId = "modern-loud";
    if (analysis.rating === "too quiet") recommendedPresetId = "modern-loud";
    else if (analysis.rating === "too loud") recommendedPresetId = "jazz-acoustic";
    else recommendedPresetId = "warm-analog";

    const recommended = getPresetById(recommendedPresetId);

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        recommended,
        allPresets: MASTERING_PRESETS,
      },
    });
  } catch (error) {
    console.error("Mastering error:", error);
    return NextResponse.json(
      { success: false, error: "Mastering analysis failed" },
      { status: 500 }
    );
  }
}
