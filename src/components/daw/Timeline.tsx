"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import { useProjectStore } from "@/store/project-store";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import TrackHeader from "./TrackHeader";
import TimelineRuler from "./TimelineRuler";
import TimelineGrid from "./TimelineGrid";
import ClipView from "./ClipView";
import {
  generateMelody,
  generateBassline,
  generateDrumPattern,
  generateHarmony,
  generateChordProgression,
} from "@/lib/music-theory";
import { v4 as uuidv4 } from "uuid";

const TRACK_HEADER_WIDTH = 200;
const TRACK_HEIGHT = 80;

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineWidth, setTimelineWidth] = useState(800);

  const {
    project,
    zoom,
    scrollX,
    scrollY,
    activeTrackId,
    isGenerating,
    setScrollX,
    setScrollY,
    setZoom,
    setGenerating,
    addClip,
    setActiveTrack,
  } = useProjectStore();

  const { seek } = useAudioEngine();

  // Measure timeline width
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTimelineWidth(entry.contentRect.width - TRACK_HEADER_WIDTH);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle scroll
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -5 : 5;
        setZoom(zoom + delta);
      } else if (e.shiftKey) {
        setScrollX(scrollX + e.deltaY);
      } else {
        setScrollY(scrollY + e.deltaY);
      }
    },
    [zoom, scrollX, scrollY, setZoom, setScrollX, setScrollY]
  );

  // Click on empty timeline area to seek
  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const time = (x + scrollX) / zoom;
      seek(Math.max(0, time));
    },
    [scrollX, zoom, seek]
  );

  // Generate content for a track
  const handleGenerate = useCallback(
    async (trackId: string) => {
      const track = project.tracks.find((t) => t.id === trackId);
      if (!track) return;

      setGenerating(trackId, true);

      // Simulate async generation delay
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

      const bpm = project.bpm;
      const bars = 4;
      const beatDuration = 60 / bpm;
      const clipDuration = bars * 4 * beatDuration;
      let midiNotes;

      const chordProg = generateChordProgression(project.key, project.scale, "pop", bars);

      switch (track.type) {
        case "drums":
          midiNotes = generateDrumPattern(bars, bpm, "basic", 0.6);
          break;
        case "bass":
          midiNotes = generateBassline(chordProg, 2, bpm, "walking");
          break;
        case "melody":
          midiNotes = generateMelody(project.key, project.scale, 4, bars, bpm, 0.6);
          break;
        case "harmony":
          midiNotes = generateHarmony(chordProg, 4, bpm, "block");
          break;
        default:
          midiNotes = generateMelody(project.key, project.scale, 3, bars, bpm, 0.4);
      }

      // Find the last clip end time to place new clip after existing ones
      const lastEnd = track.clips.reduce(
        (max, c) => Math.max(max, c.startTime + c.duration),
        0
      );

      addClip(trackId, {
        trackId,
        startTime: lastEnd,
        duration: clipDuration,
        midiNotes,
        color: track.color,
        name: `${track.type} gen ${track.clips.length + 1}`,
        gain: 1,
      });

      setGenerating(trackId, false);
    },
    [project, addClip, setGenerating]
  );

  const pixelsPerSecond = zoom;
  const totalHeight = project.tracks.length * TRACK_HEIGHT;

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col overflow-hidden"
      onWheel={handleWheel}
    >
      {/* Ruler row */}
      <div className="flex" style={{ height: 24 }}>
        <div
          className="bg-bg-primary border-b border-r border-surface-light flex items-center justify-center"
          style={{ width: TRACK_HEADER_WIDTH, minWidth: TRACK_HEADER_WIDTH }}
        >
          <span className="text-[10px] text-text-muted font-mono">
            {project.tracks.length} tracks
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <TimelineRuler width={timelineWidth} />
        </div>
      </div>

      {/* Tracks area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track headers */}
        <div
          className="overflow-y-auto overflow-x-hidden"
          style={{
            width: TRACK_HEADER_WIDTH,
            minWidth: TRACK_HEADER_WIDTH,
            transform: `translateY(${-scrollY}px)`,
          }}
        >
          {project.tracks.map((track) => (
            <div key={track.id} style={{ height: TRACK_HEIGHT }}>
              <TrackHeader
                track={track}
                isActive={activeTrackId === track.id}
                isGenerating={isGenerating[track.id] || false}
                onGenerate={handleGenerate}
              />
            </div>
          ))}
        </div>

        {/* Timeline content */}
        <div
          ref={timelineRef}
          className="flex-1 relative overflow-hidden bg-bg-primary cursor-crosshair"
          onClick={handleTimelineClick}
        >
          {/* Grid overlay */}
          <TimelineGrid width={timelineWidth} height={Math.max(totalHeight, 400)} />

          {/* Track lanes */}
          <div
            style={{ transform: `translateY(${-scrollY}px)` }}
          >
            {project.tracks.map((track, index) => (
              <div
                key={track.id}
                className={`relative border-b border-surface-light/30
                  ${activeTrackId === track.id ? "bg-white/[0.02]" : ""}
                  ${track.muted ? "opacity-50" : ""}`}
                style={{ height: TRACK_HEIGHT }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTrack(track.id);
                }}
              >
                {/* Clips */}
                {track.clips.map((clip) => (
                  <ClipView
                    key={clip.id}
                    clip={clip}
                    trackId={track.id}
                    trackColor={track.color}
                    pixelsPerSecond={pixelsPerSecond}
                    trackHeight={TRACK_HEIGHT}
                    scrollX={scrollX}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Empty state */}
          {project.tracks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-text-muted">
                <p className="text-sm">No tracks yet</p>
                <p className="text-xs mt-1">Add a track to start creating</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
