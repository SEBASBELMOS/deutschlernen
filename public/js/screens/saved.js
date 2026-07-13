// ── Saved (Fable visual port) ─────────────────────────────────────────────────
function renderSaved() {
  const el=document.getElementById("s-guardadas"); el.innerHTML="";

  // ── Fable header ──
  var hdr=mk("div","","margin-bottom:14px;");
  hdr.appendChild(mk("p","Vocabulario · Tu colección","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","Guardadas","font-size:24px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin:3px 0 4px;color:var(--text);"));
  hdr.appendChild(mk("p","Cada frase madura de caja en caja hasta que es tuya.","font-size:13px;color:var(--muted);font-weight:500;margin-bottom:0;"));
  el.appendChild(hdr);

  // ── Tab bar ──
  const subBar=mk("div","","display:flex;gap:6px;margin-bottom:14px;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:4px;");
  ["frases","chats","tabla","paquetes"].forEach(function(t){
    var tabMeta=t==="frases"?{i:"star",l:"Frases"}:t==="chats"?{i:"chat",l:"Chats"}:t==="tabla"?{i:"table",l:"Tabla"}:{i:"package",l:"Temas"};
    const btn=mk("button","","flex:1;text-align:center;padding:9px 6px;border-radius:10px;border:none;font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer;transition:background .15s,color .15s;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;");
    btn.appendChild(ico(tabMeta.i,15)); btn.appendChild(document.createTextNode(tabMeta.l));
    if(state.savedView.savedTab===t){
      btn.style.background="rgba(255,255,255,0.09)";btn.style.color="var(--text)";btn.style.boxShadow="0 2px 10px rgba(0,0,0,.3)";
    }else{
      btn.style.background="transparent";btn.style.color="var(--muted)";
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
      var emptyCreate=mk("button","+ Crear","margin-top:18px;font-size:13px;color:var(--on-primary);background:var(--gold);border:none;border-radius:12px;padding:11px 18px;font-weight:800;transition:all 0.12s;cursor:pointer;font-family:inherit;");
      emptyCreate.onclick=openCreateModal;
      empty.appendChild(emptyCreate);
      el.appendChild(empty);
      return;
    }

    // ── Fable toolbar: search + create ──
    var toolbar=mk("div","","display:flex;gap:8px;margin-bottom:12px;");
    var searchWrap=mk("div","","flex:1;position:relative;");
    var svgIcon=document.createElementNS("http://www.w3.org/2000/svg","svg");
    svgIcon.setAttribute("width","15");svgIcon.setAttribute("height","15");svgIcon.setAttribute("viewBox","0 0 24 24");
    svgIcon.setAttribute("fill","none");svgIcon.setAttribute("stroke","#e2e8f0");svgIcon.setAttribute("stroke-width","2.4");svgIcon.setAttribute("stroke-linecap","round");
    svgIcon.innerHTML='<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>';
    svgIcon.style.cssText="position:absolute;left:13px;top:50%;transform:translateY(-50%);opacity:0.5;";
    searchWrap.appendChild(svgIcon);
    var search=mk("input","","width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:13px;padding:12px 14px 12px 40px;font-size:14px;color:var(--text);outline:none;font-family:inherit;font-weight:500;transition:border-color .15s;");
    search.type="text"; search.placeholder="Buscar frase o traducción…"; search.value=state.savedView.savedFilter;
    search.oninput=function(){ state.savedView.savedFilter=this.value; renderSavedList(listHost); };
    search.onfocus=function(){this.style.borderColor="rgba(var(--gold-rgb),0.5)";};
    search.onblur=function(){this.style.borderColor="var(--border)";};
    searchWrap.appendChild(search);
    toolbar.appendChild(searchWrap);
    var createBtn=mk("button","＋ Crear tarjeta","background:var(--gold);color:#1a1000;border:none;border-radius:13px;padding:12px 16px;font-size:13.5px;font-weight:800;cursor:pointer;white-space:nowrap;box-shadow:0 5px 18px rgba(var(--gold-rgb),0.25);transition:transform .1s;font-family:inherit;");
    createBtn.onclick=openCreateModal;
    toolbar.appendChild(createBtn);
    var importBtn=mk("button","⇪ Importar","background:rgba(var(--teal-rgb),0.1);color:var(--teal-text,var(--teal));border:1px solid rgba(var(--teal-rgb),0.3);border-radius:13px;padding:12px 14px;font-size:13.5px;font-weight:800;cursor:pointer;white-space:nowrap;transition:background .15s;font-family:inherit;");
    importBtn.title="Importar desde tabla (Notion, etc.)";
    importBtn.onclick=openImportModal;
    toolbar.appendChild(importBtn);
    el.appendChild(toolbar);

    // ── SRS box filter spectrum ──
    var boxesRow=mk("div","","display:flex;gap:6px;margin-bottom:14px;overflow-x:auto;padding-bottom:2px;");
    var allCount=state.session.saved.length;
    var allBtn=mk("span","Todas · "+allCount,"flex-shrink:0;display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;padding:7px 12px;border-radius:99px;border:1px solid;background:rgba(255,255,255,0.1);color:var(--text);border-color:rgba(255,255,255,0.2);cursor:pointer;transition:border-color .15s,color .15s;");
    allBtn.onclick=function(){state.savedView._boxFilter=null;renderSavedList(listHost);};
    boxesRow.appendChild(allBtn);
    // Busuu-style strength groups (B0-B1 weak · B2-B3 medium · B4-B5 strong)
    [srsStrength(0),srsStrength(2),srsStrength(4)].forEach(function(g){
      var count=state.session.saved.filter(function(p){ensureSrsFields(p);return g.boxes.indexOf(p.box||0)>=0;}).length;
      var isActive=state.savedView._boxFilter===g.key;
      var bx=mk("span","","flex-shrink:0;display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;padding:7px 12px;border-radius:99px;border:1px solid var(--border);cursor:pointer;transition:border-color .15s,color .15s;");
      if(isActive){bx.style.background="rgba(255,255,255,0.1)";bx.style.color="var(--text)";bx.style.borderColor="rgba(255,255,255,0.2)";}
      else{bx.style.background="rgba(255,255,255,0.04)";bx.style.color="var(--muted)";}
      bx.appendChild(mk("span","","width:7px;height:7px;border-radius:99px;background:"+g.color+";display:inline-block;"));
      bx.appendChild(document.createTextNode(g.plural+" · "+count));
      bx.onclick=function(){state.savedView._boxFilter=g.key;renderSavedList(listHost);};
      boxesRow.appendChild(bx);
    });
    el.appendChild(boxesRow);

    // Due count
    var dueN=reviewDueCount();
    var countLabel=mk("p",allCount+" frases · "+dueN+" vencen hoy","color:var(--muted);font-size:11.5px;font-weight:600;margin-bottom:10px;");
    el.appendChild(countLabel);

    // Category row
    var allCats=["Todas","Sin categoría"].concat(CATEGORIES);
    var catRow=mk("div","","display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;margin-bottom:12px;");
    allCats.forEach(function(c){
      var pill=mk("button",c==="Todas"?"Todo":c,"font-size:11px;font-weight:700;padding:7px 12px;border-radius:20px;border:1.5px solid var(--border);background:rgba(255,255,255,0.03);color:var(--muted);white-space:nowrap;transition:all 0.15s;cursor:pointer;font-family:inherit;");
      if(c===state.savedView.savedFilterCat){
        pill.style.background="var(--text)";pill.style.color="var(--bg)";pill.style.borderColor="var(--text)";pill.style.fontWeight="800";
      }
      pill.onclick=function(){state.savedView.savedFilterCat=c;renderSavedList(listHost);};
      catRow.appendChild(pill);
    });
    el.appendChild(catRow);

    // Export/clear row
    var actionsRow=mk("div","","display:flex;gap:8px;margin-bottom:12px;");
    var exportBtn=mk("button","⤓ CSV","font-size:11px;color:var(--teal-text);background:rgba(var(--teal-rgb),0.08);border:1px solid rgba(var(--teal-rgb),0.25);border-radius:12px;padding:10px 13px;font-weight:700;transition:all 0.12s;cursor:pointer;font-family:inherit;");
    exportBtn.onmouseenter=function(){this.style.background="rgba(var(--teal-rgb),0.15)";};
    exportBtn.onmouseleave=function(){this.style.background="rgba(var(--teal-rgb),0.08)";};
    exportBtn.onclick=exportSavedCsv;
    actionsRow.appendChild(exportBtn);
    var clearBtn=mk("button","Borrar todas","font-size:11px;color:var(--red-text);background:none;border:1px solid rgba(var(--red-rgb),0.28);border-radius:12px;padding:10px 13px;font-weight:700;transition:all 0.12s;cursor:pointer;font-family:inherit;");
    clearBtn.onmouseenter=function(){this.style.background="rgba(var(--red-rgb),0.08)";};
    clearBtn.onmouseleave=function(){this.style.background="none";};
    clearBtn.onclick=function(){confirmModal("¿Borrar todas las frases?","Perderás todo tu progreso de vocabulario.",function(){state.session.saved=[];invalidateFlashcardQueues();updateBadge();syncUp();renderSaved();});};
    actionsRow.appendChild(clearBtn);
    el.appendChild(actionsRow);

    const listHost=mk("div","",""); el.appendChild(listHost);
    renderSavedList(listHost);
  } else if(state.savedView.savedTab==="tabla"){
    if(!state.session.saved.length){
      // appendChild, never innerHTML+= — it re-serialises the screen and kills the tab listeners
      var emptyTbl=mk("div","","text-align:center;padding:60px 20px;color:var(--muted);");
      emptyTbl.appendChild(mk("div","📊","font-size:48px;margin-bottom:14px;"));
      emptyTbl.appendChild(mk("p","Sin vocabulario","font-weight:800;font-size:17px;color:var(--text2);margin-bottom:6px;"));
      emptyTbl.appendChild(mk("p","No hay frases guardadas para mostrar.","font-size:13px;font-weight:500;"));
      el.appendChild(emptyTbl);
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
      {icon:"plane",name:"Viaje",desc:"Transporte, hotel y aeropuerto",list:TRAVEL_VOCAB,cat:"Viaje",color:"#7bd89b",textColor:"var(--green-text)",rgb:"123,216,155"},
      {icon:"utensils",name:"Comida",desc:"Restaurante, pedidos y cocina",list:FOOD_VOCAB,cat:"Comida",color:"#ffb4ab",textColor:"var(--red-text)",rgb:"255,180,171"},
      {icon:"link",name:"Conectores",desc:"weil, obwohl, deshalb, wenn...",list:CONNECTORS_VOCAB,cat:"Conectores",color:"#c4a7e7",textColor:"var(--purple-text)",rgb:"196,167,231"}
    ];
    var grid=mk("div","",""); grid.className="stitch-grid";
    packs.forEach(function(p){
      var card=mk("div","",""); card.className="stitch-card";
      card.style.cssText+=";background:linear-gradient(145deg,rgba("+p.rgb+",0.14),rgba(255,255,255,0.035));border-color:rgba("+p.rgb+",0.28);";
      card.setAttribute("tabindex","0");
      card.setAttribute("aria-label","Abrir paquete "+p.name);
      card.style.cursor="pointer";
      var iconCircle=mk("div","",""); iconCircle.className="vocab-pack-icon"; iconCircle.appendChild(ico(p.icon,31,"currentColor"));
      card.appendChild(iconCircle);
      card.appendChild(mk("p",p.name,"font-size:18px;font-weight:900;color:var(--text);letter-spacing:-0.02em;"));
      card.appendChild(mk("p",p.desc,"font-size:12px;color:var(--text2);font-weight:600;line-height:1.35;"));
      var saved=p.list.filter(function(item){return state.session.saved.some(function(x){return x.de===item.de;});}).length;
      card.appendChild(mk("p",saved+"/"+p.list.length+" guardadas","font-size:11px;color:var(--muted);font-weight:800;"));
      var progress=mk("div","",""); progress.className="vocab-pack-progress"; var fill=mk("span","",""); fill.style.width=Math.round((saved/p.list.length)*100)+"%"; progress.appendChild(fill); card.appendChild(progress);
      var btn=mk("button",saved===p.list.length?"Repasar paquete":"Abrir paquete",""); btn.className="vocab-pack-cta"; btn.style.fontFamily="inherit";
      btn.onclick=function(e){e.stopPropagation();showVocabPack(el,p.name,p.icon,p.list,p.cat);};
      card.appendChild(btn);
      card.onclick=function(){showVocabPack(el,p.name,p.icon,p.list,p.cat);};
      card.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();card.click();}};
      grid.appendChild(card);
    });
    el.appendChild(grid);
  } else {
    if(!state.session.chatLogs.length){
      el.innerHTML+="<div style='text-align:center;padding:60px 20px;color:var(--muted);'><div style='font-size:48px;margin-bottom:14px;'>💬</div><p style='font-weight:800;font-size:17px;color:var(--text2);margin-bottom:6px;'>Sin chats guardados</p><p style='font-size:13px;font-weight:500;'>En Conversar, pulsa Guardar o Cambiar.</p></div>";
      return;
    }
    state.session.chatLogs.forEach(function(log,i){
      const card=mk("div","","animation:fadeUp 0.2s "+(i*0.05)+"s both;padding:18px;margin-bottom:12px;border-radius:16px;background:var(--surface);border:1px solid var(--border);box-shadow:0 4px 24px rgba(0,0,0,0.22);");
      const header=mk("div","","display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;gap:8px;");
      header.appendChild(mk("p",log.scenario,"font-size:15px;font-weight:700;color:var(--text);flex:1;letter-spacing:-0.01em;"));
      header.appendChild(mk("span",log.date,"font-size:11px;color:var(--muted);font-weight:500;flex-shrink:0;"));
      card.appendChild(header);
      card.appendChild(mk("p",log.messages.length+" mensajes","font-size:12px;color:var(--muted);margin-bottom:12px;font-weight:600;"));
      const msgs=mk("div","",""); msgs.style.display="none";
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
      const toggle=mk("button","Ver conversación ↓","font-size:12px;color:var(--teal-text);background:none;border:none;padding:0;font-weight:700;cursor:pointer;font-family:inherit;");
      toggle.onclick=function(e){e.stopPropagation();open=!open;msgs.style.display=open?"block":"none";toggle.textContent=open?"Ocultar ↑":"Ver conversación ↓";};
      card.appendChild(toggle); el.appendChild(card);
    });
    const clearBtn2=mk("button","Borrar historial","width:100%;margin-top:8px;padding:12px;border:1px solid rgba(var(--red-rgb),0.28);border-radius:12px;background:none;color:var(--red-text);font-size:13px;font-weight:600;cursor:pointer;transition:all 0.12s;font-family:inherit;");
    clearBtn2.onmouseenter=function(){this.style.background="rgba(var(--red-rgb),0.08)";};
    clearBtn2.onmouseleave=function(){this.style.background="none";};
    clearBtn2.onclick=function(){confirmModal("¿Borrar historial de chats?","No podrás recuperar las conversaciones.",function(){state.session.chatLogs=[];syncUp();renderSaved();});};
    el.appendChild(clearBtn2);
  }
}

function renderSavedList(host){
  host.innerHTML="";
  const q=state.savedView.savedFilter.trim().toLowerCase();
  var boxColors=["var(--red)","#fb923c","var(--gold)","#a3e635","var(--green)","var(--teal)"];
  var filtered=state.session.saved.filter(function(ph){
    ensureSrsFields(ph);
    if(state.savedView._boxFilter!=null&&srsStrength(ph.box||0).key!==state.savedView._boxFilter) return false;
    const catMatch=state.savedView.savedFilterCat==="Todas"||(state.savedView.savedFilterCat==="Sin categoría"?(!ph.category):ph.category===state.savedView.savedFilterCat);
    if(!catMatch) return false;
    if(!q) return true;
    return (ph.de||"").toLowerCase().indexOf(q)>=0 || (ph.es||"").toLowerCase().indexOf(q)>=0;
  });
  if(!filtered.length){
    var empty=mk("div","","text-align:center;padding:50px 20px;");
    empty.appendChild(mk("p","Sin resultados para \""+(q||"esta búsqueda")+"\"","color:var(--muted);font-size:14px;font-weight:600;margin-bottom:4px;"));
    empty.appendChild(mk("p","Prueba con otra palabra o cambia el filtro.","font-size:12px;color:var(--dim);font-weight:500;"));
    host.appendChild(empty);
    return;
  }

  // Fable-style phrase cards with colored left border
  filtered.forEach(function(ph,i){
    ensureSrsFields(ph);
    var box=ph.box||0;
    var boxColor=boxColors[box];

    var card=mk("div","","position:relative;background:var(--surface);border:1px solid var(--border);border-radius:15px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:14px 14px 14px 17px;margin-bottom:9px;overflow:hidden;transition:border-color .15s,transform .1s;animation:fadeUp 0.2s "+(Math.min(i,10)*0.04)+"s both;");
    card.onmouseenter=function(){this.style.borderColor="rgba(255,255,255,0.16)";this.style.transform="translateY(-1px)";};
    card.onmouseleave=function(){this.style.borderColor="var(--border)";this.style.transform="";};

    // Colored left border
    var leftBorder=mk("div","","position:absolute;left:0;top:0;bottom:0;width:3.5px;background:"+boxColor+";");
    card.appendChild(leftBorder);

    // Top row
    var topRow=mk("div","","display:flex;align-items:flex-start;gap:10px;");
    var de=mk("p",ph.de,"font-size:15.5px;font-weight:800;letter-spacing:-0.01em;line-height:1.4;flex:1;color:var(--text);");
    topRow.appendChild(de);

    // Box badge
    var strength=srsStrength(box);
    var badge=mk("span",strength.label+" · B"+box,"flex-shrink:0;font-size:10px;font-weight:900;letter-spacing:.5px;padding:4px 10px;border-radius:99px;font-variant-numeric:tabular-nums;color:"+strength.color+";background:rgba("+strength.rgb+",0.13);");
    topRow.appendChild(badge);

    // Delete button
    var delBtn=mk("button","✕","flex-shrink:0;width:30px;height:30px;border-radius:9px;border:none;background:transparent;color:var(--dim);font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s;margin:-4px -4px 0 0;font-family:inherit;");
    delBtn.title="Borrar";
    delBtn.setAttribute("aria-label","Borrar tarjeta");
    delBtn.onmouseenter=function(){this.style.background="rgba(var(--red-rgb),0.12)";this.style.color="var(--red)";};
    delBtn.onmouseleave=function(){this.style.background="transparent";this.style.color="var(--dim)";};
    delBtn.onclick=function(e){
      e.stopPropagation();
      var removedPh=ph; var idx=state.session.saved.indexOf(ph);
      if(idx>=0){
        state.session.saved.splice(idx,1);
        invalidateFlashcardQueues();
        updateBadge(); syncUp();
        if(state.session.saved.length) renderSavedList(host); else renderSaved();
        showToast("Frase eliminada — Deshacer","undo",function(){
          state.session.saved.push(removedPh);
          invalidateFlashcardQueues();
          updateBadge(); syncUp();
          if(document.getElementById("s-guardadas").classList.contains("active")&&state.savedView.savedTab==="frases") renderSaved();
        });
      }
    };
    topRow.appendChild(delBtn);
    card.appendChild(topRow);

    // Translation
    card.appendChild(mk("p",ph.es||"","font-size:12.5px;color:var(--muted);font-weight:500;margin-top:4px;line-height:1.45;"));

    // Meta row
    var today=todayKey();
    var dueClass=ph.nextReview<=today?"color:var(--gold)":"";
    var dueText=ph.box>=4?"dominada":(ph.nextReview<=today?"vence hoy":"vence en "+ph.nextReview);
    var metaDiv=mk("div","","display:flex;gap:10px;font-size:10.5px;color:var(--dim);font-weight:600;margin-top:8px;");
    metaDiv.appendChild(mk("span",dueText,""+dueClass));
    if(ph.lapses>0) metaDiv.appendChild(mk("span",ph.lapses+" fallos",""));
    if(ph.source) metaDiv.appendChild(mk("span","de: "+ph.source,""));
    card.appendChild(metaDiv);

    // Category row
    var catRow=mk("div","","display:flex;align-items:center;gap:8px;margin-top:10px;");
    var catLbl=mk("span",ph.category||"Sin categoría","display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;white-space:nowrap;");
    catLbl.style.background=ph.category?"rgba(var(--gold-rgb),0.15)":"rgba(148,163,184,0.12)";
    catLbl.style.color=ph.category?"var(--gold-text)":"var(--text2)";
    catLbl.style.border="1px solid "+(ph.category?"rgba(var(--gold-rgb),0.25)":"rgba(148,163,184,0.2)");
    catRow.appendChild(catLbl);

    var catBtn=mk("button","✏️","background:none;border:none;font-size:12px;cursor:pointer;padding:0;opacity:0.5;transition:opacity 0.15s;font-family:inherit;");
    catBtn.onmouseenter=function(){this.style.opacity="1";};
    catBtn.onmouseleave=function(){this.style.opacity="0.5";};
    catRow.appendChild(catBtn);

    var catSelect=document.createElement("select");
    catSelect.style.cssText="display:none;font-size:11px;font-weight:600;background:rgba(255,255,255,0.06);border:1px solid rgba(var(--gold-rgb),0.3);border-radius:8px;padding:5px 8px;color:var(--text);outline:none;font-family:inherit;";
    [""].concat(CATEGORIES).forEach(function(c){
      var o=document.createElement("option");o.value=c;o.textContent=c||"Sin categoría";
      if(c===ph.category)o.selected=true;catSelect.appendChild(o);
    });
    catSelect.onchange=function(){
      ph.category=this.value;syncUp();renderSavedList(host);
    };
    catRow.appendChild(catSelect);
    catBtn.onclick=function(){
      var showing=catSelect.style.display==="inline-block";
      catSelect.style.display=showing?"none":"inline-block";
      catLbl.style.display=showing?"inline-block":"none";
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
  state.session.saved.forEach(ensureSrsFields); // fields must exist BEFORE sorting on them
  const list=[...state.session.saved].sort(function(a,b){
    let va=a[sortField]||"", vb=b[sortField]||"";
    if(state.savedView.vocabSortCol==="box"||state.savedView.vocabSortCol==="lapses"){ va=Number(va)||0; vb=Number(vb)||0; }
    if(state.savedView.vocabSortCol==="nextReview"){ va=String(va); vb=String(vb); }
    if(va<vb) return state.savedView.vocabSortAsc?-1:1;
    if(va>vb) return state.savedView.vocabSortAsc?1:-1;
    return 0;
  });
  host.style.overflowX="auto"; host.style.webkitOverflowScrolling="touch";
  host.style.borderRadius="16px";host.style.border="1px solid var(--border)";host.style.background="var(--surface)";host.style.boxShadow="0 4px 24px rgba(0,0,0,0.22)";
  const table=document.createElement("table");
  table.style.cssText="width:100%;min-width:520px;border-collapse:collapse;font-size:13px;";
  const thead=document.createElement("thead");
  const hrow=document.createElement("tr");
  ["de","es","cat","box","nextReview","lapses"].forEach(function(col){
    const th=document.createElement("th");
    th.style.cssText="padding:10px 12px;text-align:left;color:var(--muted);font-weight:700;font-size:10px;letter-spacing:1.5px;border-bottom:1px solid var(--border);cursor:pointer;user-select:none;white-space:nowrap;background:var(--surface-2);";
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

// ── Bulk import from pasted table (Notion-style, parsed by AI) ────────────────
function openImportModal(){
  var overlay=mk("div","","position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto;opacity:0;transition:opacity .18s ease;");
  var card=mk("div","","background:var(--modal-bg,var(--surface));border:1px solid var(--border);border-radius:18px;padding:20px;width:100%;max-width:520px;box-shadow:0 16px 48px rgba(0,0,0,0.6);margin:20px 0;transform:scale(.97);transition:transform .18s cubic-bezier(.16,1,.3,1);");
  card.setAttribute("role","dialog"); card.setAttribute("aria-modal","true"); card.setAttribute("aria-label","Importar tarjetas desde tabla");
  card.appendChild(mk("p","⇪ Importar desde tabla","font-size:17px;font-weight:800;color:var(--text);letter-spacing:-0.01em;margin-bottom:4px;"));
  card.appendChild(mk("p","Pega tu tabla (Deutsch | English | Beispielsatz — tabs o pipes, como sale de Notion). La IA la convierte en tarjetas.","font-size:12px;color:var(--muted);font-weight:500;line-height:1.5;margin-bottom:12px;"));
  var ta=document.createElement("textarea");
  ta.rows=7; ta.placeholder="die Besprechung\tmeeting\tDie Besprechung beginnt um 9 Uhr.\nder Termin\tappointment\tIch habe morgen einen Termin.";
  ta.style.cssText="width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:12px;padding:12px;font-size:12.5px;color:var(--text);outline:none;font-family:ui-monospace,Menlo,monospace;font-weight:500;resize:vertical;margin-bottom:10px;line-height:1.5;";
  ta.setAttribute("aria-label","Tabla de vocabulario a importar");
  card.appendChild(ta);
  var genBtn=mk("button","🤖 Generar tarjetas","width:100%;padding:13px;border-radius:13px;border:none;background:var(--gold);color:#1a1000;font-size:14px;font-weight:900;cursor:pointer;font-family:inherit;box-shadow:0 5px 18px rgba(var(--gold-rgb),0.25);");
  card.appendChild(genBtn);
  var errP=mk("p","","display:none;font-size:12px;color:var(--red-text,var(--red));font-weight:600;margin-top:10px;line-height:1.5;");
  card.appendChild(errP);
  var preview=mk("div","","display:none;margin-top:14px;");
  card.appendChild(preview);
  var footer=mk("div","","display:flex;gap:8px;margin-top:14px;");
  var cancel=mk("button","Cancelar","flex:1;padding:12px;border-radius:12px;border:1px solid var(--border);background:rgba(255,255,255,0.05);color:var(--muted);font-size:13.5px;font-weight:800;cursor:pointer;font-family:inherit;");
  footer.appendChild(cancel);
  var saveBtn=mk("button","Guardar todas","flex:1;padding:12px;border-radius:12px;border:none;background:rgba(var(--green-rgb),0.16);border:1px solid rgba(var(--green-rgb),0.4);color:var(--green-text,var(--green));font-size:13.5px;font-weight:900;cursor:pointer;font-family:inherit;display:none;");
  footer.appendChild(saveBtn);
  card.appendChild(footer);
  overlay.appendChild(card);

  var parsed=[]; // {de,es,example,include}
  function close(){
    overlay.style.opacity="0"; card.style.transform="scale(.97)";
    document.removeEventListener("keydown",onKey);
    setTimeout(function(){ if(overlay.parentNode) overlay.parentNode.removeChild(overlay); },180);
  }
  function onKey(e){ if(e.key==="Escape") close(); }
  overlay.onclick=function(e){ if(e.target===overlay) close(); };
  cancel.onclick=close;

  genBtn.onclick=async function(){
    var raw=ta.value.trim();
    if(!raw){ errP.style.display="block"; errP.textContent="Pega la tabla primero."; return; }
    errP.style.display="none";
    genBtn.disabled=true; genBtn.textContent="Generando…";
    try{
      var sys="You are a JSON-only table parser. The user pastes a markdown table with columns: German | English | Example sentence. Your ONLY task is to convert it to a JSON array. Reply with NOTHING except the JSON array — no markdown, no code fences, no explanations, no text before or after. The response must start with [ and end with ]. Translate the English column into natural Spanish. Each object must have exactly: {\"de\":\"...\",\"es\":\"...\",\"example\":\"...\"}. If there is no example sentence, use empty string \"\". Never include null values. Skip the header row and separator row (the ones with ---). Here is an example of the EXACT format you must return:\n[{\"de\":\"außerdem\",\"es\":\"además\",\"example\":\"Außerdem habe ich heute keine Zeit.\"}]";
      // Size the token budget to the table — tables truncate the JSON at a low max_tokens
      var estRows=raw.split("\n").filter(function(l){return l.trim();}).length;
      var tokens=Math.min(3200,Math.max(1400,estRows*200)); // ~200 tokens/row, capped at 3200
      var txt=await ai(sys,[{role:"user",content:raw}],tokens);
      console.log("[import] raw AI response:", (txt||"").slice(0,300));
      var arr=parseJSONArray(txt);
      if(!arr||!arr.length) throw new Error("La IA no devolvió tarjetas válidas.");
      parsed=arr.filter(function(x){return x&&x.de&&x.es;}).map(function(x){return {de:String(x.de).trim(),es:String(x.es).trim(),example:String(x.example||"").trim(),include:true};});
      if(!parsed.length) throw new Error("Ninguna fila válida — revisa el formato.");
      renderPreview();
    }catch(e){
      // Fallback: parse the table directly without AI (pipe / tab / single-column)
      try{
        var fbLines=raw.split("\n").map(function(l){return l.trim();}).filter(function(l){return l;});
        var directParsed=[];
        fbLines.forEach(function(l){
          if(/^[-|\s]+$/.test(l)) return; // separator row like ---|---
          var cells = l.indexOf("|")>=0 ? l.split("|") : (l.indexOf("\t")>=0 ? l.split("\t") : [l]);
          cells=cells.map(function(c){return c.trim();}).filter(function(c){return c;});
          if(!cells.length) return;
          var head=cells[0].toLowerCase();
          if(head==="deutsch"||head==="german"||head==="wort"||head==="palabra") return; // header row
          directParsed.push({ de:cells[0], es:(cells[1]||"").replace(/\(.*?\)/g,"").trim(), example:cells[2]||"", include:true });
        });
        if(directParsed.length){
          parsed=directParsed; renderPreview();
          genBtn.disabled=false; genBtn.textContent="🤖 Generar tarjetas";
          return; // recovered without AI — skip the error entirely
        }
      }catch(fb){ /* fallback failed → show the original error */ }
      errP.style.display="block"; errP.textContent="No pude generar. "+(e&&e.message?e.message:"Intenta con menos filas o revisa el formato. Tip: máximo 10-15 filas por tanda.");
    }
    genBtn.disabled=false; genBtn.textContent="🤖 Generar tarjetas";
  };

  function renderPreview(){
    preview.innerHTML=""; preview.style.display="block";
    // Header counter: how many are new vs already saved
    var dupCount=parsed.filter(function(x){return isDuplicate(x.de);}).length;
    var newCount=parsed.length-dupCount;
    var headerText="Vista previa · "+newCount+" nueva"+(newCount!==1?"s":"");
    if(dupCount) headerText+=" · "+dupCount+" ya existe"+(dupCount!==1?"n":"");
    preview.appendChild(mk("p",headerText,"font-size:10px;letter-spacing:1.5px;font-weight:800;color:var(--dim);text-transform:uppercase;margin-bottom:8px;"));
    parsed.forEach(function(item){
      var dup=isDuplicate(item.de);
      if(dup) item.include=false; // never count/save a duplicate
      var row=mk("label","","display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);cursor:"+(dup?"default":"pointer")+";opacity:"+(dup?"0.45":"1")+";");
      var cb=document.createElement("input"); cb.type="checkbox"; cb.checked=!dup&&item.include; cb.disabled=dup;
      cb.style.cssText="margin-top:3px;accent-color:var(--gold);width:16px;height:16px;flex-shrink:0;cursor:"+(dup?"not-allowed":"pointer")+";";
      if(!dup) cb.onchange=function(){ item.include=cb.checked; updateSaveBtn(); };
      row.appendChild(cb);
      var txtCol=mk("div","","flex:1;min-width:0;");
      var deRow=mk("div","","display:flex;align-items:center;gap:6px;flex-wrap:wrap;");
      deRow.appendChild(mk("p",item.de,"font-size:13.5px;font-weight:800;color:var(--text);line-height:1.4;"));
      if(dup) deRow.appendChild(mk("span","YA EXISTE","font-size:9px;font-weight:700;padding:1px 6px;border-radius:6px;background:rgba(var(--gold-rgb),0.18);color:var(--gold-text);letter-spacing:0.5px;"));
      txtCol.appendChild(deRow);
      txtCol.appendChild(mk("p",item.es,"font-size:12px;color:var(--muted);font-weight:500;margin-top:1px;"));
      if(item.example) txtCol.appendChild(mk("p","„"+item.example+"”","font-size:11.5px;color:var(--dim);font-weight:500;font-style:italic;margin-top:2px;line-height:1.45;"));
      row.appendChild(txtCol);
      preview.appendChild(row);
    });
    saveBtn.style.display="block";
    updateSaveBtn();
  }
  function updateSaveBtn(){
    var n=parsed.filter(function(x){return x.include;}).length;
    saveBtn.textContent="Guardar "+n+(n===1?" tarjeta":" tarjetas");
    saveBtn.disabled=n===0;
  }
  saveBtn.onclick=function(){
    var picked=parsed.filter(function(x){return x.include;});
    var added=0;
    picked.forEach(function(x){
      var dup=state.session.saved.some(function(p){return p.de===x.de;});
      if(dup) return;
      state.session.saved.push(ensureSrsFields({de:x.de,es:x.es,tip:x.example||"",source:"import"}));
      added++;
    });
    if(typeof invalidateFlashcardQueues==="function") invalidateFlashcardQueues();
    updateBadge(); syncUp();
    showToast(added+(added===1?" tarjeta guardada":" tarjetas guardadas")+(picked.length>added?" ("+(picked.length-added)+" duplicadas omitidas)":""),"success");
    close(); renderSaved();
  };

  document.addEventListener("keydown",onKey);
  document.body.appendChild(overlay);
  requestAnimationFrame(function(){ overlay.style.opacity="1"; card.style.transform="scale(1)"; });
  ta.focus();
}
