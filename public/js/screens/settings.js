// ── SETTINGS ──────────────────────────────────────────────────────────────────
function renderSettings(){
  const el=document.getElementById("s-config"); el.innerHTML="";

  // ── Header ──
  var settingsTitle=mk("h2","","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;margin-bottom:20px;");
  settingsTitle.appendChild(iconLabel("gear","Ajustes",22));
  el.appendChild(settingsTitle);

  // ════════════════════════════════════════════════════════════════
  // SECTION: Apariencia
  // ════════════════════════════════════════════════════════════════
  el.appendChild(mk("p","APARIENCIA","font-size:10px;color:var(--teal-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:8px;margin-left:2px;"));

  // Theme toggle inside a single-row card
  const themeCard=document.createElement("div"); themeCard.className="card";
  themeCard.style.cssText="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;";
  const isLight=document.documentElement.classList.contains("light-mode");
  const themeLeft=mk("div","","display:flex;align-items:center;gap:12px;");
  const themeIcon=mk("span",isLight?"☀️":"🌙","font-size:22px;");
  themeLeft.appendChild(themeIcon);
  const themeText=mk("div","","");
  themeText.appendChild(mk("p",isLight?"Modo claro":"Modo oscuro","font-size:14px;color:var(--text);font-weight:700;"));
  themeText.appendChild(mk("p","Toque para cambiar","font-size:11px;color:var(--muted);font-weight:500;"));
  themeLeft.appendChild(themeText);
  themeCard.appendChild(themeLeft);

  const toggleBtn=document.createElement("button");
  toggleBtn.style.cssText="width:52px;height:28px;border-radius:14px;border:none;background:rgba(var(--teal-rgb),0.25);position:relative;cursor:pointer;transition:background 0.25s;flex-shrink:0;";
  const toggleDot=mk("span","","display:block;width:22px;height:22px;border-radius:50%;background:var(--teal-text);position:absolute;top:3px;transition:left 0.25s ease;box-shadow:0 1px 3px rgba(0,0,0,0.3);");
  toggleDot.style.left=isLight?"27px":"3px";
  toggleBtn.style.background=isLight?"rgba(var(--teal-rgb),0.35)":"rgba(255,255,255,0.08)";
  toggleBtn.appendChild(toggleDot);

  toggleBtn.onclick=function(){
    const html=document.documentElement;
    html.classList.toggle("light-mode");
    const nowLight=html.classList.contains("light-mode");
    localStorage.setItem("dl_theme",nowLight?"light":"dark");
    renderSettings();
  };
  themeCard.appendChild(toggleBtn);
  el.appendChild(themeCard);

  // ════════════════════════════════════════════════════════════════
  // SECTION: Aprendizaje
  // ════════════════════════════════════════════════════════════════
  el.appendChild(mk("p","APRENDIZAJE","font-size:10px;color:var(--green-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:8px;margin-top:24px;margin-left:2px;"));

  // Level selector — expanded to A1-C1
  const lvlCard=document.createElement("div"); lvlCard.className="card";
  lvlCard.style.cssText="padding:14px 16px;";
  const lvlHeader=mk("div","","display:flex;align-items:center;gap:12px;margin-bottom:14px;");
  lvlHeader.appendChild(mk("span","📚","font-size:20px;"));
  const lvlHeaderText=mk("div","","");
  lvlHeaderText.appendChild(mk("p","Nivel actual","font-size:14px;color:var(--text);font-weight:700;"));
  lvlHeaderText.appendChild(mk("p","Ajustá la dificultad del contenido","font-size:11px;color:var(--muted);font-weight:500;"));
  lvlHeader.appendChild(lvlHeaderText);
  lvlCard.appendChild(lvlHeader);

  const lvlRow=mk("div","","display:grid;grid-template-columns:repeat(5,1fr);gap:8px;");
  ["A1","A2","B1","B2","C1"].forEach(function(l){
    const btn=mk("button",l,"padding:10px 6px;border-radius:var(--r-md);border:2px solid rgba(255,255,255,0.08);font-size:14px;font-weight:800;cursor:pointer;transition:all 0.2s;text-align:center;");
    if(state.app.level===l){
      btn.style.background="rgba(var(--green-rgb),0.15)";
      btn.style.color="var(--green-text)";
      btn.style.borderColor="rgba(var(--green-rgb),0.35)";
    } else {
      btn.style.background="transparent";
      btn.style.color="var(--muted)";
      btn.style.borderColor="rgba(255,255,255,0.08)";
    }
    btn.onclick=function(){setLevel(l); renderSettings();};
    lvlRow.appendChild(btn);
  });
  lvlCard.appendChild(lvlRow);
  el.appendChild(lvlCard);

  // ════════════════════════════════════════════════════════════════
  // SECTION: Preferencias
  // ════════════════════════════════════════════════════════════════
  el.appendChild(mk("p","PREFERENCIAS","font-size:10px;color:var(--gold-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:8px;margin-top:24px;margin-left:2px;"));

  // TTS Speed
  const ttsCard=document.createElement("div"); ttsCard.className="card";
  ttsCard.style.cssText="padding:14px 16px;";
  const ttsHeader=mk("div","","display:flex;align-items:center;gap:12px;margin-bottom:12px;");
  ttsHeader.appendChild(mk("span","🔊","font-size:20px;"));
  const ttsHeaderText=mk("div","","");
  ttsHeaderText.appendChild(mk("p","Velocidad TTS","font-size:14px;color:var(--text);font-weight:700;"));
  ttsHeaderText.appendChild(mk("p","Probá ▶ en cualquier tab","font-size:11px;color:var(--muted);font-weight:500;"));
  ttsHeader.appendChild(ttsHeaderText);
  ttsCard.appendChild(ttsHeader);

  const ttsRate=parseFloat(localStorage.getItem("ttsRate")||"0.82");
  const ttsRow=mk("div","","display:flex;align-items:center;gap:12px;");
  const ttsSlider=document.createElement("input"); ttsSlider.type="range"; ttsSlider.min="0.5"; ttsSlider.max="1.5"; ttsSlider.step="0.05"; ttsSlider.setAttribute("aria-label","Velocidad de pronunciación");
  ttsSlider.value=ttsRate;
  ttsSlider.style.cssText="flex:1;accent-color:var(--gold);";
  const ttsLabel=mk("span",ttsRate.toFixed(2)+"×","font-size:14px;color:var(--text);font-weight:700;min-width:44px;text-align:right;");
  ttsSlider.oninput=function(){
    const v=parseFloat(this.value);
    ttsLabel.textContent=v.toFixed(2)+"×";
    localStorage.setItem("ttsRate",v.toFixed(2));
  };
  ttsRow.appendChild(ttsSlider); ttsRow.appendChild(ttsLabel);
  ttsCard.appendChild(ttsRow);
  el.appendChild(ttsCard);

  // Weekly Goal
  const goalCard=document.createElement("div"); goalCard.className="card";
  goalCard.style.cssText="padding:14px 16px;";
  const goalHeader=mk("div","","display:flex;align-items:center;gap:12px;margin-bottom:12px;");
  goalHeader.appendChild(mk("span","🎯","font-size:20px;"));
  const goalHeaderText=mk("div","","");
  goalHeaderText.appendChild(mk("p","Meta semanal","font-size:14px;color:var(--text);font-weight:700;"));
  goalHeaderText.appendChild(mk("p","Minutos de práctica por semana","font-size:11px;color:var(--muted);font-weight:500;"));
  goalHeader.appendChild(goalHeaderText);
  goalCard.appendChild(goalHeader);

  const goalRow=mk("div","","display:flex;align-items:center;gap:12px;");
  const goalInp=document.createElement("input"); goalInp.type="number"; goalInp.min="0"; goalInp.max="999"; goalInp.setAttribute("aria-label","Meta semanal en minutos");
  goalInp.value=state.session.weeklyGoal;
  goalInp.style.cssText="width:80px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:var(--r-md);padding:10px 13px;font-size:16px;color:var(--text);outline:none;font-family:inherit;font-weight:700;text-align:center;";
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

  // ════════════════════════════════════════════════════════════════
  // SECTION: IA
  // ════════════════════════════════════════════════════════════════
  el.appendChild(mk("p","IA","font-size:10px;color:var(--purple-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:8px;margin-top:24px;margin-left:2px;"));

  // AI Model
  const modelCard=document.createElement("div"); modelCard.className="card";
  modelCard.style.cssText="padding:14px 16px;";
  const modelHeader=mk("div","","display:flex;align-items:center;gap:12px;");
  modelHeader.appendChild(mk("span","🤖","font-size:20px;"));
  const modelHeaderText=mk("div","","");
  modelHeaderText.appendChild(mk("p","Modelo AI","font-size:14px;color:var(--text);font-weight:700;"));
  modelHeaderText.appendChild(mk("p",state.app.serverInfo.model||"no disponible","font-size:13px;color:var(--purple-text);font-weight:500;margin-top:2px;"));
  modelHeader.appendChild(modelHeaderText);
  modelCard.appendChild(modelHeader);
  modelCard.appendChild(mk("p","Configurado en el servidor vía AI_MODEL","font-size:11px;color:var(--muted);margin-top:8px;font-weight:500;"));
  el.appendChild(modelCard);

  // ════════════════════════════════════════════════════════════════
  // SECTION: Datos
  // ════════════════════════════════════════════════════════════════
  el.appendChild(mk("p","DATOS","font-size:10px;color:var(--purple-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:8px;margin-top:24px;margin-left:2px;"));

  const dataGrid=mk("div","","display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;");

  // Export button card
  const exportCard=document.createElement("button");
  exportCard.style.cssText="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:20px 16px;border-radius:var(--r-lg);border:1px solid rgba(var(--purple-rgb),0.22);background:rgba(var(--purple-rgb),0.06);color:var(--purple-text);font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;text-align:center;";
  exportCard.innerHTML='<span style="font-size:28px;">📥</span> Exportar';
  exportCard.setAttribute("aria-label","Exportar progreso completo en JSON");
  exportCard.onclick=exportFullProgress;
  exportCard.onmouseenter=function(){this.style.background="rgba(var(--purple-rgb),0.12)";this.style.borderColor="rgba(var(--purple-rgb),0.4)";};
  exportCard.onmouseleave=function(){this.style.background="rgba(var(--purple-rgb),0.06)";this.style.borderColor="rgba(var(--purple-rgb),0.22)";};
  dataGrid.appendChild(exportCard);

  // Import button
  const importCard=document.createElement("button");
  importCard.style.cssText="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:20px 16px;border-radius:var(--r-lg);border:1px solid rgba(var(--gold-rgb),0.22);background:rgba(var(--gold-rgb),0.06);color:var(--gold-text);font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;text-align:center;";
  importCard.innerHTML='<span style="font-size:28px;">📤</span> Importar';
  importCard.setAttribute("aria-label","Importar progreso desde JSON");
  importCard.onclick=function(){
    var inp=document.createElement("input");inp.type="file";inp.accept=".json";
    inp.onchange=function(e){
      var file=e.target.files[0];if(!file)return;
      var reader=new FileReader();
      reader.onload=function(ev){
        try{
          var data=JSON.parse(ev.target.result);
          if(data.session){state.session=data.session;}
          if(data.logs){state.session.dailyLog=data.logs;}
          syncUp();showToast("Progreso importado ✓");
          renderSettings();
        }catch(err){showToast("Archivo inválido","error");}
      };
      reader.readAsText(file);
    };
    inp.click();
  };
  importCard.onmouseenter=function(){this.style.background="rgba(var(--gold-rgb),0.12)";this.style.borderColor="rgba(var(--gold-rgb),0.4)";};
  importCard.onmouseleave=function(){this.style.background="rgba(var(--gold-rgb),0.06)";this.style.borderColor="rgba(var(--gold-rgb),0.22)";};
  dataGrid.appendChild(importCard);
  el.appendChild(dataGrid);

  el.appendChild(mk("p","dailyLog, racha, nivel, estadísticas de gramática, errores y más.","font-size:11px;color:var(--muted);margin-bottom:24px;font-weight:500;text-align:center;"));

  // ════════════════════════════════════════════════════════════════
  // SECTION: Cuenta
  // ════════════════════════════════════════════════════════════════
  el.appendChild(mk("p","CUENTA","font-size:10px;color:var(--red-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:8px;margin-left:2px;"));

  // Logout button
  const logoutBtn=document.createElement("button");
  logoutBtn.style.cssText="width:100%;padding:14px;border:none;border-radius:var(--r-lg);background:rgba(var(--red-rgb),0.12);border:1px solid rgba(var(--red-rgb),0.25);color:var(--red-text);font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;";
  logoutBtn.innerHTML='<span style="font-size:18px;">🚪</span> Cerrar sesión';
  logoutBtn.setAttribute("aria-label","Cerrar sesión");
  logoutBtn.onclick=function(){
    if(confirm("¿Cerrar sesión? Tus datos locales se sincronizarán antes de salir.")){
      doLogout();
    }
  };
  logoutBtn.onmouseenter=function(){this.style.background="rgba(var(--red-rgb),0.20)";};
  logoutBtn.onmouseleave=function(){this.style.background="rgba(var(--red-rgb),0.12)";};
  el.appendChild(logoutBtn);

  // Version
  el.appendChild(mk("p","DeutschLernen v1.0 · Hecho con ❤️","font-size:11px;color:var(--muted);margin-top:20px;text-align:center;font-weight:500;opacity:0.6;"));
}
