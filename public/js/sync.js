// ── Sync / Data ───────────────────────────────────────────────────────────────
function applyServerData(data) {
  if (Array.isArray(data.saved)) { state.session.saved=data.saved; state.session.saved.forEach(ensureSrsFields); invalidateFlashcardQueues(); }
  if (Array.isArray(data.chatLogs)) state.session.chatLogs=data.chatLogs;
  if (data.totalPhrases) state.session.sessionPhrases=data.totalPhrases;
  if (data.totalMinutes) state.session.sessionMinutes=data.totalMinutes;
  if (data.dailyLog && typeof data.dailyLog==="object") {
    var logs=cleanDailyLog(data.dailyLog);
    state.session.dailyLog=logs.dailyLog;
    state.session.levelLog=Object.assign({}, logs.levelLog, (data.levelLog&&typeof data.levelLog==="object"?data.levelLog:{}));
  }
  else if (data.levelLog && typeof data.levelLog==="object") state.session.levelLog=data.levelLog;
  if (data.shownPhrases && typeof data.shownPhrases==="object") state.session.shownPhrases=data.shownPhrases;
  if (data.weeklyGoal) state.session.weeklyGoal=Number(data.weeklyGoal)||60;
  if (data.level&&["A2","B1","B2"].includes(data.level)) state.app.level=data.level;
  if (data.grammarStats && typeof data.grammarStats==="object") state.grammar.grammarStats=data.grammarStats;
  if (data.casesStats && typeof data.casesStats==="object") {
    state.cases=Object.assign(state.cases||{}, data.casesStats);
    if(typeof casesInitState==="function") casesInitState();
  }
  if (Array.isArray(data.errorJournal)) state.session.errorJournal=data.errorJournal;
}

function lvlRange(){
  if(typeof userLevel==="string"&&userLevel) return userLevel;
  if(state.app.level==="A2") return "A2-B1";
  if(state.app.level==="B1") return "B1-B2";
  return "B2";
}

function setLevel(lvl) {
  if(lvl===state.app.level && (typeof userLevel!=="string"||userLevel===lvl)) return; // same level, no celebration
  state.app.level=lvl;
  if(typeof userLevel==="string"){
    userLevel=lvl;
    localStorage.setItem("dl_level",userLevel);
    if(typeof paintLevelPill==="function") paintLevelPill();
  }
  showToast("Nivel cambiado a "+lvl,"info");
  syncUp();
  if(state.app._motionOK) fireConfetti();
}

state.app.syncTimer=null;
function syncPayload(){
  var payload={saved:state.session.saved,chatLogs:state.session.chatLogs,totalPhrases:state.session.sessionPhrases,totalMinutes:state.session.sessionMinutes,dailyLog:state.session.dailyLog,levelLog:state.session.levelLog,shownPhrases:state.session.shownPhrases,weeklyGoal:state.session.weeklyGoal,level:state.app.level,grammarStats:state.grammar.grammarStats,errorJournal:state.session.errorJournal};
  if(typeof getCasesSyncState==="function") payload.casesStats=getCasesSyncState();
  return JSON.stringify(payload);
}
function setSyncChip(state){
  var chip=document.getElementById("sync-chip"); if(!chip) return;
  var lbl=document.getElementById("sync-lbl"); if(!lbl){lbl=document.createElement("span");lbl.id="sync-lbl";chip.appendChild(lbl);}
  chip.dataset.syncState=state;
  if(state==="saving"){ chip.style.display="flex"; lbl.textContent="\u27F3 guardando\u2026"; chip.style.color="var(--muted)"; chip.style.background="rgba(255,255,255,0.04)"; chip.style.border="1px solid rgba(255,255,255,0.06)"; }
  else if(state==="done"){ chip.style.display="flex"; lbl.textContent="\u2713 guardado"; chip.style.color="var(--green-text)"; chip.style.background="rgba(var(--green-rgb),0.08)"; chip.style.border="1px solid rgba(var(--green-rgb),0.15)"; setTimeout(function(){ if(chip.dataset.syncState==="done") chip.style.display="none"; },2500); }
  else if(state==="error"){ chip.style.display="flex"; lbl.textContent="\u26A0 sin guardar"; chip.style.color="var(--red-text)"; chip.style.background="rgba(var(--red-rgb),0.08)"; chip.style.border="1px solid rgba(var(--red-rgb),0.15)"; }
}
// Debounced: batches bursts of changes into a single POST after a 1200ms pause.
function syncUp() {
  if (!state.app.authToken) return;
  setSyncChip("saving");
  clearTimeout(state.app.syncTimer);
  state.app.syncTimer=setTimeout(syncNow,1200);
}
// Immediate flush with 3 retries (backoff 1s/2s/4s). Used by logout and beforeunload.
async function syncNow() {
  if (!state.app.authToken) return false;
  clearTimeout(state.app.syncTimer); state.app.syncTimer=null;
  for (let attempt=0; attempt<3; attempt++) {
    try {
      const r=await fetch("/api/sync",{method:"POST",headers:{"content-type":"application/json","x-token":state.app.authToken},body:syncPayload()});
      const data=await r.json();
      if(data.ok){ setSyncChip("done"); return true; }
      console.error("sync rejected",data.error); setSyncChip("error"); showToast(data.error||"No se pudo guardar","error"); return false;
    } catch(e){
      if(attempt<2){ await new Promise(function(res){setTimeout(res,1000*Math.pow(2,attempt));}); }
      else { console.error("sync failed",e); setSyncChip("error"); showToast("Sin conexión — cambios no guardados","error"); return false; }
    }
  }
}

function showApp() {
  document.getElementById("loading-screen").style.opacity="0";
  setTimeout(function(){
    document.getElementById("loading-screen").style.display="none";
    document.getElementById("login-screen").style.display="none";
    document.getElementById("app-header").style.display="block";
    document.getElementById("app").style.display="flex";
    document.getElementById("user-chip").style.display="flex";
    document.getElementById("user-lbl").textContent=state.app.authUser;
    if(typeof computeTier==="function"){
      var streak=typeof computeStreak==="function"?computeStreak():(state.session.streak||0);
      var t=computeTier(streak);
      var tb=document.getElementById("tier-badge");
      if(tb&&t){
        tb.style.display="inline-block";
        tb.textContent=t.icon+" "+t.label;
        tb.style.background="linear-gradient(135deg,rgba("+t.rgb+",0.18),rgba("+t.rgb+",0.06))";
        tb.style.border="1px solid rgba("+t.rgb+",0.35)";
        tb.style.color=t.color;
      }
    }
    state.app.currentTab="hoy";
    updateBadge(); renderTabs(); paintLevelPill(); showScreen("hoy");
    // Onboarding for new users
    if(!localStorage.getItem("dl_onboarding_done_"+state.app.authUser)) setTimeout(showOnboarding,400);
  },250);
}
