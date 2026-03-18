"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Waves,
  ScissorsIcon,
  Copy,
  Trash2,
  RotateCcw,
  Volume2,
  TrendingDown,
  TrendingUp,
  Maximize2,
} from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import WaveformDisplay from "@/components/ui/WaveformDisplay";
import type { TrackClip, SelectionRange } from "@/types";

type WaveformTool = "select" | "cut" | "fade-in" | "fade-out" | "normalize" | "gain";

const TOOLS: { id: WaveformTool; icon: React.ReactNode; label: string }[] = [
  { id: "select", icon: <Maximize2 size={12} />, label: "Select" },
  { id: "cut", icon: <ScissorsIcon size={12} />, label: "Cut" },
  { id: "fade-in", icon: <TrendingUp size={12} />, label: "Fade In" },
  { id: "fade-out", icon: <TrendingDown size={12} />, label: "Fade Out" },
  { id: "normalize", icon: <Volume2 size={12} />, label: "Normalize" },
  { id: "gain", icon: <Volume2 size={12} />, label: "Gain" },
];

export default function WaveformEditorPanel() {
  const { project, activeTrackId, selection, setSelection, updateClip, removeClip } =
    useProjectStore();

  const [activeTool, setActiveTool] = useState<WaveformTool>("select");
  const [gainValue, setGainValue] = useState(0);
  const [localSelection, setLocalSelection] = useState<{ start: number; end: number } | null>(null);

  const activeTrack = project.tracks.find((t) => t.id === activeTrackId);
  const selectedClip: TrackClip | null = useMemo(() => {
    if (!activeTrack || !selection?.trackId) return null;
    return (
      activeTrack.clips.find(
        (c) =>
          c.startTime <= (selection.start ?? 0) &&
          c.startTime + c.duration >= (selection.end ?? 0)
      ) ?? activeTrack.clips[0] ?? null
    );
  }, [activeTrack, selection]);

  // Generate fake waveform data for display
  const waveformData = useMemo(() => {
    if (!selectedClip) return null;
    const points = 512;
    const data = new Float32Array(points);
    for (let i = 0; i < points; i++) {
      const t = i / points;
      data[i] =
        0.5 * Math.sin(t * 20) +
        0.3 * Math.sin(t * 47) +
        0.15 * Math.sin(t * 91) +
        0.1 * (Math.random() - 0.5);

      // Apply fade-in/fade-out visualization
      if (localSelection) {
        if (activeTool === "fade-in" && t < localSelection.end) {
          data[i] *= t / Math.max(0.01, localSelection.end);
        }
        if (activeTool === "fade-out" && t > localSelection.start) {
          data[i] *= (1 - t) / Math.max(0.01, 1 - localSelection.start);
        }
      }
    }
    return data;
  }, [selectedClip, localSelection, activeTool]);

  const handleSelectionChange = useCallback(
    (start: number, end: number) => {
      setLocalSelection({ start, end });
      if (selectedClip && activeTrackId) {
        setSelection({
          start: selectedClip.startTime + start * selectedClip.duration,
          end: selectedClip.startTime + end * selectedClip.duration,
          trackId: activeTrackId,
        });
      }
    },
    [selectedClip, activeTrackId, setSelection]
  );

  const handleCut = useCallback(() => {
    if (!selectedClip || !activeTrackId || !localSelection) return;
    // Split clip at selection point
    const cutPoint = localSelection.start;
    const originalDuration = selectedClip.duration;
    const firstDuration = cutPoint * originalDuration;
    const secondDuration = originalDuration - firstDuration;

    if (firstDuration > 0.1 && secondDuration > 0.1) {
      updateClip(activeTrackId, selectedClip.id, { duration: firstDuration });
    }
  }, [selectedClip, activeTrackId, localSelection, updateClip]);

  const handleDelete = useCallback(() => {
    if (!selectedClip || !activeTrackId) return;
    removeClip(activeTrackId, selectedClip.id);
  }, [selectedClip, activeTrackId, removeClip]);

  const handleGain = useCallback(() => {
    if (!selectedClip || !activeTrackId) return;
    const newGain = Math.max(0, Math.min(2, selectedClip.gain + gainValue / 6));
    updateClip(activeTrackId, selectedClip.id, { gain: newGain });
  }, [selectedClip, activeTrackId, gainValue, updateClip]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-text-primary flex items-center gap-1.5">
          <Waves size={14} className="text-accent-cyan" />
          Waveform Editor
        </h3>
      </div>

      {!selectedClip ? (
        <div className="text-center py-8 text-text-muted text-xs">
          <Waves size={24} className="mx-auto mb-2 opacity-30" />
          <p>Select a clip to edit its waveform</p>
          <p className="text-[10px] mt-1">Double-click a clip in the timeline</p>
        </div>
      ) : (
        <>
          {/* Tool bar */}
          <div className="flex gap-0.5 p-1 bg-bg-primary rounded-md">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all
                  ${activeTool === tool.id
                    ? "bg-accent-purple/20 text-accent-purple"
                    : "text-text-muted hover:text-text-secondary hover:bg-surface-light/50"
                  }`}
                title={tool.label}
              >
                {tool.icon}
                <span className="hidden xl:inline">{tool.label}</span>
              </button>
            ))}
          </div>

          {/* Clip info */}
          <div className="flex items-center gap-3 text-[10px] text-text-muted">
            <span>Clip: {selectedClip.name}</span>
            <span>{selectedClip.duration.toFixed(2)}s</span>
            <span>Gain: {(selectedClip.gain * 100).toFixed(0)}%</span>
          </div>

          {/* Waveform display */}
          <div className="panel p-1 overflow-hidden">
            <WaveformDisplay
              data={waveformData}
              width={270}
              height={100}
              color="#06b6d4"
              backgroundColor="#0a0a0f"
              selectionStart={localSelection?.start}
              selectionEnd={localSelection?.end}
              onSelectionChange={handleSelectionChange}
              interactive
            />
          </div>

          {/* Tool-specific controls */}
          {activeTool === "gain" && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-text-muted">Gain (dB):</label>
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={gainValue}
                onChange={(e) => setGainValue(Number(e.target.value))}
                className="slider-track flex-1"
              />
              <span className="text-[10px] text-text-secondary font-mono w-10 text-right">
                {gainValue > 0 ? "+" : ""}{gainValue}
              </span>
              <button onClick={handleGain} className="btn-primary text-[10px] py-1 px-2">
                Apply
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-1">
            {activeTool === "cut" && (
              <button
                onClick={handleCut}
                disabled={!localSelection}
                className="btn-secondary flex-1 text-[10px] flex items-center justify-center gap-1"
              >
                <ScissorsIcon size={10} /> Cut at Selection
              </button>
            )}
            <button
              onClick={handleDelete}
              className="btn-secondary text-[10px] flex items-center gap-1 text-accent-red"
            >
              <Trash2 size={10} /> Delete
            </button>
          </div>

          {/* Selection info */}
          {localSelection && (
            <div className="text-[9px] text-text-muted text-center">
              Selection: {(localSelection.start * selectedClip.duration).toFixed(2)}s -{" "}
              {(localSelection.end * selectedClip.duration).toFixed(2)}s (
              {((localSelection.end - localSelection.start) * selectedClip.duration).toFixed(2)}s)
            </div>
          )}
        </>
      )}
    </div>
  );
}
