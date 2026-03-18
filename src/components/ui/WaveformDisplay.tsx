"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface WaveformDisplayProps {
  data: Float32Array | number[] | null;
  width: number;
  height: number;
  color?: string;
  backgroundColor?: string;
  selectionStart?: number;
  selectionEnd?: number;
  playheadPosition?: number;
  onSelectionChange?: (start: number, end: number) => void;
  onClick?: (position: number) => void;
  interactive?: boolean;
}

export default function WaveformDisplay({
  data,
  width,
  height,
  color = "#8b5cf6",
  backgroundColor = "transparent",
  selectionStart,
  selectionEnd,
  playheadPosition,
  onSelectionChange,
  onClick,
  interactive = false,
}: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Selection highlight
    if (selectionStart !== undefined && selectionEnd !== undefined) {
      const x1 = selectionStart * width;
      const x2 = selectionEnd * width;
      ctx.fillStyle = `${color}20`;
      ctx.fillRect(x1, 0, x2 - x1, height);
      ctx.strokeStyle = `${color}60`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, 0);
      ctx.lineTo(x1, height);
      ctx.moveTo(x2, 0);
      ctx.lineTo(x2, height);
      ctx.stroke();
    }

    if (!data || data.length === 0) {
      // Draw empty state
      ctx.strokeStyle = `${color}30`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    const samples = Array.from(data);
    const step = samples.length / width;
    const midY = height / 2;

    // Draw waveform
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, midY);

    for (let x = 0; x < width; x++) {
      const idx = Math.floor(x * step);
      const value = samples[idx] || 0;
      const y = midY - value * midY * 0.9;
      ctx.lineTo(x, y);
    }

    ctx.stroke();

    // Fill under curve
    ctx.lineTo(width, midY);
    ctx.lineTo(0, midY);
    ctx.closePath();
    ctx.fillStyle = `${color}15`;
    ctx.fill();

    // Mirror
    ctx.strokeStyle = `${color}60`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);

    for (let x = 0; x < width; x++) {
      const idx = Math.floor(x * step);
      const value = samples[idx] || 0;
      const y = midY + Math.abs(value) * midY * 0.9;
      ctx.lineTo(x, y);
    }

    ctx.stroke();

    // Playhead
    if (playheadPosition !== undefined && playheadPosition >= 0 && playheadPosition <= 1) {
      const px = playheadPosition * width;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
    }

    // Center line
    ctx.strokeStyle = `${color}30`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();
  }, [data, width, height, color, backgroundColor, selectionStart, selectionEnd, playheadPosition]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pos = (e.clientX - rect.left) / rect.width;
      isDraggingRef.current = true;
      dragStartRef.current = pos;
    },
    [interactive]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive || !isDraggingRef.current || !onSelectionChange) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const start = Math.min(dragStartRef.current, pos);
      const end = Math.max(dragStartRef.current, pos);
      onSelectionChange(start, end);
    },
    [interactive, onSelectionChange]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive) return;
      isDraggingRef.current = false;
      if (onClick) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const pos = (e.clientX - rect.left) / rect.width;
        if (Math.abs(pos - dragStartRef.current) < 0.01) {
          onClick(pos);
        }
      }
    },
    [interactive, onClick]
  );

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width, height }}
      className={interactive ? "cursor-crosshair" : ""}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
}
