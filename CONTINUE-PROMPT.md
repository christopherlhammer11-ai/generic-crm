# Continue Prompt — Paste This Into a New Chat

---

I need you to finish building my projects. Here's the full context of where everything stands. My computer is fixed (killed a zombie Signal Helper process that was eating 718% CPU). All projects use Next.js 16 + React 19 + Tailwind v4.

## PRIORITY 1: Build repo-intelligence (NEW PROJECT — codebase Q&A tool)

**Location:** `~/Documents/repo-intelligence`

**Current state:** `create-next-app` ran successfully. `node_modules` exist with base Next.js deps only. The app/page.tsx is still default boilerplate. NO additional dependencies installed, NO shadcn, NO lib/ or data/ directories.

**Step 1 — Run these Terminal commands first (dependencies):**
```bash
cd ~/Documents/repo-intelligence
npm install ai ollama-ai-provider-v2 lucide-react lancedb @lancedb/vectordb
npx shadcn@latest init -d
npx shadcn@latest add button card textarea scroll-area badge separator --yes
mkdir -p data/lancedb
```

**Step 2 — Write all the code files:**

The app is a local codebase Q&A tool. Users drag/drop or upload code files, they get chunked and embedded into LanceDB vectors via Ollama, then users can ask questions about their codebase in a chat interface.

Files to create:
- `app/page.tsx` — Split-pane UI: left panel = file upload/drag-drop with file list, right panel = chat interface with message history
- `app/api/ingest/route.ts` — Accepts uploaded code files, chunks them intelligently (by function/class boundaries, not arbitrary line counts), generates embeddings via Ollama, stores in LanceDB
- `app/api/chat/route.ts` — RAG chat endpoint: takes user question, embeds it, searches LanceDB for relevant chunks, sends context + question to Ollama for answer, streams response back
- `lib/vectorstore.ts` — LanceDB connection, table creation, search/insert operations
- `lib/chunker.ts` — Intelligent code chunking that respects function/class boundaries across JS/TS/Python/Go/Rust
- `lib/embeddings.ts` — Ollama embedding helper (use nomic-embed-text model)

**Design notes:**
- Use Vercel AI SDK (`ai` package) for streaming chat responses
- Use `ollama-ai-provider-v2` as the LLM provider (model: llama3.2 or similar)
- Use `nomic-embed-text` for embeddings via Ollama
- LanceDB stores vectors locally in `data/lancedb/`
- Support uploading .ts, .tsx, .js, .jsx, .py, .go, .rs, .md files
- The chat should show which source files/chunks were used to answer each question
- Dark mode with clean UI (shadcn components + Tailwind)

**Step 3 — Verify it builds:**
```bash
cd ~/Documents/repo-intelligence
npm run build
```

---

## PRIORITY 2: Push 4 repos to GitHub (triggers Vercel auto-deploys)

These repos have local commits with bug fixes, tests, and .env.example files that haven't been pushed yet:

```bash
cd ~/Documents/generic-crm && git push origin main
cd ~/Documents/genesis-marketplace && git push origin main
cd ~/Documents/genesis-node-api && git push origin main
cd ~/Documents/local-doc-rag && git push origin main
```

Commit details:
- generic-crm `9380513`: localStorage persistence, Ollama health check, error handling, 28 tests
- genesis-marketplace `491dae6`: dead code removal, error boundary, loading skeletons, 35+ tests
- genesis-node-api `9a60359`: request validation, env config, error propagation, 45+ tests
- local-doc-rag `125607a`: missing imports fix, utils.ts creation, 40+ tests

---

## PRIORITY 3: Remaining infrastructure tasks

1. **Configure genesis-node-api env vars on Vercel** — Go to Vercel dashboard → genesis-node-api → Settings → Environment Variables. Add these from `.env.example`:
   - PORT=6970, DB_PATH=./db.json, SOLANA_NETWORK=devnet
   - SOLANA_RPC_URL=https://api.devnet.solana.com
   - FLUX_MINT_ADDRESS=4CkR2jysfcsk3Mdn86KuuUkRSBBPwtN1fPaaffawLax9
   - FLUX_DECIMALS=9
   - TREASURY_WALLET=5JfVfdEAAuwop51RLx6rUbooiEd1vTSxyw2DhkjPbA8G
   - STRIPE_SECRET_KEY=(I'll provide this separately)

2. **Create Vercel project for local-doc-rag** — Import from GitHub repo `christopherlhammer11-ai/local-doc-rag`

3. **Connect hammercg-site to GitHub** — for auto-deploys instead of manual `vercel deploy`

4. **Clone 0frazierlake** — `git clone git@github.com:christopherlhammer11-ai/0frazierlake.git ~/Documents/0frazierlake` — then analyze it the same way the other projects were analyzed (find bugs, add tests, add .env.example)

5. **Add GitHub Actions CI/CD** to all projects — basic workflow that runs `npm test` on push to main

---

## Reference: Full project portfolio

| Project | Stack | Status | Vercel |
|---------|-------|--------|--------|
| generic-crm | Next.js 16 + Ollama | Working, fixes committed | READY |
| genesis-marketplace | Next.js 16 | Working, fixes committed | READY |
| genesis-node-api | Express + Solana + Stripe | Working, fixes committed | READY |
| local-doc-rag | Next.js 16 + LanceDB | Scaffolding only | No Vercel project |
| repo-intelligence | Next.js 16 + LanceDB + Ollama | Bare scaffold, needs code | Not deployed yet |
| hammercg-site | Static HTML/CSS/JS | Live at hammercg.com | READY (manual deploys) |
| 0frazierlake | Python | Not cloned locally | N/A |

The overnight summary with full details is at `~/AI/OVERNIGHT-SUMMARY.md`.
