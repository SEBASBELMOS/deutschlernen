// ── Today (motivational home: streak, due cards, habit spine) ─────────────────
state.app._lastStreakSeen=-1;
function renderToday(){
  removeReviewBackBtn();
  const el=document.getElementById("s-hoy"); el.innerHTML="";
  const streak=computeStreak();
  const due=reviewDueCount();
  const t=todayKey();
  const todayLog=state.session.dailyLog[t]||{minutes:0,phrasesReviewed:0,drillsDone:0};
  const todayTotal=(todayLog.minutes||0)+(todayLog.phrasesReviewed||0)+(todayLog.drillsDone||0);
  const allDone=due===0&&state.session.saved.length>0;

  // ── Hero band: Tagesbahn (habit spine) + streak + fused due CTA ──
  // Only celebrate when the streak GREW (not on every tab visit) — avoids animation fatigue
  const streakGrew = streak > state.app._lastStreakSeen;
  const hero=document.createElement("div");
  hero.style.cssText="padding:var(--s-5) var(--s-4) var(--s-4);margin-bottom:var(--s-3);text-align:center;";

  // Tagesbahn — the last 7 days as the habit's spine (signature element)
  const bahn=mk("div","","display:flex;gap:var(--s-2);justify-content:center;align-items:center;margin-bottom:var(--s-4);");
  for(var bi=6;bi>=0;bi--){
    var dkey=addDays(t,-bi);
    var dlog=state.session.dailyLog[dkey];
    var dActive=!!(dlog&&((dlog.minutes||0)>0||(dlog.phrasesReviewed||0)>0||(dlog.drillsDone||0)>0));
    var isToday=bi===0;
    var dot=mk("span","","border-radius:var(--r-pill);flex-shrink:0;transition:transform var(--d-base) var(--ease-out);");
    if(dActive){
      dot.style.width="11px"; dot.style.height="11px"; dot.style.background="var(--gold)";
      if(isToday) dot.style.boxShadow="0 0 10px rgba(var(--gold-rgb),0.6)";
    } else if(isToday){
      dot.style.width="13px"; dot.style.height="13px"; dot.style.background="transparent";
      dot.style.border="2px solid var(--gold)"; dot.style.boxShadow="0 0 8px rgba(var(--gold-rgb),0.35)";
    } else {
      dot.style.width="11px"; dot.style.height="11px"; dot.style.background="var(--dim)"; dot.style.opacity="0.55";
    }
    dot.setAttribute("aria-label",(isToday?"hoy":dkey)+": "+(dActive?"estudiado":"sin estudiar"));
    bahn.appendChild(dot);
  }
  hero.appendChild(bahn);

  // Streak line — the hero numeral
  if(streak>0){
    const streakLine=mk("div","","display:flex;align-items:baseline;justify-content:center;gap:var(--s-2);");
    const streakNum=mk("span",String(streak),"font-size:var(--t-2xl);font-weight:900;color:var(--gold-text);letter-spacing:-0.02em;line-height:1;font-variant-numeric:tabular-nums;");
    if(streakGrew) streakNum.style.animation="counterPop 0.4s var(--ease-spring) 0.2s 1";
    streakLine.appendChild(streakNum);
    streakLine.appendChild(mk("span",(streak===1?"día de racha":"días de racha"),"font-size:var(--t-sm);font-weight:700;color:var(--text2);"));
    hero.appendChild(streakLine);
    hero.appendChild(mk("p","últimos 7 días","font-size:var(--t-xs);color:var(--muted);font-weight:600;margin-top:var(--s-1);letter-spacing:1px;font-family:var(--font-label);"));
  } else {
    hero.appendChild(mk("p","Empezá tu racha hoy","font-size:var(--t-md);font-weight:800;color:var(--text);"));
    hero.appendChild(mk("p","1 minuto ya cuenta","font-size:var(--t-sm);color:var(--muted);font-weight:500;margin-top:var(--s-1);"));
  }

  // Fused due CTA / win state — the single call to action
  if(allDone){
    const win=mk("div","","margin-top:var(--s-4);padding:var(--s-4);border-radius:var(--r-lg);background:linear-gradient(135deg,rgba(var(--green-rgb),0.12),rgba(var(--green-rgb),0.03));border:1px solid rgba(var(--green-rgb),0.2);animation:winPop 0.45s var(--ease-spring) both;");
    win.appendChild(mk("p","🎉 Por hoy terminaste","font-size:var(--t-md);font-weight:800;color:var(--green-text);"));
    const sumToday=todayLog.phrasesReviewed||0;
    win.appendChild(mk("p",sumToday+" repasada"+(sumToday===1?"":"s")+" · racha "+streak,"font-size:var(--t-sm);color:var(--muted);font-weight:600;margin-top:var(--s-1);"));
    hero.appendChild(win);
  } else if(due>0){
    const cta=document.createElement("div"); cta.className="hover-lift";
    cta.setAttribute("role","button"); cta.setAttribute("tabindex","0");
    cta.setAttribute("aria-label","Repasar "+due+" tarjetas pendientes");
    cta.style.cssText="margin-top:var(--s-4);padding:var(--s-3) var(--s-4);border-radius:var(--r-lg);background:linear-gradient(135deg,rgba(var(--gold-rgb),0.14),rgba(var(--gold-rgb),0.04));border:1px solid rgba(var(--gold-rgb),0.28);cursor:pointer;display:flex;align-items:center;gap:var(--s-3);text-align:left;transition:transform var(--d-fast) var(--ease-out),box-shadow var(--d-base);";
    cta.onclick=function(){state.app.currentTab="flashcards";renderTabs();showScreen("flashcards");};
    cta.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();this.click();}};
    cta.appendChild(mk("span",String(due),"font-size:var(--t-3xl);font-weight:900;color:var(--gold-text);line-height:1;font-variant-numeric:tabular-nums;flex-shrink:0;"));
    const dueTxt=mk("div","","flex:1;min-width:0;");
    dueTxt.appendChild(mk("p",due===1?"tarjeta pendiente":"tarjetas pendientes","font-size:var(--t-sm);color:var(--gold-text);font-weight:700;"));
    const riskMsg=streak>0?"tu racha de "+streak+" está en juego":"repasá para empezar tu racha";
    dueTxt.appendChild(mk("p",riskMsg,"font-size:var(--t-xs);color:"+(streak>0?"var(--red-text)":"var(--muted)")+";font-weight:600;margin-top:2px;"));
    cta.appendChild(dueTxt);
    cta.appendChild(mk("span","Repasar →","font-size:var(--t-sm);font-weight:800;color:#000;background:var(--gold);padding:var(--s-2) var(--s-3);border-radius:var(--r-md);flex-shrink:0;white-space:nowrap;"));
    hero.appendChild(cta);
  }
  el.appendChild(hero);

  // ── Level progress ──
  var lvlPct=computeLevelProgress();
  state.session.levelLog[todayKey()]=lvlPct;
  var lvlLabel=state.app.level==="A2"?"A2→B1":state.app.level==="B1"?"B1→B2":"B2+";
  var lvlCard=document.createElement("div"); lvlCard.className="card";
  var lvlTop=mk("div","","display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;");
  lvlTop.appendChild(mk("p","📈 "+lvlLabel,"font-size:11px;color:var(--purple-text);letter-spacing:1.5px;font-family:var(--font-label);font-weight:700;"));
  lvlTop.appendChild(mk("p",lvlPct+"%","font-size:16px;font-weight:900;color:var(--purple-text);font-variant-numeric:tabular-nums;"));
  lvlCard.appendChild(lvlTop);
  var lvlBar=mk("div","","background:rgba(255,255,255,0.06);border-radius:6px;height:6px;overflow:hidden;");
  var lvlFill=mk("div","","background:linear-gradient(90deg,#c4a7e7,#c4b5fd);height:100%;width:"+lvlPct+"%;transition:width 0.5s var(--ease-out);border-radius:6px;");
  lvlBar.appendChild(lvlFill); lvlCard.appendChild(lvlBar);
  var eff=state.session.saved.filter(function(p){return (p.box||0)>=2;}).length;
  var avgBx=state.session.saved.length?state.session.saved.reduce(function(s,p){return s+(p.box||0);},0)/state.session.saved.length:0;
  var gk=Object.keys(state.grammar.grammarStats||{}).length;
  var str=computeStreak();
  var breakdown=mk("div","","display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-top:6px;font-weight:500;");
  breakdown.appendChild(mk("span","Vocabulario útil: "+eff+"/400",""));
  breakdown.appendChild(mk("span","Promedio SRS: caja "+avgBx.toFixed(1)+"/5",""));
  breakdown.appendChild(mk("span","Gram: "+gk+"/"+GRAMMAR_TOPICS.length,""));
  breakdown.appendChild(mk("span","Racha: "+str+"d",""));
  lvlCard.appendChild(breakdown);
  el.appendChild(lvlCard);

  // ── Study recommendation ──
  var rec=getStudyRecommendation();
  if(rec){
    var recCard=document.createElement("div"); recCard.className="card";
    recCard.setAttribute("role","button"); recCard.setAttribute("tabindex","0");
    recCard.style.cssText="border-left:3px solid "+rec.color+";margin-bottom:10px;padding:16px 14px;";
    var recTop=mk("div","","display:flex;align-items:center;gap:6px;margin-bottom:4px;");
    recTop.appendChild(mk("span",rec.icon,"font-size:14px;"));
    recTop.appendChild(mk("span",rec.label,"font-size:10px;color:"+rec.color+";letter-spacing:1.5px;font-family:var(--font-label);font-weight:700;"));
    recCard.appendChild(recTop);
    var recMsg=document.createElement("p");
    recMsg.style.cssText="font-size:13px;color:var(--text);font-weight:600;line-height:1.55;margin:0;";
    recMsg.innerHTML=rec.msg.replace(/\*\*([^*]+)\*\*/g,'<b style="color:'+rec.color+'">$1</b>');
    recCard.appendChild(recMsg);
    if(rec.key==="grammar") recCard.onclick=function(){state.app.currentTab="gramatica";renderTabs();showScreen("gramatica");};
    else if(rec.key==="vocab"||rec.key==="srs") recCard.onclick=function(){state.app.currentTab="flashcards";renderTabs();showScreen("flashcards");};
    else recCard.onclick=function(){state.app.currentTab="conversar";renderTabs();showScreen("conversar");};
    recCard.style.cursor="pointer";
    recCard.onkeydown=function(e){if(e.key==="Enter"||e.key===" ") this.click();};
    el.appendChild(recCard);
  }

  // ── Contextual tip ──
  var tip=getContextualTip();
  if(tip){
    var tipCard=document.createElement("div"); tipCard.className="card";
    tipCard.setAttribute("role","button"); tipCard.setAttribute("tabindex","0");
    tipCard.style.cssText="border-left:3px solid "+tip.color+";padding:12px 14px;margin-bottom:10px;cursor:"+(tip.tab?"pointer":"default")+";";
    var tipTop=mk("div","","display:flex;align-items:center;gap:6px;margin-bottom:2px;");
    tipTop.appendChild(mk("span",tip.icon,"font-size:12px;"));
    tipTop.appendChild(mk("span","TIP","font-size:9px;color:"+tip.color+";letter-spacing:1.5px;font-family:var(--font-label);font-weight:700;"));
    tipCard.appendChild(tipTop);
    var tipMsg=document.createElement("p");
    tipMsg.style.cssText="font-size:12px;color:var(--text);font-weight:500;line-height:1.5;margin:0;";
    tipMsg.innerHTML=tip.msg;
    tipCard.appendChild(tipMsg);
    if(tip.tab) tipCard.onclick=function(){state.app.currentTab=tip.tab;renderTabs();showScreen(tip.tab);};
    tipCard.onkeydown=function(e){if(e.key==="Enter"||e.key===" ") this.click();};
    el.appendChild(tipCard);
  }

  // ── How to improve (actionable insight, shared with Summary) ──
  var imp=getInsightData();
  const impCard=document.createElement("div"); impCard.className="card";
  impCard.style.cssText="margin-bottom:10px;border:1px solid rgba(var(--gold-rgb),0.2);background:rgba(var(--gold-rgb),0.05);";
  impCard.appendChild(mk("p","💡 CÓMO MEJORAR","font-size:10px;color:var(--gold-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:8px;"));
  impCard.appendChild(mk("p",imp.error,"font-size:13px;color:var(--text2);font-weight:600;line-height:1.5;margin-bottom:6px;"));
  impCard.appendChild(mk("p","→ "+imp.tip,"font-size:14px;color:var(--gold-text);font-weight:700;line-height:1.5;"));
  el.appendChild(impCard);

  // ── Mini daily progress + adaptive goal ──
  const progCard=document.createElement("div"); progCard.className="card";
  var goalHdr=mk("div","","display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;");
  goalHdr.appendChild(mk("p","HOY","font-size:10px;color:var(--teal-text);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;"));
  const dailyGoal=getDailyGoal();
  var curMin=todayLog.minutes||0;
  var goalPct=Math.min(100,Math.round(curMin/dailyGoal*100));
  var goalColor=goalPct>=100?"var(--green-text)":goalPct>=50?"var(--gold-text)":"var(--muted)";
  var goalFillColor=goalPct>=100?"var(--green)":goalPct>=50?"var(--gold)":"var(--muted)";
  goalHdr.appendChild(mk("p","\u26a1 "+curMin+"/"+dailyGoal+"min","font-size:11px;color:"+goalColor+";font-weight:700;font-variant-numeric:tabular-nums;"));
  progCard.appendChild(goalHdr);
  var goalBar=mk("div","","background:rgba(255,255,255,0.06);border-radius:4px;height:3px;overflow:hidden;margin-bottom:10px;");
  var goalFill=mk("div","","background:"+goalFillColor+";height:100%;width:"+goalPct+"%;transition:width 0.4s ease;border-radius:4px;");
  goalBar.appendChild(goalFill); progCard.appendChild(goalBar);
  const progItems=[
    {label:"Minutos", value:todayLog.minutes||0, color:"var(--teal-text)", icon:"⏱️"},
    {label:"Reviews", value:todayLog.phrasesReviewed||0, color:"var(--gold-text)", icon:"📖"},
    {label:"Drills", value:todayLog.drillsDone||0, color:"var(--purple-text)", icon:"📐"}
  ];
  const progRow=mk("div","","display:flex;gap:8px;");
  progItems.forEach(function(p){
    const box=mk("div","","flex:1;text-align:center;padding:10px 4px;border-radius:var(--r-md,12px);background:rgba(255,255,255,0.03);");
    box.appendChild(mk("span",p.icon,"font-size:18px;"));
    box.appendChild(mk("p",String(p.value),"font-size:22px;font-weight:900;color:"+p.color+";line-height:1.2;margin-top:4px;font-variant-numeric:tabular-nums;"));
    box.appendChild(mk("p",p.label,"font-size:10px;color:var(--muted);font-weight:600;margin-top:2px;"));
    progRow.appendChild(box);
  });
  progCard.appendChild(progRow);
  el.appendChild(progCard);

  // ── Quick actions ──
  const actions=document.createElement("div"); actions.className="card";
  actions.appendChild(mk("p","ACCION RAPIDA","font-size:10px;color:var(--muted);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;margin-bottom:10px;"));
  const actBtns=[
    {label:"💬 Conversar", tab:"conversar", color:"#5dd9d0"},
    {label:"✏️ Corrigeme", tab:"corrigeme", color:"#ffb4ab"},
    {label:"🎧 Shadowing", tab:"shadowing", color:"#ffb955"},
    {label:"📐 Gramática", tab:"gramatica", color:"#c4a7e7"}
  ];
  const actGrid=mk("div","","display:grid;grid-template-columns:1fr 1fr;gap:8px;");
  actBtns.forEach(function(a){
    const btn=mk("button",a.label,"padding:14px;border-radius:var(--r-md,12px);border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);color:var(--text,#e2e8f0);font-size:14px;font-weight:700;cursor:pointer;text-align:center;");
    btn.className="hover-glow";
    btn.style.setProperty("--btn-color","rgba("+hexToRgb(a.color)+",0.25)");
    btn.style.setProperty("--btn-bg","rgba("+hexToRgb(a.color)+",0.06)");
    btn.style.setProperty("--btn-border",a.color+"33");
    btn.onmousedown=function(){this.style.transform="scale(0.97)";};
    btn.onmouseup=function(){this.style.transform="";};
    btn.onclick=function(){state.app.currentTab=a.tab;renderTabs();showScreen(a.tab);};
    actGrid.appendChild(btn);
  });
  actions.appendChild(actGrid);
  el.appendChild(actions);

  // ── Personalized review card ──
  if(state.app._reviewPlan&&state.app._reviewPlan.started&&!state.app._reviewPlan.done){
    var rp=state.app._reviewPlan;
    var rStep=rp.steps[rp.currentStep];
    if(rStep){
      var rCard=document.createElement("div"); rCard.className="card";
      rCard.style.cssText="border-left:3px solid var(--teal);margin-bottom:10px;padding:14px;";
      rCard.appendChild(mk("p","🔄 REPASO EN CURSO","font-size:10px;color:var(--teal-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
      rCard.appendChild(mk("p","Paso "+(rp.currentStep+1)+"/"+rp.steps.length+" · "+rStep.icon+" "+rStep.label,"font-size:13px;color:var(--text);font-weight:700;margin-bottom:8px;"));
      var contBtn=mk("button","▶ Continuar","width:100%;padding:12px;border-radius:12px;border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-size:13px;font-weight:700;cursor:pointer;transition:background 0.2s,transform 0.12s;");
      contBtn.onclick=function(){runPersonalizedStep(rp.currentStep);};
      rCard.appendChild(contBtn);
      var backBtn=mk("button","← Descartar repaso","width:100%;padding:10px;border-radius:10px;border:none;background:transparent;color:var(--muted);font-size:12px;font-weight:500;cursor:pointer;margin-top:6px;");
      backBtn.onclick=function(){state.app._reviewPlan=null;renderToday();};
      rCard.appendChild(backBtn);
      el.appendChild(rCard);
    }
  } else if(reviewDueCount()>0||state.session.saved.length>0){
    var reviewCard=document.createElement("div"); reviewCard.className="card hover-lift";
    reviewCard.setAttribute("role","button"); reviewCard.setAttribute("tabindex","0");
    reviewCard.style.cssText="background:linear-gradient(135deg,rgba(var(--teal-rgb),0.08),rgba(var(--teal-rgb),0.02));border:1px solid rgba(var(--teal-rgb),0.2);border-radius:var(--r-lg,16px);padding:18px;cursor:pointer;margin-bottom:10px;";
    reviewCard.onclick=function(){startPersonalizedReview();};
    reviewCard.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();this.click();}};
    reviewCard.appendChild(mk("p","🔄 REPASO PERSONALIZADO","font-size:10px;color:var(--teal-text);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
    reviewCard.appendChild(mk("p","Sesión guiada a tu medida","font-size:15px;color:var(--text);font-weight:700;margin-bottom:2px;"));
    reviewCard.appendChild(mk("p","Armada con tus fallos, errores y temas débiles","font-size:11px;color:var(--muted);font-weight:500;"));
    el.appendChild(reviewCard);
  }

  // ── Hörverstehen card ──
  var hvCard=document.createElement("div"); hvCard.className="card hover-lift";
  hvCard.style.cssText="background:linear-gradient(135deg,rgba(var(--teal-rgb),0.08),rgba(var(--teal-rgb),0.02));border:1px solid rgba(var(--teal-rgb),0.2);border-radius:var(--r-lg,16px);padding:18px;cursor:pointer;margin-bottom:10px;";
  hvCard.onclick=function(){
    hvCard.style.display="none";
    var hvContainer=document.createElement("div"); hvContainer.id="hv-container";
    hvContainer.style.cssText="margin-bottom:10px;";
    el.insertBefore(hvContainer,el.lastChild);
    startHörverstehen(hvContainer);
  };
  hvCard.appendChild(mk("p","🎧 HÖRVERSTEHEN","font-size:10px;color:var(--teal-text);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
  hvCard.appendChild(mk("p","Comprensión auditiva","font-size:15px;color:var(--text);font-weight:700;margin-bottom:2px;"));
  hvCard.appendChild(mk("p","Escucha un diálogo y responde preguntas","font-size:11px;color:var(--muted);font-weight:500;"));
  el.appendChild(hvCard);

  state.app._lastStreakSeen=streak;
}

// ── PERSONALIZED REVIEW ────────────────────────────────────────────────────────
// Builds an adaptive 3-5 step plan from the user's real data (lapses, due cards,
// errorJournal, weak grammar, conversation phrases) and runs it as an inline
// guided session inside #s-hoy with progress, per-step cancel and a final summary.

function buildPersonalizedPlan(){
  var steps=[]; var t=todayKey(); var saved=state.session.saved||[];
  saved.forEach(ensureSrsFields);
  var used={};
  // 1. Critical cards (high lapses) first; then due high-box (about to be forgotten); then other due
  var byLapses=saved.map(function(_,i){return i;}).filter(function(i){return (saved[i].lapses||0)>=2;})
    .sort(function(a,b){return (saved[b].lapses||0)-(saved[a].lapses||0);});
  var dueHigh=saved.map(function(_,i){return i;}).filter(function(i){return saved[i].nextReview<=t && (saved[i].box||0)>=3 && (saved[i].lapses||0)<2;})
    .sort(function(a,b){return (saved[b].box||0)-(saved[a].box||0);});
  var dueOther=saved.map(function(_,i){return i;}).filter(function(i){return saved[i].nextReview<=t && (saved[i].box||0)<3 && (saved[i].lapses||0)<2;});
  var cardItems=[];
  byLapses.forEach(function(i){if(cardItems.length<8&&!used[i]){cardItems.push(i);used[i]=1;}});
  var critCount=cardItems.length;
  dueHigh.forEach(function(i){if(cardItems.length<8&&!used[i]){cardItems.push(i);used[i]=1;}});
  dueOther.forEach(function(i){if(cardItems.length<6&&!used[i]){cardItems.push(i);used[i]=1;}});
  if(cardItems.length){
    var lbl=critCount>0?(critCount+" crítica"+(critCount>1?"s":"")+(cardItems.length>critCount?" + "+(cardItems.length-critCount)+" más":"")):(cardItems.length+" pendiente"+(cardItems.length>1?"s":""));
    steps.push({type:"cards", icon:"🃏", label:critCount>0?"Tarjetas críticas":"Tarjetas pendientes", detail:lbl, items:cardItems});
  }
  // 2. errorJournal → mini correction exercise
  var errs=(state.session.errorJournal||[]).filter(function(e){return e&&e.original&&e.correction;}).slice(0,3);
  if(errs.length) steps.push({type:"errors", icon:"✏️", label:"Corregir errores", detail:errs.length+" error"+(errs.length>1?"es":"")+" reciente"+(errs.length>1?"s":"")+" del chat", items:errs});
  // 3. Weakest grammar topic (worst right/total ratio)
  var gStats=state.grammar.grammarStats||{};
  var weak=Object.keys(gStats).filter(function(k){var s=gStats[k];return (s.right+s.wrong)>0 && s.right/(s.right+s.wrong)<0.7;})
    .sort(function(a,b){var sa=gStats[a],sb=gStats[b];return (sa.right/(sa.right+sa.wrong))-(sb.right/(sb.right+sb.wrong));});
  if(weak.length){ var tk=weak[0]; var topo=GRAMMAR_TOPICS.filter(function(x){return x.key===tk;})[0]; steps.push({type:"grammar", icon:(topo?topo.icon:"📐"), label:"Gramática", topic:tk, detail:(topo?topo.label:tk)+" — tu tema más flojo"}); }
  // 4. Shadowing of phrases saved from conversar/noentendi
  var shadowItems=saved.filter(function(p){return ["conversar","noentendi"].indexOf(p.source)>=0;}).slice(0,3);
  if(shadowItems.length) steps.push({type:"shadow", icon:"🎧", label:"Pronunciación", detail:shadowItems.length+" frase"+(shadowItems.length>1?"s":"")+" de tus charlas", items:shadowItems});
  // 5. Reading comprehension on weak grammar topic — AI generates a passage + questions
  if(weak.length && steps.length>=1 && steps.length<4){
    var rt=GRAMMAR_TOPICS.filter(function(x){return x.key===weak[0];})[0];
    steps.push({type:"reading", icon:"📖", label:"Comprensión lectora", topic:weak[0], detail:rt?"Lectura sobre "+rt.label:"Texto con preguntas"});
  }
  // 6. Have something but it's thin → pad with one random bonus (vocab pack / reading / tempus).
  //    Zero real steps falls through to an empty plan → "all caught up" screen.
  if(steps.length>=1 && steps.length<2){
    var bonus=[{tab:"conectores",icon:"🔗",detail:"Practicá conectores"},{tab:"lectura",icon:"📖",detail:"Leé un texto corto"},{tab:"tempus",icon:"⏳",detail:"Drill de antes/después"}];
    var pick=bonus[Math.floor(Math.random()*bonus.length)];
    steps.push({type:"explore", icon:pick.icon, label:"Bonus", detail:pick.detail, tab:pick.tab});
  }
  return steps.slice(0,5);
}

function startPersonalizedReview(){
  var steps=buildPersonalizedPlan();
  if(!steps.length){ showAllCaughtUp(); return; }
  state.app._reviewPlan={steps:steps, currentStep:0, started:false, done:false, personalized:true,
    results:{cardsReviewed:0, errorsReviewed:0, shadowDone:0, grammarDone:0, readingDone:0, stepsCompleted:0}};
  renderReviewPlanPreview();
}

// Plan preview — user can accept, drop steps (tap to toggle), or cancel
function renderReviewPlanPreview(){
  var plan=state.app._reviewPlan; if(!plan) return;
  activateTab("hoy"); removeReviewBackBtn();
  var el=document.getElementById("s-hoy"); el.innerHTML="";
  var hdr=mk("div","","margin-bottom:14px;");
  hdr.appendChild(mk("p","REPASO PERSONALIZADO","font-size:10px;color:var(--gold-text);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","Hoy te recomiendo","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  hdr.appendChild(mk("p","Armado con tus datos. Tocá un paso para sacarlo.","font-size:13px;color:var(--muted);margin-top:4px;font-weight:500;"));
  el.appendChild(hdr);
  plan.steps.forEach(function(step){
    var row=mk("div","","display:flex;align-items:center;gap:12px;padding:14px;border-radius:var(--r-md);background:var(--surface);border:1px solid var(--border);margin-bottom:8px;cursor:pointer;transition:opacity 0.15s;");
    row.setAttribute("role","button"); row.setAttribute("tabindex","0"); row.setAttribute("aria-label",step.label+" — "+step.detail);
    row.appendChild(mk("span",step.icon,"font-size:24px;flex-shrink:0;"));
    var txt=mk("div","","flex:1;min-width:0;");
    txt.appendChild(mk("p",step.label,"font-size:14px;font-weight:700;color:var(--text);"));
    txt.appendChild(mk("p",step.detail,"font-size:12px;color:var(--muted);font-weight:500;margin-top:1px;"));
    row.appendChild(txt);
    var check=mk("span","✓","width:22px;height:22px;border-radius:var(--r-pill);flex-shrink:0;border:2px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--gold);font-weight:900;");
    row.appendChild(check);
    function paint(){ row.style.opacity=step.skipped?"0.45":"1"; check.style.borderColor=step.skipped?"var(--muted)":"var(--gold)"; check.textContent=step.skipped?"":"✓"; }
    function toggle(){ step.skipped=!step.skipped; paint(); }
    row.onclick=toggle;
    row.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle();}};
    paint(); el.appendChild(row);
  });
  var start=mk("button","Empezar repaso →","width:100%;padding:15px;border-radius:14px;border:none;background:var(--gold);color:#000;font-size:15px;font-weight:800;cursor:pointer;margin-top:10px;");
  start.onclick=function(){
    plan.steps=plan.steps.filter(function(s){return !s.skipped;});
    if(!plan.steps.length){ state.app._reviewPlan=null; renderToday(); showToast("Elegí al menos un paso","error"); return; }
    plan.currentStep=0; plan.started=true; runPersonalizedStep(0);
  };
  el.appendChild(start);
  var cancel=mk("button","Cancelar","width:100%;padding:11px;border-radius:12px;border:none;background:transparent;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;margin-top:6px;");
  cancel.onclick=function(){ state.app._reviewPlan=null; renderToday(); };
  el.appendChild(cancel);
}

// Progress header shown above every inline step
function reviewProgressHeader(idx, total, step){
  var h=mk("div","","margin-bottom:16px;");
  var top=mk("div","","display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;");
  top.appendChild(mk("p","Paso "+(idx+1)+"/"+total+" · "+step.icon+" "+step.label,"font-size:13px;font-weight:800;color:var(--text);"));
  top.appendChild(mk("p",Math.round(idx/total*100)+"%","font-size:12px;font-weight:700;color:var(--gold-text);font-variant-numeric:tabular-nums;"));
  h.appendChild(top);
  var bar=mk("div","","background:rgba(255,255,255,0.06);border-radius:var(--r-pill);height:6px;overflow:hidden;");
  var fill=mk("div","","background:linear-gradient(90deg,var(--gold),#fbbf24);height:100%;width:"+Math.round(idx/total*100)+"%;border-radius:var(--r-pill);transition:width 0.4s var(--ease-out);");
  bar.appendChild(fill); h.appendChild(bar);
  return h;
}

function runPersonalizedStep(idx){
  var plan=state.app._reviewPlan; if(!plan) return;
  if(idx>=plan.steps.length){ removeReviewBackBtn(); showPersonalizedSummary(); return; }
  plan.currentStep=idx;
  var step=plan.steps[idx];
  activateTab("hoy");
  var el=document.getElementById("s-hoy"); el.innerHTML="";
  el.appendChild(reviewProgressHeader(idx, plan.steps.length, step));
  var host=mk("div","",""); el.appendChild(host);
  if(step.type==="cards") renderReviewCardsStep(host, step);
  else if(step.type==="errors") renderReviewErrorsStep(host, step);
  else if(step.type==="shadow") renderReviewShadowStep(host, step);
  else if(step.type==="grammar") renderReviewGrammarStep(host, step);
  else if(step.type==="explore") renderReviewExploreStep(host, step);
  else if(step.type==="reading") renderReviewReadingStep(host, step);
  // Per-step cancel
  var skip=mk("button","Saltar este paso →","width:100%;background:transparent;border:1px dashed var(--border);color:var(--muted);border-radius:12px;padding:10px;font-size:12px;font-weight:600;cursor:pointer;margin-top:14px;");
  skip.onclick=function(){ step.skipped=true; runPersonalizedStep(plan.currentStep+1); };
  el.appendChild(skip);
  showReviewBackBtn();
}

// Advance to the next step (also called by grammar.js / flashcards.js on completion)
function nextReviewStep(){
  var plan=state.app._reviewPlan; if(!plan) return;
  var cur=plan.steps[plan.currentStep];
  if(cur && !cur.skipped && !cur._counted){ cur._counted=true; plan.results.stepsCompleted++; if(cur.type==="grammar") plan.results.grammarDone++; }
  runPersonalizedStep(plan.currentStep+1);
}

function renderReviewCardsStep(host, step){
  if(typeof step._i!=="number") step._i=0;
  if(step._i>=step.items.length){ nextReviewStep(); return; }
  var ph=state.session.saved[step.items[step._i]];
  if(!ph){ step._i++; renderReviewCardsStep(host, step); return; }
  ensureSrsFields(ph); host.innerHTML="";
  host.appendChild(mk("p",(step._i+1)+"/"+step.items.length+" · caja "+ph.box+"/5"+((ph.lapses||0)?" · "+ph.lapses+" fallos":""),"text-align:center;font-size:12px;color:var(--muted);font-weight:600;margin-bottom:10px;"));
  var card=mk("div","","background:linear-gradient(135deg,rgba(var(--gold-rgb),0.09),rgba(var(--gold-rgb),0.03));border:1px solid rgba(var(--gold-rgb),0.2);border-radius:var(--r-lg);padding:24px;text-align:center;margin-bottom:12px;");
  card.appendChild(mk("p",ph.de,"font-size:21px;font-weight:900;color:var(--text);line-height:1.4;margin-bottom:12px;"));
  var listen=mk("button","▶ Escuchar","background:rgba(var(--gold-rgb),0.12);border:1px solid rgba(var(--gold-rgb),0.3);color:var(--gold-text);border-radius:var(--r-pill);padding:7px 18px;font-size:13px;font-weight:700;cursor:pointer;");
  listen.onclick=function(){speak(ph.de);};
  card.appendChild(listen);
  var answer=mk("div","","display:none;margin-top:14px;");
  answer.appendChild(mk("p",ph.es,"font-size:18px;color:var(--text);font-weight:600;line-height:1.4;"));
  if(ph.tip) answer.appendChild(mk("p","💡 "+ph.tip,"font-size:13px;color:var(--muted);font-style:italic;margin-top:6px;"));
  card.appendChild(answer);
  host.appendChild(card);
  var gradeRow=mk("div","","grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px;display:none;");
  [{k:"fail",lbl:"Fallé",col:"#ffb4ab",txt:"var(--red-text)"},{k:"hard",lbl:"Difícil",col:"#fbbf24",txt:"var(--gold-text)"},{k:"good",lbl:"Bien",col:"#7bd89b",txt:"var(--green-text)"},{k:"easy",lbl:"Fácil",col:"#5dd9d0",txt:"var(--teal-text)"}].forEach(function(g){
    var b=mk("button",g.lbl,"border-radius:12px;padding:12px 6px;font-size:13px;font-weight:800;border:1px solid "+g.col+"55;background:rgba("+hexToRgb(g.col)+",0.1);color:"+g.txt+";cursor:pointer;");
    b.onclick=function(){ srsUpdate(ph,g.k); logActivity("phrasesReviewed",1); state.app._reviewPlan.results.cardsReviewed++; syncUp(); if(typeof updateBadge==="function") updateBadge(); step._i++; renderReviewCardsStep(host,step); };
    gradeRow.appendChild(b);
  });
  var show=mk("button","Mostrar respuesta","width:100%;padding:13px;border-radius:12px;border:none;background:var(--gold);color:#000;font-size:14px;font-weight:800;cursor:pointer;");
  show.onclick=function(){ answer.style.display="block"; gradeRow.style.display="grid"; show.style.display="none"; };
  host.appendChild(show);
  host.appendChild(gradeRow);
}

function renderReviewErrorsStep(host, step){
  if(typeof step._i!=="number") step._i=0;
  if(step._i>=step.items.length){ nextReviewStep(); return; }
  var e=step.items[step._i]; host.innerHTML="";
  host.appendChild(mk("p",(step._i+1)+"/"+step.items.length,"text-align:center;font-size:12px;color:var(--muted);font-weight:600;margin-bottom:10px;"));
  var card=mk("div","","background:rgba(var(--red-rgb),0.06);border:1px solid rgba(var(--red-rgb),0.2);border-radius:var(--r-lg);padding:20px;margin-bottom:12px;");
  card.appendChild(mk("p","Corregí esta frase:","font-size:11px;color:var(--red-text);font-weight:700;letter-spacing:1px;font-family:var(--font-label);margin-bottom:8px;text-transform:uppercase;"));
  card.appendChild(mk("p",e.original,"font-size:16px;color:var(--text);font-weight:700;line-height:1.5;margin-bottom:10px;"));
  var input=document.createElement("textarea"); input.rows=2; input.className="input-field"; input.placeholder="Escribí tu corrección..."; input.setAttribute("aria-label","Tu corrección"); input.style.resize="none";
  card.appendChild(input);
  var reveal=mk("div","","display:none;margin-top:12px;"); card.appendChild(reveal);
  host.appendChild(card);
  var nextB=mk("button",(step._i+1<step.items.length?"Siguiente error →":"Siguiente paso →"),"width:100%;padding:12px;border-radius:12px;border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-weight:800;font-size:13px;cursor:pointer;margin-top:8px;display:none;");
  nextB.onclick=function(){ step._i++; renderReviewErrorsStep(host,step); };
  var showBtn=mk("button","Ver corrección","width:100%;padding:13px;border-radius:12px;border:none;background:var(--gold);color:#000;font-weight:800;font-size:14px;cursor:pointer;");
  showBtn.onclick=function(){
    reveal.innerHTML="";
    if(input.value.trim()){ reveal.appendChild(mk("p","Tu respuesta","font-size:11px;color:var(--muted);font-weight:700;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.5px;")); reveal.appendChild(mk("p",input.value.trim(),"font-size:14px;color:var(--text2);margin-bottom:10px;line-height:1.4;")); }
    reveal.appendChild(mk("p","Correcta","font-size:11px;color:var(--green-text);font-weight:700;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.5px;"));
    reveal.appendChild(mk("p",e.correction,"font-size:16px;color:var(--green-text);font-weight:700;line-height:1.5;"));
    if(e.tip) reveal.appendChild(mk("p","💡 "+e.tip,"font-size:13px;color:var(--muted);font-style:italic;margin-top:6px;"));
    reveal.style.display="block"; showBtn.style.display="none"; nextB.style.display="block";
    logActivity("drillsDone",1); state.app._reviewPlan.results.errorsReviewed++; syncUp();
  };
  host.appendChild(showBtn); host.appendChild(nextB);
}

function renderReviewShadowStep(host, step){
  if(typeof step._i!=="number") step._i=0;
  if(step._i>=step.items.length){ nextReviewStep(); return; }
  var ph=step.items[step._i]; host.innerHTML="";
  host.appendChild(mk("p",(step._i+1)+"/"+step.items.length+" · "+ph.es,"text-align:center;font-size:12px;color:var(--muted);font-weight:600;margin-bottom:10px;"));
  var card=mk("div","","background:rgba(var(--teal-rgb),0.05);border:1px solid rgba(var(--teal-rgb),0.18);border-radius:var(--r-lg);padding:20px;text-align:center;margin-bottom:12px;");
  card.appendChild(mk("p",ph.de,"font-size:18px;font-weight:800;color:var(--text);line-height:1.5;margin-bottom:6px;"));
  card.appendChild(mk("p",ph.es,"font-size:13px;color:var(--muted);font-weight:500;"));
  host.appendChild(card);
  var listen=mk("button","▶ Escuchar","width:100%;padding:13px;border-radius:12px;border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-weight:800;font-size:14px;cursor:pointer;margin-bottom:10px;");
  listen.onclick=function(){speak(ph.de);};
  host.appendChild(listen);
  var scoreHost=mk("div","","margin-bottom:10px;"); host.appendChild(scoreHost);
  var nextB=mk("button",(step._i+1<step.items.length?"Siguiente →":"Siguiente paso →"),"width:100%;padding:12px;border-radius:12px;border:none;background:rgba(var(--gold-rgb),0.1);color:var(--gold-text);font-weight:800;font-size:13px;cursor:pointer;display:none;");
  nextB.onclick=function(){ step._i++; renderReviewShadowStep(host,step); };
  var micRow=mk("div","","display:flex;align-items:center;gap:10px;margin-bottom:8px;");
  micRow.appendChild(mk("span","🎤 Repetí — graba tu voz","font-size:13px;color:var(--teal-text);font-weight:700;flex:1;"));
  var mic=makeMicBtn("#5dd9d0",function(tr){ renderPronScore(scoreHost, ph.de, tr, "#5dd9d0"); logActivity("drillsDone",1); state.app._reviewPlan.results.shadowDone++; syncUp(); nextB.style.display="block"; });
  mic.setAttribute("aria-label","Grabar tu voz para puntuar la pronunciación");
  micRow.appendChild(mic); host.appendChild(micRow); host.appendChild(nextB);
  var skipPhrase=mk("button","Saltar frase","width:100%;background:transparent;border:none;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;margin-top:4px;");
  skipPhrase.onclick=function(){ step._i++; renderReviewShadowStep(host,step); };
  host.appendChild(skipPhrase);
}

function renderReviewGrammarStep(host, step){
  host.innerHTML="";
  var topo=GRAMMAR_TOPICS.filter(function(x){return x.key===step.topic;})[0];
  var card=mk("div","","background:rgba(var(--purple-rgb),0.06);border:1px solid rgba(var(--purple-rgb),0.22);border-radius:var(--r-lg);padding:22px;text-align:center;margin-bottom:12px;");
  card.appendChild(mk("p",(topo?topo.icon:"📐"),"font-size:34px;margin-bottom:6px;"));
  card.appendChild(mk("p","DRILL DE GRAMÁTICA","font-size:11px;color:var(--purple-text);font-weight:700;letter-spacing:1px;font-family:var(--font-label);margin-bottom:4px;"));
  card.appendChild(mk("p",(topo?topo.label:"Tema"),"font-size:18px;font-weight:800;color:var(--text);"));
  host.appendChild(card);
  var go=mk("button","Empezar drill →","width:100%;padding:14px;border-radius:12px;border:none;background:var(--purple);color:#000;font-weight:800;font-size:14px;cursor:pointer;");
  go.onclick=function(){ state.app.currentTab="gramatica"; renderTabs(); showScreen("gramatica"); if(topo) setTimeout(function(){loadGrammarDrills(topo);},200); };
  host.appendChild(go);
  host.appendChild(mk("p","Al terminar el drill, tocá “Siguiente” para continuar el repaso.","font-size:11px;color:var(--muted);text-align:center;margin-top:10px;font-weight:500;"));
}

function renderReviewExploreStep(host, step){
  host.innerHTML="";
  var card=mk("div","","background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:var(--r-lg);padding:22px;text-align:center;margin-bottom:12px;");
  card.appendChild(mk("p",step.icon,"font-size:34px;margin-bottom:6px;"));
  card.appendChild(mk("p","BONUS","font-size:11px;color:var(--gold-text);font-weight:700;letter-spacing:1.5px;font-family:var(--font-label);margin-bottom:4px;"));
  card.appendChild(mk("p",step.detail,"font-size:15px;font-weight:700;color:var(--text);line-height:1.4;"));
  host.appendChild(card);
  var go=mk("button","Ir →","width:100%;padding:14px;border-radius:12px;border:none;background:var(--gold);color:#000;font-weight:800;font-size:14px;cursor:pointer;");
  go.onclick=function(){
    if(!step._counted){ step._counted=true; state.app._reviewPlan.results.stepsCompleted++; }
    state.app._reviewPlan=null; removeReviewBackBtn();
    state.app.currentTab=step.tab; renderTabs(); showScreen(step.tab);
  };
  host.appendChild(go);
}

// ── Reading comprehension step — AI-generated passage + questions ──
function renderReviewReadingStep(host, step){
  if(step._done){ nextReviewStep(); return; }
  if(step._data){ if(typeof step._qi!=="number") step._qi=0; if(typeof step._score!=="number") step._score=0; renderReadingQA(host, step); return; }
  host.innerHTML="";
  host.appendChild(mk("p","📖 Generando tu lectura personalizada...","text-align:center;font-size:13px;color:var(--muted);font-weight:600;margin-bottom:10px;"));
  for(var sk=0;sk<3;sk++) host.appendChild(skelCard(3));
  var lvl=state.app.level||"B1";
  var rt=GRAMMAR_TOPICS.filter(function(x){return x.key===step.topic;})[0];
  var topicLabel=rt?rt.label:"German everyday life";
  ai("You are a German teacher. Reply ONLY with valid JSON, no markdown.",
    [{role:"user",content:'Generate a short German reading passage ('+lvl+' level) of 4-6 sentences about "'+topicLabel+'". Then 2 comprehension questions in German about the text. Format: {"title":"...","text":"...","questions":[{"q":"...","options":["...","...","..."],"correct":0},...]}. 3 options per question, correct is 0-indexed.'}],1500)
    .then(function(raw){
      var m=raw.match(/\{[\s\S]*\}/);
      if(!m){ step._done=true; nextReviewStep(); return; }
      try{
        var data=JSON.parse(m[0]);
        if(!data.text||!data.questions||!data.questions.length){ step._done=true; nextReviewStep(); return; }
        step._data=data; step._qi=0; step._score=0; step._answers=[];
        renderReviewReadingStep(host, step);
      }catch(e){ step._done=true; nextReviewStep(); }
    })
    .catch(function(e){ step._done=true; nextReviewStep(); });
}
function renderReadingQA(host, step){
  if(step._qi>=step._data.questions.length){
    host.innerHTML="";
    var pct=Math.round(step._score/step._data.questions.length*100);
    var col=pct>=70?"var(--green-text)":(pct>=50?"var(--gold-text)":"var(--red-text)");
    var result=mk("div","","text-align:center;padding:22px;background:rgba(var(--green-rgb),0.05);border:1px solid rgba(var(--green-rgb),0.18);border-radius:var(--r-lg);margin-bottom:12px;");
    result.appendChild(mk("p","📖 Lectura completada","font-size:10px;color:"+col+";letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:6px;"));
    result.appendChild(mk("p",step._score+"/"+step._data.questions.length+" correcto"+(step._data.questions.length>1?"s":""),"font-size:18px;font-weight:800;color:"+col+";"));
    host.appendChild(result);
    var next=mk("button","Siguiente paso →","width:100%;padding:13px;border-radius:12px;border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-weight:800;font-size:13px;cursor:pointer;");
    next.onclick=function(){ step._done=true; if(!step._counted){ step._counted=true; state.app._reviewPlan.results.readingDone++; } logActivity("drillsDone",1); syncUp(); nextReviewStep(); };
    host.appendChild(next);
    return;
  }
  var data=step._data; var qi=step._qi; var q=data.questions[qi];
  host.innerHTML="";
  var passage=mk("div","","background:rgba(var(--teal-rgb),0.04);border:1px solid rgba(var(--teal-rgb),0.15);border-radius:var(--r-md);padding:16px;margin-bottom:14px;");
  passage.appendChild(mk("p",data.title||"Lectura","font-size:14px;font-weight:800;color:var(--teal-text);margin-bottom:8px;"));
  passage.appendChild(mk("p",data.text,"font-size:14px;color:var(--text);line-height:1.7;font-weight:500;margin-bottom:8px;"));
  var tts=mk("button","▶ Escuchar","background:rgba(var(--teal-rgb),0.08);border:1px solid rgba(var(--teal-rgb),0.2);color:var(--teal-text);border-radius:16px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer;");
  tts.onclick=function(){speak(data.text);};
  passage.appendChild(tts); host.appendChild(passage);
  var qCard=mk("div","","padding:14px;border:1px solid var(--border);border-radius:var(--r-md);");
  qCard.appendChild(mk("p","Pregunta "+(qi+1)+"/"+data.questions.length,"font-size:11px;color:var(--muted);font-weight:600;margin-bottom:6px;"));
  qCard.appendChild(mk("p",q.q,"font-size:15px;font-weight:700;color:var(--text);margin-bottom:14px;line-height:1.5;"));
  q.options.forEach(function(opt,i){
    var b=mk("button",opt,"width:100%;padding:11px;border:1px solid var(--border);border-radius:10px;background:var(--surface);color:var(--text);font-size:13px;font-weight:600;cursor:pointer;margin-bottom:6px;text-align:left;transition:background 0.12s;");
    b.onmouseenter=function(){b.style.background="rgba(var(--teal-rgb),0.06)";};
    b.onmouseleave=function(){b.style.background="var(--surface)";};
    b.onclick=function(){
      qCard.querySelectorAll("button").forEach(function(bt){bt.disabled=true;bt.style.cursor="default";});
      if(i===q.correct){ b.style.background="rgba(var(--green-rgb),0.15)";b.style.borderColor="rgba(var(--green-rgb),0.5)";b.style.color="var(--green-text)";step._score++; }
      else { b.style.background="rgba(var(--red-rgb),0.1)";b.style.borderColor="rgba(var(--red-rgb),0.4)";b.style.color="var(--red-text)";
        qCard.querySelectorAll("button").forEach(function(bt,j){if(j===q.correct){bt.style.background="rgba(var(--green-rgb),0.15)";bt.style.borderColor="rgba(var(--green-rgb),0.5)";bt.style.color="var(--green-text)";}}); }
      step._answers.push(i);
      var nxt=mk("button",(qi+1<data.questions.length?"Siguiente pregunta →":"Ver resultado →"),"display:block;width:100%;padding:10px;border-radius:10px;border:none;background:var(--gold);color:#000;font-weight:800;font-size:12px;cursor:pointer;margin-top:8px;");
      nxt.onclick=function(){ step._qi++; renderReadingQA(host,step); };
      qCard.appendChild(nxt);
    };
    qCard.appendChild(b);
  });
  host.appendChild(qCard);
}

function showPersonalizedSummary(){
  var plan=state.app._reviewPlan; if(!plan){ renderToday(); return; }
  plan.done=true; removeReviewBackBtn();
  var r=plan.results, total=plan.steps.length;
  activateTab("hoy");
  var el=document.getElementById("s-hoy"); el.innerHTML="";
  var c=mk("div","","text-align:center;padding:26px 20px;background:linear-gradient(135deg,rgba(var(--green-rgb),0.12),rgba(var(--teal-rgb),0.06));border:1px solid rgba(var(--green-rgb),0.25);border-radius:var(--r-lg);margin-bottom:14px;animation:winPop 0.45s var(--ease-spring) both;");
  c.appendChild(mk("p","✅","font-size:40px;margin-bottom:6px;"));
  c.appendChild(mk("p","Completaste "+r.stepsCompleted+"/"+total+" pasos","font-size:18px;font-weight:800;color:var(--green-text);margin-bottom:10px;"));
  var lines=[];
  if(r.cardsReviewed) lines.push("🃏 "+r.cardsReviewed+" flashcard"+(r.cardsReviewed>1?"s":"")+" revisada"+(r.cardsReviewed>1?"s":""));
  if(r.grammarDone) lines.push("📐 "+r.grammarDone+" tema"+(r.grammarDone>1?"s":"")+" de gramática");
  if(r.errorsReviewed) lines.push("✏️ "+r.errorsReviewed+" error"+(r.errorsReviewed>1?"es":"")+" corregido"+(r.errorsReviewed>1?"s":""));
  if(r.shadowDone) lines.push("🎧 "+r.shadowDone+" frase"+(r.shadowDone>1?"s":"")+" de pronunciación");
  if(r.readingDone) lines.push("📖 "+r.readingDone+" lectura completada");
  var detail=mk("div","","display:flex;flex-direction:column;gap:4px;");
  if(lines.length) lines.forEach(function(l){detail.appendChild(mk("p",l,"font-size:13px;color:var(--text2);font-weight:600;"));});
  else detail.appendChild(mk("p","Saltaste los pasos — mañana va.","font-size:13px;color:var(--muted);font-weight:500;"));
  c.appendChild(detail); el.appendChild(c);
  var done=mk("button","Listo","width:100%;padding:13px;border-radius:12px;border:none;background:var(--gold);color:#000;font-size:14px;font-weight:800;cursor:pointer;");
  done.onclick=function(){ state.app._reviewPlan=null; renderToday(); };
  el.appendChild(done);
  if(r.stepsCompleted>=Math.ceil(total/2) && typeof fireConfetti==="function") fireConfetti();
}

// Everything is up to date — nothing urgent to review
function showAllCaughtUp(){
  activateTab("hoy"); removeReviewBackBtn();
  var el=document.getElementById("s-hoy"); el.innerHTML="";
  var c=mk("div","","text-align:center;padding:28px 20px;background:linear-gradient(135deg,rgba(var(--green-rgb),0.1),rgba(var(--teal-rgb),0.05));border:1px solid rgba(var(--green-rgb),0.22);border-radius:var(--r-lg);margin-bottom:14px;animation:winPop 0.45s var(--ease-spring) both;");
  c.appendChild(mk("p","🎉","font-size:44px;margin-bottom:8px;"));
  c.appendChild(mk("p","Todo al día","font-size:19px;font-weight:800;color:var(--green-text);margin-bottom:4px;"));
  c.appendChild(mk("p","Tomate un descanso o elegí algo para practicar.","font-size:13px;color:var(--muted);font-weight:500;"));
  el.appendChild(c);
  var grid=mk("div","","display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;");
  [{lbl:"💬 Conversar",tab:"conversar"},{lbl:"🎧 Shadowing",tab:"shadowing"},{lbl:"📖 Lectura",tab:"lectura"},{lbl:"🃏 Flashcards",tab:"flashcards"}].forEach(function(a){
    var b=mk("button",a.lbl,"padding:14px;border-radius:var(--r-md);border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:14px;font-weight:700;cursor:pointer;");
    b.onclick=function(){ state.app.currentTab=a.tab; renderTabs(); showScreen(a.tab); };
    grid.appendChild(b);
  });
  el.appendChild(grid);
  var back=mk("button","← Volver a Hoy","width:100%;padding:11px;border-radius:12px;border:none;background:transparent;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;");
  back.onclick=function(){ renderToday(); };
  el.appendChild(back);
}

// Floating back-to-Hoy FAB, persistent across every review step
function showReviewBackBtn(){
  removeReviewBackBtn();
  var btn=mk("button","← Volver a Hoy","position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:999;padding:10px 24px;border-radius:24px;border:1px solid var(--border);background:var(--modal-bg);color:var(--text);font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.3);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);");
  btn.id="review-back-fab";
  btn.onclick=function(){state.app._reviewPlan=null;removeReviewBackBtn();state.app.currentTab="hoy";renderTabs();showScreen("hoy");renderToday();};
  document.body.appendChild(btn);
}
function removeReviewBackBtn(){
  var el=document.getElementById("review-back-fab");
  if(el) el.remove();
}
