# Generic CRM

Local-first AI sales pipeline for small teams that want useful sales assistance
without sending their customer data to another CRM cloud by default.

Generic CRM is a working product surface in Christopher Hammer's AI engineering
portfolio. It demonstrates full-stack product execution: dashboard metrics,
contact workflows, status management, search, and a local Ollama-powered sales
assistant.

## Product Promise

Run a lightweight sales pipeline locally, keep your customer context under your
control, and use an AI assistant for follow-ups, qualification, and next-step
thinking.

## Features

- Contact CRUD with modal forms
- Lead / Prospect / Customer / Closed pipeline statuses
- Dashboard metrics for pipeline value, contacts, average deal size, and leads
- Status filter tabs and real-time search
- Local AI Sales Assistant powered by Ollama and Llama 3.2
- Local-first data model
- Production build verified

## Live Demo

https://generic-crm.vercel.app

## Current Status

Verified on April 22, 2026:

- `npm run build` passes
- Production route `/` prerenders successfully
- Dynamic AI route `/api/ai-assist` builds successfully

Known productization work:

- Add demo data reset / sample pipeline mode
- Add a short visual walkthrough
- Decide hosted SaaS vs local setup package
- Add pricing and onboarding copy

## Quick Start

```bash
npm install
ollama pull llama3.2
ollama serve
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

## Commercial Path

- Free live demo for proof
- Paid setup for local-first small business CRM
- Paid customization for niche pipelines
- Optional hosted version once auth, persistence, and billing are added

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Vercel AI SDK
- Ollama local model provider
- Dexie/local-first storage

## Author

Christopher L. Hammer

- GitHub: https://github.com/christopherlhammer11-ai
- Portfolio: https://2026-04-21-that-s-a-full-green-run.vercel.app
