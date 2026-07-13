// ── Auth ──────────────────────────────────────────────────────────────────────
function toggleAuthMode() {
  state.app.isRegister=!state.app.isRegister;
  document.querySelector(".login-toggle").textContent=state.app.isRegister?"Ya tienes cuenta? Login":"No tienes cuenta? Regístrate";
  document.getElementById("login-btn").textContent=state.app.isRegister?"Crear cuenta":"Iniciar sesión";
}

async function doAuth() {
  const username=document.getElementById("login-user").value.trim();
  const password=document.getElementById("login-pass").value.trim();
  const errEl=document.getElementById("login-err");
  const btn=document.getElementById("login-btn");
  if(btn.disabled) return;
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
  } catch(e){console.error("[doAuth]",e);errEl.textContent="Error: "+e.message;btn.disabled=false;btn.textContent=state.app.isRegister?"Crear cuenta":"Iniciar sesión";}
}

async function showResetPassword() {
  const username = document.getElementById("login-user").value.trim();
  if (!username) {
    document.getElementById("login-err").textContent = "Ingresa tu usuario primero.";
    return;
  }
  const newPass = prompt("Ingresa tu nueva contraseña (mínimo 4 caracteres):");
  if (!newPass || newPass.length < 4) return;
  const currentPass = prompt("Confirma tu contraseña actual:");
  if (!currentPass) return;
  try {
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "content-type": "application/json", "x-token": "" },
      body: JSON.stringify({ username, currentPassword: currentPass, newPassword: newPass })
    });
    const data = await res.json();
    document.getElementById("login-err").textContent = data.error || "Contraseña cambiada. Iniciá sesión.";
  } catch(e) {
    document.getElementById("login-err").textContent = "Error al conectar.";
  }
}

async function doLogout() {
  saveChatLog();
  await syncNow();  // immediate flush before clearing the token (the debounce wouldn't make it)
  try {await fetch("/api/logout",{method:"POST",headers:{"x-token":state.app.authToken||""}});} catch(e){console.error("logout failed",e);}
  state.app.authToken=null; state.app.authUser=null;
  state.session.saved=[]; state.session.chatLogs=[]; state.session.sessionPhrases=0; state.session.sessionMinutes=0; state.session.shownPhrases={};
  state.session.dailyLog={}; state.session.levelLog={}; state.session.errorJournal=[]; state.session.weeklyGoal=60;
  invalidateFlashcardQueues();
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
