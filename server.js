require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const AI_KEY = process.env.AI_KEY || process.env.GROQ_KEY || process.env.OPENROUTER_KEY || process.env.MIMO_KEY;
const CATEGORIES = ["Trabajo","Viajes","Comida","Naturaleza","Sentimientos","Hogar","General"];
const CATEGORIES_SET = new Set(CATEGORIES);
const AI_URL = process.env.AI_URL || "https://api.groq.com/openai/v1/chat/completions";
const AI_MODEL = process.env.AI_MODEL || "llama-3.3-70b-versatile";
const ASSEMBLY_KEY = process.env.ASSEMBLY_KEY;
const DB_FILE = path.join(__dirname, "db.json");

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
function getAuth(req) {
  const token = req.headers["x-token"]||"";
  if (!token) return null;
  const db = readDB();
  let entry = db.sessions[token];
  if (!entry) return null;
  if (typeof entry === "string") entry = {username:entry, lastUsed:Date.now()};
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  if (Date.now() - entry.lastUsed > THIRTY_DAYS) {
    delete db.sessions[token];
    writeDB(db);
    return null;
  }
  entry.lastUsed = Date.now();
  const u = db.users[entry.username];
  if (!u) return null;
  db.sessions[token] = entry;
  writeDB(db);
  return {username:entry.username, user:u, db, token};
}

const rateLimits = new Map();
const RATE_WINDOW = 15 * 60 * 1000;
const RATE_MAX = 5;
function checkRateLimit(ip, endpoint) {
  const key = ip + ":" + endpoint;
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimits.set(key, {start: now, count: 1});
    return true;
  }
  entry.count++;
  return entry.count <= RATE_MAX;
}
function clearRateLimit(ip, endpoint) {
  rateLimits.delete(ip + ":" + endpoint);
}
function cleanupExpiredSessions() {
  const db = readDB();
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
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
setInterval(function(){
  const now = Date.now();
  for (const [key, entry] of rateLimits) {
    if (now - entry.start > RATE_WINDOW) rateLimits.delete(key);
  }
}, 60 * 1000).unref();

app.use(function(_,res,next){
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("X-Frame-Options","DENY");
  res.setHeader("Referrer-Policy","no-referrer");
  next();
});
app.use(express.json({limit:"10mb"}));
app.use(express.raw({type:["audio/*","application/octet-stream","video/*"], limit:"25mb"}));
app.use(express.static(path.join(__dirname, "public")));

// Auth
app.post("/api/register", (req,res) => {
  const {username,password} = req.body||{};
  if (!username||!password) return res.json({error:"Completa todos los campos."});
  if (username.length<3) return res.json({error:"Username: minimo 3 caracteres."});
  if (password.length<4) return res.json({error:"Password: minimo 4 caracteres."});
  if (!checkRateLimit(req.ip, "register"))
    return res.status(429).json({error:"Demasiados intentos. Espera 15 minutos."});
  const db = readDB();
  if (db.users[username]) return res.json({error:"Ese username ya existe."});
  const emptyData = {saved:[],chatLogs:[],totalPhrases:0,totalMinutes:0,dailyLog:{},shownPhrases:{},weeklyGoal:60};
  db.users[username] = {passwordHash:hashPw(password), createdAt:new Date().toISOString(), data:emptyData};
  const token = makeToken();
  db.sessions[token] = {username, lastUsed:Date.now()};
  writeDB(db);
  clearRateLimit(req.ip, "register");
  res.json({ok:true, token, username, data:emptyData, serverInfo:{model:AI_MODEL}});
});

app.post("/api/login", (req,res) => {
  const {username,password} = req.body||{};
  if (!username||!password) return res.json({error:"Completa todos los campos."});
  if (!checkRateLimit(req.ip, "login"))
    return res.status(429).json({error:"Demasiados intentos. Espera 15 minutos."});
  const db = readDB();
  const user = db.users[username];
  if (!user) return res.json({error:"Usuario no encontrado."});
  if (!verifyPw(password, user.passwordHash)) return res.json({error:"Password incorrecto."});
  if (!user.passwordHash.startsWith("scrypt:")) {
    user.passwordHash = hashPw(password);
  }
  const token = makeToken();
  db.sessions[token] = {username, lastUsed:Date.now()};
  writeDB(db);
  clearRateLimit(req.ip, "login");
  res.json({ok:true, token, username, data:user.data, serverInfo:{model:AI_MODEL}});
});

app.post("/api/logout", (req,res) => {
  const token = req.headers["x-token"]||"";
  if (token) { const db=readDB(); delete db.sessions[token]; writeDB(db); }
  res.json({ok:true});
});

// Sync
app.get("/api/sync", (req,res) => {
  const auth = getAuth(req);
  if (!auth) return res.json({error:"No autenticado."});
  res.json({ok:true, data:auth.user.data, serverInfo:{model:AI_MODEL}});
});

app.post("/api/sync", (req,res) => {
  const auth = getAuth(req);
  if (!auth) return res.json({error:"No autenticado."});
  const body = req.body||{};
  if (!Array.isArray(body.saved)) return res.status(400).json({error:"saved debe ser un array."});
  for (const item of body.saved) {
    if (!item || typeof item !== "object" || typeof item.de !== "string" || typeof item.es !== "string")
      return res.status(400).json({error:"Cada frase debe tener 'de' y 'es' como string."});
    if (typeof item.category !== "string" || !CATEGORIES_SET.has(item.category)) item.category = "";
  }
  if (!Array.isArray(body.chatLogs)) return res.status(400).json({error:"chatLogs debe ser un array."});
  if (body.errorJournal && !Array.isArray(body.errorJournal)) return res.status(400).json({error:"errorJournal debe ser un array."});
  const {saved,chatLogs,totalPhrases,totalMinutes,dailyLog,shownPhrases,weeklyGoal,level,grammarStats,errorJournal} = body;
  const existing = auth.user.data || {};
  auth.db.users[auth.username].data = {
    saved: saved,
    chatLogs: chatLogs,
    totalPhrases: Number(totalPhrases)||0,
    totalMinutes: Number(totalMinutes)||0,
    dailyLog: (dailyLog && typeof dailyLog==="object") ? dailyLog : (existing.dailyLog||{}),
    shownPhrases: (shownPhrases && typeof shownPhrases==="object") ? shownPhrases : (existing.shownPhrases||{}),
    weeklyGoal: Number(weeklyGoal)||60,
    level: level,
    grammarStats: (grammarStats && typeof grammarStats==="object") ? grammarStats : (existing.grammarStats||{}),
    errorJournal: Array.isArray(errorJournal) ? errorJournal : (existing.errorJournal||[])
  };
  writeDB(auth.db);
  res.json({ok:true});
});

// AI proxy (OpenAI-compatible — defaults to OpenRouter free model)
app.post("/api/chat", async (req,res) => {
  try {
    const body = Object.assign({}, req.body||{}, {model: AI_MODEL});
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
    const contentType = req.headers["content-type"] || "audio/webm";
    const r = await fetch("https://api.assemblyai.com/v2/upload", {
      method:"POST",
      headers:{ authorization:ASSEMBLY_KEY, "content-type":contentType },
      body:req.body
    });
    res.json(await r.json());
  } catch(err) { res.status(500).json({error:err.message}); }
});

app.post("/api/transcript", async (req,res) => {
  try {
    const r = await fetch("https://api.assemblyai.com/v2/transcript", {
      method:"POST",
      headers:{authorization:ASSEMBLY_KEY,"content-type":"application/json"},
      body:JSON.stringify(req.body)
    });
    res.json(await r.json());
  } catch(err) { res.status(500).json({error:err.message}); }
});

app.get("/api/transcript/:id", async (req,res) => {
  try {
    const r = await fetch("https://api.assemblyai.com/v2/transcript/"+req.params.id, {
      headers:{authorization:ASSEMBLY_KEY}
    });
    res.json(await r.json());
  } catch(err) { res.status(500).json({error:err.message}); }
});

cleanupExpiredSessions();

app.listen(PORT, () => console.log("DeutschLernen at http://localhost:"+PORT));