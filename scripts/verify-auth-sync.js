const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {spawn} = require("child_process");
const {createClient} = require("@supabase/supabase-js");

const useSupabase = process.argv.includes("--supabase");

if (useSupabase && (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY)) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY for --supabase verification.");
  process.exit(1);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "deutschlernen-verify-"));
const dbFile = path.join(tmpDir, "db.json");
const port = String(3200 + Math.floor(Math.random() * 1000));
const base = "http://127.0.0.1:" + port;

const env = Object.assign({}, process.env, {
    PORT: port,
    NODE_ENV: "test",
    AI_KEY: "verify-only",
    AI_URL: "http://127.0.0.1:1/no-ai-request"
  });
if (useSupabase) {
  delete env.DB_FILE;
} else {
  env.DB_FILE = dbFile;
  delete env.SUPABASE_URL;
  delete env.SUPABASE_SERVICE_KEY;
}

const child = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
  env,
  stdio: ["ignore", "pipe", "pipe"]
});

let output = "";
child.stdout.on("data", chunk => { output += chunk.toString(); });
child.stderr.on("data", chunk => { output += chunk.toString(); });

function cleanup() {
  child.kill();
  fs.rmSync(tmpDir, {recursive:true, force:true});
}

async function cleanupSupabaseUser(username) {
  if (!useSupabase) return;
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {auth:{persistSession:false}});
  await supabase.from("sessions").delete().eq("username", username);
  await supabase.from("users").delete().eq("username", username);
}

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(base + "/");
      if (res.status === 200) return;
    } catch (_) {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Server did not start. Output:\n" + output);
}

async function json(pathname, options) {
  const res = await fetch(base + pathname, options);
  const body = await res.json();
  return {status:res.status, body};
}

(async function main() {
  try {
    await waitForServer();

    const staticRes = await fetch(base + "/");
    assert.strictEqual(staticRes.status, 200, "static index should return 200");

    const user = "verify_" + Date.now();
    const register = await json("/api/register", {
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({username:user, password:"testpass"})
    });
    assert.strictEqual(register.body.ok, true, "register should succeed");
    const token = register.body.token;
    assert.ok(token, "register should return token");

    const syncGet = await json("/api/sync", {headers:{"x-token":token}});
    assert.strictEqual(syncGet.body.ok, true, "authenticated sync GET should succeed");

    const nextData = Object.assign({}, syncGet.body.data, {
      saved:[{de:"Hallo", es:"Hola", category:"General"}],
      chatLogs:[],
      totalPhrases:1,
      totalMinutes:0,
      dailyLog:{},
      shownPhrases:{},
      weeklyGoal:60
    });
    const syncPost = await json("/api/sync", {
      method:"POST",
      headers:{"content-type":"application/json", "x-token":token},
      body:JSON.stringify(nextData)
    });
    assert.strictEqual(syncPost.body.ok, true, "authenticated sync POST should succeed");

    const invalidSync = await json("/api/sync");
    assert.strictEqual(invalidSync.body.error, "No autenticado.", "unauthenticated sync should fail");

    const unauthChat = await json("/api/chat", {
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({messages:[]})
    });
    assert.strictEqual(unauthChat.status, 401, "unauthenticated chat should return 401");
    assert.strictEqual(unauthChat.body.error, "No autenticado.", "unauthenticated chat should not forward");

    const unauthUpload = await json("/api/upload", {method:"POST", headers:{"content-type":"audio/webm"}, body:Buffer.from("test")});
    assert.strictEqual(unauthUpload.status, 401, "unauthenticated upload should return 401");

    const unauthTranscript = await json("/api/transcript", {
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({audio_url:"https://example.invalid/audio.webm"})
    });
    assert.strictEqual(unauthTranscript.status, 401, "unauthenticated transcript should return 401");

    const unauthTranscriptPoll = await json("/api/transcript/abc123");
    assert.strictEqual(unauthTranscriptPoll.status, 401, "unauthenticated transcript polling should return 401");

    const authChat = await json("/api/chat", {
      method:"POST",
      headers:{"content-type":"application/json", "x-token":token},
      body:JSON.stringify({messages:[]})
    });
    assert.strictEqual(authChat.status, 500, "authenticated chat should pass auth and fail only on dummy AI_URL");
    assert.ok(authChat.body.error, "authenticated chat should reach proxy path");

    const logout = await json("/api/logout", {method:"POST", headers:{"x-token":token}});
    assert.strictEqual(logout.body.ok, true, "logout should succeed");

    await cleanupSupabaseUser(user);

    console.log("verify-auth-sync" + (useSupabase ? ":supabase" : "") + ": ok");
  } finally {
    cleanup();
  }
})().catch(err => {
  console.error(err);
  cleanup();
  process.exit(1);
});
