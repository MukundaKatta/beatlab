"use client";

import React from "react";
import {
  Power,
  Trash2,
  Plus,
  GripVertical,
} from "lucide-react";
import type { Track, EffectType } from "@/types";
import { useProjectStore } from "@/store/project-store";
import Knob from "@/components/ui/Knob";

const EFFECT_NAMES: Record<EffectType, string> = {
  reverb: "Reverb",
  delay: "Delay",
  compressor: "Compressor",
  eq: "EQ3",
  distortion: "Distortion",
  chorus: "Chorus",
  phaser: "Phaser",
  filter: "Filter",
  limiter: "Limiter",
};

const EFFECT_COLORS: Record<EffectType, string> = {
  reverb: "#8b5cf6",
  delay: "#06b6d4",
  compressor: "#f59e0b",
  eq: "#10b981",
  distortion: "#ef4444",
  chorus: "#ec4899",
  phaser: "#3b82f6",
  filter: "#a78bfa",
  limiter: "#f59e0b",
};

const ALL_EFFECTS: EffectType[] = [
  "reverb", "delay", "compressor", "eq", "distortion",
  "chorus", "phaser", "filter", "limiter",
];

interface EffectChainProps {
  track: Track;
}

export default function EffectChain({ track }: EffectChainProps) {
  const {
    addEffect,
    removeEffect,
    toggleEffect,
    updateEffectParam,
  } = useProjectStore();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-text-primary">
          Effect Chain — {track.name}
        </h3>
        <div className="relative group">
          <button className="btn-ghost flex items-center gap-1 text-[10px]">
            <Plus size={12} /> Add
          </button>
          <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50
                          panel p-1 w-36 shadow-xl">
            {ALL_EFFECTS.map((type) => (
              <button
                key={type}
                onClick={() => addEffect(track.id, type)}
                className="w-full text-left px-2 py-1 text-[11px] text-text-secondary
                           hover:bg-surface-light rounded transition-colors flex items-center gap-2"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: EFFECT_COLORS[type] }}
                />
                {EFFECT_NAMES[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {track.effects.length === 0 && (
        <div className="text-center py-4 text-text-muted text-xs">
          No effects. Add one to shape the sound.
        </div>
      )}

      <div className="space-y-1.5">
        {track.effects.map((effect, index) => (
          <div
            key={effect.id}
            className={`panel transition-all ${
              effect.enabled ? "opacity-100" : "opacity-50"
            }`}
          >
            {/* Effect header */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-surface-light/50">
              <GripVertical size={10} className="text-text-muted cursor-grab" />
              <div
                className="w-1.5 h-4 rounded-full"
                style={{ backgroundColor: EFFECT_COLORS[effect.type] }}
              />
              <span className="text-[11px] font-medium text-text-primary flex-1">
                {index + 1}. {EFFECT_NAMES[effect.type]}
              </span>
              <button
                onClick={() => toggleEffect(track.id, effect.id)}
                className={`p-0.5 rounded transition-colors ${
                  effect.enabled ? "text-accent-green" : "text-text-muted"
                }`}
                title="Toggle effect"
              >
                <Power size={12} />
              </button>
              <button
                onClick={() => removeEffect(track.id, effect.id)}
                className="p-0.5 text-text-muted hover:text-accent-red transition-colors"
                title="Remove effect"
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Effect params */}
            {effect.enabled && (
              <div className="flex items-center gap-3 px-3 py-2 flex-wrap">
                {effect.params.map((param) => (
                  <Knob
                    key={param.id}
                    value={param.value}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    size={32}
                    label={param.name}
                    unit={param.unit}
                    color={EFFECT_COLORS[effect.type]}
                    onChange={(value) =>
                      updateEffectParam(track.id, effect.id, param.id, value)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Signal flow visualization */}
      {track.effects.length > 1 && (
        <div className="flex items-center justify-center gap-1 py-1">
          <span className="text-[9px] text-text-muted">IN</span>
          {track.effects.map((fx, i) => (
            <React.Fragment key={fx.id}>
              <div className="w-4 h-px bg-text-muted/30" />
              <div
                className={`w-2 h-2 rounded-full ${fx.enabled ? "" : "opacity-30"}`}
                style={{ backgroundColor: EFFECT_COLORS[fx.type] }}
              />
            </React.Fragment>
          ))}
          <div className="w-4 h-px bg-text-muted/30" />
          <span className="text-[9px] text-text-muted">OUT</span>
        </div>
      )}
    </div>
  );
}
