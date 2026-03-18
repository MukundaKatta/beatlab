"use client";

import React from "react";
import {
  Sliders,
  Music2,
  Zap,
  Package,
  Waves,
  X,
} from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import EffectChain from "@/components/effects/EffectChain";
import ChordPanel from "./ChordPanel";
import MasteringPanel from "./MasteringPanel";
import SamplePackPanel from "./SamplePackPanel";
import WaveformEditorPanel from "./WaveformEditorPanel";

const PANEL_TABS = [
  { id: "effects" as const, icon: Sliders, label: "Effects" },
  { id: "chords" as const, icon: Music2, label: "Chords" },
  { id: "mastering" as const, icon: Zap, label: "Master" },
  { id: "samples" as const, icon: Package, label: "Samples" },
  { id: "waveform" as const, icon: Waves, label: "Waveform" },
];

export default function SidePanel() {
  const { sidePanel, setSidePanel, project, activeTrackId } = useProjectStore();

  const activeTrack = project.tracks.find((t) => t.id === activeTrackId);

  if (!sidePanel) return null;

  return (
    <div className="w-[300px] min-w-[300px] bg-bg-secondary border-l border-surface-light
                    flex flex-col overflow-hidden animate-slide-in">
      {/* Tab bar */}
      <div className="flex items-center border-b border-surface-light">
        <div className="flex-1 flex">
          {PANEL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSidePanel(tab.id)}
              className={`flex items-center gap-1 px-3 py-2 text-[10px] font-medium
                         border-b-2 transition-all
                ${sidePanel === tab.id
                  ? "border-accent-purple text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-secondary"
                }`}
            >
              <tab.icon size={12} />
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setSidePanel(null)}
          className="btn-icon p-1.5 mr-1"
          title="Close panel"
        >
          <X size={14} />
        </button>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-3">
        {sidePanel === "effects" && activeTrack && (
          <EffectChain track={activeTrack} />
        )}
        {sidePanel === "effects" && !activeTrack && (
          <div className="text-center py-8 text-text-muted text-xs">
            <Sliders size={24} className="mx-auto mb-2 opacity-30" />
            <p>Select a track to edit effects</p>
          </div>
        )}
        {sidePanel === "chords" && <ChordPanel />}
        {sidePanel === "mastering" && <MasteringPanel />}
        {sidePanel === "samples" && <SamplePackPanel />}
        {sidePanel === "waveform" && <WaveformEditorPanel />}
      </div>
    </div>
  );
}
