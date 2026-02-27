# 🏖️ OOO Generator

An Out of Office message generator that creates memorable, tone-perfect
auto-reply messages. Because "I'm out of office" deserves better.

![CI](https://github.com/YOUR_USERNAME/ooo-generator/actions/workflows/ci.yml/badge.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![Vitest](https://img.shields.io/badge/Tested_with-Vitest-green)

## Features

- **8 Creative Tones** — Professional, Friendly, Hilarious, Passive-Aggressive,
  Mysterious, Pirate, Haiku, and Gen Z
- **Dual Generation Modes** — Instant templates or AI-powered via Claude API
- **Subject Line Generator** — Tone-matched subject lines with copy & reroll
- **Spice Level Control** — Dial the intensity from "Mild 🌱" to "Unhinged 💥"
- **Dark / Light Mode** — Toggle between themes
- **Email Preview** — See your message as it appears in a mail client
- **Copy to Clipboard** — Grab the full message (subject + body) instantly
- **"Surprise Me" Button** — Random tone selection for the indecisive

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/ooo-generator.git
cd ooo-generator
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

### Test Coverage

The test suite includes **35+ tests** across two files:

**Unit tests** (`src/utils.test.js`):
- Date formatting edge cases (empty, single-digit, end-of-year)
- Template generation for all 8 tones with full and minimal inputs
- Subject line generation and fallback behavior
- Constant validation (unique IDs, matching theme keys)

**Component tests** (`src/App.test.jsx`):
- Initial render and empty state
- All form inputs (name, dates, reason, backup, custom reason)
- Template generation with user data and empty form
- Tone switching and output differentiation
- Dark/light theme toggle
- Copy-to-clipboard with subject line inclusion
- AI mode UI (spice slider show/hide)
- Surprise me / random tone
- Subject line reroll

## Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

The built files will be in the `dist/` directory, ready to deploy to any
static hosting provider (Vercel, Netlify, GitHub Pages, etc.).

## How It Works

### Template Mode (default)
Generates messages instantly using pre-written templates for each tone.
No API keys or network requests needed — works completely offline.

### AI Mode
Calls the Claude API to generate unique, creative messages every time.
The spice level slider controls how bold Claude gets with the output.

To enable AI mode:

1. Copy the env file: `cp .env.example .env`
2. Add your Anthropic API key to `.env`
3. Restart the dev server

For production (Vercel), set `ANTHROPIC_API_KEY` in your project's
environment variables. A serverless proxy at `api/anthropic/v1/messages.js`
keeps the key server-side.

## CI

GitHub Actions runs automatically on every push and PR to `main`. The pipeline:

1. **Install** — `npm ci` with dependency caching
2. **Test** — Full Vitest suite (35+ tests)
3. **Build** — Production build to catch compilation errors

Tests run against Node 18, 20, and 22 to ensure broad compatibility.

The workflow config lives at `.github/workflows/ci.yml`.

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool and dev server
- **Vitest** — Unit and component testing
- **React Testing Library** — Component interaction tests
- **Lucide React** — Icon library
- **Claude API** — AI-powered message generation (optional)

## Project Structure

```
src/
├── main.jsx          # Entry point
├── App.jsx           # Main application component
├── utils.js          # Pure logic (templates, formatting, constants)
├── utils.test.js     # Unit tests for utils
├── App.test.jsx      # Component integration tests
└── test-setup.js     # Test environment setup (jsdom + jest-dom)
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

## License

MIT
