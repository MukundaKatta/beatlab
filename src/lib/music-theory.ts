import type { MusicalKey, MusicalScale, ChordInfo, ChordProgression, MidiNote } from "@/types";

const NOTE_NAMES: MusicalKey[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const SCALE_INTERVALS: Record<MusicalScale, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
  "harmonic-minor": [0, 2, 3, 5, 7, 8, 11],
};

const CHORD_QUALITIES: Record<string, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
  dim7: [0, 3, 6, 9],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  add9: [0, 4, 7, 14],
  min9: [0, 3, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
};

const SCALE_CHORD_QUALITIES: Record<string, string[]> = {
  major: ["major", "minor", "minor", "major", "major", "minor", "diminished"],
  minor: ["minor", "diminished", "major", "minor", "minor", "major", "major"],
  dorian: ["minor", "minor", "major", "major", "minor", "diminished", "major"],
  mixolydian: ["major", "minor", "diminished", "major", "minor", "minor", "major"],
  phrygian: ["minor", "major", "major", "minor", "diminished", "major", "minor"],
  lydian: ["major", "major", "minor", "diminished", "major", "minor", "minor"],
  aeolian: ["minor", "diminished", "major", "minor", "minor", "major", "major"],
  locrian: ["diminished", "major", "minor", "minor", "major", "major", "minor"],
};

export function getScaleNotes(key: MusicalKey, scale: MusicalScale): string[] {
  const rootIndex = NOTE_NAMES.indexOf(key);
  const intervals = SCALE_INTERVALS[scale];
  return intervals.map((interval) => NOTE_NAMES[(rootIndex + interval) % 12]);
}

export function getScaleNoteMidi(key: MusicalKey, scale: MusicalScale, octave: number = 4): number[] {
  const rootMidi = NOTE_NAMES.indexOf(key) + 12 * (octave + 1);
  const intervals = SCALE_INTERVALS[scale];
  return intervals.map((interval) => rootMidi + interval);
}

export function noteToMidi(note: string): number {
  const match = note.match(/^([A-G]#?)(\d+)$/);
  if (!match) return 60;
  const [, noteName, octaveStr] = match;
  const noteIndex = NOTE_NAMES.indexOf(noteName as MusicalKey);
  return noteIndex + 12 * (parseInt(octaveStr) + 1);
}

export function midiToNote(midi: number): string {
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function getChordNotes(root: MusicalKey, quality: string): string[] {
  const rootIndex = NOTE_NAMES.indexOf(root);
  const intervals = CHORD_QUALITIES[quality] || CHORD_QUALITIES.major;
  return intervals.map((interval) => NOTE_NAMES[(rootIndex + interval) % 12]);
}

export function getDiatonicChords(key: MusicalKey, scale: MusicalScale): ChordInfo[] {
  const scaleNotes = getScaleNotes(key, scale);
  const qualities = SCALE_CHORD_QUALITIES[scale] || SCALE_CHORD_QUALITIES.major;
  const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];

  return scaleNotes.map((note, index) => {
    const quality = qualities[index] || "major";
    const notes = getChordNotes(note as MusicalKey, quality);
    const suffix = quality === "major" ? "" : quality === "minor" ? "m" : quality === "diminished" ? "dim" : quality;
    return {
      root: note,
      quality,
      symbol: `${note}${suffix}`,
      notes,
      duration: 1,
    };
  });
}

const COMMON_PROGRESSIONS: Record<string, number[][]> = {
  pop: [[0, 4, 5, 3], [0, 5, 3, 4], [0, 3, 4, 4]],
  rock: [[0, 3, 4, 4], [0, 4, 3, 3], [0, 3, 0, 4]],
  jazz: [[1, 4, 0, 0], [0, 5, 1, 4], [2, 5, 0, 3]],
  blues: [[0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4]],
  edm: [[0, 5, 3, 4], [5, 3, 0, 4], [0, 0, 3, 4]],
  rnb: [[0, 2, 5, 3], [3, 0, 4, 5], [1, 4, 0, 5]],
  lofi: [[0, 3, 5, 1], [2, 5, 0, 3], [0, 5, 3, 1]],
};

export function generateChordProgression(
  key: MusicalKey,
  scale: MusicalScale,
  style: string = "pop",
  bars: number = 4
): ChordProgression {
  const diatonicChords = getDiatonicChords(key, scale);
  const progressions = COMMON_PROGRESSIONS[style] || COMMON_PROGRESSIONS.pop;
  const selectedProgression = progressions[Math.floor(Math.random() * progressions.length)];

  const repeatedProgression: number[] = [];
  while (repeatedProgression.length < bars) {
    for (const deg of selectedProgression) {
      if (repeatedProgression.length >= bars) break;
      repeatedProgression.push(deg);
    }
  }

  const chords = repeatedProgression.slice(0, bars).map((degree) => ({
    ...diatonicChords[degree % diatonicChords.length],
    duration: 1,
  }));

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    name: `${key} ${scale} - ${style}`,
    chords,
    key,
    scale,
  };
}

export function generateMelody(
  key: MusicalKey,
  scale: MusicalScale,
  octave: number = 4,
  bars: number = 4,
  bpm: number = 120,
  complexity: number = 0.5
): MidiNote[] {
  const notes: MidiNote[] = [];
  const scaleNoteMidi = getScaleNoteMidi(key, scale, octave);
  const beatsPerBar = 4;
  const totalBeats = bars * beatsPerBar;
  const beatDuration = 60 / bpm;

  let currentBeat = 0;
  let prevNoteIndex = Math.floor(scaleNoteMidi.length / 2);

  while (currentBeat < totalBeats) {
    const isRest = Math.random() < 0.15 * (1 - complexity);
    if (isRest) {
      currentBeat += 0.5;
      continue;
    }

    const maxJump = Math.floor(1 + complexity * 4);
    const jump = Math.floor(Math.random() * maxJump * 2) - maxJump;
    let noteIndex = prevNoteIndex + jump;
    noteIndex = Math.max(0, Math.min(scaleNoteMidi.length - 1, noteIndex));

    const octaveShift = noteIndex >= scaleNoteMidi.length ? 12 : noteIndex < 0 ? -12 : 0;
    const pitch = scaleNoteMidi[noteIndex % scaleNoteMidi.length] + octaveShift;

    const durationOptions = complexity > 0.7
      ? [0.25, 0.5, 0.75, 1]
      : complexity > 0.4
        ? [0.5, 1, 1.5]
        : [1, 2];
    const duration = durationOptions[Math.floor(Math.random() * durationOptions.length)];

    const velocity = 60 + Math.floor(Math.random() * 40 * complexity);

    notes.push({
      pitch,
      startTime: currentBeat * beatDuration,
      duration: duration * beatDuration,
      velocity: Math.min(127, velocity),
    });

    prevNoteIndex = noteIndex;
    currentBeat += duration;
  }

  return notes;
}

export function generateBassline(
  chordProgression: ChordProgression,
  octave: number = 2,
  bpm: number = 120,
  style: string = "basic"
): MidiNote[] {
  const notes: MidiNote[] = [];
  const beatDuration = 60 / bpm;
  let currentTime = 0;

  for (const chord of chordProgression.chords) {
    const rootMidi = noteToMidi(`${chord.root}${octave}`);
    const fifth = rootMidi + 7;
    const barDuration = 4 * beatDuration;

    switch (style) {
      case "walking":
        for (let beat = 0; beat < 4; beat++) {
          const walkNotes = [rootMidi, rootMidi + 3, fifth, rootMidi + 5];
          notes.push({
            pitch: walkNotes[beat % walkNotes.length],
            startTime: currentTime + beat * beatDuration,
            duration: beatDuration * 0.9,
            velocity: beat === 0 ? 100 : 80,
          });
        }
        break;
      case "syncopated":
        notes.push({ pitch: rootMidi, startTime: currentTime, duration: beatDuration * 1.5, velocity: 100 });
        notes.push({ pitch: fifth, startTime: currentTime + beatDuration * 1.5, duration: beatDuration, velocity: 85 });
        notes.push({ pitch: rootMidi, startTime: currentTime + beatDuration * 3, duration: beatDuration * 0.9, velocity: 90 });
        break;
      case "octave":
        notes.push({ pitch: rootMidi, startTime: currentTime, duration: beatDuration, velocity: 100 });
        notes.push({ pitch: rootMidi + 12, startTime: currentTime + beatDuration, duration: beatDuration * 0.5, velocity: 80 });
        notes.push({ pitch: rootMidi, startTime: currentTime + beatDuration * 2, duration: beatDuration, velocity: 95 });
        notes.push({ pitch: rootMidi + 12, startTime: currentTime + beatDuration * 3, duration: beatDuration * 0.5, velocity: 80 });
        break;
      default:
        notes.push({ pitch: rootMidi, startTime: currentTime, duration: beatDuration * 2, velocity: 100 });
        notes.push({ pitch: fifth, startTime: currentTime + beatDuration * 2, duration: beatDuration * 2, velocity: 85 });
    }
    currentTime += barDuration;
  }

  return notes;
}

export function generateDrumPattern(
  bars: number = 4,
  bpm: number = 120,
  style: string = "basic",
  complexity: number = 0.5
): MidiNote[] {
  const notes: MidiNote[] = [];
  const beatDuration = 60 / bpm;
  const KICK = 36;
  const SNARE = 38;
  const HIHAT_CLOSED = 42;
  const HIHAT_OPEN = 46;
  const TOM_HIGH = 50;
  const RIDE = 51;
  const CRASH = 49;

  for (let bar = 0; bar < bars; bar++) {
    const barStart = bar * 4 * beatDuration;

    switch (style) {
      case "trap": {
        notes.push({ pitch: KICK, startTime: barStart, duration: 0.1, velocity: 110 });
        notes.push({ pitch: KICK, startTime: barStart + beatDuration * 2.5, duration: 0.1, velocity: 100 });
        notes.push({ pitch: SNARE, startTime: barStart + beatDuration, duration: 0.1, velocity: 100 });
        notes.push({ pitch: SNARE, startTime: barStart + beatDuration * 3, duration: 0.1, velocity: 100 });
        for (let i = 0; i < 8; i++) {
          notes.push({ pitch: HIHAT_CLOSED, startTime: barStart + i * beatDuration * 0.5, duration: 0.05, velocity: 70 + Math.floor(Math.random() * 20) });
        }
        if (complexity > 0.5) {
          for (let i = 0; i < 16; i++) {
            if (Math.random() < complexity * 0.3) {
              notes.push({ pitch: HIHAT_CLOSED, startTime: barStart + i * beatDuration * 0.25, duration: 0.03, velocity: 50 + Math.floor(Math.random() * 30) });
            }
          }
        }
        break;
      }
      case "house": {
        for (let beat = 0; beat < 4; beat++) {
          notes.push({ pitch: KICK, startTime: barStart + beat * beatDuration, duration: 0.1, velocity: 110 });
        }
        notes.push({ pitch: SNARE, startTime: barStart + beatDuration, duration: 0.1, velocity: 90 });
        notes.push({ pitch: SNARE, startTime: barStart + beatDuration * 3, duration: 0.1, velocity: 90 });
        for (let i = 0; i < 8; i++) {
          notes.push({ pitch: i % 2 === 1 ? HIHAT_OPEN : HIHAT_CLOSED, startTime: barStart + i * beatDuration * 0.5, duration: 0.05, velocity: 80 });
        }
        break;
      }
      case "dnb": {
        notes.push({ pitch: KICK, startTime: barStart, duration: 0.1, velocity: 110 });
        notes.push({ pitch: KICK, startTime: barStart + beatDuration * 2.75, duration: 0.1, velocity: 100 });
        notes.push({ pitch: SNARE, startTime: barStart + beatDuration * 1.5, duration: 0.1, velocity: 105 });
        notes.push({ pitch: SNARE, startTime: barStart + beatDuration * 3.5, duration: 0.1, velocity: 100 });
        for (let i = 0; i < 16; i++) {
          notes.push({ pitch: RIDE, startTime: barStart + i * beatDuration * 0.25, duration: 0.05, velocity: 60 + Math.floor(Math.random() * 20) });
        }
        break;
      }
      case "jazz": {
        notes.push({ pitch: KICK, startTime: barStart, duration: 0.1, velocity: 80 });
        notes.push({ pitch: KICK, startTime: barStart + beatDuration * 2.5, duration: 0.1, velocity: 70 });
        for (let beat = 0; beat < 4; beat++) {
          notes.push({ pitch: RIDE, startTime: barStart + beat * beatDuration, duration: 0.1, velocity: 75 });
          notes.push({ pitch: RIDE, startTime: barStart + beat * beatDuration + beatDuration * 0.66, duration: 0.05, velocity: 55 });
        }
        notes.push({ pitch: HIHAT_CLOSED, startTime: barStart + beatDuration, duration: 0.05, velocity: 60 });
        notes.push({ pitch: HIHAT_CLOSED, startTime: barStart + beatDuration * 3, duration: 0.05, velocity: 60 });
        break;
      }
      default: {
        notes.push({ pitch: KICK, startTime: barStart, duration: 0.1, velocity: 110 });
        notes.push({ pitch: KICK, startTime: barStart + beatDuration * 2, duration: 0.1, velocity: 100 });
        notes.push({ pitch: SNARE, startTime: barStart + beatDuration, duration: 0.1, velocity: 100 });
        notes.push({ pitch: SNARE, startTime: barStart + beatDuration * 3, duration: 0.1, velocity: 100 });
        for (let i = 0; i < 8; i++) {
          notes.push({ pitch: HIHAT_CLOSED, startTime: barStart + i * beatDuration * 0.5, duration: 0.05, velocity: 80 });
        }
        if (complexity > 0.6 && bar === bars - 1) {
          notes.push({ pitch: CRASH, startTime: barStart + beatDuration * 3.5, duration: 0.2, velocity: 90 });
          notes.push({ pitch: TOM_HIGH, startTime: barStart + beatDuration * 3, duration: 0.1, velocity: 85 });
        }
      }
    }
  }

  return notes;
}

export function generateHarmony(
  chordProgression: ChordProgression,
  octave: number = 4,
  bpm: number = 120,
  voicing: string = "block"
): MidiNote[] {
  const notes: MidiNote[] = [];
  const beatDuration = 60 / bpm;
  let currentTime = 0;

  for (const chord of chordProgression.chords) {
    const rootMidi = noteToMidi(`${chord.root}${octave}`);
    const intervals = CHORD_QUALITIES[chord.quality] || CHORD_QUALITIES.major;
    const chordMidis = intervals.map((i) => rootMidi + i);
    const barDuration = chord.duration * 4 * beatDuration;

    switch (voicing) {
      case "arpeggiated":
        chordMidis.forEach((midi, idx) => {
          notes.push({
            pitch: midi,
            startTime: currentTime + idx * beatDuration,
            duration: beatDuration * 0.9,
            velocity: 75,
          });
        });
        break;
      case "spread":
        chordMidis.forEach((midi, idx) => {
          const spread = idx * 0.1;
          notes.push({
            pitch: midi,
            startTime: currentTime + spread,
            duration: barDuration - spread,
            velocity: 65 + idx * 5,
          });
        });
        break;
      default:
        chordMidis.forEach((midi) => {
          notes.push({
            pitch: midi,
            startTime: currentTime,
            duration: barDuration * 0.95,
            velocity: 70,
          });
        });
    }

    currentTime += barDuration;
  }

  return notes;
}
