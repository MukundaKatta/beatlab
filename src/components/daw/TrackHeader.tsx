"use client";

import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
  Headphones,
  Trash2,
  ChevronDown,
  Sparkles,
  GripVertical,
} from "lucide-react";
import type { Track, TrackType } from "@/types";
import { useProjectStore } from "@/store/project-store";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import Knob from "@/components/ui/Knob";
import Meter from "@/components/ui/Meter";

interface TrackHeaderProps {
  track: Track;
  isActive: boolean;
  isGenerating: boolean;
  onGenerate: (trackId: string) => void;
}

const TRACK_ICONS: Record<TrackType, string> = {
  drums: "DR",
  bass: "BA",
  melody: "ML",
  harmony: "HR",
  vocals: "VO",
  fx: "FX",
  sample: "SP",
};

export default function TrackHeader({
  track,
  isActive,
  isGenerating,
  onGenerate,
}: TrackHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    setActiveTrack,
    toggleTrackMute,
    toggleTrackSolo,
    setTrackVolume,
    setTrackPan,
    removeTrack,
    updateTrack,
  } = useProjectStore();

  const { setTrackVolume: setEngineVolume, setTrackPan: setEnginePan, setTrackMute } = useAudioEngine();

  const handleVolumeChange = (value: number) => {
    setTrackVolume(track.id, value);
    setEngineVolume(track.id, value);
  };

  const handlePanChange = (value: number) => {
    setTrackPan(track.id, value);
    setEnginePan(track.id, value);
  };

  const handleMute = () => {
    toggleTrackMute(track.id);
    setTrackMute(track.id, !track.muted);
  };

  return (
    <div
      className={`h-full border-r border-surface-light flex flex-col
        ${isActive ? "bg-bg-elevated/50" : "bg-bg-secondary"}
        transition-colors duration-100`}
      style={{ borderLeft: `3px solid ${track.color}` }}
      onClick={() => setActiveTrack(track.id)}
    >
      {/* Top row */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-surface-light/50">
        <GripVertical size={12} className="text-text-muted cursor-grab" />
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white"
          style={{ backgroundColor: track.color }}
        >
          {TRACK_ICONS[track.type]}
        </div>
        <input
          type="text"
          value={track.name}
          onChange={(e) => updateTrack(track.id, { name: e.target.value })}
          className="flex-1 bg-transparent text-xs text-text-primary font-medium
                     border-none outline-none min-w-0 truncate"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="btn-icon p-0.5"
        >
          <ChevronDown
            size={12}
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-1 px-2 py-1 flex-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleMute();
          }}
          className={`p-1 rounded text-xs font-bold transition-colors
            ${track.muted ? "bg-accent-red/20 text-accent-red" : "text-text-muted hover:text-text-primary"}`}
          title="Mute"
        >
          {track.muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTrackSolo(track.id);
          }}
          className={`p-1 rounded text-[10px] font-bold transition-colors
            ${track.solo ? "bg-accent-orange/20 text-accent-orange" : "text-text-muted hover:text-text-primary"}`}
          title="Solo"
        >
          <Headphones size={13} />
        </button>

        <div className="flex-1 flex items-center justify-center gap-1">
          <Knob
            value={track.volume}
            min={0}
            max={1}
            step={0.01}
            size={28}
            label="Vol"
            color={track.color}
            onChange={handleVolumeChange}
          />
          <Knob
            value={track.pan}
            min={-1}
            max={1}
            step={0.01}
            size={28}
            label="Pan"
            color={track.color}
            onChange={handlePanChange}
          />
        </div>

        <Meter level={-20 + track.volume * 20} height={32} width={4} />
      </div>

      {/* Generate button */}
      <div className="px-2 py-1 border-t border-surface-light/50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGenerate(track.id);
          }}
          disabled={isGenerating}
          className={`w-full py-1 rounded text-[10px] font-medium flex items-center justify-center gap-1
            transition-all ${
              isGenerating
                ? "bg-accent-purple/20 text-accent-purple animate-pulse"
                : "bg-accent-purple/10 text-accent-purple-light hover:bg-accent-purple/20"
            }`}
        >
          <Sparkles size={10} />
          {isGenerating ? "Generating..." : "AI Generate"}
        </button>
      </div>

      {/* Expanded section */}
      {isExpanded && (
        <div className="px-2 py-1.5 border-t border-surface-light/50 space-y-1 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted">Effects: {track.effects.length}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTrack(track.id);
              }}
              className="p-1 text-text-muted hover:text-accent-red transition-colors"
              title="Delete track"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
