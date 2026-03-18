"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useProjectStore } from "@/store/project-store";
import { getAudioEngine, disposeAudioEngine } from "@/lib/audio-engine";

export function useAudioEngine() {
  const engineRef = useRef<ReturnType<typeof getAudioEngine> | null>(null);
  const animFrameRef = useRef<number>(0);
  const [isReady, setIsReady] = useState(false);
  const [meterLevel, setMeterLevel] = useState(-60);
  const [fftData, setFftData] = useState<Float32Array | null>(null);
  const [waveformData, setWaveformData] = useState<Float32Array | null>(null);

  const {
    project,
    transport,
    setPlaying,
    setCurrentTime,
    masterVolume,
  } = useProjectStore();

  const init = useCallback(async () => {
    if (!engineRef.current) {
      engineRef.current = getAudioEngine();
    }
    await engineRef.current.initialize();
    engineRef.current.setBPM(project.bpm);
    engineRef.current.setMasterVolume(masterVolume);
    setIsReady(true);
  }, [project.bpm, masterVolume]);

  // Sync tracks to audio engine
  useEffect(() => {
    if (!engineRef.current || !isReady) return;
    for (const track of project.tracks) {
      engineRef.current.createTrackChannel(track);
    }
  }, [project.tracks, isReady]);

  // Sync BPM
  useEffect(() => {
    if (engineRef.current && isReady) {
      engineRef.current.setBPM(project.bpm);
    }
  }, [project.bpm, isReady]);

  // Sync master volume
  useEffect(() => {
    if (engineRef.current && isReady) {
      engineRef.current.setMasterVolume(masterVolume);
    }
  }, [masterVolume, isReady]);

  // Transport animation loop
  useEffect(() => {
    if (!engineRef.current || !isReady) return;

    const tick = () => {
      if (engineRef.current) {
        const time = engineRef.current.getCurrentTime();
        setCurrentTime(time);
        setMeterLevel(engineRef.current.getMeterLevel());
        setFftData(engineRef.current.getFFTData());
        setWaveformData(engineRef.current.getWaveformData());
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    if (transport.isPlaying) {
      animFrameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [transport.isPlaying, isReady, setCurrentTime]);

  const play = useCallback(async () => {
    if (!isReady) await init();
    engineRef.current?.play();
    setPlaying(true);
  }, [isReady, init, setPlaying]);

  const pause = useCallback(() => {
    engineRef.current?.pause();
    setPlaying(false);
  }, [setPlaying]);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setPlaying(false);
    setCurrentTime(0);
  }, [setPlaying, setCurrentTime]);

  const seek = useCallback(
    (time: number) => {
      engineRef.current?.seek(time);
      setCurrentTime(time);
    },
    [setCurrentTime]
  );

  const setTrackVolume = useCallback((trackId: string, volume: number) => {
    engineRef.current?.setTrackVolume(trackId, volume);
  }, []);

  const setTrackPan = useCallback((trackId: string, pan: number) => {
    engineRef.current?.setTrackPan(trackId, pan);
  }, []);

  const setTrackMute = useCallback((trackId: string, muted: boolean) => {
    engineRef.current?.setTrackMute(trackId, muted);
  }, []);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      disposeAudioEngine();
    };
  }, []);

  return {
    init,
    isReady,
    play,
    pause,
    stop,
    seek,
    setTrackVolume,
    setTrackPan,
    setTrackMute,
    meterLevel,
    fftData,
    waveformData,
    engine: engineRef.current,
  };
}
