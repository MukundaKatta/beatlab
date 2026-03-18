"use client";

import { useEffect, useCallback } from "react";
import { useProjectStore } from "@/store/project-store";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { exportProjectToMidi, downloadMidiFile } from "@/lib/midi-export";

export function useKeyboardShortcuts() {
  const {
    project,
    transport,
    zoom,
    snapToGrid,
    activeTrackId,
    setZoom,
    toggleSnapToGrid,
    toggleLoop,
    removeTrack,
    setSidePanel,
    sidePanel,
  } = useProjectStore();

  const { play, pause, stop, seek, init, isReady } = useAudioEngine();

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return;
      }

      switch (e.code) {
        case "Space": {
          e.preventDefault();
          if (!isReady) await init();
          if (transport.isPlaying) {
            pause();
          } else {
            play();
          }
          break;
        }

        case "Enter": {
          e.preventDefault();
          stop();
          break;
        }

        case "KeyL": {
          if (!e.metaKey && !e.ctrlKey) {
            toggleLoop();
          }
          break;
        }

        case "KeyG": {
          if (!e.metaKey && !e.ctrlKey) {
            toggleSnapToGrid();
          }
          break;
        }

        case "Equal":
        case "NumpadAdd": {
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            setZoom(zoom + 10);
          }
          break;
        }

        case "Minus":
        case "NumpadSubtract": {
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            setZoom(zoom - 10);
          }
          break;
        }

        case "Home": {
          e.preventDefault();
          seek(0);
          break;
        }

        case "End": {
          e.preventDefault();
          seek(project.duration);
          break;
        }

        case "Delete":
        case "Backspace": {
          if (activeTrackId && !e.metaKey) {
            // Don't delete track on backspace unless explicitly intended
          }
          break;
        }

        case "KeyE": {
          if (!e.metaKey && !e.ctrlKey) {
            setSidePanel(sidePanel === "effects" ? null : "effects");
          }
          break;
        }

        case "KeyC": {
          if (!e.metaKey && !e.ctrlKey) {
            setSidePanel(sidePanel === "chords" ? null : "chords");
          }
          break;
        }

        case "KeyM": {
          if (e.metaKey || e.ctrlKey) {
            // Cmd+M = export MIDI
            e.preventDefault();
            const midiData = exportProjectToMidi(project);
            downloadMidiFile(midiData, `${project.name || "beatlab"}.mid`);
          } else {
            setSidePanel(sidePanel === "mastering" ? null : "mastering");
          }
          break;
        }

        case "Digit1":
        case "Digit2":
        case "Digit3":
        case "Digit4":
        case "Digit5": {
          if (!e.metaKey && !e.ctrlKey) {
            const panelMap = ["effects", "chords", "mastering", "samples", "waveform"] as const;
            const idx = parseInt(e.code.replace("Digit", "")) - 1;
            if (idx >= 0 && idx < panelMap.length) {
              setSidePanel(sidePanel === panelMap[idx] ? null : panelMap[idx]);
            }
          }
          break;
        }
      }
    },
    [
      transport.isPlaying,
      isReady,
      init,
      play,
      pause,
      stop,
      seek,
      zoom,
      setZoom,
      toggleLoop,
      toggleSnapToGrid,
      activeTrackId,
      project,
      sidePanel,
      setSidePanel,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
