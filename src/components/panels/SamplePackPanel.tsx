"use client";

import React, { useState, useCallback } from "react";
import { Package, Play, Square, Plus, Shuffle, Download } from "lucide-react";
import type { SamplePack, SampleInfo, TrackType } from "@/types";
import { useProjectStore } from "@/store/project-store";
import { v4 as uuidv4 } from "uuid";

const SAMPLE_CATEGORIES = [
  "Kick", "Snare", "Hi-Hat", "Clap", "Tom",
  "Bass", "Lead", "Pad", "FX", "Vocal",
  "Loop", "One-Shot", "Percussion", "Sub",
];

const GENERATED_PACKS: SamplePack[] = [
  {
    id: "trap-essentials",
    name: "Trap Essentials",
    category: "Trap",
    createdAt: new Date().toISOString(),
    samples: [
      { id: "s1", name: "808 Boom", url: "", duration: 1.2, bpm: 140, category: "Kick" },
      { id: "s2", name: "Snap Snare", url: "", duration: 0.4, category: "Snare" },
      { id: "s3", name: "Rapid HH", url: "", duration: 0.15, category: "Hi-Hat" },
      { id: "s4", name: "Hard Clap", url: "", duration: 0.3, category: "Clap" },
      { id: "s5", name: "Sub Bass", url: "", duration: 2.0, bpm: 140, key: "C", category: "Bass" },
      { id: "s6", name: "Dark Pad", url: "", duration: 4.0, key: "C", category: "Pad" },
      { id: "s7", name: "Riser FX", url: "", duration: 3.0, category: "FX" },
      { id: "s8", name: "Vox Chop", url: "", duration: 0.5, category: "Vocal" },
    ],
  },
  {
    id: "lofi-dreams",
    name: "Lo-Fi Dreams",
    category: "Lo-Fi",
    createdAt: new Date().toISOString(),
    samples: [
      { id: "s9", name: "Dusty Kick", url: "", duration: 0.8, category: "Kick" },
      { id: "s10", name: "Vinyl Snare", url: "", duration: 0.5, category: "Snare" },
      { id: "s11", name: "Soft HH", url: "", duration: 0.2, category: "Hi-Hat" },
      { id: "s12", name: "Warm Bass", url: "", duration: 1.5, bpm: 85, key: "A", category: "Bass" },
      { id: "s13", name: "Rhodes Loop", url: "", duration: 8.0, bpm: 85, key: "A", category: "Loop" },
      { id: "s14", name: "Rain Texture", url: "", duration: 5.0, category: "FX" },
      { id: "s15", name: "Vinyl Crackle", url: "", duration: 10.0, category: "FX" },
      { id: "s16", name: "Jazz Guitar", url: "", duration: 4.0, bpm: 85, key: "D", category: "Loop" },
    ],
  },
  {
    id: "house-tools",
    name: "House Tools",
    category: "House",
    createdAt: new Date().toISOString(),
    samples: [
      { id: "s17", name: "4/4 Kick", url: "", duration: 0.5, category: "Kick" },
      { id: "s18", name: "Offbeat HH", url: "", duration: 0.1, category: "Hi-Hat" },
      { id: "s19", name: "Clap Layer", url: "", duration: 0.4, category: "Clap" },
      { id: "s20", name: "Acid Bass", url: "", duration: 2.0, bpm: 124, key: "F", category: "Bass" },
      { id: "s21", name: "Stab Chord", url: "", duration: 0.3, key: "F", category: "One-Shot" },
      { id: "s22", name: "Vocal Hook", url: "", duration: 2.0, category: "Vocal" },
      { id: "s23", name: "Build FX", url: "", duration: 4.0, category: "FX" },
      { id: "s24", name: "Perc Loop", url: "", duration: 4.0, bpm: 124, category: "Percussion" },
    ],
  },
];

export default function SamplePackPanel() {
  const [selectedPack, setSelectedPack] = useState<SamplePack>(GENERATED_PACKS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [playingSample, setPlayingSample] = useState<string | null>(null);
  const { addTrack, addClip, project } = useProjectStore();

  const filteredSamples =
    selectedCategory === "All"
      ? selectedPack.samples
      : selectedPack.samples.filter((s) => s.category === selectedCategory);

  const categoriesInPack = ["All", ...new Set(selectedPack.samples.map((s) => s.category))];

  const handlePlaySample = useCallback((sample: SampleInfo) => {
    if (playingSample === sample.id) {
      setPlayingSample(null);
    } else {
      setPlayingSample(sample.id);
      // Auto-stop after duration
      setTimeout(() => setPlayingSample(null), sample.duration * 1000);
    }
  }, [playingSample]);

  const handleAddToTimeline = useCallback(
    (sample: SampleInfo) => {
      // Determine track type from sample category
      let trackType: TrackType = "sample";
      if (["Kick", "Snare", "Hi-Hat", "Clap", "Tom", "Percussion"].includes(sample.category)) {
        trackType = "drums";
      } else if (["Bass", "Sub"].includes(sample.category)) {
        trackType = "bass";
      } else if (["Lead"].includes(sample.category)) {
        trackType = "melody";
      } else if (["Pad"].includes(sample.category)) {
        trackType = "harmony";
      } else if (["Vocal"].includes(sample.category)) {
        trackType = "vocals";
      } else if (["FX"].includes(sample.category)) {
        trackType = "fx";
      }

      let track = project.tracks.find((t) => t.type === trackType);
      let trackId: string;
      if (!track) {
        trackId = addTrack(trackType, sample.name);
      } else {
        trackId = track.id;
      }

      const existingTrack = project.tracks.find((t) => t.id === trackId);
      const lastEnd = existingTrack
        ? existingTrack.clips.reduce((max, c) => Math.max(max, c.startTime + c.duration), 0)
        : 0;

      addClip(trackId, {
        trackId,
        startTime: lastEnd,
        duration: sample.duration,
        audioUrl: sample.url || undefined,
        color: "#3b82f6",
        name: sample.name,
        gain: 1,
      });
    },
    [project, addTrack, addClip]
  );

  const handleGenerateNewPack = useCallback(() => {
    // Rotate through packs for demo
    const currentIndex = GENERATED_PACKS.findIndex((p) => p.id === selectedPack.id);
    const nextIndex = (currentIndex + 1) % GENERATED_PACKS.length;
    setSelectedPack(GENERATED_PACKS[nextIndex]);
  }, [selectedPack]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-text-primary flex items-center gap-1.5">
          <Package size={14} className="text-accent-blue" />
          Sample Packs
        </h3>
        <button
          onClick={handleGenerateNewPack}
          className="btn-ghost text-[10px] flex items-center gap-1"
        >
          <Shuffle size={10} /> Generate
        </button>
      </div>

      {/* Pack selector */}
      <div className="flex gap-1">
        {GENERATED_PACKS.map((pack) => (
          <button
            key={pack.id}
            onClick={() => setSelectedPack(pack)}
            className={`flex-1 text-[10px] py-1.5 rounded transition-all border
              ${selectedPack.id === pack.id
                ? "border-accent-blue bg-accent-blue/10 text-text-primary"
                : "border-surface-light text-text-muted hover:text-text-secondary"
              }`}
          >
            {pack.name}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-1 flex-wrap">
        {categoriesInPack.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-[9px] px-2 py-0.5 rounded-full transition-colors
              ${selectedCategory === cat
                ? "bg-accent-blue/20 text-accent-blue"
                : "bg-surface-light/50 text-text-muted hover:text-text-secondary"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sample list */}
      <div className="space-y-0.5 max-h-64 overflow-y-auto">
        {filteredSamples.map((sample) => (
          <div
            key={sample.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-light/50
                       transition-colors group"
          >
            <button
              onClick={() => handlePlaySample(sample)}
              className={`p-1 rounded transition-colors ${
                playingSample === sample.id
                  ? "text-accent-green"
                  : "text-text-muted group-hover:text-text-primary"
              }`}
            >
              {playingSample === sample.id ? <Square size={12} /> : <Play size={12} />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-text-primary truncate">{sample.name}</div>
              <div className="text-[9px] text-text-muted flex items-center gap-2">
                <span>{sample.category}</span>
                <span>{sample.duration.toFixed(1)}s</span>
                {sample.bpm && <span>{sample.bpm} BPM</span>}
                {sample.key && <span>{sample.key}</span>}
              </div>
            </div>

            <button
              onClick={() => handleAddToTimeline(sample)}
              className="p-1 text-text-muted hover:text-accent-blue transition-colors
                         opacity-0 group-hover:opacity-100"
              title="Add to timeline"
            >
              <Plus size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
