// ── Smart Coach: leech detection + weakest topic + SRS urgency ────────────────
function smartCoach(){
  var saved=state.session.saved||[];
  var gStats=state.grammar.grammarStats||{};
  var t=todayKey();
  saved.forEach(ensureSrsFields);
  // 1. Leeches: lapses >= 5
  var leechIdx=saved.map(function(_,i){return i;}).filter(function(i){return (saved[i].lapses||0)>=5;})
    .sort(function(a,b){return (saved[b].lapses||0)-(saved[a].lapses||0);});
  // 2. Weakest grammar topic (most wrong%) with >3 attempts
  var weak=Object.keys(gStats).filter(function(k){
    var s=gStats[k]||{}; var total=(s.right||0)+(s.wrong||0);
    return total>3 && (s.right||0)/total<0.5;
  }).sort(function(a,b){
    var sa=gStats[a]||{}, sb=gStats[b]||{};
    return ((sa.right||0)/((sa.right||0)+(sa.wrong||0)))-((sb.right||0)/((sb.right||0)+(sb.wrong||0)));
  });
  if(!weak.length){
    weak=Object.keys(gStats).filter(function(k){
      var s=gStats[k]||{}; var total=(s.right||0)+(s.wrong||0);
      return total>0 && (s.right||0)/total<0.7;
    }).sort(function(a,b){
      var sa=gStats[a]||{}, sb=gStats[b]||{};
      return ((sa.right||0)/((sa.right||0)+(sa.wrong||0)))-((sb.right||0)/((sb.right||0)+(sb.wrong||0)));
    });
  }
  // 3. SRS urgency
  var dueToday=saved.filter(function(p){return p.nextReview<=t;}).length;
  var tomorrow=addDays(t,1);
  var dueTomorrow=saved.filter(function(p){return p.nextReview===tomorrow;}).length;
  var tm=weak[0]?GRAMMAR_TOPICS.filter(function(x){return x.key===weak[0];})[0]:null;

  if(leechIdx.length){
    return {
      msg:leechIdx.length===1
        ?"⚠️ Hay una frase que se te resiste — la fallaste 5+ veces. Repasarla con ejemplos nuevos ayuda a fijarla."
        :"⚠️ Hay frases que se te resisten — las fallaste 5+ veces. Repasarlas con ejemplos nuevos ayuda a fijarlas.",
      actions:[{label:"🔁 Repasar las difíciles", color:"var(--gold)", go:function(){
        state.flashcards.flashReviewMode=true;
        state.flashcards.reviewQueue=leechIdx.slice(0,8);
        state.flashcards.flashIdx=0;
        state.flashcards._isFlipped=false;
        state.app.currentTab="flashcards"; renderTabs(); showScreen("flashcards");
      }}]
    };
  }
  // Error journal has material → suggest the error-review session
  var errN=(state.session.errorJournal||[]).length;
  if(errN>=4){
    return {
      msg:"🔁 Tenés "+errN+" errores anotados en tu diario. Repasarlos es el drill más rentable que existe — es exactamente lo que fallaste.",
      actions:[{label:"🔁 Repasar mis errores ("+Math.min(errN,10)+")", color:"var(--red)", go:function(){
        state.app.currentTab="gramatica"; renderTabs(); showScreen("gramatica");
        setTimeout(function(){ if(typeof startErrorReview==="function") startErrorReview(); },250);
      }}]
    };
  }
  if(tm){
    var stat=gStats[tm.key]||{}, total=(stat.right||0)+(stat.wrong||0);
    var pct=total?Math.round((1-(stat.right||0)/total)*100):0;
    return {
      msg:"🎯 Tu tema más débil: "+tm.label+" ("+pct+"% fallo). Un drill rápido te ayuda.",
      actions:[{label:tm.icon+" Drill de "+tm.label, color:"var(--purple)", go:function(){
        state.app.currentTab="gramatica"; renderTabs(); showScreen("gramatica");
        if(tm) setTimeout(function(){loadGrammarDrills(tm);},250);
      }}]
    };
  }
  if(dueToday>=5 && dueTomorrow<dueToday){
    return {
      msg:"📊 Hoy se vencen "+dueToday+" tarjetas, mañana solo "+dueTomorrow+". Prioriza ahora.",
      actions:[{label:"🃏 Repaso del día", color:"var(--gold)", go:function(){
        state.app.currentTab="flashcards"; renderTabs(); showScreen("flashcards");
      }}]
    };
  }
  if(dueToday>0){
    return {
      msg:"📊 Tienes "+dueToday+" tarjetas pendientes. Un repaso rápido protege tu racha.",
      actions:[{label:"🃏 Repasar", color:"var(--gold)", go:function(){
        state.app.currentTab="flashcards"; renderTabs(); showScreen("flashcards");
      }}]
    };
  }
  return null;
}

// ── Today (motivational home: streak, due cards, habit spine) ─────────────────
state.app._lastStreakSeen=-1;
function removeReviewBackBtn(){
  var el=document.getElementById("review-back-fab");
  if(el) el.remove();
}
function showReviewBackBtn(){
  removeReviewBackBtn();
  var btn=mk("button","← Volver a Hoy","position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:999;padding:10px 24px;border-radius:24px;border:1px solid var(--border);background:var(--modal-bg);color:var(--text);font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.3);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);");
  btn.id="review-back-fab";
  btn.onclick=function(){state.app._reviewPlan=null;removeReviewBackBtn();state.app.currentTab="hoy";renderTabs();showScreen("hoy");renderToday();};
  document.body.appendChild(btn);
}
function showAllCaughtUp(){
  activateTab("hoy"); removeReviewBackBtn();
  var el=document.getElementById("s-hoy"); el.innerHTML="";
  var c=mk("div","","text-align:center;padding:28px 20px;background:linear-gradient(135deg,rgba(var(--green-rgb),0.1),rgba(var(--teal-rgb),0.05));border:1px solid rgba(var(--green-rgb),0.22);border-radius:var(--r-lg);margin-bottom:14px;animation:winPop 0.45s var(--ease-spring) both;");
  c.appendChild(mk("p","🎉","font-size:44px;margin-bottom:8px;"));
  c.appendChild(mk("p","Todo al día","font-size:19px;font-weight:800;color:var(--green-text);margin-bottom:4px;"));
  c.appendChild(mk("p","Tomate un descanso o elige algo para practicar.","font-size:13px;color:var(--muted);font-weight:500;"));
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
function renderToday(){
  removeReviewBackBtn();
  const el=document.getElementById("s-hoy"); el.innerHTML="";
  const streak=computeStreak();
  const due=reviewDueCount();
  const t=todayKey();
  const todayLog=state.session.dailyLog[t]||{minutes:0,phrasesReviewed:0,drillsDone:0};
  const todayTotal=(todayLog.minutes||0)+(todayLog.phrasesReviewed||0)+(todayLog.drillsDone||0);
  const allDone=due===0&&state.session.saved.length>0;
  const streakGrew = streak > state.app._lastStreakSeen;
  const _hr=new Date().getHours();
  const _greet=_hr<12?"Buenos días":_hr<19?"Buenas tardes":"Buenas noches";
  const _uname=(state.app.authUser||"").trim();

  // ── TIER ──
  const _t=computeTier(streak);
  state.app.tier=_t.key;
  const tier={c:_t.color, t:_t.icon+" "+_t.label.toUpperCase(), g:_t.nextAt||100};

  // ═══════════════════════════════════════════
  // 1. HERO — Stitch "Hoy" primary-container card
  // ═══════════════════════════════════════════
  var hero=mk("section","","position:relative;overflow:hidden;background:var(--primary-container);border-radius:20px;padding:24px 20px 20px;margin-bottom:12px;box-shadow:0 10px 34px rgba(0,0,0,.4);z-index:1;");
  if(streakGrew) hero.style.animation="celebratePop 0.45s var(--ease-spring) 0.1s 1";

  // Blur orb decoration (Stitch style)
  var orb=mk("div","","position:absolute;right:-40px;bottom:-40px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(var(--primary-rgb),.35),transparent 70%);pointer-events:none;");
  hero.appendChild(orb);

  // Content wrapper (above orb)
  var heroContent=mk("div","","position:relative;z-index:1;");

  // Streak + tier badge pills
  var badgeRow=mk("div","","display:flex;align-items:center;gap:8px;margin-bottom:16px;");
  var streakBadge=mk("div","","display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.15);border-radius:20px;padding:4px 12px;");
  streakBadge.appendChild(mk("span","🔥","font-size:14px;line-height:1;"));
  streakBadge.appendChild(mk("span",streak+" días","font-size:11px;font-weight:700;color:var(--on-primary-container);"));
  var tierBadge=mk("div","","display:inline-flex;align-items:center;padding:4px 10px;border-radius:20px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);font-size:10px;font-weight:700;letter-spacing:1px;color:"+tier.c+";");
  tierBadge.textContent=tier.t;
  badgeRow.appendChild(streakBadge);
  badgeRow.appendChild(tierBadge);
  heroContent.appendChild(badgeRow);

  // Greeting label
  heroContent.appendChild(mk("p",_greet,"font-size:11px;letter-spacing:2px;font-weight:700;color:rgba(222,224,255,.7);text-transform:uppercase;margin-bottom:4px;"));
  // Name headline
  var greetH1=mk("h1","Hallo, "+(_uname||"Sebastian")+" 👋","font-size:28px;font-weight:900;letter-spacing:-0.03em;color:var(--on-primary-container);line-height:1.2;margin-bottom:6px;");
  heroContent.appendChild(greetH1);
  // Subtext
  var subtext=due>0
    ?"Hoy es un gran día para practicar."
    : allDone?"¡Excelente! Todo al día — disfrutá tu racha."
    :"Empieza hoy a construir tu hábito de alemán.";
  heroContent.appendChild(mk("p",subtext,"font-size:13.5px;color:rgba(222,224,255,.72);font-weight:500;margin-bottom:18px;line-height:1.5;"));

  // Due cards frosted pill (Stitch style)
  var dueLabel=due>0?due+" tarjetas pendientes":"0 tarjetas — ¡al día!";
  var duePill=mk("div","","display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.08);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 16px;");
  duePill.appendChild(mk("span","🃏","font-size:16px;"));
  duePill.appendChild(mk("span",dueLabel,"font-size:13.5px;font-weight:700;color:var(--on-primary-container);"));
  heroContent.appendChild(duePill);

  hero.appendChild(heroContent);
  el.appendChild(hero);

  // ═══════════════════════════════════════════
  // 2. CTA — Full-width primary button
  // ═══════════════════════════════════════════
  if(due>0){
    var cta=mk("button","⚡ Repasar ahora","display:block;width:100%;padding:17px;border-radius:16px;border:none;background:var(--primary);color:var(--on-primary);font-size:16px;font-weight:800;letter-spacing:-.01em;box-shadow:0 6px 24px rgba(var(--primary-rgb),.35);cursor:pointer;transition:transform .12s, box-shadow .2s;margin-bottom:12px;");
    cta.onmouseenter=function(){cta.style.boxShadow="0 8px 30px rgba(var(--primary-rgb),.5)";};
    cta.onmouseleave=function(){cta.style.boxShadow="0 6px 24px rgba(var(--primary-rgb),.35)";};
    cta.onmousedown=function(){cta.style.transform="scale(.97)";};
    cta.onmouseup=function(){cta.style.transform="";};
    cta.onclick=function(){state.app.currentTab="flashcards";renderTabs();showScreen("flashcards");};
    el.appendChild(cta);
  } else if(allDone){
    var doneCta=mk("div","","width:100%;padding:17px;border-radius:16px;background:rgba(var(--green-rgb),0.1);border:1px solid rgba(var(--green-rgb),0.25);color:var(--green-text);text-align:center;font-size:16px;font-weight:800;margin-bottom:12px;");
    doneCta.textContent="✅ ¡Todo al día!";
    el.appendChild(doneCta);
  }

  // ═══════════════════════════════════════════
  // 3. BENTO GRID — Hörverstehen + Tagesziel
  // ═══════════════════════════════════════════
  var weekMins=weeklyMinutes();
  var weekGoal=Math.max(1,Number(state.session.weeklyGoal)||60);
  var weekPct=Math.min(100,Math.round(weekMins/weekGoal*100));

  var bento=mk("div","","display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;");

  // Left: Hörverstehen / Comprensión card
  var hvCard=mk("div","","padding:16px;border-radius:16px;background:var(--surface);border:1px solid var(--border);display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;transition:border-color .2s;min-height:152px;");
  hvCard.onmouseenter=function(){hvCard.style.borderColor="rgba(var(--primary-rgb),.4)";};
  hvCard.onmouseleave=function(){hvCard.style.borderColor="var(--border)";};
  hvCard.onclick=function(){state.app.currentTab="lectura";renderTabs();showScreen("lectura");};

  var hvTop=mk("div","","display:flex;justify-content:space-between;align-items:flex-start;");
  var hvLabels=mk("div","","");
  hvLabels.appendChild(mk("p","🎧 Comprensión","font-size:14px;font-weight:800;color:var(--text);margin-bottom:2px;"));
  hvLabels.appendChild(mk("p","Lectura y audio","font-size:10.5px;color:var(--muted);font-weight:600;"));
  hvTop.appendChild(hvLabels);

  var playBtn=mk("button","▶","width:40px;height:40px;border-radius:50%;border:none;background:rgba(var(--primary-rgb),.18);color:var(--primary);font-size:14px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .15s;");
  playBtn.onclick=function(e){e.stopPropagation();state.app.currentTab="lectura";renderTabs();showScreen("lectura");};
  playBtn.onmouseenter=function(){playBtn.style.transform="scale(1.1)";};
  playBtn.onmouseleave=function(){playBtn.style.transform="";};
  hvTop.appendChild(playBtn);
  hvCard.appendChild(hvTop);

  // Audio wave visualizer bars
  var waveBars=mk("div","","display:flex;align-items:end;gap:2px;height:28px;margin-top:auto;");
  for(var wi=0;wi<10;wi++){
    var bar=mk("div","","width:3px;background:rgba(var(--primary-rgb),"+(0.28+wi*0.07)+");border-radius:2px;animation:waveBar 1.2s ease-in-out infinite;animation-delay:"+(wi*0.11)+"s;");
    waveBars.appendChild(bar);
  }
  hvCard.appendChild(waveBars);
  bento.appendChild(hvCard);

  // Right: Tagesziel / Weekly goal card
  var tzCard=mk("div","","padding:16px;border-radius:16px;background:var(--surface);border:1px solid var(--border);display:flex;flex-direction:column;justify-content:space-between;min-height:152px;");
  tzCard.appendChild(mk("p","🎯 Meta semanal","font-size:14px;font-weight:800;color:var(--text);margin-bottom:2px;"));
  tzCard.appendChild(mk("p",weekPct+"% completado","font-size:10.5px;color:var(--muted);font-weight:600;margin-bottom:10px;"));

  var tzProgress=mk("div","","margin-top:auto;");
  var tzBar=mk("div","","width:100%;height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;margin-bottom:8px;");
  var tzFill=mk("div","","height:100%;background:var(--primary);width:"+weekPct+"%;border-radius:3px;box-shadow:0 0 8px rgba(var(--primary-rgb),.4);transition:width .5s var(--ease-out);");
  tzBar.appendChild(tzFill);
  tzProgress.appendChild(tzBar);

  var tzMotiv=weekPct>=80?"¡Casi llegás!" : weekPct>=50?"¡Mitad de camino!" : weekPct>=20?"¡Buen arranque!" : "¡Hoy empezamos!";
  tzProgress.appendChild(mk("p",tzMotiv,"font-size:11px;font-weight:700;color:var(--gold-text);"));
  tzCard.appendChild(tzProgress);
  bento.appendChild(tzCard);

  el.appendChild(bento);

  // ═══════════════════════════════════════════
  // 4. STAT CHIPS — 3 col grid
  // ═══════════════════════════════════════════
  var newPhrases=todayLog.phrasesReviewed||0;
  var chips=mk("div","","display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:12px;");
  var chipData=[
    {v:todayLog.minutes||0,l:"min hoy",c:"var(--teal-text)"},
    {v:"+"+(newPhrases||0),l:"frases",c:"var(--green-text)"},
    {v:streak,l:"racha",c:"var(--gold-text)"}
  ];
  chipData.forEach(function(cd,i){
    var chip=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:13px 10px 11px;text-align:center;animation:rise .4s "+(i*0.06)+"s both;");
    chip.appendChild(mk("p",String(cd.v),"font-size:23px;font-weight:900;letter-spacing:-.03em;color:"+cd.c+";"));
    chip.appendChild(mk("p",cd.l,"font-size:9.5px;font-weight:700;color:var(--muted);letter-spacing:.6px;text-transform:uppercase;margin-top:2px;"));
    chips.appendChild(chip);
  });
  el.appendChild(chips);

  // ═══════════════════════════════════════════
  // 5. HABIT WEEK
  // ═══════════════════════════════════════════
  var daysES=["LU","MA","MI","JU","VI","SA","DO"];
  var todayIdx=(new Date().getDay()+6)%7;
  var week=mk("div","","display:flex;justify-content:space-between;padding:16px 18px 14px;border-radius:16px;background:var(--surface);border:1px solid var(--border);margin-bottom:12px;");
  daysES.forEach(function(dd,i){
    var dkey=addDays(t,i-todayIdx);
    var dlog=state.session.dailyLog[dkey];
    var dActive=!!(dlog&&((dlog.minutes||0)>0||(dlog.phrasesReviewed||0)>0||(dlog.drillsDone||0)>0));
    var isToday=dkey===t;
    var day=mk("div","","text-align:center;");
    var dot=mk("div","","width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;margin:0 auto 6px;background:rgba(255,255,255,.05);border:1.5px solid transparent;transition:transform .15s;");
    if(dActive){
      dot.style.background="rgba(74,222,128,.14)";dot.style.borderColor="rgba(74,222,128,.5)";
      dot.textContent="✓";
    }else if(isToday){
      dot.style.borderColor="var(--gold-text)";dot.style.animation="ring 1.8s infinite";
      dot.textContent="·";
    }
    day.appendChild(dot);
    var dl=mk("p",dd,"font-size:8.5px;font-weight:800;color:"+(isToday?"var(--gold-text)":"var(--dim)")+";letter-spacing:.8px;");
    day.appendChild(dl);
    week.appendChild(day);
  });
  el.appendChild(week);

  // ═══════════════════════════════════════════
  // 6. SMART COACH
  // ═══════════════════════════════════════════
  var coach=smartCoach();
  if(coach){
    var coCard=mk("section","","position:relative;overflow:hidden;margin-bottom:12px;padding:18px 17px;border-radius:18px;background:linear-gradient(135deg,rgba(var(--gold-rgb),.16),rgba(var(--gold-rgb),.035));border:1px solid rgba(var(--gold-rgb),.34);animation:rise .45s .2s both;box-shadow:0 10px 30px rgba(0,0,0,.24);--glow-rgb:var(--gold-rgb);");
    coCard.classList.add("pulse-glow");
    coCard.appendChild(mk("span","","position:absolute;right:-42px;top:-48px;width:150px;height:150px;border-radius:50%;background:rgba(var(--gold-rgb),.12);filter:blur(34px);pointer-events:none;"));
    coCard.appendChild(mk("p","✦ Coach del día","position:relative;z-index:1;font-size:9.5px;letter-spacing:2.5px;font-weight:900;color:var(--gold-text);text-transform:uppercase;margin-bottom:8px;"));
    coCard.appendChild(mk("p",coach.msg,"position:relative;z-index:1;font-size:14px;font-weight:650;line-height:1.58;color:var(--text);"));
    coach.actions.forEach(function(a){
      var btn=mk("button",a.label,"position:relative;z-index:1;margin-top:13px;background:rgba(var(--gold-rgb),.16);border:1px solid rgba(var(--gold-rgb),.46);color:var(--gold-text);border-radius:13px;padding:10px 16px;font-size:12.5px;font-weight:900;cursor:pointer;transition:background .15s,transform .1s;margin-right:8px;font-family:inherit;");
      btn.onmouseenter=function(){btn.style.background="rgba(var(--gold-rgb),.24)";};
      btn.onmouseleave=function(){btn.style.background="rgba(var(--gold-rgb),.16)";};
      btn.onmousedown=function(){btn.style.transform="scale(.96)";};
      btn.onmouseup=function(){btn.style.transform="";};
      btn.onclick=function(){if(a.go)a.go();};
      coCard.appendChild(btn);
    });
    el.appendChild(coCard);
  }

  // ═══════════════════════════════════════════
  // 7. QUICK ACTIONS (Sesión rápida)
  // ═══════════════════════════════════════════
  el.appendChild(mk("p","⚡ Sesión rápida","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin:20px 0 10px;"));
  var quick=mk("div","");
  quick.className="today-action-grid stagger";
  var quickActions=[
    {ico:"💬",t:"Conversar",d:"5 min de roleplay",col:"var(--teal-text)",rgb:"93,217,208",tab:"conversar"},
    {ico:"✍️",t:"Corregir",d:"Texto y feedback",col:"var(--red-text)",rgb:"255,180,171",tab:"corrigeme"},
    {ico:"📖",t:"Leer",d:"Artículo B1",col:"var(--purple-text)",rgb:"196,167,231",tab:"lectura"},
  ];
  quickActions.forEach(function(qa,i){
    var qCard=mk("button","","position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:flex-start;gap:11px;padding:15px;border-radius:18px;text-align:left;color:var(--text);background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);cursor:pointer;transition:transform .12s, border-color .2s, background .2s, box-shadow .2s;width:100%;min-height:142px;font-family:inherit;");
    if(i===2) qCard.style.gridColumn="span 2";
    qCard.onmousedown=function(){qCard.style.transform="scale(.98)";};
    qCard.onmouseup=function(){qCard.style.transform="";};
    var qGlow=mk("span","","position:absolute;right:-28px;top:-30px;width:105px;height:105px;border-radius:50%;background:rgba("+qa.rgb+",.14);filter:blur(26px);pointer-events:none;");
    qCard.appendChild(qGlow);
    var qIco=mk("span",qa.ico,"position:relative;z-index:1;width:54px;height:54px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;background:rgba("+qa.rgb+",.15);border:1px solid rgba("+qa.rgb+",.32);box-shadow:inset 0 -1px 0 rgba(255,255,255,.08);");
    qCard.appendChild(qIco);
    var qTxt=mk("span","","position:relative;z-index:1;display:block;min-width:0;");
    qTxt.appendChild(mk("span",qa.t,"display:block;font-size:15px;font-weight:900;letter-spacing:-.01em;"));
    qTxt.appendChild(mk("span",qa.d,"display:block;font-size:11.5px;color:var(--muted);font-weight:650;margin-top:2px;line-height:1.35;"));
    qCard.appendChild(qTxt);
    var qGo=mk("span","→","position:absolute;right:14px;bottom:13px;color:"+qa.col+";font-weight:900;font-size:16px;transition:transform .15s,color .15s;");
    qCard.appendChild(qGo);
    qCard.onmouseenter=function(){qCard.style.borderColor="rgba("+qa.rgb+",.34)";qCard.style.background="rgba(255,255,255,.065)";qCard.style.boxShadow="0 12px 30px rgba(0,0,0,.26)";qGo.style.transform="translateX(3px)";};
    qCard.onmouseleave=function(){qCard.style.borderColor="rgba(255,255,255,.08)";qCard.style.background="rgba(255,255,255,.045)";qCard.style.boxShadow="";qGo.style.transform="";};
    qCard.onclick=function(){state.app.currentTab=qa.tab;renderTabs();showScreen(qa.tab);};
    quick.appendChild(qCard);
  });
  el.appendChild(quick);

  // ═══════════════════════════════════════════
  // 8. LEVEL PROGRESS + WEEKLY GOAL (combined card)
  // ═══════════════════════════════════════════
  var lvlPct=computeLevelProgress();
  state.session.levelLog[todayKey()]=lvlPct;
  var lvlLabel=state.app.level==="A2"?"A2→B1":state.app.level==="B1"?"B1→B2":"B2+";

  var lvlCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:18px;margin-bottom:12px;");
  var lvlTop=mk("div","","display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;");
  lvlTop.appendChild(mk("p","📈 "+lvlLabel,"font-size:10px;color:var(--purple-text);letter-spacing:1.5px;font-weight:700;"));
  lvlTop.appendChild(mk("p",lvlPct+"%","font-size:16px;font-weight:900;color:var(--purple-text);font-variant-numeric:tabular-nums;"));
  lvlCard.appendChild(lvlTop);
  var lvlBar=mk("div","","background:rgba(255,255,255,0.06);border-radius:6px;height:6px;overflow:hidden;margin-bottom:10px;");
  var lvlFill=mk("div","","background:linear-gradient(90deg,var(--purple),var(--primary));height:100%;width:"+lvlPct+"%;transition:width 0.5s var(--ease-out);border-radius:6px;");
  lvlBar.appendChild(lvlFill); lvlCard.appendChild(lvlBar);

  // Weekly goal line
  var weekLine=mk("div","","display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;");
  weekLine.appendChild(mk("p","Meta semanal: "+weekMins+" / "+weekGoal+" min","font-size:11px;color:var(--muted);font-weight:700;"));
  weekLine.appendChild(mk("p",weekPct+"%","font-size:11px;color:var(--gold-text);font-weight:700;font-variant-numeric:tabular-nums;"));
  lvlCard.appendChild(weekLine);
  var wBar=mk("div","","background:rgba(255,255,255,0.06);border-radius:4px;height:4px;overflow:hidden;");
  var wFill=mk("div","","background:linear-gradient(90deg,var(--gold),var(--green));height:100%;width:"+weekPct+"%;transition:width 0.4s ease;border-radius:4px;");
  wBar.appendChild(wFill); lvlCard.appendChild(wBar);

  // Mini stat row
  var breakdown=mk("div","","display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-top:8px;font-weight:500;");
  var eff=state.session.saved.filter(function(p){return (p.box||0)>=2;}).length;
  var avgBx=state.session.saved.length?state.session.saved.reduce(function(s,p){return s+(p.box||0);},0)/state.session.saved.length:0;
  var gk=Object.keys(state.grammar.grammarStats||{}).length;
  breakdown.appendChild(mk("span","Vocab: "+eff+"/400",""));
  breakdown.appendChild(mk("span","SRS: "+avgBx.toFixed(1)+"/5",""));
  breakdown.appendChild(mk("span","Gram: "+gk+"/"+GRAMMAR_TOPICS.length,""));
  breakdown.appendChild(mk("span","Racha: "+streak+"d",""));
  lvlCard.appendChild(breakdown);
  el.appendChild(lvlCard);

  // ═══════════════════════════════════════════
  // 9. PERSONALIZED REVIEW CARD (existing logic preserved)
  // ═══════════════════════════════════════════
  if(state.app._reviewPlan&&state.app._reviewPlan.started&&!state.app._reviewPlan.done){
    var rp=state.app._reviewPlan;
    var rStep=rp.steps[rp.currentStep];
    if(rStep){
      var rCard=document.createElement("div");
      rCard.style.cssText="position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(var(--teal-rgb),0.16),rgba(var(--primary-rgb),0.055));border:1px solid rgba(var(--teal-rgb),0.34);border-radius:20px;padding:18px;margin-bottom:12px;box-shadow:0 10px 30px rgba(0,0,0,.24);";
      rCard.appendChild(mk("span","","position:absolute;right:-36px;bottom:-50px;width:150px;height:150px;border-radius:50%;background:rgba(var(--teal-rgb),.12);filter:blur(34px);pointer-events:none;"));
      rCard.appendChild(mk("p","🔄 Repaso en curso","position:relative;z-index:1;font-size:10px;color:var(--teal-text);letter-spacing:2px;font-weight:900;text-transform:uppercase;margin-bottom:6px;"));
      rCard.appendChild(mk("p","Paso "+(rp.currentStep+1)+"/"+rp.steps.length+" · "+rStep.icon+" "+rStep.label,"position:relative;z-index:1;font-size:15px;color:var(--text);font-weight:900;letter-spacing:-.01em;margin-bottom:10px;"));
      var contBtn=mk("button","▶ Continuar","width:100%;padding:12px;border-radius:12px;border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-size:13px;font-weight:700;cursor:pointer;transition:background 0.2s,transform 0.12s;");
      contBtn.onclick=function(){runPersonalizedStep(rp.currentStep);};
      rCard.appendChild(contBtn);
      var backBtn=mk("button","← Descartar repaso","width:100%;padding:10px;border-radius:10px;border:none;background:transparent;color:var(--muted);font-size:12px;font-weight:500;cursor:pointer;margin-top:6px;");
      backBtn.onclick=function(){state.app._reviewPlan=null;renderToday();};
      rCard.appendChild(backBtn);
      el.appendChild(rCard);
    }
  } else if(reviewDueCount()>0||state.session.saved.length>0){
    var reviewCard=mk("div","","position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(var(--teal-rgb),0.17),rgba(var(--primary-rgb),0.055));border:1px solid rgba(var(--teal-rgb),0.34);border-radius:22px;padding:20px;cursor:pointer;margin-bottom:12px;transition:background .2s,transform .12s,box-shadow .2s;box-shadow:0 10px 30px rgba(0,0,0,.24);");
    reviewCard.onclick=function(){startPersonalizedReview();};
    reviewCard.onmouseenter=function(){reviewCard.style.transform="translateY(-2px)";reviewCard.style.boxShadow="0 14px 36px rgba(0,0,0,.30)";};
    reviewCard.onmouseleave=function(){reviewCard.style.transform="";reviewCard.style.boxShadow="0 10px 30px rgba(0,0,0,.24)";};
    reviewCard.appendChild(mk("span","","position:absolute;right:-44px;bottom:-54px;width:170px;height:170px;border-radius:50%;background:rgba(var(--teal-rgb),.12);filter:blur(36px);pointer-events:none;"));
    var reviewTop=mk("div","","position:relative;z-index:1;display:flex;align-items:center;gap:14px;");
    reviewTop.appendChild(mk("span","🔄","width:54px;height:54px;border-radius:18px;background:rgba(var(--teal-rgb),.16);border:1px solid rgba(var(--teal-rgb),.32);display:flex;align-items:center;justify-content:center;font-size:25px;flex-shrink:0;"));
    var reviewTxt=mk("div","","flex:1;min-width:0;");
    reviewTxt.appendChild(mk("p","Repaso personalizado","font-size:10px;color:var(--teal-text);letter-spacing:2.5px;font-weight:900;text-transform:uppercase;margin-bottom:4px;"));
    reviewTxt.appendChild(mk("p","Sesión guiada a tu medida","font-size:17px;color:var(--text);font-weight:900;letter-spacing:-.02em;margin-bottom:2px;"));
    reviewTxt.appendChild(mk("p","Fallos, errores y temas débiles en una ruta corta","font-size:12px;color:var(--muted);font-weight:600;line-height:1.45;"));
    reviewTop.appendChild(reviewTxt);
    reviewTop.appendChild(mk("span","→","color:var(--teal-text);font-size:18px;font-weight:900;"));
    reviewCard.appendChild(reviewTop);
    el.appendChild(reviewCard);
  }

  // ═══════════════════════════════════════════
  // 10. STUDY RECOMMENDATION
  // ═══════════════════════════════════════════
  var rec=getStudyRecommendation();
  if(rec){
    var recCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:14px;margin-bottom:12px;border-left:3px solid "+rec.color+";cursor:pointer;");
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
    el.appendChild(recCard);
  }

  // ═══════════════════════════════════════════
  // 11. CONTEXTUAL TIP
  // ═══════════════════════════════════════════
  var tip=getContextualTip();
  if(tip){
    var tipCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:12px 14px;margin-bottom:12px;border-left:3px solid "+tip.color+";");
    var tipTop=mk("div","","display:flex;align-items:center;gap:6px;margin-bottom:2px;");
    tipTop.appendChild(mk("span",tip.icon,"font-size:12px;"));
    tipTop.appendChild(mk("span","TIP","font-size:9px;color:"+tip.color+";letter-spacing:1.5px;font-weight:700;"));
    tipCard.appendChild(tipTop);
    var tipMsg=document.createElement("p");
    tipMsg.style.cssText="font-size:12px;color:var(--text);font-weight:500;line-height:1.5;margin:0;";
    tipMsg.innerHTML=tip.msg;
    tipCard.appendChild(tipMsg);
    if(tip.tab) tipCard.onclick=function(){state.app.currentTab=tip.tab;renderTabs();showScreen(tip.tab);};
    el.appendChild(tipCard);
  }

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
  var errs=(state.session.errorJournal||[]).filter(function(e){return e&&e.original&&e.correction&&(e.type==="pronunciacion"||e.source||e.type);}).slice(0,3);
  if(errs.length){
    var pronCount=errs.filter(function(e){return e.type==="pronunciacion";}).length;
    var errDetail=pronCount?pronCount+" de pronunciación + "+(errs.length-pronCount)+" más":errs.length+" error"+(errs.length>1?"es":"")+" reciente"+(errs.length>1?"s":"");
    steps.push({type:"errors", icon:"✏️", label:"Corregir errores", detail:errDetail, items:errs});
  }
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
    var bonus=[{tab:"conectores",icon:"🔗",detail:"Practica conectores"},{tab:"lectura",icon:"📖",detail:"Leé un texto corto"},{tab:"tempus",icon:"⏳",detail:"Drill de antes/después"}];
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
  hdr.appendChild(mk("p","REPASO PERSONALIZADO","font-size:10px;color:var(--gold-text);letter-spacing:2.5px;font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","Hoy te recomiendo","font-size:24px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  hdr.appendChild(mk("p","Armado con tus datos. Toca un paso para sacarlo.","font-size:13px;color:var(--muted);margin-top:4px;font-weight:500;"));
  el.appendChild(hdr);
  plan.steps.forEach(function(step){
    var row=mk("div","","display:flex;align-items:center;gap:12px;padding:14px;border-radius:12px;background:var(--surface);border:1px solid var(--border);margin-bottom:8px;cursor:pointer;transition:opacity 0.15s;");
    row.setAttribute("role","button"); row.setAttribute("tabindex","0"); row.setAttribute("aria-label",step.label+" — "+step.detail);
    row.appendChild(mk("span",step.icon,"font-size:24px;flex-shrink:0;"));
    var txt=mk("div","","flex:1;min-width:0;");
    txt.appendChild(mk("p",step.label,"font-size:14px;font-weight:700;color:var(--text);"));
    txt.appendChild(mk("p",step.detail,"font-size:12px;color:var(--muted);font-weight:500;margin-top:1px;"));
    row.appendChild(txt);
    // Empty circle = not selected · ✓ = selected (tap to include the step)
    step.done=false;
    var check=mk("span","✓","width:22px;height:22px;border-radius:999px;flex-shrink:0;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:13px;color:transparent;font-weight:900;transition:border-color .15s,color .15s;");
    row.appendChild(check);
    function paint(){
      row.style.opacity=step.done?"1":"0.72";
      check.style.borderColor=step.done?"var(--gold-text)":"var(--border)";
      check.style.color=step.done?"var(--gold-text)":"transparent";
    }
    function toggle(){ step.done=!step.done; paint(); }
    row.onclick=toggle;
    row.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle();}};
    paint(); el.appendChild(row);
  });
  var start=mk("button","Empezar repaso →","width:100%;padding:15px;border-radius:14px;border:none;background:var(--gold);color:#000;font-size:15px;font-weight:800;cursor:pointer;margin-top:10px;");
  start.onclick=function(){
    plan.steps=plan.steps.filter(function(s){return s.done;});
    if(!plan.steps.length){ state.app._reviewPlan=null; renderToday(); showToast("Elige al menos un paso","error"); return; }
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
  var bar=mk("div","","background:rgba(255,255,255,0.06);border-radius:999px;height:6px;overflow:hidden;");
  var fill=mk("div","","background:linear-gradient(90deg,var(--gold),#fbbf24);height:100%;width:"+Math.round(idx/total*100)+"%;border-radius:999px;transition:width 0.4s var(--ease-out);");
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
  var card=mk("div","","background:linear-gradient(135deg,rgba(var(--gold-rgb),0.09),rgba(var(--gold-rgb),0.03));border:1px solid rgba(var(--gold-rgb),0.2);border-radius:22px;padding:24px;text-align:center;margin-bottom:12px;backdrop-filter:blur(12px);box-shadow:0 8px 28px rgba(0,0,0,.35);");
  card.appendChild(mk("p",ph.de,"font-size:21px;font-weight:900;color:var(--text);line-height:1.4;margin-bottom:12px;"));
  var listen=mk("button","▶ Escuchar","background:rgba(var(--gold-rgb),0.12);border:1px solid rgba(var(--gold-rgb),0.3);color:var(--gold-text);border-radius:999px;padding:7px 18px;font-size:13px;font-weight:700;cursor:pointer;");
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
  var isPron=e.type==="pronunciacion";
  var card=mk("div","","background:"+(isPron?"rgba(var(--teal-rgb),0.06)":"rgba(var(--red-rgb),0.06)")+";border:1px solid "+(isPron?"rgba(var(--teal-rgb),0.22)":"rgba(var(--red-rgb),0.2)")+";border-radius:22px;padding:20px;margin-bottom:12px;backdrop-filter:blur(12px);box-shadow:0 8px 28px rgba(0,0,0,.35);");
  card.appendChild(mk("p",isPron?"🎤 Pronunciación":"Corregí esta frase:","font-size:11px;color:"+(isPron?"var(--teal-text)":"var(--red-text)")+";font-weight:700;letter-spacing:1px;margin-bottom:8px;text-transform:uppercase;"));
  if(isPron){
    card.appendChild(mk("p","Dijiste: "+e.original+" → Correcto: "+e.correction,"font-size:15px;color:var(--text);font-weight:800;line-height:1.55;margin-bottom:10px;"));
  } else {
    card.appendChild(mk("p",e.original,"font-size:16px;color:var(--text);font-weight:700;line-height:1.5;margin-bottom:10px;"));
  }
  var input=document.createElement("textarea"); input.rows=2; input.placeholder="Escribe tu corrección..."; input.setAttribute("aria-label","Tu corrección"); input.style.resize="none";
  input.style.cssText="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;font-size:14px;color:var(--text);outline:none;font-family:inherit;font-weight:500;";
  if(!isPron) card.appendChild(input);
  var reveal=mk("div","","display:none;margin-top:12px;"); card.appendChild(reveal);
  host.appendChild(card);
  var nextB=mk("button",(step._i+1<step.items.length?"Siguiente error →":"Siguiente paso →"),"width:100%;padding:12px;border-radius:12px;border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-weight:800;font-size:13px;cursor:pointer;margin-top:8px;display:none;");
  nextB.onclick=function(){ step._i++; renderReviewErrorsStep(host,step); };
  var showBtn=mk("button","Ver corrección","width:100%;padding:13px;border-radius:12px;border:none;background:var(--gold);color:#000;font-weight:800;font-size:14px;cursor:pointer;");
  showBtn.onclick=function(){
    reveal.innerHTML="";
    if(!isPron&&input.value.trim()){ reveal.appendChild(mk("p","Tu respuesta","font-size:11px;color:var(--muted);font-weight:700;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.5px;")); reveal.appendChild(mk("p",input.value.trim(),"font-size:14px;color:var(--text2);margin-bottom:10px;line-height:1.4;")); }
    reveal.appendChild(mk("p",isPron?"Correcto":"Correcta","font-size:11px;color:var(--green-text);font-weight:700;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.5px;"));
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
  var card=mk("div","","background:rgba(var(--teal-rgb),0.05);border:1px solid rgba(var(--teal-rgb),0.18);border-radius:22px;padding:20px;text-align:center;margin-bottom:12px;backdrop-filter:blur(12px);box-shadow:0 8px 28px rgba(0,0,0,.35);");
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
  var card=mk("div","","background:rgba(var(--purple-rgb),0.06);border:1px solid rgba(var(--purple-rgb),0.22);border-radius:22px;padding:22px;text-align:center;margin-bottom:12px;backdrop-filter:blur(12px);box-shadow:0 8px 28px rgba(0,0,0,.35);");
  card.appendChild(mk("p",(topo?topo.icon:"📐"),"font-size:34px;margin-bottom:6px;"));
  card.appendChild(mk("p","DRILL DE GRAMÁTICA","font-size:11px;color:var(--purple-text);font-weight:700;letter-spacing:1px;margin-bottom:4px;"));
  card.appendChild(mk("p",(topo?topo.label:"Tema"),"font-size:18px;font-weight:800;color:var(--text);"));
  host.appendChild(card);
  var go=mk("button","Empezar drill →","width:100%;padding:14px;border-radius:12px;border:none;background:var(--purple);color:#000;font-weight:800;font-size:14px;cursor:pointer;");
  go.onclick=function(){ state.app.currentTab="gramatica"; renderTabs(); showScreen("gramatica"); if(topo) setTimeout(function(){loadGrammarDrills(topo);},200); };
  host.appendChild(go);
  host.appendChild(mk("p","Al terminar el drill, toca \"Siguiente\" para continuar el repaso.","font-size:11px;color:var(--muted);text-align:center;margin-top:10px;font-weight:500;"));
}

function renderReviewExploreStep(host, step){
  host.innerHTML="";
  var card=mk("div","","background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:22px;padding:22px;text-align:center;margin-bottom:12px;backdrop-filter:blur(12px);box-shadow:0 8px 28px rgba(0,0,0,.35);");
  card.appendChild(mk("p",step.icon,"font-size:34px;margin-bottom:6px;"));
  card.appendChild(mk("p","BONUS","font-size:11px;color:var(--gold-text);font-weight:700;letter-spacing:1.5px;margin-bottom:4px;"));
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
    var result=mk("div","","text-align:center;padding:22px;background:rgba(var(--green-rgb),0.05);border:1px solid rgba(var(--green-rgb),0.18);border-radius:22px;margin-bottom:12px;backdrop-filter:blur(12px);box-shadow:0 8px 28px rgba(0,0,0,.35);");
    result.appendChild(mk("p","📖 Lectura completada","font-size:10px;color:"+col+";letter-spacing:2px;font-weight:700;margin-bottom:6px;"));
    result.appendChild(mk("p",step._score+"/"+step._data.questions.length+" correcto"+(step._data.questions.length>1?"s":""),"font-size:18px;font-weight:800;color:"+col+";"));
    host.appendChild(result);
    var next=mk("button","Siguiente paso →","width:100%;padding:13px;border-radius:12px;border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-weight:800;font-size:13px;cursor:pointer;");
    next.onclick=function(){ step._done=true; if(!step._counted){ step._counted=true; state.app._reviewPlan.results.readingDone++; } logActivity("drillsDone",1); syncUp(); nextReviewStep(); };
    host.appendChild(next);
    return;
  }
  var data=step._data; var qi=step._qi; var q=data.questions[qi];
  host.innerHTML="";
  var passage=mk("div","","background:rgba(var(--teal-rgb),0.04);border:1px solid rgba(var(--teal-rgb),0.15);border-radius:14px;padding:16px;margin-bottom:14px;");
  passage.appendChild(mk("p",data.title||"Lectura","font-size:14px;font-weight:800;color:var(--teal-text);margin-bottom:8px;"));
  passage.appendChild(mk("p",data.text,"font-size:14px;color:var(--text);line-height:1.7;font-weight:500;margin-bottom:8px;"));
  var tts=mk("button","▶ Escuchar","background:rgba(var(--teal-rgb),0.08);border:1px solid rgba(var(--teal-rgb),0.2);color:var(--teal-text);border-radius:16px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer;");
  tts.onclick=function(){speak(data.text);};
  passage.appendChild(tts); host.appendChild(passage);
  var qCard=mk("div","","padding:14px;border:1px solid var(--border);border-radius:14px;background:var(--surface);");
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
