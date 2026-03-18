export type TrackType = "drums" | "bass" | "melody" | "harmony" | "vocals" | "fx" | "sample";

export type MusicalKey =
  | "C" | "C#" | "D" | "D#" | "E" | "F"
  | "F#" | "G" | "G#" | "A" | "A#" | "B";

export type MusicalScale = "major" | "minor" | "dorian" | "mixolydian" | "phrygian" | "lydian" | "aeolian" | "locrian" | "pentatonic" | "blues" | "harmonic-minor";

export type TimeSignature = "4/4" | "3/4" | "6/8" | "5/4" | "7/8";

export type EffectType = "reverb" | "delay" | "compressor" | "eq" | "distortion" | "chorus" | "phaser" | "filter" | "limiter";

export interface EffectParam {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export interface Effect {
  id: string;
  type: EffectType;
  enabled: boolean;
  params: EffectParam[];
}

export interface TrackClip {
  id: string;
  trackId: string;
  startTime: number;
  duration: number;
  audioUrl?: string;
  audioBuffer?: AudioBuffer | null;
  midiNotes?: MidiNote[];
  color: string;
  name: string;
  gain: number;
}

export interface MidiNote {
  pitch: number;
  startTime: number;
  duration: number;
  velocity: number;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  armed: boolean;
  effects: Effect[];
  clips: TrackClip[];
  order: number;
}

export interface Project {
  id: string;
  name: string;
  bpm: number;
  key: MusicalKey;
  scale: MusicalScale;
  timeSignature: TimeSignature;
  tracks: Track[];
  duration: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  collaborators: Collaborator[];
  isPublic: boolean;
}

export interface Collaborator {
  userId: string;
  email: string;
  displayName: string;
  role: "owner" | "editor" | "viewer";
  joinedAt: string;
  avatar?: string;
}

export interface GenerationParams {
  trackType: TrackType;
  bpm: number;
  key: MusicalKey;
  scale: MusicalScale;
  duration: number;
  style?: string;
  energy?: number;
  complexity?: number;
  referenceUrl?: string;
  chordProgression?: string[];
  temperature?: number;
}

export interface ChordProgression {
  id: string;
  name: string;
  chords: ChordInfo[];
  key: MusicalKey;
  scale: MusicalScale;
}

export interface ChordInfo {
  root: string;
  quality: string;
  symbol: string;
  notes: string[];
  duration: number;
}

export interface MasteringPreset {
  id: string;
  name: string;
  description: string;
  settings: {
    loudness: number;
    stereoWidth: number;
    lowCut: number;
    highCut: number;
    compression: number;
    limiterThreshold: number;
    eq: { frequency: number; gain: number; q: number }[];
  };
}

export interface SamplePack {
  id: string;
  name: string;
  category: string;
  samples: SampleInfo[];
  createdAt: string;
}

export interface SampleInfo {
  id: string;
  name: string;
  url: string;
  duration: number;
  bpm?: number;
  key?: MusicalKey;
  category: string;
}

export interface WaveformData {
  peaks: number[];
  duration: number;
  sampleRate: number;
}

export interface TransportState {
  isPlaying: boolean;
  isPaused: boolean;
  isRecording: boolean;
  currentTime: number;
  loopStart: number;
  loopEnd: number;
  loopEnabled: boolean;
}

export interface SelectionRange {
  start: number;
  end: number;
  trackId?: string;
}

export interface CollaborationEvent {
  type: "cursor_move" | "track_update" | "clip_add" | "clip_remove" | "effect_change" | "transport_change" | "chat_message";
  userId: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  message: string;
  timestamp: number;
}
