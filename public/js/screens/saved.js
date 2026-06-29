// ── Saved (vocab packs) ───────────────────────────────────────────────────────
function renderSaved() {
  const el=document.getElementById("s-guardadas"); el.innerHTML="";
  const hdr=mk("div","","margin-bottom:14px;");
  hdr.appendChild(mk("h2","Guardadas","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  el.appendChild(hdr);

  const subBar=mk("div","","display:flex;gap:8px;margin-bottom:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:4px;");
  ["frases","chats","tabla","paquetes"].forEach(function(t){
    const btn=document.createElement("button");
    btn.style.cssText="flex:1;padding:9px;border-radius:10px;border:none;font-size:13px;font-weight:700;cursor:pointer;transition:background 0.2s,color 0.2s,box-shadow 0.2s;display:flex;align-items:center;justify-content:center;gap:6px;";
    var tabMeta=t==="frases"?{i:"star",l:"Frases"}:t==="chats"?{i:"chat",l:"Chats"}:t==="tabla"?{i:"table",l:"Tabla"}:{i:"package",l:"Temas"};
    btn.appendChild(ico(tabMeta.i,15)); btn.appendChild(document.createTextNode(tabMeta.l));
    if(state.savedView.savedTab===t){
      btn.style.background="var(--gold)"; btn.style.color="#000"; btn.style.boxShadow="0 2px 10px rgba(var(--gold-rgb),0.3)";
    } else {
      btn.style.background="transparent"; btn.style.color="var(--muted)";
    }
    btn.onclick=function(){state.savedView.savedTab=t;renderSaved();};
    subBar.appendChild(btn);
  });
  el.appendChild(subBar);

  if(state.savedView.savedTab==="frases"){
    if(!state.session.saved.length){
      var empty=mk("div","","text-align:center;padding:50px 0;color:var(--muted);");
      var emptyIcon=mk("div","","font-size:44px;margin-bottom:14px;color:var(--gold-text);display:flex;justify-content:center;");
      emptyIcon.appendChild(ico("star",44));
      empty.appendChild(emptyIcon);
      empty.appendChild(mk("p","Sin frases guardadas","font-weight:700;font-size:15px;color:var(--text2);margin-bottom:6px;"));
      empty.appendChild(mk("p","En Frases o No entendi, toca la estrella para guardar.","font-size:13px;font-weight:500;"));
      el.appendChild(empty);
      return;
    }
    const searchRow=mk("div","","display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap;");
    const createBtn=mk("button","+ Crear","font-size:12px;color:#000;background:var(--gold);border:none;border-radius:8px;padding:7px 11px;font-weight:700;");
    createBtn.onclick=openCreateModal;
    searchRow.appendChild(createBtn);
    const catFilter=document.createElement("select");
    catFilter.className="input-field";
    catFilter.style.cssText="font-size:12px;font-weight:600;padding:6px 8px;color:var(--text);max-width:130px;";
    ["Todas","Sin categoría",...CATEGORIES].forEach(function(c){const o=document.createElement("option");o.value=c;o.textContent=c;if(c===state.savedView.savedFilterCat)o.selected=true;catFilter.appendChild(o);});
    catFilter.onchange=function(){state.savedView.savedFilterCat=this.value;renderSavedList(listHost);};
    searchRow.appendChild(catFilter);
    const search=document.createElement("input"); search.type="text"; search.placeholder="Buscar..."; search.value=state.savedView.savedFilter;
    search.className="input-field";
    search.style.cssText="flex:1;font-size:13px;padding:8px 12px;font-weight:500;";
    search.oninput=function(){ state.savedView.savedFilter=this.value; renderSavedList(listHost); };
    searchRow.appendChild(search);
    const exportBtn=mk("button","⤓ CSV","font-size:12px;color:var(--teal-text);background:rgba(var(--teal-rgb),0.08);border:1px solid rgba(var(--teal-rgb),0.25);border-radius:8px;padding:7px 11px;font-weight:700;");
    exportBtn.onclick=exportSavedCsv;
    searchRow.appendChild(exportBtn);
    const clearBtn=mk("button","🗑","font-size:14px;color:var(--red-text);background:none;border:1px solid rgba(var(--red-rgb),0.28);border-radius:8px;padding:6px 10px;font-weight:600;");
    clearBtn.title="Borrar todas";
    clearBtn.onclick=function(){if(confirm("Borrar todas las frases?")){state.session.saved=[];updateBadge();syncUp();renderSaved();}};
    searchRow.appendChild(clearBtn);
    el.appendChild(searchRow);
    el.appendChild(mk("p",state.session.saved.length+" guardada(s)","color:var(--muted);font-size:12px;font-weight:600;margin-bottom:10px;"));

    const listHost=document.createElement("div"); el.appendChild(listHost);
    renderSavedList(listHost);
  } else if(state.savedView.savedTab==="tabla"){
    if(!state.session.saved.length){
      el.innerHTML+="<div style='text-align:center;padding:50px 0;color:var(--muted);'><div style='font-size:44px;margin-bottom:14px;'>📊</div><p style='font-weight:700;font-size:15px;color:var(--text2);margin-bottom:6px;'>Sin vocabulario</p><p style='font-size:13px;font-weight:500;'>No hay frases guardadas para mostrar.</p></div>";
      return;
    }
    const listHost=document.createElement("div"); el.appendChild(listHost);
    renderVocabTable(listHost);
  } else if(state.savedView.savedTab==="paquetes"){
    const intro=mk("p","Elige un paquete, guarda palabras y mira tu avance al instante.","font-size:13px;color:var(--muted);font-weight:500;margin-bottom:14px;");
    el.appendChild(intro);
    var packs=[
      {icon:"file",name:"Trámites",desc:"Documentos, citas y burocracia",list:ERRANDS_VOCAB,cat:"Trámites",color:"#ffb955",textColor:"var(--gold-text)",rgb:"255,185,85"},
      {icon:"laptop",name:"Tech",desc:"Desarrollo, IT y herramientas",list:TECH_VOCAB,cat:"Tech",color:"#5dd9d0",textColor:"var(--teal-text)",rgb:"93,217,208"},
      {icon:"plane",name:"Viaje",desc:"Transporte, hotel y aeropuerto",list:TRAVEL_VOCAB,cat:"Viaje",color:"#4ade80",textColor:"var(--green-text)",rgb:"123,216,155"},
      {icon:"utensils",name:"Comida",desc:"Restaurante, pedidos y cocina",list:FOOD_VOCAB,cat:"Comida",color:"#ffb4ab",textColor:"var(--red-text)",rgb:"255,180,171"},
      {icon:"link",name:"Conectores",desc:"weil, obwohl, deshalb, wenn...",list:CONNECTORS_VOCAB,cat:"Conectores",color:"#c4a7e7",textColor:"var(--purple-text)",rgb:"196,167,231"}
    ];
    var grid=mk("div",""); grid.className="vocab-pack-grid";
    packs.forEach(function(p){
      var card=document.createElement("div"); card.className="card";
      card.className="card vocab-pack-card";
      card.style.setProperty("--pack-accent",p.color);
      card.style.setProperty("--pack-color",p.textColor);
      card.style.setProperty("--pack-rgb",p.rgb);
      card.style.background="linear-gradient(145deg,rgba("+p.rgb+",0.14),rgba(255,255,255,0.035))";
      card.style.borderColor="rgba("+p.rgb+",0.28)";
      card.style.animation="fadeUp 0.2s both";
      var iconCircle=mk("div",""); iconCircle.className="vocab-pack-icon"; iconCircle.appendChild(ico(p.icon,31,"currentColor"));
      card.appendChild(iconCircle);
      card.appendChild(mk("p",p.name,"font-size:18px;font-weight:900;color:var(--text);letter-spacing:-0.02em;"));
      card.appendChild(mk("p",p.desc,"font-size:12px;color:var(--text2);font-weight:600;line-height:1.35;"));
      var saved=p.list.filter(function(item){return state.session.saved.some(function(x){return x.de===item.de;});}).length;
      card.appendChild(mk("p",saved+"/"+p.list.length+" guardadas","font-size:11px;color:var(--muted);font-weight:800;"));
      var progress=mk("div",""); progress.className="vocab-pack-progress"; var fill=mk("span",""); fill.style.width=Math.round((saved/p.list.length)*100)+"%"; progress.appendChild(fill); card.appendChild(progress);
      var btn=mk("button",saved===p.list.length?"Repasar paquete":"Abrir paquete","");
      btn.className="vocab-pack-cta";
      btn.onclick=function(e){e.stopPropagation();showVocabPack(el,p.name,p.icon,p.list,p.cat);};
      card.appendChild(btn);
      card.onclick=function(){showVocabPack(el,p.name,p.icon,p.list,p.cat);};
      grid.appendChild(card);
    });
    el.appendChild(grid);
  } else {
    if(!state.session.chatLogs.length){
      el.innerHTML+="<div style='text-align:center;padding:50px 0;color:var(--muted);'><div style='font-size:44px;margin-bottom:14px;'>💬</div><p style='font-weight:700;font-size:15px;color:var(--text2);margin-bottom:6px;'>Sin chats guardados</p><p style='font-size:13px;font-weight:500;'>En Conversar, pulsa Guardar o Cambiar.</p></div>";
      return;
    }
    state.session.chatLogs.forEach(function(log,i){
      const card=document.createElement("div"); card.className="card";
      card.style.animation="fadeUp 0.2s "+(i*0.05)+"s both";
      const header=mk("div","","display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;gap:8px;");
      header.appendChild(mk("p",log.scenario,"font-size:14px;font-weight:700;color:var(--text);flex:1;letter-spacing:-0.01em;"));
      header.appendChild(mk("span",log.date,"font-size:11px;color:var(--muted);font-weight:500;flex-shrink:0;"));
      card.appendChild(header);
      card.appendChild(mk("p",log.messages.length+" mensajes","font-size:12px;color:var(--muted);margin-bottom:10px;font-weight:600;"));
      const msgs=document.createElement("div"); msgs.style.display="none";
      log.messages.forEach(function(m){
        const isUser=m.role==="user";
        const row=mk("div","","display:flex;justify-content:"+(isUser?"flex-end":"flex-start")+";margin-bottom:6px;");
        const bub=mk("p",m.content,"max-width:90%;padding:8px 12px;font-size:13px;border-radius:12px;line-height:1.55;white-space:pre-wrap;font-weight:500;");
        bub.style.background=isUser?"rgba(var(--teal-rgb),0.1)":"rgba(255,255,255,0.06)";
        bub.style.border="1px solid "+(isUser?"rgba(var(--teal-rgb),0.2)":"rgba(255,255,255,0.08)");
        bub.style.color="var(--text)"; row.appendChild(bub); msgs.appendChild(row);
      });
      card.appendChild(msgs);
      let open=false;
      const toggle=mk("button","Ver conversacion ↓","font-size:12px;color:var(--teal-text);background:none;border:none;padding:0;font-weight:700;");
      toggle.onclick=function(e){e.stopPropagation();open=!open;msgs.style.display=open?"block":"none";toggle.textContent=open?"Ocultar ↑":"Ver conversacion ↓";};
      card.appendChild(toggle); el.appendChild(card);
    });
    const clearBtn=document.createElement("button");
    clearBtn.className="btn-danger";
    clearBtn.textContent="Borrar historial";
    clearBtn.style.marginTop="8px";
    clearBtn.style.width="100%";
    clearBtn.onclick=function(){if(confirm("Borrar historial de chats?")){state.session.chatLogs=[];syncUp();renderSaved();}};
    el.appendChild(clearBtn);
  }
}

function renderSavedList(host){
  host.innerHTML="";
  const q=state.savedView.savedFilter.trim().toLowerCase();
  const filtered=state.session.saved.filter(function(ph){
    ensureSrsFields(ph);
    const catMatch=state.savedView.savedFilterCat==="Todas"||(state.savedView.savedFilterCat==="Sin categoría"?(!ph.category):ph.category===state.savedView.savedFilterCat);
    if(!catMatch) return false;
    if(!q) return true;
    return (ph.de||"").toLowerCase().indexOf(q)>=0 || (ph.es||"").toLowerCase().indexOf(q)>=0;
  });
  if(!filtered.length){
    host.appendChild(mk("p","Sin resultados para \""+q+"\"","color:var(--muted);font-size:13px;text-align:center;padding:30px 0;font-weight:500;"));
    return;
  }
  filtered.forEach(function(ph,i){
    ensureSrsFields(ph);
    const card=document.createElement("div"); card.className="card";
    card.style.borderColor="rgba(var(--gold-rgb),0.12)";
    card.style.animation="fadeUp 0.2s "+(Math.min(i,10)*0.04)+"s both";
    const topRow=mk("div","","display:flex;justify-content:space-between;align-items:center;gap:12px;");
    const txt=mk("div","","flex:1;min-width:0;");
    txt.appendChild(mk("p",ph.de,"font-size:15px;font-weight:700;color:var(--text);letter-spacing:-0.01em;"));
    txt.appendChild(mk("p",ph.es,"font-size:13px;color:var(--text2);margin-top:4px;font-weight:500;"));
    txt.appendChild(mk("p","caja "+ph.box+" · "+ph.nextReview,"font-size:10px;color:var(--muted);margin-top:4px;font-weight:600;letter-spacing:0.5px;"));
    const right=mk("div","","display:flex;align-items:center;gap:4px;flex-shrink:0;");
    const play=document.createElement("button"); play.className="icon-btn"; play.setAttribute("aria-label","Escuchar");play.innerHTML="&#9654;"; play.style.color="var(--gold-text)"; play.style.fontSize="20px";
    play.onclick=function(){speak(ph.de);};
    const del=document.createElement("button"); del.className="icon-btn"; del.setAttribute("aria-label","Eliminar");del.innerHTML="&times;"; del.style.color="var(--muted)"; del.style.fontSize="20px";
    del.title="Eliminar";
    del.onclick=function(){
      var removedPh=ph; var idx=state.session.saved.indexOf(ph);
      if(idx>=0){ state.session.saved.splice(idx,1); updateBadge(); syncUp(); renderSaved(); showToast("Frase eliminada — Deshacer","undo",function(){state.session.saved.push(removedPh);updateBadge();syncUp();renderSaved();}); }
    };
    right.appendChild(play); right.appendChild(del);
    topRow.appendChild(txt); topRow.appendChild(right); card.appendChild(topRow);
    const catRow=mk("div","","display:flex;align-items:center;gap:6px;margin-top:8px;");
    const catLbl=mk("span",ph.category||"Sin categoría","font-size:11px;font-weight:700;color:"+(ph.category?"var(--gold)":"var(--muted)")+";background:"+(ph.category?"rgba(var(--gold-rgb),0.1)":"rgba(255,255,255,0.04)")+";padding:2px 10px;border-radius:20px;");
    const catBtn=document.createElement("button");
    catBtn.className="cat-edit-btn";
    catBtn.textContent="✏️";
    catRow.appendChild(catLbl); catRow.appendChild(catBtn);
    var catSelect=document.createElement("select");
    catSelect.style.cssText="display:none;font-size:11px;font-weight:600;background:rgba(255,255,255,0.06);border:1px solid rgba(var(--gold-rgb),0.3);border-radius:8px;padding:4px 6px;color:var(--text);outline:none;font-family:inherit;";
    [""].concat(CATEGORIES).forEach(function(c){
      var o=document.createElement("option");o.value=c;o.textContent=c||"Sin categoría";
      if(c===ph.category)o.selected=true;catSelect.appendChild(o);
    });
    catSelect.onchange=function(){
      ph.category=this.value;state.session.saved[state.session.saved.indexOf(ph)]=ph;syncUp();renderSaved();
    };
    catRow.appendChild(catSelect);
    catBtn.onclick=function(){
      var showing=catSelect.style.display==="inline-block";
      catSelect.style.display=showing?"none":"inline-block";
      catLbl.style.display=showing?"inline-block":"none";
    };
    catSelect.onblur=function(){
      catSelect.style.display="none";catLbl.style.display="inline-block";
    };
    card.appendChild(catRow);
    host.appendChild(card);
  });
}

// ── VOCAB TABLE ───────────────────────────────────────────────────────────────
function renderVocabTable(host){
  host.innerHTML="";
  const today=todayKey();
  const sortField={cat:"category",de:"de",es:"es",box:"box",nextReview:"nextReview",lapses:"lapses"}[state.savedView.vocabSortCol]||state.savedView.vocabSortCol;
  const list=[...state.session.saved].sort(function(a,b){
    let va=a[sortField]||"", vb=b[sortField]||"";
    if(state.savedView.vocabSortCol==="box"||state.savedView.vocabSortCol==="lapses"){ va=Number(va)||0; vb=Number(vb)||0; }
    if(state.savedView.vocabSortCol==="nextReview"){ va=String(va); vb=String(vb); }
    if(va<vb) return state.savedView.vocabSortAsc?-1:1;
    if(va>vb) return state.savedView.vocabSortAsc?1:-1;
    return 0;
  });
  host.style.overflowX="auto"; host.style.webkitOverflowScrolling="touch";
  const table=document.createElement("table");
  table.style.cssText="width:100%;min-width:520px;border-collapse:collapse;font-size:13px;";
  const thead=document.createElement("thead");
  const hrow=document.createElement("tr");
  ["de","es","cat","box","nextReview","lapses"].forEach(function(col){
    const th=document.createElement("th");
    th.style.cssText="padding:8px 10px;text-align:left;color:var(--muted);font-weight:700;font-size:11px;letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.08);cursor:pointer;user-select:none;white-space:nowrap;";
    const arrow=state.savedView.vocabSortCol===col?(state.savedView.vocabSortAsc?" ▲":" ▼"):"";
    th.textContent=col.toUpperCase()+arrow;
    th.onclick=function(){
      if(state.savedView.vocabSortCol===col) state.savedView.vocabSortAsc=!state.savedView.vocabSortAsc;
      else{ state.savedView.vocabSortCol=col; state.savedView.vocabSortAsc=true; }
      renderVocabTable(host);
    };
    hrow.appendChild(th);
  });
  thead.appendChild(hrow); table.appendChild(thead);

  const tbody=document.createElement("tbody");
  list.forEach(function(ph){
    ensureSrsFields(ph);
    const tr=document.createElement("tr");
    tr.className="stat-row-hover";
    tr.style.cssText="border-bottom:1px solid rgba(255,255,255,0.04);";
    const boxColors=["var(--red-text)","var(--gold-text)","var(--teal-text)","var(--green-text)","var(--purple-text)","var(--gold-text)"];
    const vals=[
      {text:ph.de, style:"font-weight:700;color:var(--text);"},
      {text:ph.es, style:"color:var(--text);"},
      {text:ph.category||"-", style:"color:var(--gold-text);font-weight:600;font-size:11px;"},
      {text:String(ph.box), style:"color:"+(boxColors[ph.box]||"var(--text2)")+";font-weight:800;text-align:center;"},
      {text:ph.nextReview, style:(ph.nextReview<=today?"color:var(--red-text);font-weight:700;":"color:var(--muted);")},
      {text:String(ph.lapses||0), style:"color:var(--muted);text-align:center;"}
    ];
    vals.forEach(function(v){
      const td=document.createElement("td");
      td.style.cssText="padding:8px 10px;"+v.style;
      td.textContent=v.text;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  host.appendChild(table);
  host.appendChild(mk("p",list.length+" frase(s)","margin-top:8px;font-size:12px;color:var(--muted);font-weight:600;"));
}

function exportSavedCsv(){
  if(!state.session.saved.length) return;
  function esc(s){ s=String(s||""); if(/[",\n]/.test(s)) return '"'+s.replace(/"/g,'""')+'"'; return s; }
  const lines=["de,es,tip,category,box,nextReview,lapses"];
  state.session.saved.forEach(function(p){ ensureSrsFields(p); lines.push([esc(p.de),esc(p.es),esc(p.tip||""),esc(p.category||""),p.box,p.nextReview,p.lapses||0].join(",")); });
  const blob=new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download="deutschlernen-frases-"+todayKey()+".csv";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},2000);
}

// ── Full Progress JSON Export ────────────────────────────────────────────────
function exportFullProgress(){
  const _t=todayKey();
  const str=computeStreak();
  const lvlPct=computeLevelProgress();
  var weekMins=weeklyMinutes();
  var due=reviewDueCount();

  var recentLog={};
  var recentLevelLog={};
  for(var i=29;i>=0;i--){
    var dk=addDays(_t,-i);
    if(state.session.dailyLog[dk]) recentLog[dk]=state.session.dailyLog[dk];
    else recentLog[dk]={minutes:0,phrasesReviewed:0,drillsDone:0};
    if(state.session.levelLog&&typeof state.session.levelLog[dk]==="number") recentLevelLog[dk]=state.session.levelLog[dk];
  }

  var payload={
    exportDate: _t,
    level: state.app.level,
    levelProgressPercent: lvlPct,
    streak: str,
    streakLabel: str+(str===1?" dia":" dias")+" seguidos",
    weeklyMinutes: weekMins,
    weeklyGoal: state.session.weeklyGoal,
    totalPhrases: state.session.sessionPhrases,
    totalMinutes: state.session.sessionMinutes,
    savedPhrases: state.session.saved.length,
    reviewDueCount: due,
    grammarStats: state.grammar.grammarStats||{},
    errorJournalCount: (state.session.errorJournal||[]).length,
    errorJournal: (state.session.errorJournal||[]).slice(0,100),
    chatLogsCount: state.session.chatLogs.length,
    shownPhrasesTopics: Object.keys(state.session.shownPhrases||{}).length,
    dailyLog: state.session.dailyLog,
    dailyLogLast30Days: recentLog,
    levelLog: state.session.levelLog||{},
    levelLogLast30Days: recentLevelLog
  };

  var json=JSON.stringify(payload,null,2);
  var blob=new Blob([json],{type:"application/json;charset=utf-8"});
  var url=URL.createObjectURL(blob);
  var a=document.createElement("a"); a.href=url; a.download="deutschlernen-progreso-"+_t+".json";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},2000);
  showToast("Progreso exportado → deutschlernen-progreso-"+_t+".json","success");
}
