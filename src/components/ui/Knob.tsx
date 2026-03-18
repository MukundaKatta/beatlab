"use client";

import React, { useCallback, useRef, useState } from "react";

interface KnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  size?: number;
  label?: string;
  unit?: string;
  color?: string;
  onChange: (value: number) => void;
}

export default function Knob({
  value,
  min,
  max,
  step = 0.01,
  size = 40,
  label,
  unit,
  color = "#8b5cf6",
  onChange,
}: KnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  const normalizedValue = (value - min) / (max - min);
  const angle = -135 + normalizedValue * 270;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startYRef.current = e.clientY;
      startValueRef.current = value;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaY = startYRef.current - e.clientY;
        const range = max - min;
        const sensitivity = e.shiftKey ? 0.001 : 0.005;
        const newValue = startValueRef.current + deltaY * range * sensitivity;
        const stepped = Math.round(newValue / step) * step;
        onChange(Math.max(min, Math.min(max, stepped)));
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [value, min, max, step, onChange]
  );

  const handleDoubleClick = useCallback(() => {
    const defaultValue = (min + max) / 2;
    onChange(Math.round(defaultValue / step) * step);
  }, [min, max, step, onChange]);

  const r = (size - 6) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r * (270 / 360);
  const offset = circumference * (1 - normalizedValue);

  const displayValue =
    step >= 1 ? Math.round(value) : value.toFixed(step < 0.1 ? 2 : 1);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative cursor-pointer select-none"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <svg width={size} height={size} className="transform -rotate-[135deg]">
          {/* Background arc */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#1a1a24"
            strokeWidth={3}
            strokeDasharray={`${circumference} ${2 * Math.PI * r - circumference}`}
            strokeLinecap="round"
          />
          {/* Value arc */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={isDragging ? color : `${color}cc`}
            strokeWidth={3}
            strokeDasharray={`${circumference - offset} ${2 * Math.PI * r - (circumference - offset)}`}
            strokeLinecap="round"
            className="transition-colors duration-100"
          />
        </svg>
        {/* Indicator dot */}
        <div
          className="absolute w-1.5 h-1.5 rounded-full bg-white"
          style={{
            top: cy - r * Math.cos((angle * Math.PI) / 180) - 3,
            left: cx + r * Math.sin((angle * Math.PI) / 180) - 3,
          }}
        />
      </div>
      {label && (
        <span className="text-[10px] text-text-muted truncate max-w-[60px] text-center">
          {label}
        </span>
      )}
      <span className="text-[10px] text-text-secondary font-mono">
        {displayValue}
        {unit ? unit : ""}
      </span>
    </div>
  );
}
