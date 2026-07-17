require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const {createClient} = require("@supabase/supabase-js");

const app = express();
app.set("trust proxy", 1);
const compression = require("compression");
app.use(compression());
const PORT = process.env.PORT || 3000;
const AI_KEY = process.env.AI_KEY || process.env.GROQ_KEY || process.env.OPENROUTER_KEY || process.env.MIMO_KEY;
const CATEGORIES = ["Trabajo","Viaje","Viajes","Comida","Naturaleza","Sentimientos","Hogar","Trámites","Tech","Conectores","General"];
const CATEGORIES_SET = new Set(CATEGORIES);
const AI_URL = process.env.AI_URL || "https://api.groq.com/openai/v1/chat/completions";
const AI_MODEL = process.env.AI_MODEL || "llama-3.3-70b-versatile";
const ASSEMBLY_KEY = process.env.ASSEMBLY_KEY;
const DB_FILE = process.env.DB_FILE || path.join(__dirname, "db.json");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const usingSupabase = Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);
const requiresManagedStorage = Boolean(process.env.SPACE_ID || process.env.HF_SPACE_ID || process.env.NODE_ENV === "production");

if (requiresManagedStorage && !usingSupabase) {
  const missing = [];
  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SUPABASE_SERVICE_KEY) missing.push("SUPABASE_SERVICE_KEY");
  throw new Error("Supabase is required in production/HF Space. Missing: " + missing.join(", ") + ". Refusing to fall back to db.json.");
}

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({users:{},sessions:{}}, null, 2));
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch(e) { return {users:{},sessions:{}}; }
}
function writeDB(db) {
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

function createFileStorage() {
  return {
    async getUser(username) {
      const db = readDB();
      return {db, user:db.users[username] || null};
    },
    async createUser(username, passwordHash, data) {
      const db = readDB();
      if (db.users[username]) return false;
      db.users[username] = {passwordHash, createdAt:new Date().toISOString(), data};
      writeDB(db);
      return true;
    },
    async updatePasswordHash(username, passwordHash) {
      const db = readDB();
      if (!db.users[username]) return;
      db.users[username].passwordHash = passwordHash;
      writeDB(db);
    },
    async updateUserData(username, data) {
      const db = readDB();
      if (!db.users[username]) return;
      db.users[username].data = data;
      writeDB(db);
    },
    async createSession(token, username) {
      const db = readDB();
      db.sessions[token] = {username, lastUsed:Date.now()};
      writeDB(db);
    },
    async getSession(token) {
      const db = readDB();
      let entry = db.sessions[token];
      if (!entry) return null;
      if (typeof entry === "string") entry = {username:entry, lastUsed:Date.now()};
      const user = db.users[entry.username];
      if (!user) return null;
      return {db, token, username:entry.username, lastUsed:entry.lastUsed, user};
    },
    async refreshSession(token, username) {
      const db = readDB();
      db.sessions[token] = {username, lastUsed:Date.now()};
      writeDB(db);
    },
    async deleteSession(token) {
      const db = readDB();
      delete db.sessions[token];
      writeDB(db);
    },
    async cleanupExpiredSessions() {
      const db = readDB();
      const now = Date.now();
      let changed = false;
      for (const [token, entry] of Object.entries(db.sessions)) {
        if (typeof entry === "string") continue;
        if (now - entry.lastUsed > THIRTY_DAYS) {
          delete db.sessions[token];
          changed = true;
        }
      }
      if (changed) writeDB(db);
    }
  };
}

function toAppUser(row) {
  if (!row) return null;
  return {passwordHash:row.password_hash, createdAt:row.created_at, data:row.data || {}};
}

function sessionLastUsedMs(value) {
  if (typeof value === "number") return value;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function createSupabaseStorage() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {auth:{persistSession:false}});
  return {
    async getUser(username) {
      const {data, error} = await supabase.from("users").select("username,password_hash,data,created_at").eq("username", username).maybeSingle();
      if (error) throw error;
      return {user:toAppUser(data)};
    },
    async createUser(username, passwordHash, data) {
      const {error} = await supabase.from("users").insert({username, password_hash:passwordHash, data, created_at:new Date().toISOString()});
      if (!error) return true;
      if (error.code === "23505") return false;
      throw error;
    },
    async updatePasswordHash(username, passwordHash) {
      const {error} = await supabase.from("users").update({password_hash:passwordHash}).eq("username", username);
      if (error) throw error;
    },
    async updateUserData(username, data) {
      const {error} = await supabase.from("users").update({data}).eq("username", username);
      if (error) throw error;
    },
    async createSession(token, username) {
      const {error} = await supabase.from("sessions").insert({token, username, last_used:new Date().toISOString()});
      if (error) throw error;
    },
    async getSession(token) {
      const {data, error} = await supabase.from("sessions").select("token,username,last_used").eq("token", token).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const userRow = await this.getUser(data.username);
      if (!userRow.user) return null;
      return {token:data.token, username:data.username, lastUsed:sessionLastUsedMs(data.last_used), user:userRow.user};
    },
    async refreshSession(token) {
      const {error} = await supabase.from("sessions").update({last_used:new Date().toISOString()}).eq("token", token);
      if (error) throw error;
    },
    async deleteSession(token) {
      const {error} = await supabase.from("sessions").delete().eq("token", token);
      if (error) throw error;
    },
    async cleanupExpiredSessions() {
      const cutoff = new Date(Date.now() - THIRTY_DAYS).toISOString();
      const {error} = await supabase.from("sessions").delete().lt("last_used", cutoff);
      if (error) throw error;
    }
  };
}

const storage = usingSupabase ? createSupabaseStorage() : createFileStorage();
console.log("Storage:", usingSupabase ? "Supabase" : "db.json");

function hashPw(pw, salt) {
  if (!salt) salt = crypto.randomBytes(16).toString("hex");
  return "scrypt:" + salt + ":" + crypto.scryptSync(pw, salt, 64).toString("hex");
}
function verifyPw(pw, stored) {
  if (stored.startsWith("scrypt:")) {
    const p = stored.split(":");
    if (p.length !== 3) return false;
    const a = crypto.scryptSync(pw, p[1], 64);
    const b = Buffer.from(p[2], "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  return stored === crypto.createHash("sha256").update("dl26_"+pw).digest("hex");
}
function makeToken() { return crypto.randomBytes(32).toString("hex"); }
async function getAuth(req) {
  const token = req.headers["x-token"]||"";
  if (!token) return null;
  const entry = await storage.getSession(token);
  if (!entry) return null;
  if (Date.now() - entry.lastUsed > THIRTY_DAYS) {
    await storage.deleteSession(token);
    return null;
  }
  await storage.refreshSession(token, entry.username);
  return {username:entry.username, user:entry.user, token};
}

async function requireAuth(req, res) {
  const auth = await getAuth(req);
  if (!auth) {
    res.status(401).json({error:"No autenticado."});
    return null;
  }
  return auth;
}

const rateLimits = new Map();
const RATE_WINDOW = 15 * 60 * 1000;
const RATE_MAX = 5;
function checkRateLimit(ip, endpoint, max) {
  const limit = typeof max === "number" ? max : RATE_MAX;
  const key = ip + ":" + endpoint;
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimits.set(key, {start: now, count: 1});
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}
function clearRateLimit(ip, endpoint) {
  rateLimits.delete(ip + ":" + endpoint);
}
async function cleanupExpiredSessions() {
  await storage.cleanupExpiredSessions();
}
setInterval(function(){
  const now = Date.now();
  for (const [key, entry] of rateLimits) {
    if (now - entry.start > RATE_WINDOW) rateLimits.delete(key);
  }
}, 60 * 1000).unref();

// Content-Security-Policy: even if an XSS fires, connect-src/img-src 'self' block
// exfiltration of the auth token to any external host, and object/base/frame are locked down.
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data:",
  "font-src 'self' https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'"
].join("; ");
app.use(function(_,res,next){
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("X-Frame-Options","DENY");
  res.setHeader("Referrer-Policy","no-referrer");
  res.setHeader("Content-Security-Policy", CSP);
  res.setHeader("Permissions-Policy","geolocation=(), camera=(), payment=()");
  next();
});
app.use(express.json({limit:"10mb"}));
app.use(express.raw({type:["audio/*","application/octet-stream","video/*"], limit:"25mb"}));
app.use(express.static(path.join(__dirname, "public"), {maxAge: "1h", etag: true}));

// Auth
app.post("/api/register", async (req,res) => {
  try {
    const {username,password} = req.body||{};
    if (!username||!password) return res.json({error:"Completa todos los campos."});
    if (username.length<3) return res.json({error:"Username: minimo 3 caracteres."});
    if (password.length<8) return res.json({error:"Password: mínimo 8 caracteres."});
    if (!checkRateLimit(req.ip, "register"))
      return res.status(429).json({error:"Demasiados intentos. Espera 15 minutos."});
    const emptyData = {saved:[],chatLogs:[],totalPhrases:0,totalMinutes:0,dailyLog:{},shownPhrases:{},weeklyGoal:60,casesStats:{}};
    const created = await storage.createUser(username, hashPw(password), emptyData);
    if (!created) return res.json({error:"Ese username ya existe."});
    const token = makeToken();
    await storage.createSession(token, username);
    clearRateLimit(req.ip, "register");
    res.json({ok:true, token, username, data:emptyData, serverInfo:{model:AI_MODEL}});
  } catch(err) {
    console.error("[register]", err);
    res.status(500).json({error:"Internal server error"});
  }
});

app.post("/api/login", async (req,res) => {
  try {
    const {username,password} = req.body||{};
    if (!username||!password) return res.json({error:"Completa todos los campos."});
    if (!checkRateLimit(req.ip, "login"))
      return res.status(429).json({error:"Demasiados intentos. Espera 15 minutos."});
    const {user} = await storage.getUser(username);
    // Same generic error + constant-time work whether or not the user exists (anti-enumeration)
    if (!user) {
      crypto.scryptSync(password, "dummy-enumeration-guard-salt", 64); // equalize timing
      return res.json({error:"Usuario o contraseña incorrectos."});
    }
    if (!verifyPw(password, user.passwordHash)) return res.json({error:"Usuario o contraseña incorrectos."});
    if (!user.passwordHash.startsWith("scrypt:")) {
      await storage.updatePasswordHash(username, hashPw(password));
    }
    const token = makeToken();
    await storage.createSession(token, username);
    clearRateLimit(req.ip, "login");
    res.json({ok:true, token, username, data:user.data, serverInfo:{model:AI_MODEL}});
  } catch(err) {
    console.error("[login]", err);
    res.status(500).json({error:"Internal server error"});
  }
});

app.post("/api/logout", async (req,res) => {
  try {
    const token = req.headers["x-token"]||"";
    if (token) await storage.deleteSession(token);
    res.json({ok:true});
  } catch(err) {
    console.error("[logout]", err);
    res.status(500).json({error:"Internal server error"});
  }
});

app.post("/api/change-password", async (req,res) => {
  try {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const {currentPassword,newPassword} = req.body||{};
    if (!currentPassword||!newPassword) return res.json({error:"Completa todos los campos."});
    if (newPassword.length<4) return res.json({error:"Nuevo password: mínimo 4 caracteres."});
    if (!verifyPw(currentPassword, auth.user.passwordHash)) return res.json({error:"Password actual incorrecto."});
    await storage.updatePasswordHash(auth.username, hashPw(newPassword));
    // Invalida todas las otras sesiones de este usuario
    if (usingSupabase) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {auth:{persistSession:false}});
      const {error} = await supabase.from("sessions").delete().eq("username", auth.username).neq("token", auth.token);
      if (error) console.error("[change-password cleanup]", error);
    } else {
      const db = readDB();
      for (const t of Object.keys(db.sessions)) {
        const s = db.sessions[t];
        if (s && (s.username||s)===auth.username && t!==auth.token) delete db.sessions[t];
      }
      writeDB(db);
    }
    res.json({ok:true});
  } catch(err) {
    console.error("[change-password]", err);
    res.status(500).json({error:"Internal server error"});
  }
});

// Sync
app.get("/api/sync", async (req,res) => {
  try {
    const auth = await getAuth(req);
    if (!auth) return res.json({error:"No autenticado."});
    res.json({ok:true, data:auth.user.data, serverInfo:{model:AI_MODEL}});
  } catch(err) {
    console.error("[sync:get]", err);
    res.status(500).json({error:"Internal server error"});
  }
});

app.post("/api/sync", async (req,res) => {
  try {
    let auth = await getAuth(req);
    // sendBeacon fallback: token in body when x-token header is absent (mobile/PWA)
    if (!auth && req.body && req.body.token) {
      req.headers["x-token"] = req.body.token;
      auth = await getAuth(req);
    }
    if (!auth) return res.json({error:"No autenticado."});
    const body = req.body||{};
    const MAX_SAVED = 5000, MAX_CHATLOGS = 200, MAX_ERRJOURNAL = 100, MAX_STR = 2000;
    if (!Array.isArray(body.saved)) return res.status(400).json({error:"saved debe ser un array."});
    if (body.saved.length > MAX_SAVED) return res.status(400).json({error:"Demasiadas frases guardadas (máx "+MAX_SAVED+")."});
    for (const item of body.saved) {
      if (!item || typeof item !== "object" || typeof item.de !== "string" || typeof item.es !== "string")
        return res.status(400).json({error:"Cada frase debe tener 'de' y 'es' como string."});
      if (item.de.length > MAX_STR || item.es.length > MAX_STR)
        return res.status(400).json({error:"Frase demasiado larga (máx "+MAX_STR+" caracteres)."});
      if (typeof item.category !== "string" || !CATEGORIES_SET.has(item.category)) item.category = "";
    }
    if (!Array.isArray(body.chatLogs)) return res.status(400).json({error:"chatLogs debe ser un array."});
    if (body.chatLogs.length > MAX_CHATLOGS) return res.status(400).json({error:"Demasiados chats (máx "+MAX_CHATLOGS+")."});
    if (body.errorJournal && !Array.isArray(body.errorJournal)) return res.status(400).json({error:"errorJournal debe ser un array."});
    if (Array.isArray(body.errorJournal) && body.errorJournal.length > MAX_ERRJOURNAL) body.errorJournal = body.errorJournal.slice(-MAX_ERRJOURNAL);
    const existingData = auth.user.data || {};

    // ── Merge saved: keep the most-recent lastReviewed per phrase ──
    if (Array.isArray(body.saved)) {
      var savedMap = {};
      // Start with existing phrases
      if (Array.isArray(existingData.saved)) {
        existingData.saved.forEach(function(s){
          if (s.de) savedMap[s.de] = s;
        });
      }
      // Merge incoming (overwrite if newer or new)
      body.saved.forEach(function(s){
        if (!s.de) return;
        var existing = savedMap[s.de];
        if (!existing || (s.lastReviewed && (!existing.lastReviewed || new Date(s.lastReviewed) > new Date(existing.lastReviewed)))) {
          savedMap[s.de] = s;
        }
      });
      body.saved = Object.values(savedMap);
    }

    // ── Merge dailyLog: sum minutes / phrasesReviewed / drillsDone per day ──
    if (body.dailyLog && typeof body.dailyLog==="object" && existingData.dailyLog && typeof existingData.dailyLog==="object") {
      Object.keys(body.dailyLog).forEach(function(day){
        var incoming = body.dailyLog[day] || {};
        if (existingData.dailyLog[day]) {
          existingData.dailyLog[day].minutes = (existingData.dailyLog[day].minutes||0) + (incoming.minutes||0);
          existingData.dailyLog[day].phrasesReviewed = (existingData.dailyLog[day].phrasesReviewed||0) + (incoming.phrasesReviewed||0);
          existingData.dailyLog[day].drillsDone = (existingData.dailyLog[day].drillsDone||0) + (incoming.drillsDone||0);
        } else {
          existingData.dailyLog[day] = {
            minutes: Number(incoming.minutes)||0,
            phrasesReviewed: Number(incoming.phrasesReviewed)||0,
            drillsDone: Number(incoming.drillsDone)||0
          };
        }
      });
      body.dailyLog = existingData.dailyLog;
    } else if (body.dailyLog && typeof body.dailyLog==="object") {
      // No existing dailyLog — use incoming as-is
    }

    // ── Merge levelLog: incoming wins for same keys ──
    if (body.levelLog && typeof body.levelLog==="object" && existingData.levelLog && typeof existingData.levelLog==="object") {
      body.levelLog = Object.assign({}, existingData.levelLog, body.levelLog);
    }

    // ── Cases stats validation ──
    let cleanCasesStats = existingData.casesStats || {};
    const casesStats = body.casesStats;
    if (casesStats && typeof casesStats==="object" && !Array.isArray(casesStats)) {
      cleanCasesStats = {};
      if (["identificar","transformar","reglas","practicar"].includes(casesStats.casesSubtab)) cleanCasesStats.casesSubtab = casesStats.casesSubtab;
      if (["der","ein","mein"].includes(casesStats.casesArt)) cleanCasesStats.casesArt = casesStats.casesArt;
      if (["all","articulo","caso","mov","traduccion"].includes(casesStats.casesQuizMode)) cleanCasesStats.casesQuizMode = casesStats.casesQuizMode;
      ["casesNounIdx","casesHits","casesTotal","casesStreak"].forEach((k) => {
        const n = Number(casesStats[k]);
        if (Number.isFinite(n)) cleanCasesStats[k] = Math.max(0, Math.floor(n));
      });
    }

    // ── Assemble merged data (full-replace fields: incoming wins) ──
    var merged = Object.assign({}, existingData, {
      saved: body.saved,
      chatLogs: body.chatLogs,
      totalPhrases: Number(body.totalPhrases)||0,
      totalMinutes: Number(body.totalMinutes)||0,
      dailyLog: (body.dailyLog && typeof body.dailyLog==="object") ? body.dailyLog : (existingData.dailyLog||{}),
      levelLog: (body.levelLog && typeof body.levelLog==="object") ? body.levelLog : (existingData.levelLog||{}),
      shownPhrases: (body.shownPhrases && typeof body.shownPhrases==="object") ? body.shownPhrases : (existingData.shownPhrases||{}),
      weeklyGoal: Number(body.weeklyGoal)||60,
      level: body.level,
      grammarStats: (body.grammarStats && typeof body.grammarStats==="object") ? body.grammarStats : (existingData.grammarStats||{}),
      casesStats: cleanCasesStats,
      errorJournal: Array.isArray(body.errorJournal) ? body.errorJournal : (existingData.errorJournal||[])
    });
    await storage.updateUserData(auth.username, merged);
    res.json({ok:true});
  } catch(err) {
    console.error("[sync:post]", err);
    res.status(500).json({error:"Internal server error"});
  }
});

// AI proxy (OpenAI-compatible — defaults to OpenRouter free model)
app.post("/api/chat", async (req,res) => {
  try {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    if (!checkRateLimit(auth.username, "chat", 40))
      return res.status(429).json({error:{message:"Demasiadas solicitudes de IA. Espera unos minutos."}});
    // Only forward a safe allowlist of params, and clamp cost-driving fields.
    const src = req.body || {};
    if (!Array.isArray(src.messages)) return res.status(400).json({error:{message:"messages debe ser un array."}});
    const body = {
      model: AI_MODEL,
      messages: src.messages.slice(0, 40),
      temperature: typeof src.temperature === "number" ? Math.max(0, Math.min(2, src.temperature)) : undefined,
      top_p: typeof src.top_p === "number" ? Math.max(0, Math.min(1, src.top_p)) : undefined,
      max_tokens: Math.max(1, Math.min(2048, Number(src.max_tokens) || 1024)),
      response_format: (src.response_format && typeof src.response_format === "object") ? src.response_format : undefined,
      stop: src.stop
    };
    const r = await fetch(AI_URL, {
      method:"POST",
      headers:{
        "content-type":"application/json",
        "authorization":"Bearer "+AI_KEY
      },
      body:JSON.stringify(body)
    });
    const data = await r.json();
    if (data.error) {
      console.error("[AI proxy] "+r.status+" "+AI_MODEL+":", JSON.stringify(data.error));
    }
    res.json(data);
  } catch(err) {
    console.error("[AI proxy] fetch failed:", err.message);
    res.status(500).json({error:{message:err.message}});
  }
});

// AssemblyAI proxies
app.post("/api/upload", async (req,res) => {
  try {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    if (!checkRateLimit(auth.username, "voice", 30))
      return res.status(429).json({error:"Demasiadas transcripciones. Espera unos minutos."});
    const contentType = req.headers["content-type"] || "audio/webm";
    const r = await fetch("https://api.assemblyai.com/v2/upload", {
      method:"POST",
      headers:{ authorization:ASSEMBLY_KEY, "content-type":contentType },
      body:req.body
    });
    res.json(await r.json());
  } catch(err) { console.error("[upload]", err.message); res.status(500).json({error:"Error al subir el audio."}); }
});

app.post("/api/transcript", async (req,res) => {
  try {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    if (!checkRateLimit(auth.username, "voice", 30))
      return res.status(429).json({error:"Demasiadas transcripciones. Espera unos minutos."});
    const r = await fetch("https://api.assemblyai.com/v2/transcript", {
      method:"POST",
      headers:{authorization:ASSEMBLY_KEY,"content-type":"application/json"},
      body:JSON.stringify(req.body)
    });
    res.json(await r.json());
  } catch(err) { console.error("[transcript]", err.message); res.status(500).json({error:"Error al iniciar la transcripción."}); }
});

app.get("/api/transcript/:id", async (req,res) => {
  try {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    // Only allow AssemblyAI's opaque id format — never let arbitrary path segments reach the upstream URL.
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(req.params.id)) return res.status(400).json({error:"ID inválido."});
    const r = await fetch("https://api.assemblyai.com/v2/transcript/"+req.params.id, {
      headers:{authorization:ASSEMBLY_KEY}
    });
    res.json(await r.json());
  } catch(err) { console.error("[transcript:get]", err.message); res.status(500).json({error:"Error al obtener la transcripción."}); }
});

cleanupExpiredSessions().catch(err => console.error("[sessions cleanup]", err));

app.listen(PORT, () => console.log("DeutschLernen at http://localhost:"+PORT));
