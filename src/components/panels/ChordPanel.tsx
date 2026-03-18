"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Shuffle, Play, Plus, Music2 } from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import {
  getDiatonicChords,
  generateChordProgression,
  generateHarmony,
} from "@/lib/music-theory";
import type { ChordProgression, ChordInfo } from "@/types";
import { v4 as uuidv4 } from "uuid";

const STYLES = ["pop", "rock", "jazz", "blues", "edm", "rnb", "lofi"];
const VOICINGS = ["block", "arpeggiated", "spread"];

export default function ChordPanel() {
  const { project, addClip, addTrack } = useProjectStore();
  const [selectedStyle, setSelectedStyle] = useState("pop");
  const [selectedVoicing, setSelectedVoicing] = useState("block");
  const [bars, setBars] = useState(4);
  const [progression, setProgression] = useState<ChordProgression | null>(null);

  const diatonicChords = useMemo(
    () => getDiatonicChords(project.key, project.scale),
    [project.key, project.scale]
  );

  const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];

  const handleGenerate = useCallback(() => {
    const prog = generateChordProgression(project.key, project.scale, selectedStyle, bars);
    setProgression(prog);
  }, [project.key, project.scale, selectedStyle, bars]);

  const handleShuffle = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleAddToTimeline = useCallback(() => {
    if (!progression) return;

    // Find or create a harmony track
    let harmonyTrack = project.tracks.find((t) => t.type === "harmony");
    let trackId: string;

    if (!harmonyTrack) {
      trackId = addTrack("harmony", "Chords");
    } else {
      trackId = harmonyTrack.id;
    }

    const midiNotes = generateHarmony(progression, 4, project.bpm, selectedVoicing);
    const beatDuration = 60 / project.bpm;
    const clipDuration = progression.chords.length * 4 * beatDuration;

    const track = project.tracks.find((t) => t.id === trackId);
    const lastEnd = track
      ? track.clips.reduce((max, c) => Math.max(max, c.startTime + c.duration), 0)
      : 0;

    addClip(trackId, {
      trackId,
      startTime: lastEnd,
      duration: clipDuration,
      midiNotes,
      color: "#8b5cf6",
      name: `${project.key} ${project.scale} chords`,
      gain: 1,
    });
  }, [progression, project, addTrack, addClip, selectedVoicing]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-text-primary flex items-center gap-1.5">
          <Music2 size={14} className="text-accent-purple" />
          Chord Progression
        </h3>
      </div>

      {/* Diatonic chords palette */}
      <div>
        <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1 block">
          {project.key} {project.scale} — Diatonic Chords
        </label>
        <div className="grid grid-cols-4 gap-1">
          {diatonicChords.map((chord, i) => (
            <button
              key={i}
              className="panel p-1.5 text-center hover:bg-surface-light transition-colors group"
            >
              <div className="text-[10px] text-text-muted">{romanNumerals[i]}</div>
              <div className="text-xs font-medium text-text-primary group-hover:text-accent-purple transition-colors">
                {chord.symbol}
              </div>
              <div className="text-[9px] text-text-muted mt-0.5">
                {chord.notes.join(" ")}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Generator controls */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1 block">
              Style
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="select-field w-full text-xs py-1"
            >
              {STYLES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1 block">
              Voicing
            </label>
            <select
              value={selectedVoicing}
              onChange={(e) => setSelectedVoicing(e.target.value)}
              className="select-field w-full text-xs py-1"
            >
              {VOICINGS.map((v) => (
                <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="w-16">
            <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1 block">
              Bars
            </label>
            <input
              type="number"
              value={bars}
              onChange={(e) => setBars(Math.max(1, Math.min(16, Number(e.target.value))))}
              className="input-field w-full text-xs py-1 text-center"
              min={1}
              max={16}
            />
          </div>
        </div>

        <div className="flex gap-1.5">
          <button onClick={handleGenerate} className="btn-primary flex-1 text-xs flex items-center justify-center gap-1">
            <Shuffle size={12} />
            Generate
          </button>
          <button onClick={handleShuffle} className="btn-secondary text-xs px-3">
            <Shuffle size={12} />
          </button>
        </div>
      </div>

      {/* Generated progression display */}
      {progression && (
        <div className="space-y-2 animate-fade-in">
          <label className="text-[10px] text-text-muted uppercase tracking-wider">
            Generated: {progression.name}
          </label>
          <div className="flex gap-1 flex-wrap">
            {progression.chords.map((chord, i) => (
              <div
                key={i}
                className="panel px-3 py-2 text-center min-w-[50px] hover:border-accent-purple/50
                           transition-colors cursor-pointer"
              >
                <div className="text-sm font-medium text-text-primary">{chord.symbol}</div>
                <div className="text-[9px] text-text-muted mt-0.5">
                  {chord.notes.join(" ")}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddToTimeline}
            className="btn-primary w-full text-xs flex items-center justify-center gap-1"
          >
            <Plus size={12} />
            Add to Timeline
          </button>
        </div>
      )}
    </div>
  );
}
