"use client";

import React, { useRef, useCallback, useMemo } from "react";
import { useProjectStore } from "@/store/project-store";

interface TimelineGridProps {
  width: number;
  height: number;
}

export default function TimelineGrid({ width, height }: TimelineGridProps) {
  const { project, transport, zoom, scrollX } = useProjectStore();
  const pixelsPerSecond = zoom;
  const bpm = project.bpm;
  const beatDuration = 60 / bpm;
  const barDuration = beatDuration * 4;

  const totalWidth = project.duration * pixelsPerSecond;
  const visibleStart = scrollX / pixelsPerSecond;
  const visibleEnd = visibleStart + width / pixelsPerSecond;

  const gridLines = useMemo(() => {
    const lines: { x: number; isBeat: boolean; isBar: boolean; label?: string }[] = [];
    const startBar = Math.floor(visibleStart / barDuration);
    const endBar = Math.ceil(visibleEnd / barDuration) + 1;

    for (let bar = startBar; bar <= endBar; bar++) {
      const barTime = bar * barDuration;
      const barX = barTime * pixelsPerSecond - scrollX;

      if (barX >= -50 && barX <= width + 50) {
        lines.push({
          x: barX,
          isBeat: false,
          isBar: true,
          label: `${bar + 1}`,
        });

        // Beat lines
        for (let beat = 1; beat < 4; beat++) {
          const beatTime = barTime + beat * beatDuration;
          const beatX = beatTime * pixelsPerSecond - scrollX;
          if (beatX >= 0 && beatX <= width) {
            lines.push({ x: beatX, isBeat: true, isBar: false });
          }
        }
      }
    }

    return lines;
  }, [visibleStart, visibleEnd, barDuration, beatDuration, pixelsPerSecond, scrollX, width]);

  // Playhead position
  const playheadX = transport.currentTime * pixelsPerSecond - scrollX;

  return (
    <svg
      width={width}
      height={height}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ overflow: "visible" }}
    >
      {/* Grid lines */}
      {gridLines.map((line, i) => (
        <line
          key={i}
          x1={line.x}
          y1={0}
          x2={line.x}
          y2={height}
          stroke={line.isBar ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)"}
          strokeWidth={line.isBar ? 1 : 0.5}
        />
      ))}

      {/* Loop region */}
      {transport.loopEnabled && (
        <rect
          x={transport.loopStart * pixelsPerSecond - scrollX}
          y={0}
          width={(transport.loopEnd - transport.loopStart) * pixelsPerSecond}
          height={height}
          fill="rgba(6, 182, 212, 0.05)"
          stroke="rgba(6, 182, 212, 0.3)"
          strokeWidth={1}
        />
      )}

      {/* Playhead */}
      {playheadX >= 0 && playheadX <= width && (
        <>
          <line
            x1={playheadX}
            y1={0}
            x2={playheadX}
            y2={height}
            stroke="#ffffff"
            strokeWidth={1.5}
          />
          <polygon
            points={`${playheadX - 5},0 ${playheadX + 5},0 ${playheadX},8`}
            fill="#ffffff"
          />
        </>
      )}
    </svg>
  );
}
