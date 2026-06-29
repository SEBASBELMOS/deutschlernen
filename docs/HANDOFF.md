# DeutschLernen HF/Supabase handoff

> **Updated after 2026-06-27 documentation audit — all SKILL_*.md files refreshed to match current app state.**

> **Canonical handoff** — maintained here in the main dev repo (`docs/HANDOFF.md`, gitignored so it stays private/local). The `HANDOFF.md` inside the HF deploy clone is a deploy-only snapshot; update THIS file going forward.

## Current status

- Main repo has an Express app with a Supabase-backed storage abstraction and local `db.json` fallback for development only.
- AI and AssemblyAI proxy endpoints now require valid `x-token` authentication before forwarding requests.
- Production/HF Space startup now fails fast if Supabase secrets are missing instead of silently using `db.json`.
- HF clone path: `/Users/sebasbelmos/Downloads/deutschlernen-hf-space`.
- User ran `npm run verify:auth-sync:supabase` locally with exported Supabase env vars and reported it passed before HF push.
- Sprint rápido features done: Plurales (10th grammar topic), Confetti level-up, Vocab Trámites (16 words), Vocab Tech (15 words).
- Duolingo-style icon refresh started: reusable inline SVG icon helpers, bottom navigation/sheet icons, star/save icons, flashcard DE/ES badges, settings gear, and Vocabulario → Temas tiles refreshed.
- Icon system upgraded from Lucide-like outlines to chunky filled/duotone SVG shapes. Bottom nav, sheet buttons, and Vocabulario → Temas use rounded color chips with category colors.
- Latest user QA feedback was added to `docs/checklist.md` before compaction: Hörverstehen audio cuts off, Casos needs failure tips, Género repeats nouns, Conectores has a `wenn` answer missing from options, and Flashcards needs a delete/stop-practicing action.
- Latest QA backlog implemented in `public/index.html`: Hörverstehen chunked full TTS, Conectores option normalization, Género noun rotation, Flashcards delete/stop-practicing action, and Casos repeated-failure tips.
- Personalized daily review (`today.js`): adaptive recommendations, grammar drill integration, review plan progress tracking, actionable tips based on user performance. +295/-69 lines. Shipped: GitHub `feature/v3-learning-ui` (commit `4ea3ace`) + HF `main` (commit `d336663`).
- Personalized review ViewTransition bug fixed (2026-06-28): `showScreen("hoy")` used async `document.startViewTransition` whose callback fired `renderToday()` and wiped inline review content. Added `activateTab(id)` helper in `nav.js` that activates tab DOM without triggering re-render. Fixed 4 call sites: `renderReviewPlanPreview`, `runPersonalizedStep`, `showPersonalizedSummary`, `showAllCaughtUp`. GitHub `19264f6`, HF `9c5a711`.
- AI reading comprehension step added to personalized review (2026-06-28): `renderReviewReadingStep()` generates a German passage via AI on the user's weakest grammar topic, shows text with TTS playback, and presents 2 MC comprehension questions with green/red feedback. Results tracked in `plan.results.readingDone` and shown in final summary. +77 lines in `today.js`. GitHub `527aca9`, HF `74e33f9`.
- Gráfico de progreso histórico: inline SVG chart in Resumen showing level % curve from `levelLog` snapshots (last 30 days). Legacy `dailyLog.levelPct` is migrated into `levelLog` on sync load; `dailyLog` only tracks `minutes`, `phrasesReviewed`, `drillsDone`. Shadowing: new Practicar screen with 10-sentence pool, record/transcribe/score flow, and AI sentence generation.
- Export progreso completo: JSON download in Settings with dailyLog, streak, level, grammarStats, errorJournal. Onboarding: 3-step card overlay for new users, skipped via localStorage.
- README.md rewritten as recruiter-focused portfolio piece: professional English, no personal details, no public demo link, no roadmap. Positions app as a focused learning alternative with portfolio snapshot, technical highlights, architecture, security/privacy, verification, known limitations, and screenshot guidance.
- README demo wording: public demo access is intentionally limited to avoid uncontrolled usage of paid AI/voice integrations; future public version should use sanitized seed data, screenshots, and usage limits.
- README licence wording: no formal open-source licence is granted; code is available for portfolio review only, and reuse/redistribution/derivative use requires written permission.
- i18n: all UI copy converted from Rioplatense voseo to neutral Spanish (`tú` forms), covering both literal accents and escaped `\uXXXX` strings. Dynamic AI-generated copy still depends on the model output.
- Chat anti-injection hardening (client-side): Conversar system prompt scoped to German conversation only, refuses code/unrelated tasks, ignores role-override/jailbreak attempts; chat response capped at 400 tokens; de-personalized for multi-user use.
- Git history scrubbed: `db.json` (which held user `sebasbelmos` + a SHA-256 password hash + saved phrases) removed from ALL commits via `git filter-repo --path db.json --invert-paths --force` + `git push --force --all origin`. Verified 0 occurrences locally and on origin. No API keys / `.env` were ever committed. Repo is now safe to make public.

## Files changed

- `server.js` — production Supabase guard and auth checks for `/api/chat`, `/api/upload`, `/api/transcript`, `/api/transcript/:id`.
- `public/index.html` — AI and voice proxy calls send `x-token` from `state.app.authToken`. Sprint rápido: Plurales, Confetti, Vocab Trámites, Vocab Tech. Vocabulario → Temas moved out of Hoy and upgraded with Duolingo-style pack tiles. High-visibility icon layer now uses inline SVG helpers.
- `public/index.html` — Temporal "Antes/Después" audit fixes: validated AI drills before use, fallback requires 24 valid exercises, avoided `innerHTML` for AI sentences, made `drillsDone` logging idempotent, separated skipped questions from wrong-answer SRS saves, and moved level history out of `dailyLog` into `levelLog`.
- `public/index.html` — icon API (`ico`, `iconLabel`, `langBadge`, `setSaveIcon`) preserved while SVG paths were redrawn as filled/duotone shapes; `.dl-ico svg` now uses `fill: currentColor; stroke: none;`. Added `iconChip()` for rounded color-chip treatment.
- `supabase-schema.sql` — required Supabase schema for `users` and `sessions`.
- `scripts/verify-auth-sync.js` — deterministic local verification script using a temporary `DB_FILE`.
- `package.json` — added `verify:auth-sync` script.
- HF clone `.gitignore` — excludes secrets, local DB, dependencies, and agent/planning folders.
- `docs/checklist.md` — cleaned, only pending items remain.
- `docs/checklist.md` — latest Sebastian QA feedback organized as top-priority bug/product backlog.
- `docs/checklist.md` — QA backlog items marked complete; next suggested work is progress history/export/Shadowing.
- `docs/checklist.md` — cleaned 2026-06-27: removed all done sections, kept only pending items.
- `README.md` — portfolio/recruiter polish: added portfolio snapshot, Mermaid architecture diagram, security/privacy section, verification commands, screenshot recommendations, known limitations, demo-access wording, and all-rights-reserved licence wording.

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
- Filled icon verification: JS parse check passed, `node -c server.js` passed, `git diff --check` passed, and diff search confirmed no `dailyLog` changes.
- QA fixes verification: JS parse check passed, `node -c server.js` passed, `git diff --check` passed, and diff search found no `dailyLog` changes.
- README-only verification: `git diff --check -- README.md` passed.
- Temporal audit verification (2026-06-26): `node -c server.js` passed; frontend `<script>` parsed via `new Function(...)`; UTF-8 `iconv` check passed; `TEMPUS_CURATED` has 24 valid items and every correct answer is in options; `rg --pcre2` found no non-activity `state.session.dailyLog[...]` property reads/writes; `git diff --check -- public/index.html docs/HANDOFF.md` passed; sandboxed server boot failed with `listen EPERM 0.0.0.0:3099`, rerun with approval returned HTTP 200 from `/`, then the server process was closed.
- Personalized review verification (2026-06-28): `node --check server.js` + all JS files passed; server started and returned HTTP 200 from `/`; all 16 screens verified (TABS ids + `showScreen` routing + render function names match 1:1).
- Reading comprehension verification (2026-06-28): `node --check server.js` + today.js `new Function()` parse passed; `speak()` exists for TTS; `ai()` signature `ai(system, messages, maxTokens)` confirmed; reading step integrated into plan builder (weakest grammar topic) + results tracking + summary.

## Pending final steps

- Portfolio assets: add 4 screenshots + 1 short GIF before broad sharing:
  - `dashboard.png` — Hoy/Resumen with progress chart, streak, daily goal, and CTA.
  - `ai-chat.png` — AI role-play with corrected/useful German.
  - `shadowing.gif` — 5-8s listen -> record -> score/correction flow.
  - `srs-review.png` — flashcard/SRS review with grading actions.
  - `grammar-drill.png` — grammar drill showing learning depth beyond chat.
- Next recommended work: conversación voz continua, change-password, PWA, bulk edit, solo-audio.
- HF Space push: done (2026-06-28) — ViewTransition fix + reading comprehension committed and pushed to HF `main`.

## Pending: server-side AI hardening for scale (NOT done — required before a public/live demo)

`/api/chat` requires auth but has **no rate limiting** and **forwards the client body unchecked** (only overrides `model`). System prompt + `max_tokens` are client-controlled and bypassable by any token holder calling the proxy directly. Before any public live demo:
1. Rate-limit `/api/chat` per user/IP (~40–60/min). The `rateLimits` Map infra exists but is only applied to login/register today.
2. Clamp `max_tokens` server-side: `Math.min(body.max_tokens||1024, 1500)` — keep ≥1400 so JSON features still work.
3. (Strongest) Prepend a guard system message server-side to every `/api/chat` call.

Decision (2026-06-16): user does NOT want a public live demo (avoid paid-AI abuse + new users) → portfolio uses screenshots + a GIF instead, so this hardening is optional/deferred. Also pending (manual): rotate the account password (legacy SHA-256 is weak).

## Completed: Temporal "antes/después" module (2026-06-25)

New screen "⏳ Antes/Después" in Gramática group teaching temporal connectors: `vor/nach` (+Dativ), `bevor/nachdem` (subordinate), `vorher/danach` (adverbs), `früher/später`. Implementation:
- **Screen**: `s-tempus` div, `renderTempus()`, added to TABS, NAV_GROUPS.gramatica, showScreen.
- **State**: `state.tempo` namespace (`tempusIdx`, `tempusRight`, `tempusWrong`, `tempusDone`, `tempusResults`, `tempusSkipped`, `tempusLogged`, `tempusData`).
- **Reference**: compact scrollable 4-column table (Español/Alemán/Cuándo/Ejemplo — headers in Spanish to match the app's i18n; header bg `var(--surface)`), gold-Alemán/purple-rules/text2-examples.
- **Warning box**: `nach dem` ≠ `nachdem` distinction, red-text token + rgba(248,113,113,0.06) background.
- **Mini-rule card**: vor/nach + Dativ, bevor/nachdem + subordinate (verb-final), vorher/danach = adverbs only.
- **Drills**: "Iniciar ronda (24)" → AI first (parseJSONArray, lvlRange), fallback to 24 curated exercises (3 per connector) unless the AI returns 24 valid items with `___`, known `correct`, and correct answer present in options. Progress bar, gold option buttons, green/red feedback with tips, skip support.
- **Integration**: `logActivity("drillsDone",1)`+`syncUp()` once per completed round; wrong answered items auto-save as flashcards (`source:"antes-despues"`), dedup + `updateBadge()`. Skipped items appear in the summary but are not auto-saved as failures.
- **Conventions**: `mk()`/DOM nodes for dynamic UI, no `innerHTML` for AI-generated Tempus sentences, theme text tokens (var(--gold-text), var(--green-text), var(--red-text), var(--purple-text), var(--text2)), no hexToRgb, aria-labels on all buttons, ✓/✗/Saltada text feedback.
- **Claude 3rd/final audit (2026-06-26)**: verified all of the above against code — notably that the `levelLog` refactor persists (it IS in `syncPayload`), legacy `dailyLog.levelPct` migrates via `cleanDailyLog()` on load, chart/snapshot/export/reset all use `levelLog`, and `logActivity()` hard-rejects non-allowed kinds. Fixed: table headers German→Spanish + header bg → `var(--surface)`. Shipped: GitHub `feature/v3-learning-ui` + HF `main` (JS OK, UTF-8 clean, both synced). Accepted minors: saved flashcard `es` = grammar tip (no per-sentence translation in curated data); `link` icon is semantically loose for a temporal module.

## Risks/notes

- `SUPABASE_SERVICE_KEY` is a privileged service role key and must never be exposed in frontend code or committed.
- AI and voice proxy endpoints require auth; frontend calls include `x-token` for logged-in users.
- `db.json` fallback is local-development only. HF/production requires Supabase secrets and fails fast without them.
- HF Docker uses Node 22 because Supabase JS requires native WebSocket support at startup.
- Remaining icon debt is intentionally deferred: lower-visibility motivational copy/icons in tips, stats, Resumen, and minor labels still use emojis.
- Visual light/dark browser inspection was not performed in-agent because no browser/headless visual tool was available; implementation uses existing theme-safe text tokens (`--gold-text`, `--teal-text`, `--purple-text`, `--green-text`, `--red-text`, `--text2`).
- Do not compress context before updating handoff/Engram when user reports QA observations; user explicitly requested this workflow.
