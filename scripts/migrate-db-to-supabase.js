#!/usr/bin/env node
// One-time recovery: migrate users from local db.json into the Supabase `users` table.
//
// The HF/Supabase deploy created the schema (supabase-schema.sql) but did NOT import
// existing db.json data, so accounts that lived only in db.json cannot log in.
// This script copies them over so you can log in with your existing credentials.
//
// Run locally with the Supabase env vars exported (same ones used by
// `npm run verify:auth-sync:supabase`):
//
//   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/migrate-db-to-supabase.js
//
//   # preview without writing:
//   node scripts/migrate-db-to-supabase.js --dry-run
//
// Safe to re-run: it upserts on `username`, so it inserts new users and refreshes
// existing ones. password_hash is copied verbatim (scrypt or legacy sha256, both of
// which server.js still verifies), so passwords keep working.

const fs = require("fs");
const path = require("path");

const DRY = process.argv.includes("--dry-run");
const DB_FILE = process.env.DB_FILE || path.join(__dirname, "..", "db.json");
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

if (!fs.existsSync(DB_FILE)) {
  console.error("db.json not found at " + DB_FILE);
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
const users = db.users || {};
const names = Object.keys(users);
if (!names.length) {
  console.error("No users in db.json — nothing to migrate.");
  process.exit(1);
}

const rows = names.map(function (username) {
  const u = users[username] || {};
  return {
    username: username,
    password_hash: u.passwordHash,
    data: u.data || {},
    created_at: u.createdAt || new Date().toISOString(),
  };
});

console.log((DRY ? "[dry-run] " : "") + "Users to migrate from " + DB_FILE + ":");
rows.forEach(function (r) {
  const saved = (r.data && r.data.saved && r.data.saved.length) || 0;
  console.log(
    "  - " + r.username +
    "  (password_hash: " + (r.password_hash ? r.password_hash.length + " chars" : "MISSING") +
    ", " + saved + " saved phrases)"
  );
  if (!r.password_hash) {
    console.error("    WARNING: no password_hash for " + r.username + " — this user could not log in even after migrating.");
  }
});

if (DRY) {
  console.log("[dry-run] No writes performed. Drop --dry-run to migrate.");
  process.exit(0);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL and/or SUPABASE_SERVICE_KEY env vars. Export them and retry (or use --dry-run to preview).");
  process.exit(1);
}

// Surface common URL mistakes before the opaque "fetch failed".
if (typeof fetch !== "function") {
  console.error("Your Node has no global fetch (need Node 18+). Run: node -v  — and use Node 18 or newer.");
  process.exit(1);
}
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(SUPABASE_URL)) {
  console.error("SUPABASE_URL looks off: \"" + SUPABASE_URL + "\"");
  console.error("It must be the Project URL, exactly like: https://abcdefghijklm.supabase.co");
  console.error("(no /rest path, no dashboard URL, no trailing spaces). Find it in Supabase → Project Settings → Data API → Project URL.");
  process.exit(1);
}

const { createClient } = require("@supabase/supabase-js");

function explain(err) {
  // supabase-js wraps network failures as "TypeError: fetch failed"; the real reason is in err.cause.
  var cause = err && err.cause ? err.cause : null;
  var code = cause && (cause.code || cause.errno);
  console.error("Migration failed: " + (err && err.message ? err.message : err));
  if (cause) console.error("  cause: " + (cause.message || cause));
  if (code === "ENOTFOUND") console.error("  → DNS could not resolve the host. The SUPABASE_URL is almost certainly wrong/typo'd.");
  else if (code === "ECONNREFUSED" || code === "ETIMEDOUT" || code === "ECONNRESET") console.error("  → Network/connection problem (firewall, VPN, or no internet). Try again or off the VPN.");
  else if (cause && /certificate|TLS|SSL/i.test(cause.message || "")) console.error("  → TLS/certificate problem (corporate proxy?).");
}

(async function () {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
  try {
    const { error } = await supabase.from("users").upsert(rows, { onConflict: "username" });
    if (error) { explain(error); process.exit(1); }
  } catch (err) {
    explain(err);
    process.exit(1);
  }
  console.log("✓ Done. " + rows.length + " user(s) upserted into Supabase `users`.");
  console.log("You can now log in at the HF Space with your existing username and password.");
})();
