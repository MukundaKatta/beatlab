"use client";

import React, { useEffect, useState } from "react";
import TransportBar from "@/components/daw/TransportBar";
import Timeline from "@/components/daw/Timeline";
import TrackAdder from "@/components/daw/TrackAdder";
import BottomBar from "@/components/daw/BottomBar";
import SidePanel from "@/components/panels/SidePanel";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useProjectStore } from "@/store/project-store";

function DAWApp() {
  useKeyboardShortcuts();
  const { project, setProjectName } = useProjectStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
              <path d="M9 18V5l12-2v13" />
              <circle cx={6} cy={18} r={3} />
              <circle cx={18} cy={16} r={3} />
            </svg>
          </div>
          <p className="text-text-muted text-sm">Loading BeatLab...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      {/* Top transport bar */}
      <TransportBar />

      {/* Project name bar */}
      <div className="h-8 bg-bg-tertiary border-b border-surface-light flex items-center px-3 gap-3">
        <input
          type="text"
          value={project.name}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-transparent text-xs text-text-primary font-medium border-none outline-none
                     hover:bg-surface-light/30 focus:bg-surface-light/50 rounded px-2 py-0.5
                     transition-colors w-48"
          placeholder="Project name..."
        />
        <div className="w-px h-4 bg-surface-light" />
        <TrackAdder />
        <div className="flex-1" />
        <div className="text-[10px] text-text-muted flex items-center gap-3">
          <span>Space: Play/Pause</span>
          <span>Enter: Stop</span>
          <span>L: Loop</span>
          <span>G: Snap</span>
          <span>1-5: Panels</span>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Timeline area */}
        <Timeline />

        {/* Side panel */}
        <SidePanel />
      </div>

      {/* Bottom bar */}
      <BottomBar />
    </div>
  );
}

export default function Page() {
  return <DAWApp />;
}
