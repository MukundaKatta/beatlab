import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0a0f",
          secondary: "#111118",
          tertiary: "#1a1a24",
          elevated: "#222233",
        },
        accent: {
          purple: "#8b5cf6",
          "purple-light": "#a78bfa",
          "purple-dark": "#6d28d9",
          blue: "#3b82f6",
          cyan: "#06b6d4",
          green: "#10b981",
          orange: "#f59e0b",
          red: "#ef4444",
          pink: "#ec4899",
        },
        surface: {
          light: "#2a2a3e",
          DEFAULT: "#1e1e2e",
          dark: "#141420",
        },
        text: {
          primary: "#f1f1f6",
          secondary: "#a0a0b8",
          muted: "#6b6b80",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "waveform": "waveform 1.5s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(139, 92, 246, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.6)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "waveform": {
          "0%, 100%": { height: "4px" },
          "50%": { height: "20px" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
