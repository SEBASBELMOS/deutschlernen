// ── Sync / Data ───────────────────────────────────────────────────────────────
function applyServerData(data) {
  if (Array.isArray(data.saved)) { state.session.saved=data.saved; state.session.saved.forEach(ensureSrsFields); }
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
  if (Array.isArray(data.errorJournal)) state.session.errorJournal=data.errorJournal;
}

function lvlRange(){
  if(state.app.level==="A2") return "A2-B1";
  if(state.app.level==="B1") return "B1-B2";
  return "B2";
}

function setLevel(lvl) {
  if(lvl===state.app.level) return; // same level, no celebration
  state.app.level=lvl;
  showToast("Nivel cambiado a "+lvl,"info");
  syncUp();
  if(state.app._motionOK) fireConfetti();
}

state.app.syncTimer=null;
function syncPayload(){
  return JSON.stringify({saved:state.session.saved,chatLogs:state.session.chatLogs,totalPhrases:state.session.sessionPhrases,totalMinutes:state.session.sessionMinutes,dailyLog:state.session.dailyLog,levelLog:state.session.levelLog,shownPhrases:state.session.shownPhrases,weeklyGoal:state.session.weeklyGoal,level:state.app.level,grammarStats:state.grammar.grammarStats,errorJournal:state.session.errorJournal});
}
function setSyncChip(state){
  const el=document.getElementById("sync-status"); if(!el) return;
  el.dataset.syncState=state;
  if(state==="saving"){ el.style.display="inline-block"; el.innerHTML='<span aria-hidden="true" style="display:inline-block;animation:spin 0.8s linear infinite;">⟳</span><span class="sr-only">Guardando</span>'; el.title="Guardando…"; el.style.color="#94a3b8"; el.style.background="rgba(255,255,255,0.06)"; }
  else if(state==="done"){ el.style.display="inline-block"; el.innerHTML='<span aria-hidden="true">✓</span><span class="sr-only">Guardado</span>'; el.title="Guardado"; el.style.color="#4ade80"; el.style.background="rgba(74,222,128,0.1)"; setTimeout(function(){ if(el.dataset.syncState==="done") el.style.display="none"; },2000); }
  else if(state==="error"){ el.style.display="inline-block"; el.innerHTML='<span aria-hidden="true">⚠</span><span class="sr-only">Error de conexión</span>'; el.title="Sin guardar"; el.style.color="#F87171"; el.style.background="rgba(248,113,113,0.1)"; }
}
// Debounced: agrupa ráfagas de cambios en un solo POST tras 1200ms de pausa.
function syncUp() {
  if (!state.app.authToken) return;
  setSyncChip("saving");
  clearTimeout(state.app.syncTimer);
  state.app.syncTimer=setTimeout(syncNow,1200);
}
// Flush inmediato con 3 reintentos (backoff 1s/2s/4s). Usado por logout y beforeunload.
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
    state.app.currentTab="hoy";
    updateBadge(); renderTabs(); showScreen("hoy");
    // Onboarding for new users
    if(!localStorage.getItem("dl_onboarding_done_"+state.app.authUser)) setTimeout(showOnboarding,400);
  },250);
}
