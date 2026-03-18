"use client";

import * as Tone from "tone";
import type { Track, Effect, EffectType, TrackClip } from "@/types";

type ToneEffect =
  | Tone.Reverb
  | Tone.FeedbackDelay
  | Tone.Compressor
  | Tone.EQ3
  | Tone.Distortion
  | Tone.Chorus
  | Tone.Phaser
  | Tone.Filter
  | Tone.Limiter;

class AudioEngine {
  private players: Map<string, Tone.Player> = new Map();
  private channels: Map<string, Tone.Channel> = new Map();
  private effects: Map<string, ToneEffect[]> = new Map();
  private masterChannel: Tone.Channel;
  private masterCompressor: Tone.Compressor;
  private masterLimiter: Tone.Limiter;
  private masterEQ: Tone.EQ3;
  private analyser: Tone.Analyser;
  private waveformAnalyser: Tone.Analyser;
  private meter: Tone.Meter;
  private isInitialized = false;

  constructor() {
    this.masterEQ = new Tone.EQ3(0, 0, 0);
    this.masterCompressor = new Tone.Compressor(-12, 4);
    this.masterLimiter = new Tone.Limiter(-1);
    this.masterChannel = new Tone.Channel(0, 0);
    this.analyser = new Tone.Analyser("fft", 256);
    this.waveformAnalyser = new Tone.Analyser("waveform", 1024);
    this.meter = new Tone.Meter();

    this.masterChannel
      .chain(
        this.masterEQ,
        this.masterCompressor,
        this.masterLimiter,
        this.analyser,
        this.waveformAnalyser,
        this.meter,
        Tone.getDestination()
      );
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await Tone.start();
    this.isInitialized = true;
  }

  setBPM(bpm: number): void {
    Tone.getTransport().bpm.value = bpm;
  }

  createTrackChannel(track: Track): void {
    if (this.channels.has(track.id)) {
      this.disposeTrackChannel(track.id);
    }

    const channel = new Tone.Channel(
      Tone.gainToDb(track.volume),
      track.pan
    ).connect(this.masterChannel);

    channel.mute = track.muted;
    this.channels.set(track.id, channel);

    const toneEffects = track.effects
      .filter((e) => e.enabled)
      .map((e) => this.createEffect(e));

    this.effects.set(track.id, toneEffects);

    if (toneEffects.length > 0) {
      channel.disconnect();
      let chain: Tone.InputNode = channel;
      for (const fx of toneEffects) {
        (chain as Tone.ToneAudioNode).connect(fx);
        chain = fx;
      }
      (chain as Tone.ToneAudioNode).connect(this.masterChannel);
    }
  }

  private createEffect(effect: Effect): ToneEffect {
    switch (effect.type) {
      case "reverb": {
        const decay = effect.params.find((p) => p.name === "Decay")?.value ?? 2.5;
        const wet = effect.params.find((p) => p.name === "Mix")?.value ?? 0.3;
        const rev = new Tone.Reverb(decay);
        rev.wet.value = wet;
        return rev;
      }
      case "delay": {
        const time = effect.params.find((p) => p.name === "Time")?.value ?? 0.25;
        const feedback = effect.params.find((p) => p.name === "Feedback")?.value ?? 0.3;
        const wet = effect.params.find((p) => p.name === "Mix")?.value ?? 0.25;
        const del = new Tone.FeedbackDelay(time, feedback);
        del.wet.value = wet;
        return del;
      }
      case "compressor": {
        const threshold = effect.params.find((p) => p.name === "Threshold")?.value ?? -24;
        const ratio = effect.params.find((p) => p.name === "Ratio")?.value ?? 4;
        const attack = effect.params.find((p) => p.name === "Attack")?.value ?? 0.003;
        const release = effect.params.find((p) => p.name === "Release")?.value ?? 0.25;
        return new Tone.Compressor({ threshold, ratio, attack, release });
      }
      case "eq": {
        const low = effect.params.find((p) => p.name === "Low")?.value ?? 0;
        const mid = effect.params.find((p) => p.name === "Mid")?.value ?? 0;
        const high = effect.params.find((p) => p.name === "High")?.value ?? 0;
        return new Tone.EQ3(low, mid, high);
      }
      case "distortion": {
        const amount = effect.params.find((p) => p.name === "Drive")?.value ?? 0.4;
        const wet = effect.params.find((p) => p.name === "Mix")?.value ?? 1;
        const dist = new Tone.Distortion(amount);
        dist.wet.value = wet;
        return dist;
      }
      case "chorus": {
        const freq = effect.params.find((p) => p.name === "Rate")?.value ?? 1.5;
        const depth = effect.params.find((p) => p.name === "Depth")?.value ?? 0.7;
        const wet = effect.params.find((p) => p.name === "Mix")?.value ?? 0.5;
        const ch = new Tone.Chorus(freq, depth, 0.5);
        ch.wet.value = wet;
        return ch;
      }
      case "phaser": {
        const freq = effect.params.find((p) => p.name === "Rate")?.value ?? 0.5;
        const depth = effect.params.find((p) => p.name === "Depth")?.value ?? 10;
        const wet = effect.params.find((p) => p.name === "Mix")?.value ?? 0.5;
        const ph = new Tone.Phaser({ frequency: freq, octaves: depth, baseFrequency: 350 });
        ph.wet.value = wet;
        return ph;
      }
      case "filter": {
        const freq = effect.params.find((p) => p.name === "Frequency")?.value ?? 1000;
        const q = effect.params.find((p) => p.name === "Q")?.value ?? 1;
        return new Tone.Filter(freq, "lowpass", -12);
      }
      case "limiter": {
        const threshold = effect.params.find((p) => p.name === "Threshold")?.value ?? -1;
        return new Tone.Limiter(threshold);
      }
      default:
        return new Tone.Limiter(0);
    }
  }

  async loadClip(clip: TrackClip, trackId: string): Promise<void> {
    if (!clip.audioUrl) return;

    const channel = this.channels.get(trackId);
    if (!channel) return;

    const player = new Tone.Player({
      url: clip.audioUrl,
      onload: () => {
        const effectsChain = this.effects.get(trackId);
        if (effectsChain && effectsChain.length > 0) {
          player.connect(effectsChain[0]);
        } else {
          player.connect(channel);
        }
      },
    });

    this.players.set(clip.id, player);
  }

  playClip(clipId: string, startTime?: number): void {
    const player = this.players.get(clipId);
    if (player && player.loaded) {
      player.start(startTime);
    }
  }

  stopClip(clipId: string): void {
    const player = this.players.get(clipId);
    if (player && player.state === "started") {
      player.stop();
    }
  }

  play(): void {
    Tone.getTransport().start();
  }

  pause(): void {
    Tone.getTransport().pause();
  }

  stop(): void {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    this.players.forEach((player) => {
      if (player.state === "started") player.stop();
    });
  }

  seek(time: number): void {
    Tone.getTransport().seconds = time;
  }

  setLoop(start: number, end: number, enabled: boolean): void {
    const transport = Tone.getTransport();
    transport.loop = enabled;
    transport.loopStart = start;
    transport.loopEnd = end;
  }

  setTrackVolume(trackId: string, volume: number): void {
    const channel = this.channels.get(trackId);
    if (channel) {
      channel.volume.value = Tone.gainToDb(volume);
    }
  }

  setTrackPan(trackId: string, pan: number): void {
    const channel = this.channels.get(trackId);
    if (channel) {
      channel.pan.value = pan;
    }
  }

  setTrackMute(trackId: string, muted: boolean): void {
    const channel = this.channels.get(trackId);
    if (channel) {
      channel.mute = muted;
    }
  }

  setMasterVolume(volume: number): void {
    this.masterChannel.volume.value = Tone.gainToDb(volume);
  }

  setMasterEQ(low: number, mid: number, high: number): void {
    this.masterEQ.low.value = low;
    this.masterEQ.mid.value = mid;
    this.masterEQ.high.value = high;
  }

  setMasterCompression(threshold: number, ratio: number): void {
    this.masterCompressor.threshold.value = threshold;
    this.masterCompressor.ratio.value = ratio;
  }

  setMasterLimiter(threshold: number): void {
    this.masterLimiter.threshold.value = threshold;
  }

  getFFTData(): Float32Array {
    return this.analyser.getValue() as Float32Array;
  }

  getWaveformData(): Float32Array {
    return this.waveformAnalyser.getValue() as Float32Array;
  }

  getMeterLevel(): number {
    return this.meter.getValue() as number;
  }

  getCurrentTime(): number {
    return Tone.getTransport().seconds;
  }

  getTransportState(): string {
    return Tone.getTransport().state;
  }

  async exportToWav(): Promise<Blob> {
    const offlineContext = new OfflineAudioContext(2, 44100 * 120, 44100);
    const buffer = new ArrayBuffer(44);
    return new Blob([buffer], { type: "audio/wav" });
  }

  disposeTrackChannel(trackId: string): void {
    const channel = this.channels.get(trackId);
    if (channel) {
      channel.dispose();
      this.channels.delete(trackId);
    }

    const trackEffects = this.effects.get(trackId);
    if (trackEffects) {
      trackEffects.forEach((fx) => fx.dispose());
      this.effects.delete(trackId);
    }

    this.players.forEach((player, clipId) => {
      if (clipId.startsWith(trackId)) {
        player.dispose();
        this.players.delete(clipId);
      }
    });
  }

  dispose(): void {
    this.players.forEach((p) => p.dispose());
    this.channels.forEach((c) => c.dispose());
    this.effects.forEach((fxArr) => fxArr.forEach((fx) => fx.dispose()));
    this.masterChannel.dispose();
    this.masterCompressor.dispose();
    this.masterLimiter.dispose();
    this.masterEQ.dispose();
    this.analyser.dispose();
    this.waveformAnalyser.dispose();
    this.meter.dispose();
    this.players.clear();
    this.channels.clear();
    this.effects.clear();
  }
}

let engineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!engineInstance) {
    engineInstance = new AudioEngine();
  }
  return engineInstance;
}

export function disposeAudioEngine(): void {
  if (engineInstance) {
    engineInstance.dispose();
    engineInstance = null;
  }
}
