"use client";

import React, { useState, useCallback } from "react";
import { Zap, Check, RotateCcw } from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { MASTERING_PRESETS, analyzeLoudness } from "@/lib/mastering";
import type { MasteringPreset } from "@/types";
import Knob from "@/components/ui/Knob";
import SpectrumAnalyzer from "@/components/ui/SpectrumAnalyzer";

export default function MasteringPanel() {
  const { masteringPreset, setMasteringPreset, masterVolume, setMasterVolume } =
    useProjectStore();
  const { meterLevel, fftData, engine } = useAudioEngine();

  const [loudness, setLoudness] = useState(0.7);
  const [stereoWidth, setStereoWidth] = useState(1.0);
  const [lowCut, setLowCut] = useState(30);
  const [highCut, setHighCut] = useState(18000);
  const [compression, setCompression] = useState(0.4);
  const [limiterThreshold, setLimiterThreshold] = useState(-1);
  const [eqLow, setEqLow] = useState(0);
  const [eqMid, setEqMid] = useState(0);
  const [eqHigh, setEqHigh] = useState(0);

  const loudnessInfo = analyzeLoudness(meterLevel);

  const applyPreset = useCallback(
    (preset: MasteringPreset) => {
      setMasteringPreset(preset);
      setLoudness(preset.settings.loudness);
      setStereoWidth(preset.settings.stereoWidth);
      setLowCut(preset.settings.lowCut);
      setHighCut(preset.settings.highCut);
      setCompression(preset.settings.compression);
      setLimiterThreshold(preset.settings.limiterThreshold);

      // Apply to engine
      if (engine) {
        const lowGain = preset.settings.eq.find((e) => e.frequency <= 200)?.gain ?? 0;
        const midGain = preset.settings.eq.find((e) => e.frequency > 200 && e.frequency <= 4000)?.gain ?? 0;
        const highGain = preset.settings.eq.find((e) => e.frequency > 4000)?.gain ?? 0;
        setEqLow(lowGain);
        setEqMid(midGain);
        setEqHigh(highGain);
        engine.setMasterEQ(lowGain, midGain, highGain);
        engine.setMasterCompression(-24 * preset.settings.compression, 4 + preset.settings.compression * 8);
        engine.setMasterLimiter(preset.settings.limiterThreshold);
      }
    },
    [engine, setMasteringPreset]
  );

  const handleEQChange = useCallback(
    (band: "low" | "mid" | "high", value: number) => {
      if (band === "low") setEqLow(value);
      if (band === "mid") setEqMid(value);
      if (band === "high") setEqHigh(value);
      if (engine) {
        engine.setMasterEQ(
          band === "low" ? value : eqLow,
          band === "mid" ? value : eqMid,
          band === "high" ? value : eqHigh
        );
      }
    },
    [engine, eqLow, eqMid, eqHigh]
  );

  const handleReset = useCallback(() => {
    setMasteringPreset(null);
    setLoudness(0.7);
    setStereoWidth(1.0);
    setLowCut(30);
    setHighCut(18000);
    setCompression(0.4);
    setLimiterThreshold(-1);
    setEqLow(0);
    setEqMid(0);
    setEqHigh(0);
    if (engine) {
      engine.setMasterEQ(0, 0, 0);
      engine.setMasterCompression(-12, 4);
      engine.setMasterLimiter(-1);
    }
  }, [engine, setMasteringPreset]);

  const ratingColors: Record<string, string> = {
    "too quiet": "#6b6b80",
    good: "#10b981",
    loud: "#f59e0b",
    "too loud": "#ef4444",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-text-primary flex items-center gap-1.5">
          <Zap size={14} className="text-accent-orange" />
          Mastering Assistant
        </h3>
        <button onClick={handleReset} className="btn-ghost text-[10px] flex items-center gap-1">
          <RotateCcw size={10} /> Reset
        </button>
      </div>

      {/* Spectrum analyzer */}
      <div className="panel p-2">
        <SpectrumAnalyzer fftData={fftData} width={260} height={60} />
      </div>

      {/* Loudness meter */}
      <div className="panel p-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-text-muted">Loudness</span>
          <span
            className="text-[10px] font-medium"
            style={{ color: ratingColors[loudnessInfo.rating] }}
          >
            {loudnessInfo.rating.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3 text-center">
          <div>
            <div className="text-sm font-mono text-text-primary">{loudnessInfo.lufs.toFixed(1)}</div>
            <div className="text-[9px] text-text-muted">LUFS</div>
          </div>
          <div>
            <div className="text-sm font-mono text-text-primary">{loudnessInfo.peak.toFixed(1)}</div>
            <div className="text-[9px] text-text-muted">Peak dB</div>
          </div>
          <div>
            <div className="text-sm font-mono text-text-primary">{loudnessInfo.dynamic.toFixed(1)}</div>
            <div className="text-[9px] text-text-muted">DR</div>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div>
        <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5 block">
          Presets
        </label>
        <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
          {MASTERING_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`text-left px-2 py-1.5 rounded text-[10px] transition-all border
                ${masteringPreset?.id === preset.id
                  ? "border-accent-purple bg-accent-purple/10 text-text-primary"
                  : "border-surface-light hover:border-surface-light hover:bg-surface-light/50 text-text-secondary"
                }`}
            >
              <div className="flex items-center gap-1">
                {masteringPreset?.id === preset.id && <Check size={10} className="text-accent-purple" />}
                <span className="font-medium truncate">{preset.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Master EQ */}
      <div>
        <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5 block">
          Master EQ
        </label>
        <div className="flex items-center justify-center gap-4">
          <Knob
            value={eqLow}
            min={-12}
            max={12}
            step={0.5}
            size={36}
            label="Low"
            unit="dB"
            color="#ef4444"
            onChange={(v) => handleEQChange("low", v)}
          />
          <Knob
            value={eqMid}
            min={-12}
            max={12}
            step={0.5}
            size={36}
            label="Mid"
            unit="dB"
            color="#f59e0b"
            onChange={(v) => handleEQChange("mid", v)}
          />
          <Knob
            value={eqHigh}
            min={-12}
            max={12}
            step={0.5}
            size={36}
            label="High"
            unit="dB"
            color="#06b6d4"
            onChange={(v) => handleEQChange("high", v)}
          />
        </div>
      </div>

      {/* Dynamics */}
      <div>
        <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5 block">
          Dynamics
        </label>
        <div className="flex items-center justify-center gap-4">
          <Knob
            value={compression}
            min={0}
            max={1}
            step={0.01}
            size={36}
            label="Comp"
            color="#f59e0b"
            onChange={(v) => {
              setCompression(v);
              engine?.setMasterCompression(-24 * v, 4 + v * 8);
            }}
          />
          <Knob
            value={limiterThreshold}
            min={-12}
            max={0}
            step={0.1}
            size={36}
            label="Limiter"
            unit="dB"
            color="#ef4444"
            onChange={(v) => {
              setLimiterThreshold(v);
              engine?.setMasterLimiter(v);
            }}
          />
          <Knob
            value={masterVolume}
            min={0}
            max={1}
            step={0.01}
            size={36}
            label="Output"
            color="#10b981"
            onChange={setMasterVolume}
          />
        </div>
      </div>
    </div>
  );
}
