// ── Phrases (phrase of the day — Stitch port) ──────────────────────────────────

function renderPhrases() {
  const el=document.getElementById("s-frases"); el.innerHTML="";

  // ── Hero Daily Phrase Card (Stitch primary-container hero) ──
  const potdWrapper=document.createElement("div");
  potdWrapper.style.cssText="position:relative;overflow:hidden;border-radius:28px;padding:28px 22px;margin-bottom:22px;background:linear-gradient(135deg,var(--primary-container),rgba(var(--primary-rgb),0.15) 70%);border:1px solid rgba(var(--primary-rgb),0.18);box-shadow:0 14px 40px rgba(0,0,0,0.32);min-height:180px;";
  // Decorative glow
  var potdGlow = document.createElement("span");
  potdGlow.style.cssText = "position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(var(--primary-rgb),0.14);border-radius:50%;filter:blur(35px);pointer-events:none;";
  potdWrapper.appendChild(potdGlow);
  var potdSkew = document.createElement("span");
  potdSkew.style.cssText = "position:absolute;right:-40px;top:0;width:200px;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.04));transform:skewX(-16deg);pointer-events:none;";
  potdWrapper.appendChild(potdSkew);
  potdWrapper.setAttribute("role","button");
  potdWrapper.setAttribute("tabindex","0");
  potdWrapper.setAttribute("aria-label","Generar otra frase del día");
  potdWrapper.title="Generar otra frase";
  const potdInner=document.createElement("div");
  potdInner.id="potd-card";
  const innerSty=document.createElement("div");
  innerSty.style.cssText="position:relative;z-index:1;min-height:180px;";
  potdWrapper.appendChild(innerSty);
  el.appendChild(potdWrapper);
  renderPotd(innerSty);
  potdWrapper.onclick=function(){if(!potdWrapper.dataset._go){potdWrapper.dataset._go=1;renderPotd(innerSty,true);}};
  potdWrapper.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();potdWrapper.click();}};
  potdWrapper.style.cssText+="cursor:pointer;";

  // ── Fable Paquetes Section ──
  renderPaquetesSection(el);

  // ── Section Header ──
  el.appendChild(mk("h3","Temas de Vocabulario","font-size:17px;font-weight:700;color:var(--text);margin-top:22px;margin-bottom:12px;"));

  // ── Stitch-grid of vocab packs ──
  var tc=[];
  for(var ci=0;ci<8;ci++) tc.push({color:"var(--gold-text)",bg:"rgba(var(--gold-rgb),0.13)"},
    {color:"var(--teal-text)",bg:"rgba(var(--teal-rgb),0.13)"},
    {color:"var(--purple-text)",bg:"rgba(var(--purple-rgb),0.13)"},
    {color:"var(--green-text)",bg:"rgba(var(--green-rgb),0.13)"});
  var grid=document.createElement("div");
  grid.className="stitch-grid";
  SITS.forEach(function(s,i){
    var _tc=tc[i%tc.length];
    var tile=document.createElement("button");
    tile.className="stitch-card";
    tile.style.cssText="text-align:left;cursor:pointer;width:100%;";

    // Icon box
    tile.appendChild(mk("span",s.icon,"width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;background:"+_tc.bg+";color:"+_tc.color+";flex-shrink:0;"));

    // Title
    tile.appendChild(mk("span",s.label,"font-size:14px;font-weight:700;color:var(--text);line-height:1.25;"));

    tile.onclick=function(){loadPhrases(s.label);};
    grid.appendChild(tile);
  });
  el.appendChild(grid);
}

// ── Fable Paquetes: Descubrir + Mis paquetes with themed cards ────────────────
function renderPaquetesSection(container){
  var section=mk("div","","margin-bottom:18px;");

  // Header
  var header=mk("div","","margin-bottom:6px;");
  header.appendChild(mk("p","Vocabulario · Por temas","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
  header.appendChild(mk("h3","Paquetes","font-size:20px;font-weight:800;letter-spacing:-0.01em;color:var(--text);"));
  header.appendChild(mk("p","Vocabulario en bloques temáticos — guarda lo que te sirva.","font-size:12.5px;color:var(--muted);font-weight:500;margin-top:2px;"));
  section.appendChild(header);

  // JS subtabs
  var tabState={active:0};
  var tabRow=mk("div","");
  tabRow.className="vocab-tabs-stitch";
  var tabs=[
    {label:"🧭 Descubrir",idx:0},
    {label:"📦 Mis paquetes",idx:1}
  ];
  var tabBtns=[];
  tabs.forEach(function(t){
    var btn=mk("button",t.label,"flex:1;text-align:center;padding:10px 6px;border-radius:14px;font-size:12.5px;font-weight:800;font-family:inherit;border:none;cursor:pointer;transition:background .15s,color .15s,box-shadow .15s;color:var(--muted);background:transparent;");
    btn.setAttribute("aria-selected",t.idx===tabState.active?"true":"false");
    btn.onclick=function(){
      tabState.active=t.idx;
      tabBtns.forEach(function(b,bi){b.setAttribute("aria-selected",bi===t.idx?"true":"false");});
      renderPaquetesPanels(panelsContainer,tabState.active);
    };
    tabBtns.push(btn);
    tabRow.appendChild(btn);
  });
  section.appendChild(tabRow);

  var panelsContainer=mk("div","","");
  renderPaquetesPanels(panelsContainer,0);
  section.appendChild(panelsContainer);
  container.appendChild(section);
}

function renderPaquetesPanels(host,activeIdx){
  host.innerHTML="";

  // Build packs data from existing vocab lists
  var packs=[
    {icon:"👨‍👩‍👧",name:"Trámites",desc:"Documentos, citas y burocracia",list:ERRANDS_VOCAB,cat:"Trámites",colorClass:"gold",color:"var(--gold)",bgRgba:"rgba(255,185,85,",bgOpacity:"0.12",rgb:"255,185,85"},
    {icon:"💻",name:"Tech",desc:"Desarrollo, IT y herramientas",list:TECH_VOCAB,cat:"Tech",colorClass:"teal",color:"var(--teal)",bgRgba:"rgba(93,217,208,",bgOpacity:"0.12",rgb:"93,217,208"},
    {icon:"🍽️",name:"Comida",desc:"Restaurante, pedidos y cocina",list:FOOD_VOCAB,cat:"Comida",colorClass:"red",color:"var(--red-text)",bgRgba:"rgba(255,180,171,",bgOpacity:"0.12",rgb:"255,180,171"},
    {icon:"✈️",name:"Viaje",desc:"Transporte, hotel y aeropuerto",list:TRAVEL_VOCAB,cat:"Viaje",colorClass:"green",color:"var(--green)",bgRgba:"rgba(123,216,155,",bgOpacity:"0.12",rgb:"123,216,155"},
    {icon:"🔗",name:"Conectores",desc:"weil, obwohl, deshalb, wenn...",list:CONNECTORS_VOCAB,cat:"Conectores",colorClass:"purple",color:"var(--purple)",bgRgba:"rgba(196,167,231,",bgOpacity:"0.12",rgb:"196,167,231"}
  ];

  var panel=mk("div","","animation:fadeUp .25s cubic-bezier(.16,1,.3,1);");

  if(activeIdx===0){
    // ── Panel: Descubrir ──
    panel.className="vocab-pack-stitch-grid";
    packs.forEach(function(p){
      var saved=p.list.filter(function(item){return state.session.saved.some(function(x){return x.de===item.de;});}).length;
      var total=p.list.length;
      var isComplete=saved===total;
      var hasProgress=saved>0;

      var card=mk("div","","--pack-color:"+p.color+";--pack-rgb:"+p.rgb+";");
      card.className="vocab-pack-stitch-card stitch-glass";
      card.onclick=function(){showVocabPack(document.getElementById("s-frases"),p.name,p.icon,p.list,p.cat);};
      // Accent border-left
      card.style.borderLeft = "3px solid " + p.color;

      // Top row: icon + title + badge
      var pTop=mk("div","","display:flex;align-items:flex-start;gap:12px;position:relative;z-index:1;margin-bottom:10px;");
      var ico=mk("span",p.icon,"background:"+p.bgRgba+p.bgOpacity+");color:"+p.color+";");
      ico.className="vocab-pack-orb";
      pTop.appendChild(ico);

      var pMid=mk("div","","flex:1;min-width:0;");
      var titleSpan=mk("b","","display:flex;align-items:center;gap:7px;font-size:15.5px;font-weight:800;letter-spacing:-0.01em;color:var(--text);");
      titleSpan.appendChild(document.createTextNode(p.name));
      if(!hasProgress){
        var newBadge=mk("span","NUEVO","font-size:8.5px;font-weight:900;letter-spacing:1px;color:var(--on-primary);background:var(--primary);border-radius:99px;padding:2.5px 8px;text-transform:uppercase;flex-shrink:0;box-shadow:0 3px 10px rgba(var(--primary-rgb),0.35);");
        titleSpan.appendChild(newBadge);
      }
      pMid.appendChild(titleSpan);
      pMid.appendChild(mk("p",p.desc,"font-size:11.5px;color:var(--muted);font-weight:500;margin-top:2px;"));
      pTop.appendChild(pMid);

      // Progress badge
      if(hasProgress){
        var prog=mk("span",isComplete?total+"/"+total+" ✓":saved+"/"+total,"flex-shrink:0;font-size:11px;font-weight:900;padding:5px 11px;border-radius:99px;font-variant-numeric:tabular-nums;background:"+p.bgRgba+"0.18);color:"+p.color+";border:1px solid "+p.bgRgba+"0.28);");
        pTop.appendChild(prog);
      }
      card.appendChild(pTop);

      // Progress bar (only if has progress and not complete)
      if(hasProgress&&!isComplete){
        var bar=mk("div","","height:7px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:auto;");
        var fill=mk("div","","display:block;height:100%;border-radius:5px;width:"+Math.round((saved/total)*100)+"%;background:"+p.color+";transition:width .4s cubic-bezier(.16,1,.3,1);");
        bar.appendChild(fill);
        card.appendChild(bar);
      }
      if(isComplete){
        var bar2=mk("div","","height:7px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:auto;");
        var fill2=mk("div","","display:block;height:100%;border-radius:5px;width:100%;background:linear-gradient(90deg,var(--green),rgba(var(--green-rgb),0.7));transition:width .4s cubic-bezier(.16,1,.3,1);");
        bar2.appendChild(fill2);
        card.appendChild(bar2);
      }

      // Preview: first 3 phrases
      var preview=mk("div","","position:relative;z-index:1;margin-top:12px;padding-top:11px;border-top:1px dashed rgba(255,255,255,.07);");
      var previewItems=p.list.slice(0,3);
      previewItems.forEach(function(item){
        var pv=mk("div","","display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:baseline;gap:8px;padding:3.5px 0;");
        pv.appendChild(mk("span",item.de,"font-size:12.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text);"));
        pv.appendChild(mk("span",item.es,"font-size:11px;color:var(--muted);font-weight:500;text-align:right;max-width:96px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"));
        preview.appendChild(pv);
      });
      var remaining=total-previewItems.length;
      if(remaining>0){
        preview.appendChild(mk("p",isComplete?"completado 🎉":"+ "+remaining+" frases más","font-size:10.5px;color:var(--dim);font-weight:700;margin-top:5px;letter-spacing:.5px;"));
      }
      card.appendChild(preview);
      panel.appendChild(card);
    });
  } else {
    // ── Panel: Mis paquetes ──
    var packsWithProgress=[];
    packs.forEach(function(p){
      var saved=p.list.filter(function(item){return state.session.saved.some(function(x){return x.de===item.de;});}).length;
      if(saved>0) packsWithProgress.push({pack:p,saved:saved});
    });

    if(packsWithProgress.length===0){
      // Empty state
      var empty=mk("div","","text-align:center;padding:56px 20px;");
      var eico=mk("span","📦","width:84px;height:84px;border-radius:50%;background:rgba(var(--gold-rgb),0.07);border:2px dashed rgba(var(--gold-rgb),0.3);display:inline-flex;align-items:center;justify-content:center;font-size:34px;margin-bottom:18px;");
      empty.appendChild(eico);
      empty.appendChild(mk("b","Todavía no empezaste ninguno","display:block;font-size:17px;font-weight:800;letter-spacing:-0.01em;margin-bottom:6px;color:var(--text);"));
      empty.appendChild(mk("p","Elige un paquete temático y guarda las frases que te sirvan — entran directo a tus flashcards.","font-size:13px;color:var(--muted);font-weight:500;line-height:1.55;max-width:300px;margin:0 auto;"));
      var cta=mk("button","🧭 Explorar paquetes","margin-top:20px;background:var(--gold);color:#1a1000;border:none;border-radius:13px;padding:13px 24px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;box-shadow:0 6px 20px rgba(var(--gold-rgb),0.3);transition:transform .1s;");
      cta.onclick=function(){renderPaquetesPanels(host,0);};
      cta.onmouseenter=function(){this.style.transform="scale(1.02)";};
      cta.onmouseleave=function(){this.style.transform="";};
      empty.appendChild(cta);
      panel.appendChild(empty);
    } else {
      panel.className="vocab-pack-stitch-grid";
      packsWithProgress.forEach(function(pw){
        var p=pw.pack;var saved=pw.saved;var total=p.list.length;var isComplete=saved===total;
        var card=mk("div","","--pack-color:"+p.color+";--pack-rgb:"+p.rgb+";");
        card.className="vocab-pack-stitch-card stitch-glass";
        card.onclick=function(){showVocabPack(document.getElementById("s-frases"),p.name,p.icon,p.list,p.cat);};
        card.style.borderLeft = "3px solid " + p.color;

        var pTop=mk("div","","display:flex;align-items:flex-start;gap:12px;position:relative;z-index:1;margin-bottom:10px;");
        var ico=mk("span",p.icon,"background:"+p.bgRgba+p.bgOpacity+");color:"+p.color+";");
        ico.className="vocab-pack-orb";
        pTop.appendChild(ico);
        var pMid=mk("div","","flex:1;min-width:0;");
        pMid.appendChild(mk("b",p.name,"display:flex;align-items:center;gap:7px;font-size:15.5px;font-weight:800;letter-spacing:-0.01em;color:var(--text);"));
        pMid.appendChild(mk("p",p.desc,"font-size:11.5px;color:var(--muted);font-weight:500;margin-top:2px;"));
        pTop.appendChild(pMid);
        var progBadge=mk("span",isComplete?total+"/"+total+" ✓":saved+"/"+total,"flex-shrink:0;font-size:11px;font-weight:900;padding:5px 11px;border-radius:99px;font-variant-numeric:tabular-nums;background:"+p.bgRgba+"0.18);color:"+p.color+";border:1px solid "+p.bgRgba+"0.28);");
        pTop.appendChild(progBadge);
        card.appendChild(pTop);

        var bar=mk("div","","height:7px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:auto;");
        var fill=mk("div","","display:block;height:100%;border-radius:4px;width:"+Math.round((saved/total)*100)+"%;background:"+(isComplete?"var(--green)":p.color)+";");
        bar.appendChild(fill);
        card.appendChild(bar);

        // Preview
        var preview=mk("div","","position:relative;z-index:1;margin-top:12px;padding-top:11px;border-top:1px dashed rgba(255,255,255,.07);");
        var previewItems=p.list.filter(function(item){return state.session.saved.some(function(x){return x.de===item.de;});}).slice(0,3);
        previewItems.forEach(function(item){
          var pv=mk("div","","display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:baseline;gap:8px;padding:3.5px 0;");
          pv.appendChild(mk("span",item.de,"font-size:12.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text);"));
          pv.appendChild(mk("span",item.es,"font-size:11px;color:var(--muted);font-weight:500;text-align:right;max-width:96px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"));
          preview.appendChild(pv);
        });
        var remainingSaved=saved-previewItems.length;
        if(remainingSaved>0){
          preview.appendChild(mk("p",isComplete?"completado 🎉":"+ "+remainingSaved+" frases más","font-size:10.5px;color:var(--dim);font-weight:700;margin-top:5px;letter-spacing:.5px;"));
        }
        card.appendChild(preview);
        panel.appendChild(card);
      });
    }
  }

  host.appendChild(panel);
}

async function renderPotd(host, forceFetch){
  host.innerHTML="";
  host.appendChild(mk("p","✨  FRASE DEL DÍA","font-size:10px;color:var(--gold-text);letter-spacing:2.5px;font-family:var(--font-label);margin-bottom:8px;font-weight:700;"));
  const key="dl_potd_"+todayKey();
  let cached=null;
  if(!forceFetch){ try { cached=JSON.parse(localStorage.getItem(key)||"null"); } catch(e){console.error("potd cache",e);} }
  // Only trust a complete cache — a poisoned entry (missing de/es) must not block the whole day
  if(cached && cached.de && cached.es){ paintPotd(host, cached); return; }
  if(cached){ localStorage.removeItem(key); cached=null; }
  var skel=mk("div","","display:flex;flex-direction:column;gap:10px;");
  skel.appendChild(skelLine("40%","10px"));
  skel.appendChild(skelLine("90%","20px"));
  skel.appendChild(skelLine("70%","14px"));
  skel.appendChild(skelLine("50%","12px"));
  host.appendChild(skel);
  try {
    var _ww=getWeakWords();
    var _theme=_ww ? "The user struggles with: "+_ww.join(", ") : "Random theme.";
    const sys='Reply ONLY with valid JSON: {"de":"...","es":"...","tip":"short note <8 words"}. Generate ONE useful German phrase for daily life, varied each day. '+levelPrompt()+' No markdown.';
    const text=await ai(sys,[{role:"user",content:"Date seed: "+todayKey()+". "+_theme}], 200);
    const clean=text.replace(/```json|```/g,"").trim();
    const m=clean.match(/\{[\s\S]*\}/); if(!m) throw new Error("no JSON in: "+clean.slice(0,80));
    const obj=JSON.parse(m[0]);
    if(!obj.de||!obj.es) throw new Error("incomplete phrase: "+m[0].slice(0,80));
    localStorage.setItem(key, JSON.stringify(obj));
    paintPotd(host, obj);
  } catch(e){
    console.error("[potd]",e);
    if(skel.parentNode) host.removeChild(skel);
    host.appendChild(mk("p","No pude cargar la frase del día.","font-size:12px;color:var(--muted);margin-bottom:10px;"));
    var retryPotd=mk("button","🔄 Reintentar","padding:9px 16px;border-radius:11px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:var(--on-primary-container);font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit;position:relative;z-index:1;");
    retryPotd.onclick=function(ev){ ev.stopPropagation(); renderPotd(host,true); };
    host.appendChild(retryPotd);
  }
}

function paintPotd(host, ph){
  // Clear loading children but keep header
  while(host.childNodes.length>1) host.removeChild(host.lastChild);
  const row=mk("div","","display:flex;justify-content:space-between;align-items:flex-start;gap:8px;");
  row.appendChild(mk("p",ph.de,"font-size:18px;font-weight:800;color:var(--on-primary-container);flex:1;line-height:1.4;letter-spacing:-0.01em;"));
  const btns=mk("div","","display:flex;gap:4px;flex-shrink:0;");
  const play=document.createElement("button"); play.className="icon-btn"; play.setAttribute("aria-label","Escuchar");play.innerHTML="&#9654;"; play.style.color="rgba(222,224,255,0.85)"; play.style.fontSize="18px";
  play.onclick=function(e){e.stopPropagation();speak(ph.de);};
  const isSaved=state.session.saved.some(function(x){return x.de===ph.de;});
  const star=document.createElement("button"); star.className="icon-btn"; star.setAttribute("aria-label","Guardar"); star.style.fontSize="20px"; star.style.color=isSaved?"var(--secondary)":"rgba(222,224,255,0.5)"; setSaveIcon(star,isSaved);
  star.onclick=function(e){
    e.stopPropagation();
    if(isDuplicate(ph.de)){ showToast("Ya guardada","info"); } else {
      state.session.saved.push(ensureSrsFields({de:ph.de,es:ph.es,tip:ph.tip||"",source:"frases"}));
      invalidateFlashcardQueues(); star.style.color="var(--secondary)"; setSaveIcon(star,true); updateBadge(); syncUp();
    }
  };
  const refresh=document.createElement("button"); refresh.className="icon-btn"; refresh.setAttribute("aria-label","Generar otra");refresh.innerHTML="&#x21bb;"; refresh.style.fontSize="16px"; refresh.style.color="rgba(222,224,255,0.6)";
  refresh.title="Generar otra";
  refresh.onclick=function(e){ e.stopPropagation(); localStorage.removeItem("dl_potd_"+todayKey()); renderPotd(host, true); };
  btns.appendChild(play); btns.appendChild(star); btns.appendChild(refresh);
  row.appendChild(btns); host.appendChild(row);
  host.appendChild(mk("p",ph.es,"font-size:13px;color:rgba(222,224,255,0.72);margin-top:4px;font-weight:500;"));
  if(ph.tip) host.appendChild(mk("p","💡 "+ph.tip,"font-size:12px;color:rgba(222,224,255,0.58);font-style:italic;margin-top:6px;"));
}

async function loadPhrases(sit) {
  const el=document.getElementById("s-frases"); el.innerHTML="";
  const top=mk("div","","display:flex;align-items:center;gap:10px;margin-bottom:16px;");
  const back=document.createElement("button"); back.className="btn-back"; back.textContent="← Volver";
  back.onclick=function(){renderPhrases();};
  top.appendChild(back);
  top.appendChild(mk("span",sit,"font-size:13px;color:var(--text);font-weight:700;"));
  el.appendChild(top);

  const loading=document.createElement("div"); loading.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:10px;";
  for(var si=0;si<4;si++){loading.appendChild(skelCard(3));}
  el.appendChild(loading);

  const allExcluded=state.session.shownPhrases[sit]||[];
  const excluded=allExcluded.slice(-10);
  const exclusionNote=excluded.length?" Do NOT use these phrases: "+excluded.join(" | ")+".":"";

  try {
    const sys="You are a German language expert. Generate exactly 5 complete real German phrases for the given situation. Reply ONLY with a valid JSON array, no markdown, no extra text: [{\"de\":\"German phrase\",\"es\":\"Spanish translation\",\"tip\":\"short tip\"}]. "+levelPrompt()+" Each tip must be under 8 words."+exclusionNote;
    const text=await ai(sys,[{role:"user",content:"Situation: "+sit}], 1400);
    const phrases=parseJSONArray(text);
    state.session.sessionPhrases+=phrases.length;
    if(!state.session.shownPhrases[sit]) state.session.shownPhrases[sit]=[];
    phrases.forEach(function(ph){state.session.shownPhrases[sit].push(ph.de);});
    if(state.session.shownPhrases[sit].length>40) state.session.shownPhrases[sit]=state.session.shownPhrases[sit].slice(-40);
    syncUp();
    el.removeChild(loading);

    phrases.forEach(function(ph,i){
      const card=document.createElement("div"); card.className="card";
      card.style.animation="fadeUp 0.25s "+( i*0.05)+"s both";
      const row=mk("div","","display:flex;justify-content:space-between;align-items:flex-start;gap:8px;");
      const de=mk("p",ph.de,"font-size:16px;font-weight:700;color:var(--text);flex:1;line-height:1.45;letter-spacing:-0.01em;");
      const btnRow=mk("div","","display:flex;gap:2px;flex-shrink:0;");
      const playBtn=document.createElement("button"); playBtn.className="icon-btn"; playBtn.setAttribute("aria-label","Escuchar");playBtn.innerHTML="&#9654;"; playBtn.style.color="var(--muted)"; playBtn.style.fontSize="16px";
      playBtn.onclick=function(){speak(ph.de);};
      const isSaved=state.session.saved.some(function(x){return x.de===ph.de;});
      const starBtn=document.createElement("button"); starBtn.className="icon-btn"; starBtn.setAttribute("aria-label","Guardar"); starBtn.style.fontSize="18px";
      starBtn.style.color=isSaved?"var(--gold-text)":"var(--dim)";
      setSaveIcon(starBtn,isSaved);
      starBtn.onclick=function(){
        if(isDuplicate(ph.de)){ showToast("Ya guardada","info"); } else {
          const item=ensureSrsFields({de:ph.de,es:ph.es,tip:ph.tip,source:"frases"});
          state.session.saved.push(item); invalidateFlashcardQueues(); starBtn.style.color="var(--gold-text)"; setSaveIcon(starBtn,true); updateBadge(); syncUp();
        }
      };
      btnRow.appendChild(playBtn); btnRow.appendChild(starBtn);
      row.appendChild(de); row.appendChild(btnRow); card.appendChild(row);
      card.appendChild(mk("p",ph.es,"font-size:13px;color:var(--text2);margin-top:5px;font-weight:500;"));
      if(ph.tip){
        const tipEl=mk("p","💡 "+ph.tip,"font-size:12px;color:var(--muted);font-style:italic;margin-top:6px;");
        card.appendChild(tipEl);
      }
      el.appendChild(card);
    });

    const more=document.createElement("button");
    more.className="more-btn";
    more.textContent="+ Generar 5 más";
    more.onclick=function(){loadPhrases(sit);};
    el.appendChild(more);
  } catch(e){
    if(loading.parentNode) el.removeChild(loading);
    el.appendChild(mk("p","Error al cargar frases. Intenta de nuevo.","color:var(--red-text);font-size:13px;text-align:center;font-weight:500;"));
  }
}

// ── VOCAB PACK ──
function showVocabPack(host, title, icon, vocabList, categoryName){
  host.innerHTML="";
  var c=mk("div","","padding:2px 0;");
  var topRow=mk("div","","display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;");
  var packTitle=mk("p","","font-size:10px;color:var(--gold-text);letter-spacing:2.5px;font-family:var(--font-label);font-weight:800;text-transform:uppercase;");
  packTitle.appendChild(iconLabel(icon,title,15));
  topRow.appendChild(packTitle);
  var saveAll=mk("button","Guardar todas ("+vocabList.length+")","padding:6px 12px;border-radius:8px;border:1px solid rgba(var(--gold-rgb),0.2);background:rgba(var(--gold-rgb),0.06);color:var(--gold-text);font-size:11px;font-weight:700;cursor:pointer;transition:background 0.2s,transform 0.12s;");
  var savedCount=0;
  saveAll.onclick=function(){
    vocabList.forEach(function(item){
      if(state.session.saved.some(function(x){return x.de===item.de;})) return;
      var phr=ensureSrsFields({de:item.de,es:item.es,tip:item.tip||"",source:"vocab-pack",category:categoryName});
      state.session.saved.push(phr);
      savedCount++;
    });
    if(savedCount>0){invalidateFlashcardQueues();logActivity("phrasesReviewed",savedCount);updateBadge();syncUp();showToast(savedCount+" palabras guardadas","success");}
    else showToast("Ya todas estaban guardadas","info");
    saveAll.textContent="\u2713 Guardadas";saveAll.style.opacity="0.5";saveAll.disabled=true;
  };
  topRow.appendChild(saveAll);
  c.appendChild(topRow);
  vocabList.forEach(function(item){
    var card=mk("div","","padding:10px 12px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);margin-bottom:6px;");
    card.appendChild(mk("p",item.de,"font-size:15px;font-weight:800;color:var(--text);margin-bottom:1px;"));
    var esRow=mk("div","","display:flex;justify-content:space-between;align-items:center;");
    var esLeft=mk("div","","");
    esLeft.appendChild(mk("p",item.es,"font-size:12px;color:var(--muted);font-weight:500;"));
    if(item.tip) esLeft.appendChild(mk("p","\ud83d\udca1 "+item.tip,"font-size:10px;color:var(--dim);font-weight:500;margin-top:1px;"));
    esRow.appendChild(esLeft);
    var starBtn=mk("button","","font-size:18px;background:none;border:none;cursor:pointer;padding:4px;color:var(--muted);line-height:1;min-width:44px;min-height:44px;display:inline-flex;align-items:center;justify-content:center;");
    setSaveIcon(starBtn,state.session.saved.some(function(x){return x.de===item.de;}));
    starBtn.title="Guardar palabra";
    starBtn.onclick=function(){
      if(state.session.saved.some(function(x){return x.de===item.de;})){
        showToast("Ya existe","info");
        setSaveIcon(starBtn,true);starBtn.style.color="var(--gold)";
        return;
      }
      var phr=ensureSrsFields({de:item.de,es:item.es,tip:item.tip||"",source:"vocab-pack",category:categoryName});
      state.session.saved.push(phr);
      invalidateFlashcardQueues();
      logActivity("phrasesReviewed",1);
      updateBadge();
      syncUp();
      setSaveIcon(starBtn,true);starBtn.style.color="var(--gold)";
      showToast("Guardada: "+item.de,"success");
    };
    esRow.appendChild(starBtn);
    card.appendChild(esRow);
    c.appendChild(card);
  });
  var back=mk("button","\u2190 Volver","background:none;border:none;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;padding:10px 0;margin-top:6px;");
  back.onclick=function(){renderSaved();};
  c.appendChild(back);
  host.appendChild(c);
}
