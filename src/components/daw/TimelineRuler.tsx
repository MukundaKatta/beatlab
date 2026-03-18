"use client";

import React, { useCallback, useRef } from "react";
import { useProjectStore } from "@/store/project-store";
import { useAudioEngine } from "@/hooks/useAudioEngine";

interface TimelineRulerProps {
  width: number;
}

export default function TimelineRuler({ width }: TimelineRulerProps) {
  const { project, transport, zoom, scrollX } = useProjectStore();
  const { seek } = useAudioEngine();

  const pixelsPerSecond = zoom;
  const bpm = project.bpm;
  const beatDuration = 60 / bpm;
  const barDuration = beatDuration * 4;

  const visibleStart = scrollX / pixelsPerSecond;
  const visibleEnd = visibleStart + width / pixelsPerSecond;

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = (x + scrollX) / pixelsPerSecond;
      seek(Math.max(0, time));
    },
    [scrollX, pixelsPerSecond, seek]
  );

  const markers: { x: number; label: string; isMajor: boolean }[] = [];
  const startBar = Math.floor(visibleStart / barDuration);
  const endBar = Math.ceil(visibleEnd / barDuration) + 1;

  for (let bar = startBar; bar <= endBar; bar++) {
    const barTime = bar * barDuration;
    const x = barTime * pixelsPerSecond - scrollX;
    if (x >= -50 && x <= width + 50) {
      markers.push({ x, label: `${bar + 1}`, isMajor: true });

      if (pixelsPerSecond > 40) {
        for (let beat = 1; beat < 4; beat++) {
          const beatTime = barTime + beat * beatDuration;
          const bx = beatTime * pixelsPerSecond - scrollX;
          if (bx >= 0 && bx <= width) {
            markers.push({ x: bx, label: `${beat + 1}`, isMajor: false });
          }
        }
      }
    }
  }

  const playheadX = transport.currentTime * pixelsPerSecond - scrollX;

  return (
    <svg
      width={width}
      height={24}
      className="bg-bg-primary border-b border-surface-light cursor-pointer select-none"
      onClick={handleClick}
    >
      {/* Markers */}
      {markers.map((m, i) => (
        <g key={i}>
          <line
            x1={m.x}
            y1={m.isMajor ? 14 : 18}
            x2={m.x}
            y2={24}
            stroke={m.isMajor ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}
            strokeWidth={1}
          />
          {m.isMajor && (
            <text
              x={m.x + 3}
              y={11}
              fill="rgba(255,255,255,0.4)"
              fontSize={9}
              fontFamily="monospace"
            >
              {m.label}
            </text>
          )}
        </g>
      ))}

      {/* Loop markers */}
      {transport.loopEnabled && (
        <>
          <rect
            x={transport.loopStart * pixelsPerSecond - scrollX}
            y={0}
            width={(transport.loopEnd - transport.loopStart) * pixelsPerSecond}
            height={24}
            fill="rgba(6, 182, 212, 0.1)"
          />
          <line
            x1={transport.loopStart * pixelsPerSecond - scrollX}
            y1={0}
            x2={transport.loopStart * pixelsPerSecond - scrollX}
            y2={24}
            stroke="#06b6d4"
            strokeWidth={2}
          />
          <line
            x1={transport.loopEnd * pixelsPerSecond - scrollX}
            y1={0}
            x2={transport.loopEnd * pixelsPerSecond - scrollX}
            y2={24}
            stroke="#06b6d4"
            strokeWidth={2}
          />
        </>
      )}

      {/* Playhead */}
      {playheadX >= 0 && playheadX <= width && (
        <polygon
          points={`${playheadX - 5},0 ${playheadX + 5},0 ${playheadX},8`}
          fill="#ffffff"
        />
      )}
    </svg>
  );
}
