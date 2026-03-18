import { NextRequest, NextResponse } from "next/server";
import {
  generateMelody,
  generateBassline,
  generateDrumPattern,
  generateHarmony,
  generateChordProgression,
} from "@/lib/music-theory";
import type { GenerationParams, MidiNote } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const params: GenerationParams = await req.json();
    const {
      trackType,
      bpm,
      key,
      scale,
      duration,
      style = "basic",
      energy = 0.5,
      complexity = 0.5,
    } = params;

    const bars = Math.max(1, Math.round(duration / (4 * (60 / bpm))));
    let midiNotes: MidiNote[] = [];

    const chordProg = generateChordProgression(key, scale, style, bars);

    switch (trackType) {
      case "drums":
        midiNotes = generateDrumPattern(bars, bpm, style, complexity);
        break;
      case "bass":
        midiNotes = generateBassline(chordProg, 2, bpm, style);
        break;
      case "melody":
        midiNotes = generateMelody(key, scale, 4, bars, bpm, complexity);
        break;
      case "harmony":
        midiNotes = generateHarmony(chordProg, 4, bpm, "block");
        break;
      case "fx":
        midiNotes = generateMelody(key, scale, 5, bars, bpm, 0.3);
        break;
      case "vocals":
        midiNotes = generateMelody(key, scale, 4, bars, bpm, complexity * 0.6);
        break;
      case "sample":
        midiNotes = generateMelody(key, scale, 3, bars, bpm, 0.4);
        break;
      default:
        midiNotes = generateMelody(key, scale, 4, bars, bpm, complexity);
    }

    const beatDuration = 60 / bpm;
    const clipDuration = bars * 4 * beatDuration;

    return NextResponse.json({
      success: true,
      data: {
        midiNotes,
        duration: clipDuration,
        bars,
        chordProgression: chordProg,
      },
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { success: false, error: "Generation failed" },
      { status: 500 }
    );
  }
}
