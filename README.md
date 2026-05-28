# DeutschLernen

A web app for learning German with AI. Built for the A2 → B1-2 path, with a focus on full phrases, conversation, listening and spaced repetition — not grammar tables.

Single-file vanilla JS frontend, Express backend. No frameworks, no build step.

## Features

- **Phrases** — 8 topics generate 5 German phrases with translation and tip. Save with a star.
- **Phrase of the day** — a new phrase each day, cached in localStorage.
- **Chat** — role-play in German with AI as the other person. Post-chat analysis on close.
- **Correct me** — paste or record broken German → correction + natural alternative + pronunciation scoring.
- **I didn't catch that** — type what you heard → full breakdown with keywords and suggested reply.
- **Dictation** — TTS plays a phrase, you type it, word-by-word comparison with score.
- **Grammar** — multiple-choice drills for articles, Perfekt, word order, adjective endings, separable verbs and Präteritum.
- **Flashcards SRS** — Leitner system with 5 boxes. Due today / all modes.
- **Saved** — saved phrases and chat history. Live search and CSV export.
- **Summary** — daily streak, weekly minutes goal, progress counters.
- **Voice** — microphone input (AssemblyAI v2) and TTS output (Web Speech API, de-DE).
- **Auth + sync** — username/password account with cross-device data sync.

## Setup

```bash
git clone https://github.com/SEBASBELMOS/deutschlernen.git
cd deutschlernen
npm install
```

Create a `.env` file with your API keys:

```
AI_KEY=gsk_...
ASSEMBLY_KEY=...
PORT=3000
```

Run the server:

```bash
node server.js
```

Open `http://localhost:3000`, register an account and start.
