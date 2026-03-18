import { NextRequest, NextResponse } from "next/server";
import { exportProjectToMidi, exportTrackToMidi } from "@/lib/midi-export";
import type { Project, Track } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project, trackId } = body as { project: Project; trackId?: string };

    let midiData: Uint8Array;
    let filename: string;

    if (trackId) {
      const track = project.tracks.find((t: Track) => t.id === trackId);
      if (!track) {
        return NextResponse.json(
          { success: false, error: "Track not found" },
          { status: 404 }
        );
      }
      midiData = exportTrackToMidi(track, project.bpm, project.name);
      filename = `${project.name}-${track.name}.mid`;
    } else {
      midiData = exportProjectToMidi(project);
      filename = `${project.name}.mid`;
    }

    return new NextResponse(midiData, {
      headers: {
        "Content-Type": "audio/midi",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("MIDI export error:", error);
    return NextResponse.json(
      { success: false, error: "Export failed" },
      { status: 500 }
    );
  }
}
