"use client";

import React, { useCallback, useRef, useState } from "react";
import type { TrackClip, MidiNote } from "@/types";
import { useProjectStore } from "@/store/project-store";

interface ClipViewProps {
  clip: TrackClip;
  trackId: string;
  trackColor: string;
  pixelsPerSecond: number;
  trackHeight: number;
  scrollX: number;
}

function MiniPianoRoll({
  notes,
  width,
  height,
  color,
  duration,
}: {
  notes: MidiNote[];
  width: number;
  height: number;
  color: string;
  duration: number;
}) {
  if (!notes || notes.length === 0) return null;

  const pitches = notes.map((n) => n.pitch);
  const minPitch = Math.min(...pitches);
  const maxPitch = Math.max(...pitches);
  const pitchRange = Math.max(maxPitch - minPitch, 12);

  return (
    <svg width={width} height={height} className="absolute inset-0">
      {notes.map((note, i) => {
        const x = (note.startTime / duration) * width;
        const w = Math.max(1, (note.duration / duration) * width);
        const y = height - ((note.pitch - minPitch) / pitchRange) * (height - 4) - 2;
        const h = Math.max(1, (height - 4) / pitchRange);

        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={h}
            rx={0.5}
            fill={color}
            opacity={note.velocity / 127 * 0.7 + 0.3}
          />
        );
      })}
    </svg>
  );
}

function MiniWaveform({
  width,
  height,
  color,
}: {
  width: number;
  height: number;
  color: string;
}) {
  // Deterministic pseudo-waveform visualization
  const bars: number[] = [];
  const barCount = Math.floor(width / 3);
  for (let i = 0; i < barCount; i++) {
    const t = i / barCount;
    const amp =
      0.3 +
      0.4 * Math.sin(t * Math.PI) +
      0.2 * Math.sin(t * 7) +
      0.1 * Math.sin(t * 13);
    bars.push(amp);
  }

  return (
    <svg width={width} height={height} className="absolute inset-0">
      {bars.map((amp, i) => {
        const barH = amp * (height - 4);
        const x = i * 3;
        const y = (height - barH) / 2;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={2}
            height={barH}
            rx={0.5}
            fill={color}
            opacity={0.6}
          />
        );
      })}
    </svg>
  );
}

export default function ClipView({
  clip,
  trackId,
  trackColor,
  pixelsPerSecond,
  trackHeight,
  scrollX,
}: ClipViewProps) {
  const { moveClip, resizeClip, removeClip, setSelection } = useProjectStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef({ x: 0, startTime: 0 });

  const x = clip.startTime * pixelsPerSecond - scrollX;
  const w = clip.duration * pixelsPerSecond;
  const clipHeight = trackHeight - 8;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const relativeX = e.clientX - rect.left;

      // Resize from right edge
      if (relativeX > w - 8) {
        setIsResizing(true);
        dragStartRef.current = { x: e.clientX, startTime: clip.duration };

        const handleMouseMove = (e: MouseEvent) => {
          const dx = e.clientX - dragStartRef.current.x;
          const newDuration = dragStartRef.current.startTime + dx / pixelsPerSecond;
          resizeClip(trackId, clip.id, newDuration);
        };

        const handleMouseUp = () => {
          setIsResizing(false);
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return;
      }

      // Drag move
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, startTime: clip.startTime };

      const handleMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - dragStartRef.current.x;
        const newStartTime = dragStartRef.current.startTime + dx / pixelsPerSecond;
        moveClip(trackId, clip.id, newStartTime);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [clip, trackId, w, pixelsPerSecond, moveClip, resizeClip]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelection({
        start: clip.startTime,
        end: clip.startTime + clip.duration,
        trackId,
      });
    },
    [clip, trackId, setSelection]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      removeClip(trackId, clip.id);
    },
    [trackId, clip.id, removeClip]
  );

  if (x + w < 0 || x > 2000) return null; // Off-screen culling

  const hasMidi = clip.midiNotes && clip.midiNotes.length > 0;

  return (
    <div
      className={`clip ${isDragging ? "opacity-80 scale-[1.01]" : ""} ${isResizing ? "cursor-ew-resize" : ""}`}
      style={{
        left: x,
        top: 4,
        width: Math.max(w, 4),
        height: clipHeight,
        backgroundColor: `${trackColor}25`,
        borderColor: `${trackColor}60`,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Clip header */}
      <div
        className="h-4 px-1.5 flex items-center text-[9px] font-medium truncate"
        style={{ backgroundColor: `${trackColor}40`, color: "#fff" }}
      >
        {clip.name}
      </div>

      {/* Clip content */}
      <div className="relative flex-1 overflow-hidden" style={{ height: clipHeight - 16 }}>
        {hasMidi ? (
          <MiniPianoRoll
            notes={clip.midiNotes!}
            width={Math.max(w, 4)}
            height={clipHeight - 16}
            color={trackColor}
            duration={clip.duration}
          />
        ) : (
          <MiniWaveform
            width={Math.max(w, 4)}
            height={clipHeight - 16}
            color={trackColor}
          />
        )}
      </div>

      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 w-2 h-full cursor-ew-resize hover:bg-white/10"
      />
    </div>
  );
}
