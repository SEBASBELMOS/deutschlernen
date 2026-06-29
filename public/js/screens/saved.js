// ── Saved (vocab packs) ───────────────────────────────────────────────────────
function renderSaved() {
  const el=document.getElementById("s-guardadas"); el.innerHTML="";
  // ── Header ──
  const hdr=mk("div","","margin-bottom:18px;position:relative;");
  const accent=mk("div","","width:48px;height:3px;border-radius:3px;background:var(--gold);margin-bottom:10px;");
  hdr.appendChild(accent);
  hdr.appendChild(mk("h2","Guardadas","font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.03em;line-height:1.15;"));
  el.appendChild(hdr);

  // ── Tab bar ──
  const subBar=mk("div","","display:flex;gap:6px;margin-bottom:18px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:var(--r-md);padding:4px;");
  ["frases","chats","tabla","paquetes"].forEach(function(t){
    const btn=mk("button","","flex:1;padding:10px;border-radius:var(--r-sm);border:none;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.18s;display:flex;align-items:center;justify-content:center;gap:6px;");
    var tabMeta=t==="frases"?{i:"star",l:"Frases"}:t==="chats"?{i:"chat",l:"Chats"}:t==="tabla"?{i:"table",l:"Tabla"}:{i:"package",l:"Temas"};
    btn.appendChild(ico(tabMeta.i,15)); btn.appendChild(document.createTextNode(tabMeta.l));
    if(state.savedView.savedTab===t){
      btn.style.background="var(--gold)"; btn.style.color="#000"; btn.style.fontWeight="800";
    } else {
      btn.style.background="transparent"; btn.style.color="var(--muted)";
    }
    btn.onclick=function(){state.savedView.savedTab=t;renderSaved();};
    subBar.appendChild(btn);
  });
  el.appendChild(subBar);

  if(state.savedView.savedTab==="frases"){
    if(!state.session.saved.length){
      // Empty state
      var empty=mk("div","","text-align:center;padding:60px 20px;");
      var emptyIcon=mk("div","","width:80px;height:80px;border-radius:50%;background:rgba(var(--gold-rgb),0.08);border:2px dashed rgba(var(--gold-rgb),0.25);display:inline-flex;align-items:center;justify-content:center;margin-bottom:18px;");
      emptyIcon.appendChild(ico("star",36,"var(--gold-text)"));
      empty.appendChild(emptyIcon);
      empty.appendChild(mk("p","Sin frases guardadas","font-weight:800;font-size:17px;color:var(--text2);margin-bottom:6px;letter-spacing:-0.01em;"));
      empty.appendChild(mk("p","En Frases o No entendí, toca la estrella para guardar.","font-size:13px;color:var(--muted);font-weight:500;line-height:1.5;"));
      el.appendChild(empty);
      return;
    }
    // Search bar
    const searchRow=mk("div","","display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;");
    const createBtn=mk("button","+ Crear","font-size:12px;color:#000;background:var(--gold);border:none;border-radius:var(--r-md);padding:9px 14px;font-weight:700;transition:all 0.12s;");
    createBtn.onmouseenter=function(){this.style.boxShadow="0 4px 14px rgba(var(--gold-rgb),0.3)";};
    createBtn.onmouseleave=function(){this.style.boxShadow="";};
    createBtn.onclick=openCreateModal;
    searchRow.appendChild(createBtn);
    // Category pills
    var allCats=["Todas","Sin categoría"].concat(CATEGORIES);
    var catRow=mk("div","","display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;flex:1;");
    allCats.forEach(function(c){
      var pill=mk("button",c==="Todas"?"Todo":c,"font-size:11px;font-weight:700;padding:7px 12px;border-radius:var(--r-pill);border:1.5px solid var(--border);background:rgba(255,255,255,0.03);color:var(--muted);white-space:nowrap;transition:all 0.15s;");
      if(c===state.savedView.savedFilterCat){
        pill.style.background="var(--text)";pill.style.color="var(--bg)";pill.style.borderColor="var(--text)";pill.style.fontWeight="800";
      }
      pill.onclick=function(){state.savedView.savedFilterCat=c;renderSavedList(listHost);};
      catRow.appendChild(pill);
    });
    searchRow.appendChild(catRow);
    el.appendChild(searchRow);
    // Search input
    var searchRow2=mk("div","","display:flex;gap:8px;align-items:center;margin-bottom:12px;");
    var search=mk("input","","flex:1;font-size:13px;padding:10px 14px;font-weight:500;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:var(--r-md);color:var(--text);outline:none;font-family:inherit;");
    search.type="text"; search.placeholder="Buscar..."; search.value=state.savedView.savedFilter;
    search.oninput=function(){ state.savedView.savedFilter=this.value; renderSavedList(listHost); };
    search.onfocus=function(){this.style.borderColor="rgba(var(--gold-rgb),0.5)";};
    search.onblur=function(){this.style.borderColor="var(--border)";};
    searchRow2.appendChild(search);
    var exportBtn=mk("button","⤓ CSV","font-size:11px;color:var(--teal-text);background:rgba(var(--teal-rgb),0.08);border:1px solid rgba(var(--teal-rgb),0.25);border-radius:var(--r-md);padding:10px 13px;font-weight:700;transition:all 0.12s;");
    exportBtn.onmouseenter=function(){this.style.background="rgba(var(--teal-rgb),0.15)";};
    exportBtn.onmouseleave=function(){this.style.background="rgba(var(--teal-rgb),0.08)";};
    exportBtn.onclick=exportSavedCsv;
    searchRow2.appendChild(exportBtn);
    var clearBtn=mk("button","🗑","font-size:14px;color:var(--red-text);background:none;border:1px solid rgba(var(--red-rgb),0.28);border-radius:var(--r-md);padding:9px 12px;font-weight:600;transition:all 0.12s;");
    clearBtn.title="Borrar todas";
    clearBtn.onmouseenter=function(){this.style.background="rgba(var(--red-rgb),0.08)";};
    clearBtn.onmouseleave=function(){this.style.background="none";};
    clearBtn.onclick=function(){if(confirm("Borrar todas las frases?")){state.session.saved=[];updateBadge();syncUp();renderSaved();}};
    searchRow2.appendChild(clearBtn);
    el.appendChild(searchRow2);
    el.appendChild(mk("p",state.session.saved.length+" guardada(s)","color:var(--muted);font-size:11px;font-weight:600;margin-bottom:12px;letter-spacing:1px;font-family:var(--font-label);"));

    const listHost=mk("div","",""); el.appendChild(listHost);
    renderSavedList(listHost);
  } else if(state.savedView.savedTab==="tabla"){
    if(!state.session.saved.length){
      el.innerHTML+="<div style='text-align:center;padding:60px 20px;color:var(--muted);'><div style='font-size:48px;margin-bottom:14px;'>📊</div><p style='font-weight:800;font-size:17px;color:var(--text2);margin-bottom:6px;'>Sin vocabulario</p><p style='font-size:13px;font-weight:500;'>No hay frases guardadas para mostrar.</p></div>";
      return;
    }
    const listHost=mk("div","",""); el.appendChild(listHost);
    renderVocabTable(listHost);
  } else if(state.savedView.savedTab==="paquetes"){
    const intro=mk("p","Elige un paquete, guarda palabras y mira tu avance al instante.","font-size:13px;color:var(--muted);font-weight:500;margin-bottom:16px;line-height:1.5;");
    el.appendChild(intro);
    var packs=[
      {icon:"file",name:"Trámites",desc:"Documentos, citas y burocracia",list:ERRANDS_VOCAB,cat:"Trámites",color:"#ffb955",textColor:"var(--gold-text)",rgb:"255,185,85"},
      {icon:"laptop",name:"Tech",desc:"Desarrollo, IT y herramientas",list:TECH_VOCAB,cat:"Tech",color:"#5dd9d0",textColor:"var(--teal-text)",rgb:"93,217,208"},
      {icon:"plane",name:"Viaje",desc:"Transporte, hotel y aeropuerto",list:TRAVEL_VOCAB,cat:"Viaje",color:"#4ade80",textColor:"var(--green-text)",rgb:"123,216,155"},
      {icon:"utensils",name:"Comida",desc:"Restaurante, pedidos y cocina",list:FOOD_VOCAB,cat:"Comida",color:"#ffb4ab",textColor:"var(--red-text)",rgb:"255,180,171"},
      {icon:"link",name:"Conectores",desc:"weil, obwohl, deshalb, wenn...",list:CONNECTORS_VOCAB,cat:"Conectores",color:"#c4a7e7",textColor:"var(--purple-text)",rgb:"196,167,231"}
    ];
    var grid=mk("div","",""); grid.className="vocab-pack-grid";
    packs.forEach(function(p){
      var card=document.createElement("div");
      card.className="card vocab-pack-card";
      card.style.setProperty("--pack-accent",p.color);
      card.style.setProperty("--pack-color",p.textColor);
      card.style.setProperty("--pack-rgb",p.rgb);
      card.style.background="linear-gradient(145deg,rgba("+p.rgb+",0.14),rgba(255,255,255,0.035))";
      card.style.borderColor="rgba("+p.rgb+",0.28)";
      card.style.animation="fadeUp 0.2s both";
      var iconCircle=document.createElement("div"); iconCircle.className="vocab-pack-icon"; iconCircle.appendChild(ico(p.icon,31,"currentColor"));
      card.appendChild(iconCircle);
      card.appendChild(mk("p",p.name,"font-size:18px;font-weight:900;color:var(--text);letter-spacing:-0.02em;"));
      card.appendChild(mk("p",p.desc,"font-size:12px;color:var(--text2);font-weight:600;line-height:1.35;"));
      var saved=p.list.filter(function(item){return state.session.saved.some(function(x){return x.de===item.de;});}).length;
      card.appendChild(mk("p",saved+"/"+p.list.length+" guardadas","font-size:11px;color:var(--muted);font-weight:800;"));
      var progress=document.createElement("div"); progress.className="vocab-pack-progress"; var fill=mk("span","",""); fill.style.width=Math.round((saved/p.list.length)*100)+"%"; progress.appendChild(fill); card.appendChild(progress);
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
      el.innerHTML+="<div style='text-align:center;padding:60px 20px;color:var(--muted);'><div style='font-size:48px;margin-bottom:14px;'>💬</div><p style='font-weight:800;font-size:17px;color:var(--text2);margin-bottom:6px;'>Sin chats guardados</p><p style='font-size:13px;font-weight:500;'>En Conversar, pulsa Guardar o Cambiar.</p></div>";
      return;
    }
    state.session.chatLogs.forEach(function(log,i){
      const card=mk("div","","animation:fadeUp 0.2s "+(i*0.05)+"s both;padding:18px;margin-bottom:12px;border-radius:var(--r-lg);background:var(--surface);border:1px solid var(--border);box-shadow:0 4px 24px rgba(0,0,0,0.22);");
      const header=mk("div","","display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;gap:8px;");
      header.appendChild(mk("p",log.scenario,"font-size:15px;font-weight:700;color:var(--text);flex:1;letter-spacing:-0.01em;"));
      header.appendChild(mk("span",log.date,"font-size:11px;color:var(--muted);font-weight:500;flex-shrink:0;"));
      card.appendChild(header);
      card.appendChild(mk("p",log.messages.length+" mensajes","font-size:12px;color:var(--muted);margin-bottom:12px;font-weight:600;"));
      const msgs=document.createElement("div"); msgs.style.display="none";
      log.messages.forEach(function(m){
        const isUser=m.role==="user";
        const row=mk("div","","display:flex;justify-content:"+(isUser?"flex-end":"flex-start")+";margin-bottom:6px;");
        const bub=mk("p",m.content,"max-width:90%;padding:9px 14px;font-size:13px;border-radius:12px;line-height:1.55;white-space:pre-wrap;font-weight:500;");
        bub.style.background=isUser?"rgba(var(--teal-rgb),0.1)":"rgba(255,255,255,0.06)";
        bub.style.border="1px solid "+(isUser?"rgba(var(--teal-rgb),0.2)":"rgba(255,255,255,0.08)");
        bub.style.color="var(--text)"; row.appendChild(bub); msgs.appendChild(row);
      });
      card.appendChild(msgs);
      let open=false;
      const toggle=mk("button","Ver conversación ↓","font-size:12px;color:var(--teal-text);background:none;border:none;padding:0;font-weight:700;cursor:pointer;");
      toggle.onclick=function(e){e.stopPropagation();open=!open;msgs.style.display=open?"block":"none";toggle.textContent=open?"Ocultar ↑":"Ver conversación ↓";};
      card.appendChild(toggle); el.appendChild(card);
    });
    const clearBtn=mk("button","Borrar historial","width:100%;margin-top:8px;padding:12px;border:1px solid rgba(var(--red-rgb),0.28);border-radius:var(--r-md);background:none;color:var(--red-text);font-size:13px;font-weight:600;cursor:pointer;transition:all 0.12s;");
    clearBtn.onmouseenter=function(){this.style.background="rgba(var(--red-rgb),0.08)";};
    clearBtn.onmouseleave=function(){this.style.background="none";};
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
    var empty=mk("div","","text-align:center;padding:50px 20px;");
    empty.appendChild(mk("p","Sin resultados para \""+(q||"esta búsqueda")+"\"","color:var(--muted);font-size:14px;font-weight:600;margin-bottom:4px;"));
    empty.appendChild(mk("p","Probá con otra palabra o cambiá el filtro de categoría.","font-size:12px;color:var(--dim);font-weight:500;"));
    host.appendChild(empty);
    return;
  }
  filtered.forEach(function(ph,i){
    ensureSrsFields(ph);
    var card=mk("div","","animation:fadeUp 0.2s "+(Math.min(i,10)*0.04)+"s both;padding:16px 18px;margin-bottom:10px;border-radius:var(--r-lg);background:var(--surface);border:1px solid rgba(var(--gold-rgb),0.10);box-shadow:0 2px 16px rgba(0,0,0,0.16);");
    // Top row: de + es + actions
    var topRow=mk("div","","display:flex;justify-content:space-between;align-items:flex-start;gap:12px;");
    var txt=mk("div","","flex:1;min-width:0;");
    txt.appendChild(mk("p",ph.de,"font-size:16px;font-weight:700;color:var(--text);letter-spacing:-0.01em;line-height:1.35;"));
    txt.appendChild(mk("p",ph.es||"","font-size:13px;color:var(--text2);margin-top:4px;font-weight:500;line-height:1.4;"));
    txt.appendChild(mk("p","caja "+ph.box+" · "+ph.nextReview,"font-size:10px;color:var(--muted);margin-top:4px;font-weight:600;letter-spacing:0.5px;"));
    var right=mk("div","","display:flex;align-items:center;gap:2px;flex-shrink:0;");
    var play=mk("button","▶","background:none;border:none;font-size:18px;color:var(--gold-text);padding:8px;min-width:40px;min-height:40px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.12s;");
    play.setAttribute("aria-label","Escuchar");
    play.onmouseenter=function(){this.style.opacity="0.7";};
    play.onmouseleave=function(){this.style.opacity="1";};
    play.onclick=function(){speak(ph.de);};
    var del=mk("button","×","background:none;border:none;font-size:20px;color:var(--muted);padding:8px;min-width:40px;min-height:40px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.12s;");
    del.setAttribute("aria-label","Eliminar");
    del.title="Eliminar";
    del.onmouseenter=function(){this.style.color="var(--red-text)";};
    del.onmouseleave=function(){this.style.color="var(--muted)";};
    del.onclick=function(){
      var removedPh=ph; var idx=state.session.saved.indexOf(ph);
      if(idx>=0){ state.session.saved.splice(idx,1); updateBadge(); syncUp(); renderSaved(); showToast("Frase eliminada — Deshacer","undo",function(){state.session.saved.push(removedPh);updateBadge();syncUp();renderSaved();}); }
    };
    right.appendChild(play); right.appendChild(del);
    topRow.appendChild(txt); topRow.appendChild(right); card.appendChild(topRow);
    // Category row
    var catRow=mk("div","","display:flex;align-items:center;gap:8px;margin-top:10px;");
    var catLbl=mk("span",ph.category||"Sin categoría","font-size:11px;font-weight:700;color:"+(ph.category?"var(--gold)":"var(--muted)")+";background:"+(ph.category?"rgba(var(--gold-rgb),0.1)":"rgba(255,255,255,0.04)")+";padding:4px 12px;border-radius:var(--r-pill);");
    var catBtn=mk("button","✏️","background:none;border:none;font-size:12px;cursor:pointer;padding:0;opacity:0.5;transition:opacity 0.15s;");
    catBtn.onmouseenter=function(){this.style.opacity="1";};
    catBtn.onmouseleave=function(){this.style.opacity="0.5";};
    catRow.appendChild(catLbl); catRow.appendChild(catBtn);
    var catSelect=document.createElement("select");
    catSelect.style.cssText="display:none;font-size:11px;font-weight:600;background:rgba(255,255,255,0.06);border:1px solid rgba(var(--gold-rgb),0.3);border-radius:var(--r-sm);padding:5px 8px;color:var(--text);outline:none;font-family:inherit;";
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
  host.style.borderRadius="var(--r-lg)";host.style.border="1px solid var(--border)";host.style.background="var(--surface)";host.style.boxShadow="0 4px 24px rgba(0,0,0,0.22)";
  const table=document.createElement("table");
  table.style.cssText="width:100%;min-width:520px;border-collapse:collapse;font-size:13px;";
  const thead=document.createElement("thead");
  const hrow=document.createElement("tr");
  ["de","es","cat","box","nextReview","lapses"].forEach(function(col){
    const th=document.createElement("th");
    th.style.cssText="padding:10px 12px;text-align:left;color:var(--muted);font-weight:700;font-size:10px;letter-spacing:1.5px;font-family:var(--font-label);border-bottom:1px solid var(--border);cursor:pointer;user-select:none;white-space:nowrap;background:var(--surface-2);";
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
    tr.style.cssText="border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.12s;";
    tr.onmouseenter=function(){this.style.background="rgba(255,255,255,0.02)";};
    tr.onmouseleave=function(){this.style.background="";};
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
      td.style.cssText="padding:10px 12px;"+v.style;
      td.textContent=v.text;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  host.appendChild(table);
  host.appendChild(mk("p",list.length+" frase(s)","margin-top:10px;padding:0 12px;font-size:12px;color:var(--muted);font-weight:600;"));
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
