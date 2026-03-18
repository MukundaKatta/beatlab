# BeatLab

Browser-based digital audio workstation (DAW) for composing, arranging, and producing music with AI assistance.

<!-- Add screenshot here -->

## Features

- **Multi-Track Timeline** — Arrange audio and MIDI tracks on a visual timeline with drag-and-drop
- **Transport Controls** — Play, pause, stop, record, loop, and BPM controls
- **Track Management** — Add, remove, solo, mute, and rename tracks
- **Side Panel** — Instrument selection, effects, and track properties
- **MIDI Generation** — Generate MIDI patterns using jsmidgen and Tonal music theory library
- **Audio Synthesis** — Real-time audio playback and synthesis with Tone.js
- **Keyboard Shortcuts** — Full keyboard shortcut support for efficient workflows
- **Project Management** — Save and load projects with persistent state
- **Cloud Storage** — Store audio files via AWS S3 with presigned URLs

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Audio Engine:** Tone.js
- **Music Theory:** Tonal
- **MIDI:** jsmidgen
- **Animation:** Framer Motion
- **Storage:** AWS S3
- **Database:** Supabase (with SSR helpers)
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project
- AWS S3 bucket (for audio storage)

### Installation

```bash
git clone <repo-url>
cd beatlab
npm install
```

### Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
```

### Running

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/
│   ├── daw/          # TransportBar, Timeline, TrackAdder, BottomBar
│   └── panels/       # SidePanel with instruments and effects
├── hooks/            # useKeyboardShortcuts and custom hooks
├── store/            # Zustand project store
└── types/            # TypeScript type definitions
```

## License

MIT
