import type { MasteringPreset } from "@/types";

export const MASTERING_PRESETS: MasteringPreset[] = [
  {
    id: "warm-analog",
    name: "Warm Analog",
    description: "Classic analog warmth with gentle saturation and smooth highs",
    settings: {
      loudness: 0.7,
      stereoWidth: 1.1,
      lowCut: 30,
      highCut: 18000,
      compression: 0.4,
      limiterThreshold: -1,
      eq: [
        { frequency: 80, gain: 2, q: 0.8 },
        { frequency: 250, gain: -1.5, q: 1.2 },
        { frequency: 3000, gain: 1.5, q: 0.9 },
        { frequency: 10000, gain: -1, q: 0.7 },
      ],
    },
  },
  {
    id: "modern-loud",
    name: "Modern Loud",
    description: "Competitive loudness for streaming with controlled dynamics",
    settings: {
      loudness: 0.9,
      stereoWidth: 1.2,
      lowCut: 35,
      highCut: 19000,
      compression: 0.7,
      limiterThreshold: -0.3,
      eq: [
        { frequency: 60, gain: 3, q: 1 },
        { frequency: 200, gain: -2, q: 1 },
        { frequency: 4000, gain: 2, q: 0.8 },
        { frequency: 12000, gain: 2.5, q: 0.6 },
      ],
    },
  },
  {
    id: "hip-hop",
    name: "Hip Hop / Trap",
    description: "Heavy low end with crisp highs and aggressive compression",
    settings: {
      loudness: 0.85,
      stereoWidth: 1.15,
      lowCut: 25,
      highCut: 18500,
      compression: 0.65,
      limiterThreshold: -0.5,
      eq: [
        { frequency: 50, gain: 4, q: 0.9 },
        { frequency: 120, gain: 2, q: 1.1 },
        { frequency: 500, gain: -2, q: 1.5 },
        { frequency: 8000, gain: 3, q: 0.7 },
        { frequency: 15000, gain: 1.5, q: 0.5 },
      ],
    },
  },
  {
    id: "edm-festival",
    name: "EDM / Festival",
    description: "Maximum energy with wide stereo and punchy dynamics",
    settings: {
      loudness: 0.95,
      stereoWidth: 1.4,
      lowCut: 30,
      highCut: 19500,
      compression: 0.75,
      limiterThreshold: -0.2,
      eq: [
        { frequency: 40, gain: 3.5, q: 1 },
        { frequency: 300, gain: -2.5, q: 1.2 },
        { frequency: 2500, gain: 2, q: 0.8 },
        { frequency: 8000, gain: 3, q: 0.6 },
        { frequency: 16000, gain: 2, q: 0.5 },
      ],
    },
  },
  {
    id: "lo-fi",
    name: "Lo-Fi Chill",
    description: "Warm and muffled character with rolled-off highs",
    settings: {
      loudness: 0.5,
      stereoWidth: 0.9,
      lowCut: 40,
      highCut: 12000,
      compression: 0.3,
      limiterThreshold: -2,
      eq: [
        { frequency: 100, gain: 3, q: 0.7 },
        { frequency: 400, gain: 1, q: 1 },
        { frequency: 3000, gain: -2, q: 0.9 },
        { frequency: 8000, gain: -4, q: 0.5 },
      ],
    },
  },
  {
    id: "jazz-acoustic",
    name: "Jazz / Acoustic",
    description: "Natural dynamics with transparent EQ and subtle enhancement",
    settings: {
      loudness: 0.45,
      stereoWidth: 1.05,
      lowCut: 40,
      highCut: 20000,
      compression: 0.2,
      limiterThreshold: -3,
      eq: [
        { frequency: 80, gain: 1, q: 0.8 },
        { frequency: 500, gain: -0.5, q: 1.5 },
        { frequency: 2000, gain: 1, q: 0.9 },
        { frequency: 10000, gain: 1.5, q: 0.6 },
      ],
    },
  },
  {
    id: "rock",
    name: "Rock / Alternative",
    description: "Punchy mids with controlled bass and bright presence",
    settings: {
      loudness: 0.8,
      stereoWidth: 1.25,
      lowCut: 35,
      highCut: 18000,
      compression: 0.6,
      limiterThreshold: -0.8,
      eq: [
        { frequency: 60, gain: 2, q: 1 },
        { frequency: 200, gain: -1, q: 1.2 },
        { frequency: 1500, gain: 2.5, q: 0.8 },
        { frequency: 5000, gain: 2, q: 0.7 },
        { frequency: 12000, gain: 1, q: 0.5 },
      ],
    },
  },
  {
    id: "podcast",
    name: "Podcast / Voice",
    description: "Optimized for spoken word clarity and consistent levels",
    settings: {
      loudness: 0.6,
      stereoWidth: 0.8,
      lowCut: 80,
      highCut: 15000,
      compression: 0.55,
      limiterThreshold: -1.5,
      eq: [
        { frequency: 100, gain: -3, q: 1 },
        { frequency: 300, gain: -1, q: 1.5 },
        { frequency: 2500, gain: 3, q: 0.8 },
        { frequency: 6000, gain: 2, q: 0.7 },
      ],
    },
  },
];

export function getPresetById(id: string): MasteringPreset | undefined {
  return MASTERING_PRESETS.find((p) => p.id === id);
}

export function analyzeLoudness(level: number): {
  lufs: number;
  peak: number;
  dynamic: number;
  rating: "too quiet" | "good" | "loud" | "too loud";
} {
  const lufs = Math.max(-60, level);
  const peak = lufs + 3;
  const dynamic = Math.abs(lufs) * 0.3;

  let rating: "too quiet" | "good" | "loud" | "too loud";
  if (lufs < -16) rating = "too quiet";
  else if (lufs < -10) rating = "good";
  else if (lufs < -6) rating = "loud";
  else rating = "too loud";

  return { lufs, peak, dynamic, rating };
}
