"use client";

import React from "react";
import {
  Sliders,
  Music2,
  Zap,
  Package,
  Waves,
  Keyboard,
} from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import SpectrumAnalyzer from "@/components/ui/SpectrumAnalyzer";
import { useAudioEngine } from "@/hooks/useAudioEngine";

export default function BottomBar() {
  const { project, sidePanel, setSidePanel, activeTrackId } = useProjectStore();
  const { fftData } = useAudioEngine();

  const panels = [
    { id: "effects" as const, icon: Sliders, label: "Effects" },
    { id: "chords" as const, icon: Music2, label: "Chords" },
    { id: "mastering" as const, icon: Zap, label: "Mastering" },
    { id: "samples" as const, icon: Package, label: "Samples" },
    { id: "waveform" as const, icon: Waves, label: "Waveform" },
  ];

  const activeTrack = project.tracks.find((t) => t.id === activeTrackId);

  return (
    <div className="h-9 bg-bg-secondary border-t border-surface-light flex items-center px-3 gap-2 select-none">
      {/* Panel toggle buttons */}
      <div className="flex items-center gap-0.5">
        {panels.map((panel) => (
          <button
            key={panel.id}
            onClick={() => setSidePanel(panel.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all
              ${sidePanel === panel.id
                ? "bg-accent-purple/20 text-accent-purple"
                : "text-text-muted hover:text-text-secondary hover:bg-surface-light/50"
              }`}
            title={panel.label}
          >
            <panel.icon size={12} />
            <span className="hidden md:inline">{panel.label}</span>
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-surface-light" />

      {/* Mini spectrum */}
      <div className="hidden md:block">
        <SpectrumAnalyzer fftData={fftData} width={120} height={24} />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status */}
      <div className="flex items-center gap-3 text-[10px] text-text-muted">
        {activeTrack && (
          <span>
            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: activeTrack.color }} />
            {activeTrack.name}
          </span>
        )}
        <span>{project.tracks.length} tracks</span>
        <span>{project.tracks.reduce((sum, t) => sum + t.clips.length, 0)} clips</span>
        <span className="font-mono">{project.bpm} BPM</span>
        <span>{project.key} {project.scale}</span>
        <Keyboard size={12} className="text-text-muted" title="Keyboard shortcuts available" />
      </div>
    </div>
  );
}
