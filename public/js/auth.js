// ── Auth ──────────────────────────────────────────────────────────────────────
function toggleAuthMode() {
  state.app.isRegister=!state.app.isRegister;
  document.getElementById("auth-mode-lbl").textContent=state.app.isRegister?"Modo: Registro":"Modo: Login";
  document.querySelector(".login-toggle").textContent=state.app.isRegister?"Ya tienes cuenta? Login":"No tienes cuenta? Regístrate";
  document.getElementById("login-btn").textContent=state.app.isRegister?"Crear cuenta":"Iniciar sesión";
}

async function doAuth() {
  const username=document.getElementById("login-user").value.trim();
  const password=document.getElementById("login-pass").value.trim();
  const errEl=document.getElementById("login-err");
  const btn=document.getElementById("login-btn");
  errEl.textContent="";
  if (!username||!password){errEl.textContent="Completa todos los campos.";return;}
  btn.disabled=true; btn.textContent="Cargando...";
  try {
    const res=await fetch(state.app.isRegister?"/api/register":"/api/login",{
      method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({username,password})
    });
    const data=await res.json();
    if (data.error){errEl.textContent=data.error;btn.disabled=false;btn.textContent=state.app.isRegister?"Crear cuenta":"Iniciar sesión";return;}
    state.app.authToken=data.token; state.app.authUser=data.username;
    localStorage.setItem("dl_token",state.app.authToken);
    localStorage.setItem("dl_user",state.app.authUser);
    if (data.data) applyServerData(data.data);
    if (data.serverInfo) state.app.serverInfo=data.serverInfo;
    showApp();
  } catch(e){errEl.textContent="Error al conectar. Verifica tu conexión.";btn.disabled=false;btn.textContent=state.app.isRegister?"Crear cuenta":"Iniciar sesión";}
}

async function doLogout() {
  saveChatLog();
  await syncNow();  // immediate flush before clearing the token (the debounce wouldn't make it)
  try {await fetch("/api/logout",{method:"POST",headers:{"x-token":state.app.authToken||""}});} catch(e){console.error("logout failed",e);}
  state.app.authToken=null; state.app.authUser=null;
  state.session.saved=[]; state.session.chatLogs=[]; state.session.sessionPhrases=0; state.session.sessionMinutes=0; state.session.shownPhrases={};
  state.session.dailyLog={}; state.session.levelLog={}; state.session.errorJournal=[]; state.session.weeklyGoal=60;
  state.chat.chatHistory=[]; state.chat.chatScenario=null;
  localStorage.removeItem("dl_token"); localStorage.removeItem("dl_user");
  document.getElementById("app-header").style.display="none";
  document.getElementById("app").style.display="none";
  document.getElementById("login-screen").style.display="flex";
  document.getElementById("user-chip").style.display="none";
  document.getElementById("login-user").value="";
  document.getElementById("login-pass").value="";
  document.getElementById("login-btn").textContent="Iniciar sesión";
}
