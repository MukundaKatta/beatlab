import type { Project, MidiNote, Track } from "@/types";

// MIDI file format constants
const HEADER_CHUNK = [0x4d, 0x54, 0x68, 0x64]; // MThd
const TRACK_CHUNK = [0x4d, 0x54, 0x72, 0x6b]; // MTrk
const TICKS_PER_BEAT = 480;

function writeUint16(value: number): number[] {
  return [(value >> 8) & 0xff, value & 0xff];
}

function writeUint32(value: number): number[] {
  return [
    (value >> 24) & 0xff,
    (value >> 16) & 0xff,
    (value >> 8) & 0xff,
    value & 0xff,
  ];
}

function writeVariableLength(value: number): number[] {
  if (value < 0) value = 0;
  const bytes: number[] = [];
  let v = value;
  bytes.unshift(v & 0x7f);
  v >>= 7;
  while (v > 0) {
    bytes.unshift((v & 0x7f) | 0x80);
    v >>= 7;
  }
  return bytes;
}

function secondsToTicks(seconds: number, bpm: number): number {
  return Math.round((seconds * bpm * TICKS_PER_BEAT) / 60);
}

function buildTempoEvent(bpm: number): number[] {
  const microsecondsPerBeat = Math.round(60000000 / bpm);
  return [
    ...writeVariableLength(0), // delta time
    0xff, 0x51, 0x03, // tempo meta event
    (microsecondsPerBeat >> 16) & 0xff,
    (microsecondsPerBeat >> 8) & 0xff,
    microsecondsPerBeat & 0xff,
  ];
}

function buildTrackNameEvent(name: string, delta: number = 0): number[] {
  const nameBytes = Array.from(new TextEncoder().encode(name));
  return [
    ...writeVariableLength(delta),
    0xff, 0x03,
    ...writeVariableLength(nameBytes.length),
    ...nameBytes,
  ];
}

function buildEndOfTrack(): number[] {
  return [...writeVariableLength(0), 0xff, 0x2f, 0x00];
}

interface MidiEvent {
  tick: number;
  data: number[];
}

function notesToEvents(notes: MidiNote[], bpm: number, channel: number = 0): MidiEvent[] {
  const events: MidiEvent[] = [];

  for (const note of notes) {
    const startTick = secondsToTicks(note.startTime, bpm);
    const endTick = secondsToTicks(note.startTime + note.duration, bpm);
    const pitch = Math.max(0, Math.min(127, note.pitch));
    const velocity = Math.max(1, Math.min(127, note.velocity));

    events.push({
      tick: startTick,
      data: [0x90 | (channel & 0x0f), pitch, velocity],
    });
    events.push({
      tick: endTick,
      data: [0x80 | (channel & 0x0f), pitch, 0],
    });
  }

  events.sort((a, b) => a.tick - b.tick);
  return events;
}

function eventsToBytes(events: MidiEvent[]): number[] {
  const bytes: number[] = [];
  let lastTick = 0;

  for (const event of events) {
    const delta = Math.max(0, event.tick - lastTick);
    bytes.push(...writeVariableLength(delta));
    bytes.push(...event.data);
    lastTick = event.tick;
  }

  return bytes;
}

function buildMidiTrack(
  name: string,
  notes: MidiNote[],
  bpm: number,
  channel: number
): number[] {
  const trackData: number[] = [];

  // Track name
  trackData.push(...buildTrackNameEvent(name));

  // Note events
  const events = notesToEvents(notes, bpm, channel);
  trackData.push(...eventsToBytes(events));

  // End of track
  trackData.push(...buildEndOfTrack());

  return [...TRACK_CHUNK, ...writeUint32(trackData.length), ...trackData];
}

function buildTempoTrack(bpm: number, projectName: string): number[] {
  const trackData: number[] = [];

  // Track name
  trackData.push(...buildTrackNameEvent(projectName));

  // Tempo event
  trackData.push(...buildTempoEvent(bpm));

  // Time signature (4/4)
  trackData.push(
    ...writeVariableLength(0),
    0xff, 0x58, 0x04,
    0x04, 0x02, 0x18, 0x08
  );

  // End of track
  trackData.push(...buildEndOfTrack());

  return [...TRACK_CHUNK, ...writeUint32(trackData.length), ...trackData];
}

function collectTrackNotes(track: Track): MidiNote[] {
  const allNotes: MidiNote[] = [];
  for (const clip of track.clips) {
    if (clip.midiNotes && clip.midiNotes.length > 0) {
      for (const note of clip.midiNotes) {
        allNotes.push({
          ...note,
          startTime: note.startTime + clip.startTime,
        });
      }
    }
  }
  return allNotes;
}

const TRACK_TYPE_CHANNELS: Record<string, number> = {
  drums: 9, // Channel 10 (0-indexed as 9) is standard MIDI drums
  bass: 1,
  melody: 2,
  harmony: 3,
  vocals: 4,
  fx: 5,
  sample: 6,
};

export function exportProjectToMidi(project: Project): Uint8Array {
  const tracksWithNotes = project.tracks
    .map((track) => ({ track, notes: collectTrackNotes(track) }))
    .filter(({ notes }) => notes.length > 0);

  const numTracks = tracksWithNotes.length + 1; // +1 for tempo track

  // MIDI header
  const header: number[] = [
    ...HEADER_CHUNK,
    ...writeUint32(6), // header length
    ...writeUint16(1), // format 1 (multi-track)
    ...writeUint16(numTracks),
    ...writeUint16(TICKS_PER_BEAT),
  ];

  // Tempo track
  const tempoTrack = buildTempoTrack(project.bpm, project.name);

  // Instrument tracks
  const instrumentTracks = tracksWithNotes.map(({ track, notes }) => {
    const channel = TRACK_TYPE_CHANNELS[track.type] ?? 0;
    return buildMidiTrack(track.name, notes, project.bpm, channel);
  });

  const allBytes = [
    ...header,
    ...tempoTrack,
    ...instrumentTracks.flat(),
  ];

  return new Uint8Array(allBytes);
}

export function exportTrackToMidi(track: Track, bpm: number, projectName: string): Uint8Array {
  const notes = collectTrackNotes(track);
  const channel = TRACK_TYPE_CHANNELS[track.type] ?? 0;

  const header: number[] = [
    ...HEADER_CHUNK,
    ...writeUint32(6),
    ...writeUint16(1),
    ...writeUint16(2),
    ...writeUint16(TICKS_PER_BEAT),
  ];

  const tempoTrack = buildTempoTrack(bpm, projectName);
  const instrumentTrack = buildMidiTrack(track.name, notes, bpm, channel);

  return new Uint8Array([...header, ...tempoTrack, ...instrumentTrack]);
}

export function downloadMidiFile(data: Uint8Array, filename: string): void {
  const blob = new Blob([data], { type: "audio/midi" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".mid") ? filename : `${filename}.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
