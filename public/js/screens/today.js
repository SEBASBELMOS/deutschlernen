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
      if(isToday) dot.style.boxShadow="0 0 10px rgba(245,166,35,0.6)";
    } else if(isToday){
      dot.style.width="13px"; dot.style.height="13px"; dot.style.background="transparent";
      dot.style.border="2px solid var(--gold)"; dot.style.boxShadow="0 0 8px rgba(245,166,35,0.35)";
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
    hero.appendChild(mk("p","últimos 7 días","font-size:var(--t-xs);color:var(--muted);font-weight:600;margin-top:var(--s-1);letter-spacing:1px;"));
  } else {
    hero.appendChild(mk("p","Empezá tu racha hoy","font-size:var(--t-md);font-weight:800;color:var(--text);"));
    hero.appendChild(mk("p","1 minuto ya cuenta","font-size:var(--t-sm);color:var(--muted);font-weight:500;margin-top:var(--s-1);"));
  }

  // Fused due CTA / win state — the single call to action
  if(allDone){
    const win=mk("div","","margin-top:var(--s-4);padding:var(--s-4);border-radius:var(--r-lg);background:linear-gradient(135deg,rgba(74,222,128,0.12),rgba(74,222,128,0.03));border:1px solid rgba(74,222,128,0.2);animation:winPop 0.45s var(--ease-spring) both;");
    win.appendChild(mk("p","🎉 Por hoy terminaste","font-size:var(--t-md);font-weight:800;color:var(--green-text);"));
    const sumToday=todayLog.phrasesReviewed||0;
    win.appendChild(mk("p",sumToday+" repasada"+(sumToday===1?"":"s")+" · racha "+streak,"font-size:var(--t-sm);color:var(--muted);font-weight:600;margin-top:var(--s-1);"));
    hero.appendChild(win);
  } else if(due>0){
    const cta=document.createElement("div"); cta.className="hover-lift";
    cta.setAttribute("role","button"); cta.setAttribute("tabindex","0");
    cta.setAttribute("aria-label","Repasar "+due+" tarjetas pendientes");
    cta.style.cssText="margin-top:var(--s-4);padding:var(--s-3) var(--s-4);border-radius:var(--r-lg);background:linear-gradient(135deg,rgba(245,166,35,0.14),rgba(245,166,35,0.04));border:1px solid rgba(245,166,35,0.28);cursor:pointer;display:flex;align-items:center;gap:var(--s-3);text-align:left;transition:transform var(--d-fast) var(--ease-out),box-shadow var(--d-base);";
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
  lvlTop.appendChild(mk("p","📈 "+lvlLabel,"font-size:11px;color:var(--purple-text);letter-spacing:1.5px;font-weight:700;"));
  lvlTop.appendChild(mk("p",lvlPct+"%","font-size:16px;font-weight:900;color:var(--purple-text);font-variant-numeric:tabular-nums;"));
  lvlCard.appendChild(lvlTop);
  var lvlBar=mk("div","","background:rgba(255,255,255,0.06);border-radius:6px;height:6px;overflow:hidden;");
  var lvlFill=mk("div","","background:linear-gradient(90deg,#A78BFA,#c4b5fd);height:100%;width:"+lvlPct+"%;transition:width 0.5s var(--ease-out);border-radius:6px;");
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
    recTop.appendChild(mk("span",rec.label,"font-size:10px;color:"+rec.color+";letter-spacing:1.5px;font-weight:700;"));
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
    tipTop.appendChild(mk("span","TIP","font-size:9px;color:"+tip.color+";letter-spacing:1.5px;font-weight:700;"));
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
  impCard.style.cssText="margin-bottom:10px;border:1px solid rgba(245,166,35,0.2);background:rgba(245,166,35,0.05);";
  impCard.appendChild(mk("p","💡 CÓMO MEJORAR","font-size:10px;color:var(--gold-text);letter-spacing:2px;font-weight:700;margin-bottom:8px;"));
  impCard.appendChild(mk("p",imp.error,"font-size:13px;color:var(--text2);font-weight:600;line-height:1.5;margin-bottom:6px;"));
  impCard.appendChild(mk("p","→ "+imp.tip,"font-size:14px;color:var(--gold-text);font-weight:700;line-height:1.5;"));
  el.appendChild(impCard);

  // ── Mini daily progress + adaptive goal ──
  const progCard=document.createElement("div"); progCard.className="card";
  var goalHdr=mk("div","","display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;");
  goalHdr.appendChild(mk("p","HOY","font-size:10px;color:var(--teal-text);letter-spacing:2.5px;font-weight:700;"));
  const dailyGoal=getDailyGoal();
  var curMin=todayLog.minutes||0;
  var goalPct=Math.min(100,Math.round(curMin/dailyGoal*100));
  var goalColor=goalPct>=100?"#4ade80":goalPct>=50?"#F5A623":"#64748b";
  goalHdr.appendChild(mk("p","\u26a1 "+curMin+"/"+dailyGoal+"min","font-size:11px;color:"+goalColor+";font-weight:700;font-variant-numeric:tabular-nums;"));
  progCard.appendChild(goalHdr);
  var goalBar=mk("div","","background:rgba(255,255,255,0.06);border-radius:4px;height:3px;overflow:hidden;margin-bottom:10px;");
  var goalFill=mk("div","","background:"+goalColor+";height:100%;width:"+goalPct+"%;transition:width 0.4s ease;border-radius:4px;");
  goalBar.appendChild(goalFill); progCard.appendChild(goalBar);
  const progItems=[
    {label:"Minutos", value:todayLog.minutes||0, color:"#4ECDC4", icon:"⏱️"},
    {label:"Reviews", value:todayLog.phrasesReviewed||0, color:"#F5A623", icon:"📖"},
    {label:"Drills", value:todayLog.drillsDone||0, color:"#A78BFA", icon:"📐"}
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
  actions.appendChild(mk("p","ACCION RAPIDA","font-size:10px;color:var(--muted);letter-spacing:2.5px;font-weight:700;margin-bottom:10px;"));
  const actBtns=[
    {label:"💬 Conversar", tab:"conversar", color:"#4ECDC4"},
    {label:"✏️ Corrigeme", tab:"corrigeme", color:"#F87171"},
    {label:"🎧 Shadowing", tab:"shadowing", color:"#F5A623"},
    {label:"📐 Gramática", tab:"gramatica", color:"#A78BFA"}
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

  // ── Daily review card ──
  if(state.app._reviewPlan&&!state.app._reviewPlan.done){
    var rp=state.app._reviewPlan;
    var rStep=rp.steps[rp.currentStep];
    if(rStep){
      var rCard=document.createElement("div"); rCard.className="card";
      rCard.style.cssText="border-left:3px solid #4ECDC4;margin-bottom:10px;padding:14px;";
      rCard.appendChild(mk("p","🔄 REPASO EN CURSO","font-size:10px;color:var(--teal-text);letter-spacing:2px;font-weight:700;margin-bottom:4px;"));
      var rIcons={flashcards:"🃏",grammar:"📐"};
      var rNames={flashcards:"Flashcards",grammar:"Gramática"};
      rCard.appendChild(mk("p","Paso "+(rp.currentStep+1)+"/"+rp.steps.length+": <b>"+(rNames[rStep.type]||rStep.type)+"</b>","font-size:13px;color:var(--text);font-weight:600;margin-bottom:8px;"));
      var contBtn=mk("button","▶ Continuar","width:100%;padding:12px;border-radius:12px;border:none;background:rgba(78,205,196,0.12);color:#4ECDC4;font-size:13px;font-weight:700;cursor:pointer;");
      contBtn.onclick=function(){goToReviewStep(rp.currentStep);};
      rCard.appendChild(contBtn);
      var backBtn=mk("button","← Volver al inicio","width:100%;padding:10px;border-radius:10px;border:none;background:transparent;color:var(--muted);font-size:12px;font-weight:500;cursor:pointer;margin-top:6px;");
      backBtn.onclick=function(){state.app._reviewPlan=null;renderToday();};
      rCard.appendChild(backBtn);
      el.appendChild(rCard);
    }
  } else if(reviewDueCount()>0||state.session.saved.length>0){
    var reviewCard=document.createElement("div"); reviewCard.className="card hover-lift";
    reviewCard.style.cssText="background:linear-gradient(135deg,rgba(78,205,196,0.08),rgba(78,205,196,0.02));border:1px solid rgba(78,205,196,0.2);border-radius:var(--r-lg,16px);padding:18px;cursor:pointer;margin-bottom:10px;";
    reviewCard.onclick=function(){startDailyReview();};
    reviewCard.appendChild(mk("p","🔄 REPASO DEL DÍA","font-size:10px;color:var(--teal-text);letter-spacing:2.5px;font-weight:700;margin-bottom:4px;"));
    reviewCard.appendChild(mk("p","Sesión guiada para hoy","font-size:15px;color:var(--text);font-weight:700;margin-bottom:2px;"));
    var dueN=reviewDueCount();
    reviewCard.appendChild(mk("p",(dueN>0?dueN+" pendientes · ":"")+"Gramática","font-size:11px;color:var(--muted);font-weight:500;"));
    el.appendChild(reviewCard);
  }

  // ── Hörverstehen card ──
  var hvCard=document.createElement("div"); hvCard.className="card hover-lift";
  hvCard.style.cssText="background:linear-gradient(135deg,rgba(78,205,196,0.08),rgba(78,205,196,0.02));border:1px solid rgba(78,205,196,0.2);border-radius:var(--r-lg,16px);padding:18px;cursor:pointer;margin-bottom:10px;";
  hvCard.onclick=function(){
    hvCard.style.display="none";
    var hvContainer=document.createElement("div"); hvContainer.id="hv-container";
    hvContainer.style.cssText="margin-bottom:10px;";
    el.insertBefore(hvContainer,el.lastChild);
    startHörverstehen(hvContainer);
  };
  hvCard.appendChild(mk("p","🎧 HÖRVERSTEHEN","font-size:10px;color:var(--teal-text);letter-spacing:2.5px;font-weight:700;margin-bottom:4px;"));
  hvCard.appendChild(mk("p","Comprensión auditiva","font-size:15px;color:var(--text);font-weight:700;margin-bottom:2px;"));
  hvCard.appendChild(mk("p","Escucha un diálogo y responde preguntas","font-size:11px;color:var(--muted);font-weight:500;"));
  el.appendChild(hvCard);

  state.app._lastStreakSeen=streak;
}

// ── DAILY REVIEW ──
function startDailyReview(){
  var steps=[];
  // Step 1: flashcards if due
  if(reviewDueCount()>0) steps.push({type:"flashcards"});
  // Step 2: grammar — weakest topic
  var gStats=state.grammar.grammarStats||{};
  var weakTopics=Object.keys(gStats).filter(function(k){
    var s=gStats[k]; return s.right+s.wrong>0 && s.right/(s.right+s.wrong)<0.6;
  }).sort(function(a,b){
    var sa=gStats[a],sb=gStats[b];
    return (sa.right/(sa.right+sa.wrong))-(sb.right/(sb.right+sb.wrong));
  });
  if(weakTopics.length) steps.push({type:"grammar",topic:weakTopics[0]});
  else if(Object.keys(gStats).length<GRAMMAR_TOPICS.length) steps.push({type:"grammar",topic:null}); // try new topic
  state.app._reviewPlan={steps:steps,currentStep:0,done:false};
  goToReviewStep(0);
}
function goToReviewStep(idx){
  var plan=state.app._reviewPlan;
  if(!plan||idx>=plan.steps.length){ removeReviewBackBtn(); showReviewComplete(); return; }
  plan.currentStep=idx;
  var step=plan.steps[idx];
  if(step.type==="flashcards") { state.app.currentTab="flashcards";renderTabs();showScreen("flashcards"); }
  else if(step.type==="grammar") {
    state.app.currentTab="gramatica";renderTabs();showScreen("gramatica");
    if(step.topic && typeof step.topic==="string"){
      var found=GRAMMAR_TOPICS.findIndex(function(t){return t.key===step.topic;});
      if(found>=0) setTimeout(function(){loadGrammarDrills(GRAMMAR_TOPICS[found]);},200);
    }
  }
  showReviewBackBtn();
}
function showReviewBackBtn(){
  removeReviewBackBtn();
  var btn=mk("button","\u2190 Volver a Hoy","position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:999;padding:10px 24px;border-radius:24px;border:1px solid var(--border);background:var(--modal-bg);color:var(--text);font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.3);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);");
  btn.id="review-back-fab";
  btn.onclick=function(){state.app._reviewPlan=null;removeReviewBackBtn();state.app.currentTab="hoy";renderTabs();showScreen("hoy");renderToday();};
  document.body.appendChild(btn);
}
function removeReviewBackBtn(){
  var el=document.getElementById("review-back-fab");
  if(el) el.remove();
}
function nextReviewStep(){
  var plan=state.app._reviewPlan;
  if(!plan) return;
  goToReviewStep(plan.currentStep+1);
}
function showReviewComplete(){
  var plan=state.app._reviewPlan;
  var el=document.getElementById("s-hoy");
  state.app.currentTab="hoy";renderTabs();showScreen("hoy");
  setTimeout(function(){
    var c=document.createElement("div"); c.id="review-done-card";
    c.className="card";
    c.style.cssText="background:linear-gradient(135deg,rgba(74,222,128,0.12),rgba(78,205,196,0.06));border:1px solid rgba(74,222,128,0.25);border-radius:var(--r-lg,16px);padding:24px;text-align:center;margin-bottom:10px;animation:winPop 0.45s var(--ease-spring) both;";
    c.appendChild(mk("p","🎉","font-size:40px;margin-bottom:6px;"));
    c.appendChild(mk("p","¡Repaso completo!","font-size:18px;font-weight:800;color:var(--green-text);margin-bottom:4px;"));
    c.appendChild(mk("p","Hiciste todas las actividades del plan.","font-size:12px;color:var(--muted);font-weight:500;margin-bottom:10px;"));
    var stepsDone=mk("div","","display:flex;justify-content:center;gap:10px;font-size:12px;");
    plan.steps.forEach(function(s){
      var icons={flashcards:"🃏",grammar:"📐"};
      stepsDone.appendChild(mk("span",(icons[s.type]||"✅")+" "+s.type,"color:#94a3b8;font-weight:600;"));
    });
    c.appendChild(stepsDone);
    var resetBtn=mk("button","Cerrar","width:100%;padding:12px;border-radius:12px;border:none;background:rgba(255,255,255,0.06);color:#94a3b8;font-size:13px;font-weight:700;cursor:pointer;margin-top:14px;");
    resetBtn.onclick=function(){c.remove();state.app._reviewPlan=null;};
    c.appendChild(resetBtn);
    el.insertBefore(c,el.firstChild);
  },300);
  state.app._reviewPlan.done=true;
  removeReviewBackBtn();
}
