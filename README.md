# Generic CRM

Local-first AI sales pipeline with an integrated Sales Assistant powered by Ollama.

Built with the same design system as [hammercg.com](https://hammercg.com) and [hammerlockai.com](https://hammerlockai.com) — Playfair Display + DM Sans + JetBrains Mono, charcoal/teal palette, glassmorphic UI.

## Features

- Full CRUD: add, edit, delete contacts with modal forms
- Click-to-cycle status badges (Lead / Prospect / Customer / Closed)
- Dashboard metrics: pipeline value, total contacts, avg deal size, active leads
- Status filter tabs + real-time search
- AI Sales Assistant (Ollama + Llama 3.2) with streaming responses
- Fully local — no data leaves your machine

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** + custom CSS design system
- **Vercel AI SDK v6** + ollama-ai-provider-v2
- **Ollama** with Llama 3.2 for local AI

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Pull the model and start Ollama
ollama pull llama3.2
ollama serve

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Design System

Uses CSS custom properties matching the FLR0/HammerLock brand:

| Variable | Value | Usage |
|----------|-------|-------|
| `--charcoal` | `#1A1A1A` | Primary background |
| `--off-white` | `#F4F3EF` | Primary text |
| `--lake` | `#3A5A4A` | Accent / interactive |
| `--concrete` | `#8E8E8E` | Secondary text |

Typography: Playfair Display (headlines), DM Sans (body), JetBrains Mono (labels/data).

## Author

**Christopher L. Hammer** — [GitHub](https://github.com/christopherlhammer11-ai) | [hammercg.com](https://hammercg.com) | [hammerlockai.com](https://hammerlockai.com)
