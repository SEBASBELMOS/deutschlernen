// ── Phrases (phrase of the day) ───────────────────────────────────────────────

function renderPhrases() {
  const el=document.getElementById("s-frases"); el.innerHTML="";
  const hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","Elige un tema","font-size:11px;color:var(--muted);letter-spacing:2px;font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","Frases de hoy","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  el.appendChild(hdr);

  // Phrase of the day
  const potd=document.createElement("div");
  potd.style.cssText="background:linear-gradient(135deg,rgba(245,166,35,0.09),rgba(78,205,196,0.05));border:1px solid rgba(245,166,35,0.2);border-radius:16px;padding:16px;margin-bottom:16px;";
  potd.id="potd-card";
  el.appendChild(potd);
  renderPotd(potd);

  const grid=document.createElement("div"); grid.className="grid2";
  SITS.forEach(function(s){
    const btn=document.createElement("button"); btn.className="sit-btn";
    const icon=mk("span",s.icon,"font-size:24px;line-height:1;");
    const lbl=mk("span",s.label,"font-size:12px;font-weight:600;color:var(--text);");
    btn.appendChild(icon); btn.appendChild(lbl);
    btn.onclick=function(){loadPhrases(s.label);};
    grid.appendChild(btn);
  });
  el.appendChild(grid);
}

async function renderPotd(host, forceFetch){
  host.innerHTML="";
  host.appendChild(mk("p","✨  FRASE DEL DIA","font-size:10px;color:#F5A623;letter-spacing:2.5px;margin-bottom:8px;font-weight:700;"));
  const key="dl_potd_"+todayKey();
  let cached=null;
  if(!forceFetch){ try { cached=JSON.parse(localStorage.getItem(key)||"null"); } catch(e){console.error("potd cache",e);} }
  if(cached){ paintPotd(host, cached); return; }
  var skel=mk("div","","display:flex;flex-direction:column;gap:10px;");
  skel.appendChild(skelLine("40%","10px"));
  skel.appendChild(skelLine("90%","20px"));
  skel.appendChild(skelLine("70%","14px"));
  skel.appendChild(skelLine("50%","12px"));
  host.appendChild(skel);
  try {
    var _ww=getWeakWords();
    var _theme=_ww ? "The user struggles with: "+_ww.join(", ") : "Random theme.";
    const sys='Reply ONLY with valid JSON: {"de":"...","es":"...","tip":"short note <8 words"}. Generate ONE useful '+lvlRange()+' German phrase for daily life, varied each day. No markdown.';
    const text=await ai(sys,[{role:"user",content:"Date seed: "+todayKey()+". "+_theme}], 200);
    const clean=text.replace(/```json|```/g,"").trim();
    const m=clean.match(/\{[\s\S]*\}/); if(!m) throw new Error("no JSON");
    const obj=JSON.parse(m[0]);
    localStorage.setItem(key, JSON.stringify(obj));
    paintPotd(host, obj);
  } catch(e){
    host.removeChild(skel);
    host.appendChild(mk("p","No pude cargar la frase del dia.","font-size:12px;color:var(--muted);"));
  }
}

function paintPotd(host, ph){
  // Clear loading children but keep header
  while(host.childNodes.length>1) host.removeChild(host.lastChild);
  const row=mk("div","","display:flex;justify-content:space-between;align-items:flex-start;gap:8px;");
  row.appendChild(mk("p",ph.de,"font-size:17px;font-weight:800;color:var(--text);flex:1;line-height:1.4;letter-spacing:-0.01em;"));
  const btns=mk("div","","display:flex;gap:2px;flex-shrink:0;");
  const play=document.createElement("button"); play.className="icon-btn"; play.setAttribute("aria-label","Escuchar");play.innerHTML="&#9654;"; play.style.color="#F5A623"; play.style.fontSize="18px";
  play.onclick=function(){speak(ph.de);};
  const isSaved=state.session.saved.some(function(x){return x.de===ph.de;});
  const star=document.createElement("button"); star.className="icon-btn"; star.setAttribute("aria-label","Guardar"); star.style.fontSize="20px"; star.style.color=isSaved?"#F5A623":"#334155"; setSaveIcon(star,isSaved);
  star.onclick=function(){
    if(!state.session.saved.some(function(x){return x.de===ph.de;})){
      state.session.saved.push(ensureSrsFields({de:ph.de,es:ph.es,tip:ph.tip||"",source:"frases"}));
      star.style.color="#F5A623"; setSaveIcon(star,true); updateBadge(); syncUp();
    }
  };
  const refresh=document.createElement("button"); refresh.className="icon-btn"; refresh.setAttribute("aria-label","Generar otra");refresh.innerHTML="&#x21bb;"; refresh.style.fontSize="16px"; refresh.style.color="#64748b";
  refresh.title="Generar otra";
  refresh.onclick=function(){ localStorage.removeItem("dl_potd_"+todayKey()); renderPotd(host, true); };
  btns.appendChild(play); btns.appendChild(star); btns.appendChild(refresh);
  row.appendChild(btns); host.appendChild(row);
  host.appendChild(mk("p",ph.es,"font-size:13px;color:#94a3b8;margin-top:4px;font-weight:500;"));
  if(ph.tip) host.appendChild(mk("p","💡 "+ph.tip,"font-size:12px;color:#475569;font-style:italic;margin-top:6px;"));
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
    const sys="You are a German language expert. Generate exactly 5 complete real German phrases for the given situation. Reply ONLY with a valid JSON array, no markdown, no extra text: [{\"de\":\"German phrase\",\"es\":\"Spanish translation\",\"tip\":\"short tip\"}]. Level "+lvlRange()+". Each tip must be under 8 words."+exclusionNote;
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
      const playBtn=document.createElement("button"); playBtn.className="icon-btn"; playBtn.setAttribute("aria-label","Escuchar");playBtn.innerHTML="&#9654;"; playBtn.style.color="#64748b"; playBtn.style.fontSize="16px";
      playBtn.onclick=function(){speak(ph.de);};
      const isSaved=state.session.saved.some(function(x){return x.de===ph.de;});
      const starBtn=document.createElement("button"); starBtn.className="icon-btn"; starBtn.setAttribute("aria-label","Guardar"); starBtn.style.fontSize="18px";
      starBtn.style.color=isSaved?"#F5A623":"#334155";
      setSaveIcon(starBtn,isSaved);
      starBtn.onclick=function(){
        if(!state.session.saved.some(function(x){return x.de===ph.de;})){
          const item=ensureSrsFields({de:ph.de,es:ph.es,tip:ph.tip,source:"frases"});
          state.session.saved.push(item); starBtn.style.color="#F5A623"; setSaveIcon(starBtn,true); updateBadge(); syncUp();
        }
      };
      btnRow.appendChild(playBtn); btnRow.appendChild(starBtn);
      row.appendChild(de); row.appendChild(btnRow); card.appendChild(row);
      card.appendChild(mk("p",ph.es,"font-size:13px;color:#94a3b8;margin-top:5px;font-weight:500;"));
      if(ph.tip){
        const tipEl=mk("p","💡 "+ph.tip,"font-size:12px;color:#475569;font-style:italic;margin-top:6px;");
        card.appendChild(tipEl);
      }
      el.appendChild(card);
    });

    const more=document.createElement("button");
    more.className="more-btn";
    more.textContent="+ Generar 5 mas";
    more.onclick=function(){loadPhrases(sit);};
    el.appendChild(more);
  } catch(e){
    if(loading.parentNode) el.removeChild(loading);
    el.appendChild(mk("p","Error al cargar frases. Intenta de nuevo.","color:#ef4444;font-size:13px;text-align:center;font-weight:500;"));
  }
}

// ── VOCAB PACK ──
function showVocabPack(host, title, icon, vocabList, categoryName){
  host.innerHTML="";
  var c=mk("div","","padding:2px 0;");
  var topRow=mk("div","","display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;");
  var packTitle=mk("p","","font-size:10px;color:var(--gold-text);letter-spacing:2.5px;font-weight:800;text-transform:uppercase;");
  packTitle.appendChild(iconLabel(icon,title,15));
  topRow.appendChild(packTitle);
  var saveAll=mk("button","Guardar todas ("+vocabList.length+")","padding:6px 12px;border-radius:8px;border:1px solid rgba(245,166,35,0.2);background:rgba(245,166,35,0.06);color:#F5A623;font-size:11px;font-weight:700;cursor:pointer;");
  var savedCount=0;
  saveAll.onclick=function(){
    vocabList.forEach(function(item){
      if(state.session.saved.some(function(x){return x.de===item.de;})) return;
      var phr=ensureSrsFields({de:item.de,es:item.es,tip:item.tip||"",source:"vocab-pack",category:categoryName});
      state.session.saved.push(phr);
      savedCount++;
    });
    if(savedCount>0){logActivity("phrasesReviewed",savedCount);updateBadge();syncUp();showToast(savedCount+" palabras guardadas","success");}
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
