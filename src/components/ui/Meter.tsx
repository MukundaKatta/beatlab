"use client";

import React from "react";

interface MeterProps {
  level: number; // dB value, typically -60 to 0
  peak?: number;
  orientation?: "vertical" | "horizontal";
  width?: number;
  height?: number;
}

export default function Meter({
  level,
  peak,
  orientation = "vertical",
  width = 8,
  height = 80,
}: MeterProps) {
  const normalizedLevel = Math.max(0, Math.min(1, (level + 60) / 60));
  const normalizedPeak = peak !== undefined ? Math.max(0, Math.min(1, (peak + 60) / 60)) : undefined;

  const getColor = (pos: number) => {
    if (pos > 0.92) return "#ef4444";
    if (pos > 0.75) return "#f59e0b";
    return "#10b981";
  };

  if (orientation === "horizontal") {
    return (
      <div
        className="relative bg-bg-primary rounded-sm overflow-hidden"
        style={{ width: height, height: width }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-sm transition-[width] duration-75"
          style={{
            width: `${normalizedLevel * 100}%`,
            background: `linear-gradient(to right, #10b981, #f59e0b 75%, #ef4444 95%)`,
          }}
        />
        {normalizedPeak !== undefined && (
          <div
            className="absolute top-0 h-full w-0.5 bg-white/80"
            style={{ left: `${normalizedPeak * 100}%` }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="relative bg-bg-primary rounded-sm overflow-hidden"
      style={{ width, height }}
    >
      <div
        className="absolute bottom-0 left-0 w-full rounded-sm transition-[height] duration-75"
        style={{
          height: `${normalizedLevel * 100}%`,
          background: `linear-gradient(to top, #10b981, #f59e0b 75%, #ef4444 95%)`,
        }}
      />
      {normalizedPeak !== undefined && (
        <div
          className="absolute left-0 w-full h-0.5 bg-white/80"
          style={{ bottom: `${normalizedPeak * 100}%` }}
        />
      )}
      {/* Tick marks */}
      {[0, -6, -12, -24, -48].map((db) => {
        const pos = ((db + 60) / 60) * 100;
        return (
          <div
            key={db}
            className="absolute right-0 w-1 h-px bg-text-muted/30"
            style={{ bottom: `${pos}%` }}
          />
        );
      })}
    </div>
  );
}
