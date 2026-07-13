// ── SETTINGS (Fable visual port) ──────────────────────────────────────────────
function renderSettings(){
  const el=document.getElementById("s-config"); el.innerHTML="";

  // ── Fable header ──
  var hdr=mk("div","","margin-bottom:14px;");
  hdr.appendChild(mk("p","Cuenta · Preferencias","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","Ajustes","font-size:24px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin:3px 0 4px;color:var(--text);"));
  hdr.appendChild(mk("p","Tu app, a tu manera.","font-size:13px;color:var(--muted);font-weight:500;margin-bottom:0;"));
  el.appendChild(hdr);

  // ════════════════════════════════════════════════════════════════
  // SECTION: Apariencia (Fable switch toggle)
  // ════════════════════════════════════════════════════════════════
  var themeCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:16px;margin-bottom:12px;");
  themeCard.appendChild(mk("p","APARIENCIA","font-size:11px;letter-spacing:2px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:12px;"));

  var row=mk("div","","display:flex;align-items:center;gap:12px;");
  var ic=mk("span","🎨","width:36px;height:36px;border-radius:12px;background:rgba(var(--gold-rgb),0.1);display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;");
  row.appendChild(ic);

  var mid=mk("div","","flex:1;min-width:0;");
  var isLight=document.documentElement.classList.contains("light-mode");
  mid.appendChild(mk("b",isLight?"Modo claro":"Modo oscuro","display:block;font-size:14px;font-weight:800;letter-spacing:-0.01em;color:var(--text);"));
  mid.appendChild(mk("p",isLight?"Toca para oscuro":"Toca para claro","font-size:11.5px;color:var(--muted);font-weight:500;margin-top:2px;"));
  row.appendChild(mid);

  // Fable CSS-switch style toggle
  var switchLabel=document.createElement("label");
  switchLabel.style.cssText="position:relative;flex-shrink:0;";
  var switchInput=document.createElement("input"); switchInput.type="checkbox"; switchInput.checked=isLight;
  switchInput.style.cssText="display:none;";
  var track=mk("span","","display:block;width:52px;height:30px;border-radius:99px;cursor:pointer;background:rgba(255,255,255,.08);border:1px solid var(--border);transition:background .2s,border-color .2s;position:relative;");
  var dot=mk("span","","position:absolute;top:2px;left:2px;width:24px;height:24px;border-radius:99px;display:flex;align-items:center;justify-content:center;font-size:12px;transition:transform .2s cubic-bezier(.16,1,.3,1);box-shadow:0 2px 8px rgba(0,0,0,.4);background:"+(isLight?"var(--gold)":"#1a1a2e")+";");
  var dotEmoji=isLight?"☀️":"🌙"; dot.textContent=dotEmoji;
  if(isLight){track.style.background="rgba(var(--gold-rgb),0.25)";track.style.borderColor="rgba(var(--gold-rgb),0.5)";}

  function updateSwitchState(nowLight){
    var html=document.documentElement;
    if(nowLight){dot.textContent="☀️";dot.style.background="var(--gold)";dot.style.left="22px";track.style.background="rgba(var(--gold-rgb),0.25)";track.style.borderColor="rgba(var(--gold-rgb),0.5)";}
    else{dot.textContent="🌙";dot.style.background="#1a1a2e";dot.style.left="2px";track.style.background="rgba(255,255,255,.08)";track.style.borderColor="var(--border)";}
  }

  switchLabel.onclick=function(e){
    e.preventDefault();e.stopPropagation();
    var html=document.documentElement;
    html.classList.toggle("light-mode");
    var nowLight=html.classList.contains("light-mode");
    localStorage.setItem("dl_theme",nowLight?"light":"dark");
    switchInput.checked=nowLight;
    updateSwitchState(nowLight);
    // Update label text
    mid.innerHTML="";
    mid.appendChild(mk("b",nowLight?"Modo claro":"Modo oscuro","display:block;font-size:14px;font-weight:800;letter-spacing:-0.01em;color:var(--text);"));
    mid.appendChild(mk("p",nowLight?"Toca para oscuro":"Toca para claro","font-size:11.5px;color:var(--muted);font-weight:500;margin-top:2px;"));
  };

  track.appendChild(dot); switchLabel.appendChild(switchInput); switchLabel.appendChild(track);
  row.appendChild(switchLabel);
  themeCard.appendChild(row);
  el.appendChild(themeCard);

  // ════════════════════════════════════════════════════════════════
  // SECTION: Nivel (Fable progression chips)
  // ════════════════════════════════════════════════════════════════
  var lvlCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:16px;margin-bottom:12px;");
  lvlCard.appendChild(mk("p","TU NIVEL DE ALEMÁN","font-size:11px;letter-spacing:2px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:12px;"));

  var levelsWrap=mk("div","","display:flex;gap:6px;position:relative;margin-top:2px;");
  // Connecting line
  levelsWrap.style.cssText+=";--line-bg:rgba(255,255,255,0.07);";
  var chipLevels=[
    {label:"A2",key:"A2"},
    {label:"A2–B1",key:"A2-B1"},
    {label:"B1",key:"B1"},
    {label:"B1–B2",key:"B1-B2"},
    {label:"B2",key:"B2"}
  ];
  var curLevel=state.app.level||"A2";
  chipLevels.forEach(function(cl){
    var isActive=curLevel===cl.key||(typeof userLevel==="string"&&userLevel===cl.key);
    var chip=mk("button",cl.label,"flex:1;position:relative;z-index:1;text-align:center;padding:10px 4px;border-radius:12px;font-size:12px;font-weight:800;border:1.5px solid var(--border);cursor:pointer;transition:border-color .15s,color .15s,background .15s;white-space:nowrap;font-family:inherit;");
    if(isActive){
      chip.style.background="rgba(var(--gold-rgb),0.13)";
      chip.style.borderColor="var(--gold)";
      chip.style.color="var(--gold-text)";
      chip.style.boxShadow="0 4px 16px rgba(var(--gold-rgb),0.18)";
    } else {
      chip.style.background="#10101a";
      chip.style.color="var(--muted)";
    }
    chip.onmouseenter=function(){if(!isActive){this.style.color="var(--text)";this.style.borderColor="rgba(255,255,255,.22)";}};
    chip.onmouseleave=function(){if(!isActive){this.style.color="var(--muted)";this.style.borderColor="var(--border)";}};
    chip.onclick=function(){setLevel(cl.key);renderSettings();};
    levelsWrap.appendChild(chip);
  });
  lvlCard.appendChild(levelsWrap);

  var lvlNote=mk("p","","font-size:11px;color:var(--dim);font-weight:600;margin-top:10px;");
  lvlNote.innerHTML='Ajusta la dificultad de frases, drills y lecturas. Ahora: <b style="color:var(--muted);">'+(curLevel||"A2")+'</b>.';
  lvlCard.appendChild(lvlNote);
  el.appendChild(lvlCard);

  // ════════════════════════════════════════════════════════════════
  // SECTION: Preferencias (TTS + Weekly Goal — compact Fable style)
  // ════════════════════════════════════════════════════════════════
  var prefCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:16px;margin-bottom:12px;");
  prefCard.appendChild(mk("p","PREFERENCIAS","font-size:11px;letter-spacing:2px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:12px;"));

  // TTS Speed row
  var ttsRow=mk("div","","display:flex;align-items:center;gap:12px;padding:10px 2px;border-bottom:1px solid rgba(255,255,255,0.05);margin-bottom:10px;");
  var ttsIc=mk("span","🔊","width:34px;height:34px;border-radius:11px;background:rgba(var(--teal-rgb),0.1);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;");
  ttsRow.appendChild(ttsIc);
  var ttsMid=mk("div","","flex:1;min-width:0;");
  var ttsRate=parseFloat(localStorage.getItem("ttsRate")||"0.82");
  ttsMid.appendChild(mk("b","Velocidad TTS","display:block;font-size:13.5px;font-weight:700;color:var(--text);"));
  ttsMid.appendChild(mk("p",ttsRate.toFixed(2)+"×","font-size:11px;color:var(--muted);font-weight:500;margin-top:1px;"));
  ttsRow.appendChild(ttsMid);
  var ttsSlider=document.createElement("input"); ttsSlider.type="range"; ttsSlider.min="0.5"; ttsSlider.max="1.5"; ttsSlider.step="0.05"; ttsSlider.setAttribute("aria-label","Velocidad de pronunciación");
  ttsSlider.value=ttsRate;
  ttsSlider.style.cssText="width:120px;accent-color:var(--teal);flex-shrink:0;";
  ttsSlider.oninput=function(){
    var v=parseFloat(this.value);
    localStorage.setItem("ttsRate",v.toFixed(2));
    ttsMid.innerHTML="";
    ttsMid.appendChild(mk("b","Velocidad TTS","display:block;font-size:13.5px;font-weight:700;color:var(--text);"));
    ttsMid.appendChild(mk("p",v.toFixed(2)+"×","font-size:11px;color:var(--muted);font-weight:500;margin-top:1px;"));
  };
  ttsRow.appendChild(ttsSlider);
  prefCard.appendChild(ttsRow);

  // Weekly Goal row
  var goalRow=mk("div","","display:flex;align-items:center;gap:12px;padding:10px 2px;");
  var goalIc=mk("span","🎯","width:34px;height:34px;border-radius:11px;background:rgba(var(--gold-rgb),0.1);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;");
  goalRow.appendChild(goalIc);
  var goalMid=mk("div","","flex:1;min-width:0;");
  goalMid.appendChild(mk("b","Meta semanal","display:block;font-size:13.5px;font-weight:700;color:var(--text);"));
  goalMid.appendChild(mk("p",state.session.weeklyGoal+" min / semana","font-size:11px;color:var(--muted);font-weight:500;margin-top:1px;"));
  goalRow.appendChild(goalMid);
  var goalInp=document.createElement("input"); goalInp.type="number"; goalInp.min="0"; goalInp.max="999"; goalInp.setAttribute("aria-label","Meta semanal en minutos");
  goalInp.value=state.session.weeklyGoal;
  goalInp.style.cssText="width:80px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:9px 12px;font-size:14px;color:var(--text);outline:none;font-family:inherit;font-weight:700;text-align:center;flex-shrink:0;";
  goalInp.onchange=function(){
    state.session.weeklyGoal=Math.max(0,parseInt(this.value)||60);
    this.value=state.session.weeklyGoal;
    syncUp();
    showToast("Meta actualizada: "+state.session.weeklyGoal+" min");
    goalMid.innerHTML="";
    goalMid.appendChild(mk("b","Meta semanal","display:block;font-size:13.5px;font-weight:700;color:var(--text);"));
    goalMid.appendChild(mk("p",state.session.weeklyGoal+" min / semana","font-size:11px;color:var(--muted);font-weight:500;margin-top:1px;"));
  };
  goalRow.appendChild(goalInp);
  prefCard.appendChild(goalRow);
  el.appendChild(prefCard);

  // ════════════════════════════════════════════════════════════════
  // SECTION: Tus datos (Fable tinted rows)
  // ════════════════════════════════════════════════════════════════
  var dataCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:16px;margin-bottom:12px;");
  dataCard.appendChild(mk("p","TUS DATOS","font-size:11px;letter-spacing:2px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:0;"));

  // Import row
  var importBtn=document.createElement("button");
  importBtn.style.cssText="display:flex;align-items:center;gap:12px;width:100%;padding:13px 4px;border:none;background:transparent;color:var(--text);font-family:inherit;cursor:pointer;text-align:left;border-bottom:1px solid rgba(255,255,255,.05);transition:opacity .15s;";
  var impIc=mk("span","⬆️","width:34px;height:34px;border-radius:11px;background:rgba(var(--teal-rgb),0.1);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;");
  importBtn.appendChild(impIc);
  var impMid=mk("div","","flex:1;min-width:0;");
  impMid.appendChild(mk("b","Importar progreso","display:block;font-size:13.5px;font-weight:700;color:var(--text);"));
  impMid.appendChild(mk("p","Restaurá desde un archivo JSON","font-size:11px;color:var(--muted);font-weight:500;margin-top:1px;"));
  importBtn.appendChild(impMid);
  importBtn.appendChild(mk("span","›","color:var(--dim);font-size:16px;flex-shrink:0;"));
  importBtn.onmouseenter=function(){this.style.opacity="0.8";};
  importBtn.onmouseleave=function(){this.style.opacity="1";};
  importBtn.onclick=function(){
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
  dataCard.appendChild(importBtn);

  // Export row
  var exportBtn=document.createElement("button");
  exportBtn.style.cssText="display:flex;align-items:center;gap:12px;width:100%;padding:13px 4px;border:none;background:transparent;color:var(--text);font-family:inherit;cursor:pointer;text-align:left;border-bottom:1px solid rgba(255,255,255,.05);transition:opacity .15s;";
  var expIc=mk("span","⬇️","width:34px;height:34px;border-radius:11px;background:rgba(var(--gold-rgb),0.1);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;");
  exportBtn.appendChild(expIc);
  var expMid=mk("div","","flex:1;min-width:0;");
  expMid.appendChild(mk("b","Exportar progreso","display:block;font-size:13.5px;font-weight:700;color:var(--text);"));
  expMid.appendChild(mk("p","dailyLog, racha, frases, gramática → JSON","font-size:11px;color:var(--muted);font-weight:500;margin-top:1px;"));
  exportBtn.appendChild(expMid);
  exportBtn.appendChild(mk("span","›","color:var(--dim);font-size:16px;flex-shrink:0;"));
  exportBtn.onmouseenter=function(){this.style.opacity="0.8";};
  exportBtn.onmouseleave=function(){this.style.opacity="1";};
  exportBtn.onclick=exportFullProgress;
  dataCard.appendChild(exportBtn);

  // Password row (visual only — no modal exists yet)
  var passBtn=document.createElement("button");
  passBtn.style.cssText="display:flex;align-items:center;gap:12px;width:100%;padding:13px 4px;border:none;background:transparent;color:var(--text);font-family:inherit;cursor:pointer;text-align:left;transition:opacity .15s;";
  var passIc=mk("span","🔑","width:34px;height:34px;border-radius:11px;background:rgba(var(--purple-rgb),0.1);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;");
  passBtn.appendChild(passIc);
  var passMid=mk("div","","flex:1;min-width:0;");
  passMid.appendChild(mk("b","Cambiar contraseña","display:block;font-size:13.5px;font-weight:700;color:var(--text);"));
  passMid.appendChild(mk("p","Rotala cada tanto — buena práctica","font-size:11px;color:var(--muted);font-weight:500;margin-top:1px;"));
  passBtn.appendChild(passMid);
  passBtn.appendChild(mk("span","›","color:var(--dim);font-size:16px;flex-shrink:0;"));
  passBtn.onmouseenter=function(){this.style.opacity="0.8";};
  passBtn.onmouseleave=function(){this.style.opacity="1";};
  passBtn.onclick=function(){
    var current=prompt("Contraseña actual:");
    if(!current) return;
    var nueva=prompt("Nueva contraseña (mínimo 4 caracteres):");
    if(!nueva||nueva.length<4){showToast("Mínimo 4 caracteres","error");return;}
    fetch("/api/change-password",{
      method:"POST",
      headers:{"content-type":"application/json","x-token":state.app.authToken||""},
      body:JSON.stringify({currentPassword:current,newPassword:nueva})
    }).then(function(r){return r.json();}).then(function(d){
      if(d.ok) showToast("Contraseña actualizada","success");
      else showToast(d.error||"Error al cambiar","error");
    }).catch(function(){showToast("Error de conexión","error");});
  };
  dataCard.appendChild(passBtn);

  el.appendChild(dataCard);

  // ════════════════════════════════════════════════════════════════
  // SECTION: IA (compact)
  // ════════════════════════════════════════════════════════════════
  var iaCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:16px;margin-bottom:12px;");
  iaCard.appendChild(mk("p","IA","font-size:11px;letter-spacing:2px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:10px;"));
  var iaRow=mk("div","","display:flex;align-items:center;gap:12px;");
  var iaIc=mk("span","🤖","width:34px;height:34px;border-radius:11px;background:rgba(var(--purple-rgb),0.1);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;");
  iaRow.appendChild(iaIc);
  var iaMid=mk("div","","flex:1;min-width:0;");
  iaMid.appendChild(mk("b","Modelo AI","display:block;font-size:13.5px;font-weight:700;color:var(--text);"));
  iaMid.appendChild(mk("p",state.app.serverInfo.model||"no disponible","font-size:11px;color:var(--muted);font-weight:500;margin-top:1px;"));
  iaRow.appendChild(iaMid);
  iaCard.appendChild(iaRow);
  iaCard.appendChild(mk("p","Configurado en el servidor vía AI_MODEL","font-size:11px;color:var(--dim);margin-top:8px;font-weight:500;"));
  el.appendChild(iaCard);

  // ════════════════════════════════════════════════════════════════
  // SECTION: Logout (Fable red button)
  // ════════════════════════════════════════════════════════════════
  var logoutBtn=document.createElement("button");
  logoutBtn.style.cssText="width:100%;background:rgba(var(--red-rgb),0.08);border:1px solid rgba(var(--red-rgb),0.3);color:var(--red-text);border-radius:14px;padding:14px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;margin-top:4px;transition:background .15s,transform .1s;";
  logoutBtn.textContent="Cerrar sesión";
  logoutBtn.setAttribute("aria-label","Cerrar sesión");
  logoutBtn.onmouseenter=function(){this.style.background="rgba(var(--red-rgb),0.14)";};
  logoutBtn.onmouseleave=function(){this.style.background="rgba(var(--red-rgb),0.08)";};
  logoutBtn.onclick=function(){
    confirmModal("¿Cerrar sesión?","Tus datos se sincronizarán antes de salir.",function(){ doLogout(); });
  };
  el.appendChild(logoutBtn);

  // ── Version footer ──
  el.appendChild(mk("p","","font-size:10.5px;color:var(--dim);font-weight:600;margin-top:18px;letter-spacing:.5px;text-align:center;"));
  var verEl=el.lastChild;
  verEl.innerHTML='<b style="color:var(--muted);font-weight:800;">DeutschLernen</b> · v3.0 · made by <a href="https://sebasbelmos.github.io/" target="_blank" rel="noopener" style="color:var(--gold-text);text-decoration:none;font-weight:700;">sebasbelmos</a>';
}
