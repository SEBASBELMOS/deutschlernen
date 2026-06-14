# DeutschLernen

A web app for learning German with AI. Built for the A2 → B1-2 path, with a focus on full phrases, conversation, listening and spaced repetition — not grammar tables.

Single-file vanilla JS frontend, Express backend. No frameworks, no build step.

## Features

- **Phrases** — Eight topics (work, travel, emotions, daily life, etc.) generate five German phrases with translation and a tip. Star to save.
- **Phrase of the day** — A new phrase each day, cached in localStorage.
- **Chat** — Role-play chat in German where the AI plays the other person. On close, the chat is analysed for errors, new vocabulary and useful phrases to save.
- **Correct me** — Paste or record broken German and get a correction, a more natural alternative and pronunciation practice with scoring.
- **I didn't catch that** — Type what you heard and receive a full breakdown (meaning, context, key words, suggested reply).
- **Dictation** — TTS reads a phrase, you type it back, word-by-word comparison with a score.
- **Grammar** — AI multiple-choice drills for der/die/das articles, Perfekt, Wortstellung, Adjektivendungen, separable verbs and Präteritum.
- **Cases** — Offline 4-case trainer (Nominativ/Akkusativ/Dativ/Genitiv) with colour-coded functions. Four sub-tabs: a decision flow to identify the case, an article transformer table, an express rules accordion, and a curated quiz (~57 questions). No AI — works offline.
- **Flashcards with SRS** — A five-box Leitner system (intervals of 0/1/3/7/14/30 days). Switch between "due today" and "all". Grade with Fallé / Difícil / Bien / Fácil.
- **Saved** — Saved phrases and chat history. Live search and CSV export.
- **Summary** — Daily streak, weekly minutes goal and progress counters.
- **Voice** — Microphone input (AssemblyAI v2 transcribes German) and TTS output via the Web Speech API (locked to `de-DE`).
- **Auth + sync** — Username/password account with server-side data sync, so the same account works across devices.

## Stack

- **Frontend:** vanilla JS in a single file (`public/index.html`)
- **Backend:** Node.js + Express
- **AI:** Groq (default model: `llama-3.3-70b-versatile`). Endpoint is OpenAI-compatible — any provider works by changing the `.env`.
- **Voice input:** AssemblyAI v2
- **Voice output:** Web Speech API
- **Storage:** flat JSON (`db.json`), SHA-256 passwords, token-based sessions

## Setup

```bash
git clone https://github.com/SEBASBELMOS/deutschlernen.git
cd deutschlernen
npm install
```

Create a `.env` file in the project root with:

```
AI_KEY=gsk_...
ASSEMBLY_KEY=...
PORT=3000

# Optional — change model or provider without touching the code:
# AI_MODEL=llama-3.3-70b-versatile
# AI_URL=https://api.groq.com/openai/v1/chat/completions
```

Get a free Groq API key at https://console.groq.com/keys (14,400 requests per day, no card needed).

Other good Groq models: `llama-3.1-8b-instant` (faster), `mixtral-8x7b-32768`, `gemma2-9b-it`. Because the endpoint is OpenAI-compatible, OpenRouter, OpenAI, Gemini and others also work — just change `AI_URL` and `AI_MODEL`.

Run the server:

```bash
node server.js
# or with auto-reload on changes:
npm run dev
```

Open `http://localhost:3000`, register an account and start.

## Project structure

```
deutschlernen/
├── public/
│   └── index.html      # Whole frontend: HTML + CSS + JS
├── server.js           # Express: auth, sync, proxies to the AI and AssemblyAI
├── db.json             # Auto-created on first launch (gitignored)
├── .env                # API keys (gitignored)
├── package.json
└── README.md
```

## API

### Auth
- `POST /api/register` — `{username, password}` → `{ok, token, username, data}`
- `POST /api/login` — `{username, password}` → `{ok, token, username, data}`
- `POST /api/logout` — header `x-token`

### Sync
- `GET /api/sync` — header `x-token` → `{ok, data}`
- `POST /api/sync` — body with `{saved, chatLogs, totalPhrases, totalMinutes, dailyLog, shownPhrases, weeklyGoal}`

### Proxies (hide API keys from the browser)
- `POST /api/chat` → AI provider `chat/completions` (default Groq; the server injects the model from `AI_MODEL`)
- `POST /api/upload` → AssemblyAI `v2/upload`
- `POST /api/transcript` → AssemblyAI `v2/transcript`
- `GET /api/transcript/:id` → AssemblyAI `v2/transcript/:id`

## Data model

```json
{
  "saved": [{"de": "...", "es": "...", "tip": "...", "box": 0, "nextReview": "2026-05-27", "lapses": 0, "lastReviewed": "...", "source": "frases", "added": "..."}],
  "chatLogs": [{"scenario": "...", "date": "...", "messages": [...]}],
  "dailyLog": {"2026-05-27": {"minutes": 12, "phrasesReviewed": 8, "drillsDone": 5}},
  "shownPhrases": {"Mi trabajo en data": ["...", "..."]},
  "totalPhrases": 0,
  "totalMinutes": 0,
  "weeklyGoal": 60
}
```

## Known limitations

- `db.json` is a flat file — fine for personal use, not suitable for many concurrent users.
- TTS quality depends on the browser/OS and varies. Moving to a dedicated service (ElevenLabs, Azure) is on the roadmap.
- AssemblyAI polls for up to 50 seconds before timing out.
- No PWA install yet (planned).

## Licence

Personal project. No formal licence.
