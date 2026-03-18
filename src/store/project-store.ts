"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  Project,
  Track,
  TrackType,
  TrackClip,
  Effect,
  EffectType,
  MusicalKey,
  MusicalScale,
  TimeSignature,
  TransportState,
  SelectionRange,
  MasteringPreset,
} from "@/types";

const TRACK_COLORS: Record<TrackType, string> = {
  drums: "#ef4444",
  bass: "#f59e0b",
  melody: "#06b6d4",
  harmony: "#8b5cf6",
  vocals: "#ec4899",
  fx: "#10b981",
  sample: "#3b82f6",
};

const DEFAULT_EFFECTS_FOR_TYPE: Record<TrackType, EffectType[]> = {
  drums: ["compressor", "eq"],
  bass: ["compressor", "eq"],
  melody: ["reverb", "delay"],
  harmony: ["reverb", "chorus"],
  vocals: ["reverb", "compressor", "eq"],
  fx: ["delay", "reverb", "filter"],
  sample: ["eq", "compressor"],
};

function createDefaultEffect(type: EffectType): Effect {
  const id = uuidv4();
  const paramSets: Record<EffectType, Effect["params"]> = {
    reverb: [
      { id: uuidv4(), name: "Decay", value: 2.5, min: 0.1, max: 10, step: 0.1, unit: "s" },
      { id: uuidv4(), name: "Mix", value: 0.3, min: 0, max: 1, step: 0.01 },
    ],
    delay: [
      { id: uuidv4(), name: "Time", value: 0.25, min: 0.01, max: 2, step: 0.01, unit: "s" },
      { id: uuidv4(), name: "Feedback", value: 0.3, min: 0, max: 0.95, step: 0.01 },
      { id: uuidv4(), name: "Mix", value: 0.25, min: 0, max: 1, step: 0.01 },
    ],
    compressor: [
      { id: uuidv4(), name: "Threshold", value: -24, min: -60, max: 0, step: 1, unit: "dB" },
      { id: uuidv4(), name: "Ratio", value: 4, min: 1, max: 20, step: 0.5 },
      { id: uuidv4(), name: "Attack", value: 0.003, min: 0, max: 1, step: 0.001, unit: "s" },
      { id: uuidv4(), name: "Release", value: 0.25, min: 0.01, max: 2, step: 0.01, unit: "s" },
    ],
    eq: [
      { id: uuidv4(), name: "Low", value: 0, min: -12, max: 12, step: 0.5, unit: "dB" },
      { id: uuidv4(), name: "Mid", value: 0, min: -12, max: 12, step: 0.5, unit: "dB" },
      { id: uuidv4(), name: "High", value: 0, min: -12, max: 12, step: 0.5, unit: "dB" },
    ],
    distortion: [
      { id: uuidv4(), name: "Drive", value: 0.4, min: 0, max: 1, step: 0.01 },
      { id: uuidv4(), name: "Mix", value: 1, min: 0, max: 1, step: 0.01 },
    ],
    chorus: [
      { id: uuidv4(), name: "Rate", value: 1.5, min: 0.1, max: 10, step: 0.1, unit: "Hz" },
      { id: uuidv4(), name: "Depth", value: 0.7, min: 0, max: 1, step: 0.01 },
      { id: uuidv4(), name: "Mix", value: 0.5, min: 0, max: 1, step: 0.01 },
    ],
    phaser: [
      { id: uuidv4(), name: "Rate", value: 0.5, min: 0.1, max: 8, step: 0.1, unit: "Hz" },
      { id: uuidv4(), name: "Depth", value: 10, min: 1, max: 20, step: 0.5 },
      { id: uuidv4(), name: "Mix", value: 0.5, min: 0, max: 1, step: 0.01 },
    ],
    filter: [
      { id: uuidv4(), name: "Frequency", value: 1000, min: 20, max: 20000, step: 1, unit: "Hz" },
      { id: uuidv4(), name: "Q", value: 1, min: 0.1, max: 20, step: 0.1 },
    ],
    limiter: [
      { id: uuidv4(), name: "Threshold", value: -1, min: -30, max: 0, step: 0.5, unit: "dB" },
    ],
  };

  return { id, type, enabled: true, params: paramSets[type] };
}

interface ProjectState {
  project: Project;
  transport: TransportState;
  selection: SelectionRange | null;
  activeTrackId: string | null;
  zoom: number;
  scrollX: number;
  scrollY: number;
  snapToGrid: boolean;
  gridSize: number;
  masterVolume: number;
  masteringPreset: MasteringPreset | null;
  isGenerating: Record<string, boolean>;
  sidePanel: "effects" | "chords" | "mastering" | "samples" | "waveform" | null;

  // Project actions
  setProjectName: (name: string) => void;
  setBpm: (bpm: number) => void;
  setKey: (key: MusicalKey) => void;
  setScale: (scale: MusicalScale) => void;
  setTimeSignature: (ts: TimeSignature) => void;

  // Track actions
  addTrack: (type: TrackType, name?: string) => string;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  reorderTracks: (trackIds: string[]) => void;
  setActiveTrack: (trackId: string | null) => void;
  toggleTrackMute: (trackId: string) => void;
  toggleTrackSolo: (trackId: string) => void;
  setTrackVolume: (trackId: string, volume: number) => void;
  setTrackPan: (trackId: string, pan: number) => void;

  // Clip actions
  addClip: (trackId: string, clip: Omit<TrackClip, "id">) => string;
  removeClip: (trackId: string, clipId: string) => void;
  updateClip: (trackId: string, clipId: string, updates: Partial<TrackClip>) => void;
  moveClip: (trackId: string, clipId: string, newStartTime: number) => void;
  resizeClip: (trackId: string, clipId: string, newDuration: number) => void;

  // Effect actions
  addEffect: (trackId: string, type: EffectType) => void;
  removeEffect: (trackId: string, effectId: string) => void;
  toggleEffect: (trackId: string, effectId: string) => void;
  updateEffectParam: (trackId: string, effectId: string, paramId: string, value: number) => void;
  reorderEffects: (trackId: string, effectIds: string[]) => void;

  // Transport actions
  setPlaying: (playing: boolean) => void;
  setRecording: (recording: boolean) => void;
  setCurrentTime: (time: number) => void;
  setLoop: (start: number, end: number, enabled: boolean) => void;
  toggleLoop: () => void;

  // View actions
  setZoom: (zoom: number) => void;
  setScrollX: (x: number) => void;
  setScrollY: (y: number) => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  setSidePanel: (panel: ProjectState["sidePanel"]) => void;
  setSelection: (selection: SelectionRange | null) => void;

  // Master actions
  setMasterVolume: (volume: number) => void;
  setMasteringPreset: (preset: MasteringPreset | null) => void;

  // Generation state
  setGenerating: (trackId: string, generating: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: {
    id: uuidv4(),
    name: "Untitled Project",
    bpm: 120,
    key: "C" as MusicalKey,
    scale: "minor" as MusicalScale,
    timeSignature: "4/4" as TimeSignature,
    tracks: [],
    duration: 32,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: "",
    collaborators: [],
    isPublic: false,
  },
  transport: {
    isPlaying: false,
    isPaused: false,
    isRecording: false,
    currentTime: 0,
    loopStart: 0,
    loopEnd: 8,
    loopEnabled: false,
  },
  selection: null,
  activeTrackId: null,
  zoom: 60,
  scrollX: 0,
  scrollY: 0,
  snapToGrid: true,
  gridSize: 0.25,
  masterVolume: 0.8,
  masteringPreset: null,
  isGenerating: {},
  sidePanel: null,

  setProjectName: (name) =>
    set((s) => ({ project: { ...s.project, name, updatedAt: new Date().toISOString() } })),

  setBpm: (bpm) =>
    set((s) => ({ project: { ...s.project, bpm: Math.max(20, Math.min(300, bpm)), updatedAt: new Date().toISOString() } })),

  setKey: (key) =>
    set((s) => ({ project: { ...s.project, key, updatedAt: new Date().toISOString() } })),

  setScale: (scale) =>
    set((s) => ({ project: { ...s.project, scale, updatedAt: new Date().toISOString() } })),

  setTimeSignature: (timeSignature) =>
    set((s) => ({ project: { ...s.project, timeSignature, updatedAt: new Date().toISOString() } })),

  addTrack: (type, name) => {
    const id = uuidv4();
    const trackCount = get().project.tracks.filter((t) => t.type === type).length;
    const defaultEffects = DEFAULT_EFFECTS_FOR_TYPE[type].map((et) => createDefaultEffect(et));

    const track: Track = {
      id,
      name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${trackCount + 1}`,
      type,
      color: TRACK_COLORS[type],
      volume: 0.8,
      pan: 0,
      muted: false,
      solo: false,
      armed: false,
      effects: defaultEffects,
      clips: [],
      order: get().project.tracks.length,
    };

    set((s) => ({
      project: {
        ...s.project,
        tracks: [...s.project.tracks, track],
        updatedAt: new Date().toISOString(),
      },
      activeTrackId: id,
    }));

    return id;
  },

  removeTrack: (trackId) =>
    set((s) => ({
      project: {
        ...s.project,
        tracks: s.project.tracks.filter((t) => t.id !== trackId),
        updatedAt: new Date().toISOString(),
      },
      activeTrackId: s.activeTrackId === trackId ? null : s.activeTrackId,
    })),

  updateTrack: (trackId, updates) =>
    set((s) => ({
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) => (t.id === trackId ? { ...t, ...updates } : t)),
        updatedAt: new Date().toISOString(),
      },
    })),

  reorderTracks: (trackIds) =>
    set((s) => ({
      project: {
        ...s.project,
        tracks: trackIds
          .map((id, i) => {
            const track = s.project.tracks.find((t) => t.id === id);
            return track ? { ...track, order: i } : null;
          })
          .filter(Boolean) as Track[],
        updatedAt: new Date().toISOString(),
      },
    })),

  setActiveTrack: (trackId) => set({ activeTrackId: trackId }),

  toggleTrackMute: (trackId) =>
    set((s) => ({
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) =>
          t.id === trackId ? { ...t, muted: !t.muted } : t
        ),
      },
    })),

  toggleTrackSolo: (trackId) =>
    set((s) => ({
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) =>
          t.id === trackId ? { ...t, solo: !t.solo } : t
        ),
      },
    })),

  setTrackVolume: (trackId, volume) =>
    set((s) => ({
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) =>
          t.id === trackId ? { ...t, volume: Math.max(0, Math.min(1, volume)) } : t
        ),
      },
    })),

  setTrackPan: (trackId, pan) =>
    set((s) => ({
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) =>
          t.id === trackId ? { ...t, pan: Math.max(-1, Math.min(1, pan)) } : t
        ),
      },
    })),

  addClip: (trackId, clip) => {
    const id = uuidv4();
    set((s) => ({
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) =>
          t.id === trackId ? { ...t, clips: [...t.clips, { ...clip, id }] } : t
        ),
        updatedAt: new Date().toISOString(),
      },
    }));
    return id;
  },

  removeClip: (trackId, clipId) =>
    set((s) => ({
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) =>
          t.id === trackId ? { ...t, clips: t.clips.filter((c) => c.id !== clipId) } : t
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  updateClip: (trackId, clipId, updates) =>
    set((s) => ({
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) =>
          t.id === trackId
            ? { ...t, clips: t.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c)) }
            : t
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  moveClip: (trackId, clipId, newStartTime) => {
    const { snapToGrid, gridSize } = get();
    const time = snapToGrid ? Math.round(newStartTime / gridSize) * gridSize : newStartTime;
    get().updateClip(trackId, clipId, { startTime: Math.max(0, time) });
  },

  resizeClip: (trackId, clipId, newDuration) => {
    const { snapToGrid, gridSize } = get();
    const dur = snapToGrid ? Math.round(newDuration / gridSize) * gridSize : newDuration;
    get().updateClip(trackId, clipId, { duration: Math.max(gridSize, dur) });
  },

  addEffect: (trackId, type) =>
    set((s) => ({
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) =>
          t.id === trackId ? { ...t, effects: [...t.effects, createDefaultEffect(type)] } : t
        ),
      },
    })),

  removeEffect: (trackId, effectId) =>
    set((s) => ({
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) =>
          t.id === trackId ? { ...t, effects: t.effects.filter((e) => e.id !== effectId) } : t
        ),
      },
    })),

  toggleEffect: (trackId, effectId) =>
    set((s) => ({
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) =>
          t.id === trackId
            ? { ...t, effects: t.effects.map((e) => (e.id === effectId ? { ...e, enabled: !e.enabled } : e)) }
            : t
        ),
      },
    })),

  updateEffectParam: (trackId, effectId, paramId, value) =>
    set((s) => ({
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) =>
          t.id === trackId
            ? {
                ...t,
                effects: t.effects.map((e) =>
                  e.id === effectId
                    ? {
                        ...e,
                        params: e.params.map((p) => (p.id === paramId ? { ...p, value } : p)),
                      }
                    : e
                ),
              }
            : t
        ),
      },
    })),

  reorderEffects: (trackId, effectIds) =>
    set((s) => ({
      project: {
        ...s.project,
        tracks: s.project.tracks.map((t) => {
          if (t.id !== trackId) return t;
          const sorted = effectIds
            .map((id) => t.effects.find((e) => e.id === id))
            .filter(Boolean) as Effect[];
          return { ...t, effects: sorted };
        }),
      },
    })),

  setPlaying: (isPlaying) =>
    set((s) => ({ transport: { ...s.transport, isPlaying, isPaused: !isPlaying && s.transport.isPaused } })),

  setRecording: (isRecording) =>
    set((s) => ({ transport: { ...s.transport, isRecording } })),

  setCurrentTime: (currentTime) =>
    set((s) => ({ transport: { ...s.transport, currentTime } })),

  setLoop: (loopStart, loopEnd, loopEnabled) =>
    set((s) => ({ transport: { ...s.transport, loopStart, loopEnd, loopEnabled } })),

  toggleLoop: () =>
    set((s) => ({ transport: { ...s.transport, loopEnabled: !s.transport.loopEnabled } })),

  setZoom: (zoom) => set({ zoom: Math.max(20, Math.min(200, zoom)) }),
  setScrollX: (scrollX) => set({ scrollX: Math.max(0, scrollX) }),
  setScrollY: (scrollY) => set({ scrollY: Math.max(0, scrollY) }),
  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
  setGridSize: (gridSize) => set({ gridSize }),
  setSidePanel: (sidePanel) => set((s) => ({ sidePanel: s.sidePanel === sidePanel ? null : sidePanel })),
  setSelection: (selection) => set({ selection }),
  setMasterVolume: (masterVolume) => set({ masterVolume: Math.max(0, Math.min(1, masterVolume)) }),
  setMasteringPreset: (masteringPreset) => set({ masteringPreset }),
  setGenerating: (trackId, generating) =>
    set((s) => ({ isGenerating: { ...s.isGenerating, [trackId]: generating } })),
}));
