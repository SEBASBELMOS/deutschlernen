require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const MIMO_KEY = process.env.MIMO_KEY;
const ASSEMBLY_KEY = process.env.ASSEMBLY_KEY;
const DB_FILE = path.join(__dirname, "db.json");

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({users:{},sessions:{}}, null, 2));
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch(e) { return {users:{},sessions:{}}; }
}
function writeDB(db) { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }
function hashPw(pw) { return crypto.createHash("sha256").update("dl26_"+pw).digest("hex"); }
function makeToken() { return crypto.randomBytes(32).toString("hex"); }
function getAuth(req) {
  const token = req.headers["x-token"]||"";
  if (!token) return null;
  const db = readDB();
  const u = db.sessions[token];
  if (!u || !db.users[u]) return null;
  return {username:u, user:db.users[u], db, token};
}

app.use(express.json({limit:"10mb"}));
app.use(express.raw({type:"audio/*", limit:"25mb"}));
app.use(express.static(path.join(__dirname, "public")));

// Auth
app.post("/api/register", (req,res) => {
  const {username,password} = req.body||{};
  if (!username||!password) return res.json({error:"Completa todos los campos."});
  if (username.length<3) return res.json({error:"Username: minimo 3 caracteres."});
  if (password.length<4) return res.json({error:"Password: minimo 4 caracteres."});
  const db = readDB();
  if (db.users[username]) return res.json({error:"Ese username ya existe."});
  const emptyData = {saved:[],chatLogs:[],totalPhrases:0,totalMinutes:0};
  db.users[username] = {passwordHash:hashPw(password), createdAt:new Date().toISOString(), data:emptyData};
  const token = makeToken();
  db.sessions[token] = username;
  writeDB(db);
  res.json({ok:true, token, username, data:emptyData});
});

app.post("/api/login", (req,res) => {
  const {username,password} = req.body||{};
  if (!username||!password) return res.json({error:"Completa todos los campos."});
  const db = readDB();
  const user = db.users[username];
  if (!user) return res.json({error:"Usuario no encontrado."});
  if (user.passwordHash!==hashPw(password)) return res.json({error:"Password incorrecto."});
  const token = makeToken();
  db.sessions[token] = username;
  writeDB(db);
  res.json({ok:true, token, username, data:user.data});
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
  res.json({ok:true, data:auth.user.data});
});

app.post("/api/sync", (req,res) => {
  const auth = getAuth(req);
  if (!auth) return res.json({error:"No autenticado."});
  const {saved,chatLogs,totalPhrases,totalMinutes} = req.body||{};
  auth.db.users[auth.username].data = {
    saved: Array.isArray(saved)?saved:[],
    chatLogs: Array.isArray(chatLogs)?chatLogs:[],
    totalPhrases: Number(totalPhrases)||0,
    totalMinutes: Number(totalMinutes)||0
  };
  writeDB(auth.db);
  res.json({ok:true});
});

// MiMo proxy
app.post("/api/chat", async (req,res) => {
  try {
    const r = await fetch("https://api.xiaomimimo.com/v1/chat/completions", {
      method:"POST",
      headers:{"content-type":"application/json","authorization":"Bearer "+MIMO_KEY},
      body:JSON.stringify(req.body)
    });
    res.json(await r.json());
  } catch(err) { res.status(500).json({error:{message:err.message}}); }
});

// AssemblyAI proxies
app.post("/api/upload", async (req,res) => {
  try {
    const r = await fetch("https://api.assemblyai.com/v2/upload", {
      method:"POST", headers:{authorization:ASSEMBLY_KEY}, body:req.body
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

app.listen(PORT, () => console.log("DeutschLernen at http://localhost:"+PORT));