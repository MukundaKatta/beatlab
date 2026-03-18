"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import type { TrackType } from "@/types";
import { useProjectStore } from "@/store/project-store";

const TRACK_OPTIONS: { type: TrackType; label: string; color: string; icon: string }[] = [
  { type: "drums", label: "Drums", color: "#ef4444", icon: "DR" },
  { type: "bass", label: "Bass", color: "#f59e0b", icon: "BA" },
  { type: "melody", label: "Melody", color: "#06b6d4", icon: "ML" },
  { type: "harmony", label: "Harmony", color: "#8b5cf6", icon: "HR" },
  { type: "vocals", label: "Vocals", color: "#ec4899", icon: "VO" },
  { type: "fx", label: "FX", color: "#10b981", icon: "FX" },
  { type: "sample", label: "Sample", color: "#3b82f6", icon: "SP" },
];

export default function TrackAdder() {
  const [isOpen, setIsOpen] = useState(false);
  const { addTrack } = useProjectStore();

  const handleAdd = (type: TrackType) => {
    addTrack(type);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary flex items-center gap-1.5 text-xs"
      >
        {isOpen ? <X size={14} /> : <Plus size={14} />}
        Add Track
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 panel p-1.5 w-48 animate-fade-in shadow-xl">
          {TRACK_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => handleAdd(opt.type)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-light
                         transition-colors text-left"
            >
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: opt.color }}
              >
                {opt.icon}
              </div>
              <span className="text-xs text-text-primary">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
