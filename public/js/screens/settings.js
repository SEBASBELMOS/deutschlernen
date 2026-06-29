// ── SETTINGS ──────────────────────────────────────────────────────────────────
function renderSettings(){
  const el=document.getElementById("s-config"); el.innerHTML="";
  var settingsTitle=mk("h2","","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;margin-bottom:20px;");
  settingsTitle.appendChild(iconLabel("gear","Ajustes",22));
  el.appendChild(settingsTitle);

  // TTS Speed
  const ttsCard=document.createElement("div"); ttsCard.className="card";
  ttsCard.appendChild(mk("p","🔊  Velocidad TTS","font-size:10px;color:var(--gold-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:10px;font-weight:700;"));
  const ttsRate=parseFloat(localStorage.getItem("ttsRate")||"0.82");
  const ttsRow=mk("div","","display:flex;align-items:center;gap:12px;");
  const ttsSlider=document.createElement("input"); ttsSlider.type="range"; ttsSlider.min="0.5"; ttsSlider.max="1.5"; ttsSlider.step="0.05"; ttsSlider.setAttribute("aria-label","Velocidad de pronunciación");
  ttsSlider.value=ttsRate;
  ttsSlider.style.cssText="flex:1;accent-color:var(--gold);";
  const ttsLabel=mk("span",ttsRate.toFixed(2),"font-size:14px;color:var(--text);font-weight:700;min-width:40px;text-align:right;");
  ttsSlider.oninput=function(){
    const v=parseFloat(this.value);
    ttsLabel.textContent=v.toFixed(2);
    localStorage.setItem("ttsRate",v.toFixed(2));
  };
  ttsRow.appendChild(ttsSlider); ttsRow.appendChild(ttsLabel);
  ttsCard.appendChild(ttsRow);
  const ttsHint=mk("p","Prueba ▶ escuchar en cualquier tab para probar","font-size:11px;color:var(--muted);margin-top:8px;");
  ttsCard.appendChild(ttsHint);
  el.appendChild(ttsCard);

  // Weekly Goal
  const goalCard=document.createElement("div"); goalCard.className="card";
  goalCard.appendChild(mk("p","🎯  Meta semanal","font-size:10px;color:var(--teal-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:10px;font-weight:700;"));
  const goalRow=mk("div","","display:flex;align-items:center;gap:12px;");
  const goalInp=document.createElement("input"); goalInp.type="number"; goalInp.min="0"; goalInp.max="999"; goalInp.setAttribute("aria-label","Meta semanal en minutos");
  goalInp.value=state.session.weeklyGoal;
  goalInp.style.cssText="width:80px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 13px;font-size:16px;color:var(--text);outline:none;font-family:inherit;font-weight:700;text-align:center;";
  goalInp.onchange=function(){
    state.session.weeklyGoal=Math.max(0,parseInt(this.value)||60);
    this.value=state.session.weeklyGoal;
    syncUp();
    showToast("Meta actualizada: "+state.session.weeklyGoal+" min");
  };
  goalRow.appendChild(goalInp);
  goalRow.appendChild(mk("span","min / semana","font-size:13px;color:var(--muted);font-weight:600;"));
  goalCard.appendChild(goalRow);
  el.appendChild(goalCard);

  // AI Model
  const modelCard=document.createElement("div"); modelCard.className="card";
  modelCard.appendChild(mk("p","🤖  Modelo AI","font-size:10px;color:var(--purple-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:10px;font-weight:700;"));
  modelCard.appendChild(mk("p",state.app.serverInfo.model||"no disponible","font-size:15px;color:var(--text);font-weight:700;"));
  modelCard.appendChild(mk("p","Configurado en el servidor via AI_MODEL","font-size:11px;color:var(--muted);margin-top:6px;"));
  el.appendChild(modelCard);

  // Theme toggle
  const themeCard=document.createElement("div"); themeCard.className="card";
  themeCard.appendChild(mk("p","🎨  Tema","font-size:10px;color:var(--teal-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:10px;font-weight:700;"));
  const isLight=document.documentElement.classList.contains("light-mode");
  const themeRow=mk("div","","display:flex;align-items:center;justify-content:space-between;");
  themeRow.appendChild(mk("span",isLight?"☀️ Claro":"🌙 Oscuro","font-size:14px;color:var(--text);font-weight:600;"));
  const toggleBtn=document.createElement("button");
  toggleBtn.textContent=isLight?"Modo oscuro":"Modo claro";
  toggleBtn.style.cssText="padding:8px 16px;border-radius:10px;border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-size:13px;font-weight:700;cursor:pointer;transition:background 0.2s,transform 0.12s;";
  toggleBtn.onclick=function(){
    const html=document.documentElement;
    html.classList.toggle("light-mode");
    const nowLight=html.classList.contains("light-mode");
    toggleBtn.setAttribute("aria-pressed", nowLight?"false":"true");
    localStorage.setItem("dl_theme",nowLight?"light":"dark");
    renderSettings();
  };
  toggleBtn.setAttribute("aria-pressed", isLight?"false":"true");
  themeRow.appendChild(toggleBtn);
  themeCard.appendChild(themeRow);
  el.appendChild(themeCard);

  // Level
  const lvlCard=document.createElement("div"); lvlCard.className="card";
  lvlCard.appendChild(mk("p","📚  Nivel actual","font-size:10px;color:var(--green-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:10px;font-weight:700;"));
  const lvlRow=mk("div","","display:flex;gap:8px;");
  ["A2","B1","B2"].forEach(function(l){
    const btn=mk("button",l,"flex:1;padding:10px;border-radius:10px;border:none;font-size:14px;font-weight:800;cursor:pointer;transition:all 0.2s;");
    btn.style.background=state.app.level===l?"rgba(var(--green-rgb),0.15)":"rgba(255,255,255,0.04)";
    btn.style.color=state.app.level===l?"var(--green-text)":"var(--muted)";
    btn.style.border=state.app.level===l?"1px solid rgba(var(--green-rgb),0.3)":"1px solid rgba(255,255,255,0.08)";
    btn.onclick=function(){setLevel(l); renderSettings();};
    lvlRow.appendChild(btn);
  });
  lvlCard.appendChild(lvlRow);
  el.appendChild(lvlCard);

  // Export full progress
  const exportCard=document.createElement("div"); exportCard.className="card";
  exportCard.appendChild(mk("p","💾  DATOS","font-size:10px;color:var(--purple-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:10px;font-weight:700;"));
  const exportBtn=document.createElement("button");
  exportBtn.textContent="📥 Export progreso completo (JSON)";
  exportBtn.setAttribute("aria-label","Exportar progreso completo en JSON");
  exportBtn.style.cssText="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(var(--purple-rgb),0.22);background:rgba(var(--purple-rgb),0.08);color:var(--purple-text);font-size:14px;font-weight:700;cursor:pointer;text-align:left;transition:all 0.2s;";
  exportBtn.onclick=exportFullProgress;
  exportCard.appendChild(exportBtn);
  exportCard.appendChild(mk("p","dailyLog, racha, nivel, estadísticas de gramática, errores y más.","font-size:11px;color:var(--muted);margin-top:8px;font-weight:500;"));
  el.appendChild(exportCard);
}
