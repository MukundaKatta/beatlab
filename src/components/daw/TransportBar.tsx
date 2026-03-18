"use client";

import React, { useCallback } from "react";
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Repeat,
  Circle,
  Magnet,
  ZoomIn,
  ZoomOut,
  Download,
  Music,
} from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { exportProjectToMidi, downloadMidiFile } from "@/lib/midi-export";
import Meter from "@/components/ui/Meter";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

function formatBars(seconds: number, bpm: number): string {
  const beatsPerSecond = bpm / 60;
  const totalBeats = seconds * beatsPerSecond;
  const bar = Math.floor(totalBeats / 4) + 1;
  const beat = Math.floor(totalBeats % 4) + 1;
  const tick = Math.floor((totalBeats % 1) * 4) + 1;
  return `${bar}.${beat}.${tick}`;
}

export default function TransportBar() {
  const {
    project,
    transport,
    zoom,
    snapToGrid,
    masterVolume,
    setZoom,
    toggleSnapToGrid,
    toggleLoop,
    setMasterVolume,
    setBpm,
    setKey,
    setScale,
  } = useProjectStore();

  const { play, pause, stop, seek, isReady, meterLevel, init } = useAudioEngine();

  const handlePlayPause = useCallback(async () => {
    if (!isReady) await init();
    if (transport.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [transport.isPlaying, isReady, init, play, pause]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const handleSkipBack = useCallback(() => {
    seek(0);
  }, [seek]);

  const handleSkipForward = useCallback(() => {
    seek(project.duration);
  }, [seek, project.duration]);

  const handleExportMidi = useCallback(() => {
    const midiData = exportProjectToMidi(project);
    downloadMidiFile(midiData, `${project.name || "beatlab-project"}.mid`);
  }, [project]);

  const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const scales = [
    "major", "minor", "dorian", "mixolydian", "phrygian",
    "lydian", "aeolian", "locrian", "pentatonic", "blues", "harmonic-minor",
  ];

  return (
    <div className="h-14 bg-bg-secondary border-b border-surface-light flex items-center px-3 gap-2 select-none">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-3 pr-3 border-r border-surface-light">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
          <Music size={14} className="text-white" />
        </div>
        <span className="text-sm font-bold text-gradient hidden lg:block">BeatLab</span>
      </div>

      {/* Transport controls */}
      <div className="flex items-center gap-1">
        <button onClick={handleSkipBack} className="btn-icon" title="Skip to start">
          <SkipBack size={16} />
        </button>
        <button
          onClick={handlePlayPause}
          className={`btn-icon ${transport.isPlaying ? "text-accent-green" : ""}`}
          title={transport.isPlaying ? "Pause" : "Play"}
        >
          {transport.isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button onClick={handleStop} className="btn-icon" title="Stop">
          <Square size={16} />
        </button>
        <button onClick={handleSkipForward} className="btn-icon" title="Skip to end">
          <SkipForward size={16} />
        </button>
        <button
          onClick={toggleLoop}
          className={`btn-icon ${transport.loopEnabled ? "text-accent-cyan" : ""}`}
          title="Toggle loop"
        >
          <Repeat size={16} />
        </button>
        <button
          className={`btn-icon ${transport.isRecording ? "text-accent-red animate-pulse" : ""}`}
          title="Record"
        >
          <Circle size={16} fill={transport.isRecording ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Time display */}
      <div className="flex items-center gap-2 px-3 border-l border-r border-surface-light">
        <div className="text-center">
          <div className="text-sm font-mono text-text-primary font-medium tracking-wider">
            {formatTime(transport.currentTime)}
          </div>
          <div className="text-[10px] text-text-muted font-mono">
            {formatBars(transport.currentTime, project.bpm)}
          </div>
        </div>
      </div>

      {/* BPM */}
      <div className="flex items-center gap-1.5 px-2">
        <label className="text-[10px] text-text-muted uppercase tracking-wider">BPM</label>
        <input
          type="number"
          value={project.bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="input-field w-16 text-center py-1 text-xs font-mono"
          min={20}
          max={300}
        />
      </div>

      {/* Key & Scale */}
      <div className="flex items-center gap-1.5 px-2 border-l border-surface-light">
        <label className="text-[10px] text-text-muted uppercase tracking-wider">Key</label>
        <select
          value={project.key}
          onChange={(e) => setKey(e.target.value as any)}
          className="select-field py-1 text-xs w-14"
        >
          {keys.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <select
          value={project.scale}
          onChange={(e) => setScale(e.target.value as any)}
          className="select-field py-1 text-xs w-28"
        >
          {scales.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Snap & Zoom */}
      <div className="flex items-center gap-1 px-2 border-l border-surface-light">
        <button
          onClick={toggleSnapToGrid}
          className={`btn-icon ${snapToGrid ? "text-accent-orange" : ""}`}
          title="Snap to grid"
        >
          <Magnet size={14} />
        </button>
        <button onClick={() => setZoom(zoom - 10)} className="btn-icon" title="Zoom out">
          <ZoomOut size={14} />
        </button>
        <div className="text-[10px] text-text-muted font-mono w-8 text-center">
          {Math.round(zoom)}%
        </div>
        <button onClick={() => setZoom(zoom + 10)} className="btn-icon" title="Zoom in">
          <ZoomIn size={14} />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Master volume */}
      <div className="flex items-center gap-2 px-2 border-l border-surface-light">
        <Meter level={meterLevel} height={36} width={6} />
        <div className="flex flex-col items-center">
          <label className="text-[10px] text-text-muted">Master</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={masterVolume}
            onChange={(e) => setMasterVolume(Number(e.target.value))}
            className="slider-track w-16"
          />
        </div>
      </div>

      {/* Export */}
      <button onClick={handleExportMidi} className="btn-ghost flex items-center gap-1" title="Export MIDI">
        <Download size={14} />
        <span className="text-xs hidden xl:inline">MIDI</span>
      </button>
    </div>
  );
}
