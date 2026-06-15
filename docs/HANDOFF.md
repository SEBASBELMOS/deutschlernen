# DeutschLernen HF/Supabase handoff

## Current status

- Main repo has an Express app with a Supabase-backed storage abstraction and local `db.json` fallback for development only.
- AI and AssemblyAI proxy endpoints now require valid `x-token` authentication before forwarding requests.
- Production/HF Space startup now fails fast if Supabase secrets are missing instead of silently using `db.json`.
- HF clone path: `/Users/sebasbelmos/Downloads/deutschlernen-hf-space`.
- User ran `npm run verify:auth-sync:supabase` locally with exported Supabase env vars and reported it passed before HF push.
- Sprint rápido features done: Plurales (10th grammar topic), Confetti level-up, Vocab Trámites (16 words), Vocab Tech (15 words).
- Duolingo-style icon refresh started: reusable inline SVG icon helpers, bottom navigation/sheet icons, star/save icons, flashcard DE/ES badges, settings gear, and Vocabulario → Temas tiles refreshed.

## Files changed

- `server.js` — production Supabase guard and auth checks for `/api/chat`, `/api/upload`, `/api/transcript`, `/api/transcript/:id`.
- `public/index.html` — AI and voice proxy calls send `x-token` from `state.app.authToken`. Sprint rápido: Plurales, Confetti, Vocab Trámites, Vocab Tech. Vocabulario → Temas moved out of Hoy and upgraded with Duolingo-style pack tiles. High-visibility icon layer now uses inline SVG helpers.
- `supabase-schema.sql` — required Supabase schema for `users` and `sessions`.
- `scripts/verify-auth-sync.js` — deterministic local verification script using a temporary `DB_FILE`.
- `package.json` — added `verify:auth-sync` script.
- HF clone `.gitignore` — excludes secrets, local DB, dependencies, and agent/planning folders.
- `docs/checklist.md` — cleaned, only pending items remain.

## Supabase schema

Run the schema in `supabase-schema.sql` against the Supabase project before deploying HF Space.

## Required HF secrets

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `AI_KEY` or compatible configured key (`GROQ_KEY`, `OPENROUTER_KEY`, or `MIMO_KEY`)
- `ASSEMBLY_KEY`

Do not commit secret values. The Supabase service role key must remain server-side only.

## Verification commands/results

Commands run locally after these fixes:

```bash
node -c server.js
npm run verify:auth-sync
npm run verify:auth-sync:supabase
SUPABASE_URL='' SUPABASE_SERVICE_KEY='' NODE_ENV=production node server.js
```

Results:

- `node -c server.js` exits successfully.
- `npm run verify:auth-sync` prints `verify-auth-sync: ok`.
- `npm run verify:auth-sync:supabase` verifies the same auth/sync/proxy-auth flow against Supabase when `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are exported; user reported it passed locally.
- Static `/` returns HTTP 200.
- Unauthenticated `/api/chat`, `/api/upload`, `/api/transcript`, and `/api/transcript/:id` return HTTP 401 and are not forwarded.
- Authenticated `/api/chat` passes auth; the verification script uses a dummy `AI_URL` so no paid AI request is made.
- Production startup without Supabase exits with: `Supabase is required in production/HF Space... Refusing to fall back to db.json.`
- HF clone `node -c server.js` exits successfully.
- Icon refresh verification: JS parse check with `new Function(script)` passed, smoke server returned HTTP 200, and `git diff --check` reported no whitespace errors.

## Pending final steps

- HF Space commit/push after local commits.

## Risks/notes

- `SUPABASE_SERVICE_KEY` is a privileged service role key and must never be exposed in frontend code or committed.
- AI and voice proxy endpoints require auth; frontend calls include `x-token` for logged-in users.
- `db.json` fallback is local-development only. HF/production requires Supabase secrets and fails fast without them.
- HF Docker uses Node 22 because Supabase JS requires native WebSocket support at startup.
- Remaining icon debt is intentionally deferred: lower-visibility motivational copy/icons in tips, stats, Resumen, and minor labels still use emojis.
