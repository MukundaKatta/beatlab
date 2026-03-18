"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface SpectrumAnalyzerProps {
  fftData: Float32Array | null;
  width: number;
  height: number;
}

export default function SpectrumAnalyzer({ fftData, width, height }: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, width, height);

    if (!fftData || fftData.length === 0) return;

    const barCount = Math.min(64, fftData.length);
    const barWidth = width / barCount - 1;
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, "#8b5cf6");
    gradient.addColorStop(0.5, "#06b6d4");
    gradient.addColorStop(1, "#ec4899");

    for (let i = 0; i < barCount; i++) {
      const value = fftData[i];
      const normalizedValue = Math.max(0, (value + 100) / 100);
      const barHeight = normalizedValue * height * 0.9;
      const x = i * (barWidth + 1);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      // Glow effect
      ctx.fillStyle = `rgba(139, 92, 246, ${normalizedValue * 0.15})`;
      ctx.fillRect(x - 1, height - barHeight - 2, barWidth + 2, barHeight + 4);
    }
  }, [fftData, width, height]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="rounded"
    />
  );
}
