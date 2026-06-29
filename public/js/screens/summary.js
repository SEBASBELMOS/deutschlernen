// ── Summary ───────────────────────────────────────────────────────────────────
function renderSummary() {
  const el=document.getElementById("s-resumen"); el.innerHTML="";

  // ── 1. GREETING CARD ──
  const streak=computeStreak();
  const lvlPct=computeLevelProgress();
  const dueN=reviewDueCount();
  const wkMins=weeklyMinutes();
  const totalPhrases=state.session.sessionPhrases;
  const totalXP=Math.round((state.session.sessionMinutes||0)*2.5 + (state.session.saved.length||0)*5 + (Object.keys(state.grammar.grammarStats||{}).length)*10);

  var greeting=document.createElement("section"); greeting.className="stitch-page-head";
  var greetCopy=mk("div","","");
  greetCopy.appendChild(mk("h2","Resumen de Progreso",""));
  var subMsg=streak>0
    ?"Has completado parte de tu meta semanal. "+streak+" día"+(streak===1?"":"s")+" de racha."
    :"Tu alemán va por buen camino. Hoy es buen día para arrancar tu racha.";
  greetCopy.appendChild(mk("p",subMsg,""));
  greeting.appendChild(greetCopy);
  var greetActions=mk("div","",""); greetActions.className="stitch-page-actions";
  greetActions.appendChild(mk("span","Últimos 30 días","min-height:44px;display:inline-flex;align-items:center;padding:0 16px;border-radius:var(--r-pill);border:1px solid var(--border);color:var(--text2);font-size:14px;font-weight:800;"));
  greetActions.appendChild(mk("span",totalXP.toLocaleString()+" XP","min-height:44px;display:inline-flex;align-items:center;padding:0 16px;border-radius:var(--r-md);background:var(--primary-container);color:var(--on-primary-container);font-size:14px;font-weight:900;"));
  greeting.appendChild(greetActions);
  el.appendChild(greeting);

  // ── 2. STAT CARDS (2-column grid) ──
  var statGrid=mk("div","","display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-bottom:18px;");
  var cards=[
    {icon:"🔥",label:"Racha",val:streak,sub:streak===1?"día seguido":"días seguidos",borderClr:"rgba(var(--gold-rgb),0.25)",txtClr:"var(--gold-text)",bg:"rgba(var(--gold-rgb),0.06)"},
    {icon:"⭐",label:"Total XP",val:totalXP,sub:"puntos logrados",borderClr:"rgba(var(--teal-rgb),0.25)",txtClr:"var(--teal-text)",bg:"rgba(var(--teal-rgb),0.06)"}
  ];
  cards.forEach(function(c){
    var card=mk("div","","background:"+c.bg+";border:1px solid "+c.borderClr+";border-radius:20px;padding:24px;display:flex;flex-direction:column;justify-content:space-between;min-height:150px;");
    var top=mk("div","","display:flex;justify-content:space-between;align-items:flex-start;");
    top.appendChild(mk("span",c.icon,"font-size:22px;"));
    top.appendChild(mk("span",c.label,"font-size:11px;color:var(--muted);font-weight:500;letter-spacing:1px;font-family:var(--font-label);"));
    card.appendChild(top);
    var val=mk("div","","");
    val.appendChild(mk("p",typeof c.val==="number"?c.val.toLocaleString():String(c.val),"font-size:48px;font-weight:900;color:"+c.txtClr+";letter-spacing:-0.04em;line-height:1;font-variant-numeric:tabular-nums;"));
    val.appendChild(mk("p",c.sub,"font-size:13px;color:var(--muted);font-weight:500;margin-top:2px;"));
    card.appendChild(val);
    statGrid.appendChild(card);
  });
  el.appendChild(statGrid);

  // ── Mini stats row (compact) ──
  var miniStats=mk("div","","display:flex;gap:8px;margin:0 0 18px;flex-wrap:wrap;");
  var miniItems=[
    {label:"Vocabulario",val:state.session.saved.length,color:"var(--purple-text)"},
    {label:"Pendientes",val:dueN,color:"var(--red-text)"},
    {label:"Gramática",val:Object.keys(state.grammar.grammarStats||{}).length+"/"+GRAMMAR_TOPICS.length,color:"var(--green-text)"},
    {label:"Min/sem",val:wkMins+"/"+state.session.weeklyGoal,color:"var(--teal-text)"}
  ];
  miniItems.forEach(function(m){
    var chip=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:var(--r-pill);padding:6px 14px;display:flex;align-items:center;gap:6px;");
    chip.appendChild(mk("span",m.label,"font-size:11px;color:var(--muted);font-weight:600;"));
    chip.appendChild(mk("span",String(m.val),"font-size:13px;color:"+m.color+";font-weight:900;"));
    miniStats.appendChild(chip);
  });
  el.appendChild(miniStats);

  // ── 3. WEEKLY ACTIVITY CHART ──
  var chartCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:24px;margin:0 0 18px;min-height:300px;");
  var chartHdr=mk("div","","display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;");
  chartHdr.appendChild(mk("p","Actividad Semanal","font-size:14px;color:var(--text);font-weight:700;letter-spacing:-0.01em;"));
  chartCard.appendChild(chartHdr);

  var days=[];
  var dayLabels=["Do","Lu","Ma","Mi","Ju","Vi","Sa"];
  for(var i=6;i>=0;i--){ var k=addDays(todayKey(),-i); days.push({key:k,label:dayLabels[new Date(k+"T00:00:00").getDay()]}); }
  var maxAct=1;
  days.forEach(function(d){
    var e=state.session.dailyLog[d.key];
    var total=e?(e.minutes||0)+(e.phrasesReviewed||0)+(e.drillsDone||0):0;
    if(total>maxAct) maxAct=total;
  });
  maxAct=Math.max(maxAct,1);

  var chartRow=mk("div","","display:flex;align-items:flex-end;justify-content:space-between;gap:10px;height:190px;padding-bottom:18px;");
  days.forEach(function(d){
    var e=state.session.dailyLog[d.key]||{};
    var total=(e.minutes||0)+(e.phrasesReviewed||0)+(e.drillsDone||0);
    var h=Math.max(4,Math.round((total/maxAct)*100));
    var isToday=d.key===todayKey();
    var col=mk("div","","display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;");
    var barEl=mk("div","","border-radius:4px 4px 0 0;width:100%;height:"+h+"px;transition:height 0.4s;background:"+(total>0?"linear-gradient(180deg,var(--gold),rgba(var(--gold-rgb),0.25))":"rgba(255,255,255,0.06)")+";");
    var lbl=mk("p",d.label,"font-size:11px;color:"+(isToday?"var(--gold-text)":"var(--muted)")+";font-weight:"+(isToday?"800":"600")+";margin-top:4px;");
    col.appendChild(barEl); col.appendChild(lbl);
    chartRow.appendChild(col);
  });
  chartCard.appendChild(chartRow);

  var allEmpty=true;
  days.forEach(function(d){
    var e=state.session.dailyLog[d.key];
    if(e&&(e.minutes||e.phrasesReviewed||e.drillsDone)) allEmpty=false;
  });
  if(allEmpty) chartCard.appendChild(mk("p","Aún no hay actividad esta semana","font-size:12px;color:var(--muted);text-align:center;"));
  el.appendChild(chartCard);

  // ── Level progress compact ──
  var lvlCard=mk("div","","background:rgba(var(--purple-rgb),0.06);border:1px solid rgba(var(--purple-rgb),0.2);border-radius:20px;padding:20px 24px;margin:0 0 18px;");
  var lvlTop=mk("div","","display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;");
  var lvlLabel=state.app.level==="A2"?"A2→B1":state.app.level==="B1"?"B1→B2":"B2+";
  lvlTop.appendChild(mk("p","📈 Nivel "+lvlLabel,"font-size:14px;color:var(--text);font-weight:700;"));
  lvlTop.appendChild(mk("p",lvlPct+"%","font-size:20px;font-weight:900;color:var(--purple-text);"));
  lvlCard.appendChild(lvlTop);
  var lvlBar=mk("div","","background:rgba(255,255,255,0.06);border-radius:8px;height:8px;overflow:hidden;");
  var lvlFill=mk("div","","background:linear-gradient(90deg,var(--purple),var(--primary));height:100%;width:"+lvlPct+"%;transition:width 0.5s var(--ease-out);border-radius:8px;");
  lvlBar.appendChild(lvlFill); lvlCard.appendChild(lvlBar);
  el.appendChild(lvlCard);

  // ── 4. GRAMMAR PROGRESS GRID ──
  var gramCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:24px;margin:0 0 18px;");
  gramCard.appendChild(mk("p","Dominio de Gramática","font-size:26px;color:var(--text);font-weight:900;margin-bottom:18px;letter-spacing:-0.03em;"));

  var gs=state.grammar.grammarStats||{};
  var gramKeys=Object.keys(gs);
  GRAMMAR_TOPICS.forEach(function(t){
    var stat=gs[t.key];
    var pct=stat&&((stat.right||0)+(stat.wrong||0))?Math.round((stat.right||0)/((stat.right||0)+(stat.wrong||0))*100):0;
    var row=mk("div","","margin-bottom:10px;");
    var rowTop=mk("div","","display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;");
    var label=mk("div","","display:flex;align-items:center;gap:6px;");
    label.appendChild(mk("span",t.icon,"font-size:14px;"));
    label.appendChild(mk("span",t.label,"font-size:13px;color:var(--text2);font-weight:600;"));
    rowTop.appendChild(label);
    rowTop.appendChild(mk("span",pct+"%","font-size:12px;color:var(--muted);font-weight:700;"));
    row.appendChild(rowTop);
    var bar=mk("div","","background:rgba(255,255,255,0.06);border-radius:6px;height:6px;overflow:hidden;");
    var fill=mk("div","","background:var(--primary);height:100%;width:"+pct+"%;transition:width 0.4s;border-radius:6px;");
    bar.appendChild(fill); row.appendChild(bar);
    gramCard.appendChild(row);
  });
  if(!gramKeys.length) gramCard.appendChild(mk("p","Practicá gramática para ver tu progreso","font-size:13px;color:var(--muted);text-align:center;padding:10px 0;"));
  el.appendChild(gramCard);

  // ── SRS distribution (compact) ──
  var srsCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:24px;margin:0 0 18px;");
  srsCard.appendChild(mk("p","📦 Distribución SRS","font-size:14px;color:var(--text);font-weight:700;margin-bottom:12px;letter-spacing:-0.01em;"));
  var boxColors=["var(--red)","var(--gold)","var(--secondary)","var(--teal)","var(--green)","var(--green-text)"];
  var totalCards=state.session.saved.length||1;
  for(var b=0;b<=5;b++){
    var count=state.session.saved.filter(function(p){return p.box===b;}).length;
    var pct=Math.round((count/totalCards)*100);
    var row=mk("div","","display:flex;align-items:center;gap:8px;margin-bottom:6px;");
    row.appendChild(mk("span","B"+b,"font-size:11px;color:var(--muted);font-weight:700;min-width:22px;"));
    var barBg=mk("div","","flex:1;background:rgba(255,255,255,0.06);border-radius:4px;height:8px;overflow:hidden;");
    var barFill=mk("div","","background:"+boxColors[b]+";height:100%;width:"+pct+"%;transition:width 0.4s;border-radius:4px;");
    barBg.appendChild(barFill); row.appendChild(barBg);
    row.appendChild(mk("span",count+" · "+pct+"%","font-size:11px;color:var(--muted);font-weight:600;min-width:72px;text-align:right;"));
    srsCard.appendChild(row);
  }
  el.appendChild(srsCard);

  // ── Tip ──
  var msg=state.session.sessionPhrases+state.session.saved.length+state.session.sessionMinutes===0
    ?"Empezá a practicar y acá verás tu progreso."
    :"Gut gemacht! La consistencia es la clave. ¡Seguí adelante!";
  var achievement=mk("div","","background:var(--surface);border:1px solid rgba(var(--gold-rgb),0.22);border-radius:20px;padding:24px;margin:0 0 18px;text-align:center;");
  achievement.appendChild(mk("p","PRÓXIMO LOGRO","font-size:12px;color:var(--text2);letter-spacing:.14em;font-weight:900;margin-bottom:18px;"));
  achievement.appendChild(mk("p","🏅","font-size:50px;margin-bottom:10px;"));
  achievement.appendChild(mk("p","Políglota Pro","font-size:22px;color:var(--text);font-weight:900;margin-bottom:6px;"));
  achievement.appendChild(mk("p","Completa 50 lecciones sin errores.","font-size:14px;color:var(--text2);line-height:1.5;margin-bottom:14px;"));
  achievement.appendChild(mk("span",Math.min(50,totalPhrases)+" / 50 completadas","display:inline-flex;padding:6px 16px;border-radius:var(--r-pill);background:rgba(var(--gold-rgb),0.16);color:var(--gold-text);font-size:12px;font-weight:900;text-transform:uppercase;"));
  el.appendChild(achievement);

  var challenge=mk("div","","background:var(--primary-container);border:1px solid rgba(var(--primary-rgb),0.28);border-radius:20px;padding:24px;margin:0 0 18px;color:var(--on-primary-container);");
  challenge.appendChild(mk("p","DESAFÍO DIARIO","font-size:12px;letter-spacing:.1em;font-weight:900;margin-bottom:10px;color:var(--on-primary-container);"));
  challenge.appendChild(mk("p","Repaso Flash","font-size:22px;font-weight:900;margin-bottom:4px;color:var(--on-primary-container);"));
  challenge.appendChild(mk("p","Ganá 2x XP repasando vocabulario hoy.","font-size:14px;font-weight:700;color:var(--on-primary-container);opacity:0.82;"));
  el.appendChild(challenge);

  var tip=mk("div","","background:rgba(var(--teal-rgb),0.06);border:1px solid rgba(var(--teal-rgb),0.18);border-radius:var(--r-lg);padding:14px 18px;margin:0 0 14px;display:flex;gap:10px;align-items:flex-start;");
  tip.appendChild(mk("span","💡","font-size:18px;flex-shrink:0;margin-top:1px;"));
  tip.appendChild(mk("p",msg,"font-size:14px;color:var(--teal-text);font-weight:600;line-height:1.5;"));
  el.appendChild(tip);

  // ── 5. EXPORT BUTTON ──
  var exportBtn=document.createElement("button");
  exportBtn.textContent="📥 Exportar Progreso (JSON)";
  exportBtn.style.cssText="display:block;width:100%;margin:6px 0 22px;padding:14px;border-radius:var(--r-md);border:1px solid rgba(var(--gold-rgb),0.25);background:rgba(var(--gold-rgb),0.08);color:var(--gold-text);font-size:14px;font-weight:700;cursor:pointer;transition:background 0.2s,transform 0.12s;";
  exportBtn.onclick=function(){
    var _t=todayKey();
    var str=computeStreak();
    var lvlPctExport=computeLevelProgress();
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
      exportDate:_t,
      level:state.app.level,
      levelProgressPercent:lvlPctExport,
      streak:str,
      streakLabel:str+(str===1?" dia":" dias")+" seguidos",
      weeklyMinutes:weekMins,
      weeklyGoal:state.session.weeklyGoal,
      totalPhrases:state.session.sessionPhrases,
      totalMinutes:state.session.sessionMinutes,
      savedPhrases:state.session.saved.length,
      reviewDueCount:due,
      grammarStats:state.grammar.grammarStats||{},
      errorJournalCount:(state.session.errorJournal||[]).length,
      errorJournal:(state.session.errorJournal||[]).slice(0,100),
      chatLogsCount:state.session.chatLogs.length,
      shownPhrasesTopics:Object.keys(state.session.shownPhrases||{}).length,
      dailyLog:state.session.dailyLog,
      dailyLogLast30Days:recentLog,
      levelLog:state.session.levelLog||{},
      levelLogLast30Days:recentLevelLog
    };
    var json=JSON.stringify(payload,null,2);
    var blob=new Blob([json],{type:"application/json;charset=utf-8"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a"); a.href=url; a.download="deutschlernen-progreso-"+_t+".json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){URL.revokeObjectURL(url);},2000);
    showToast("Progreso exportado → deutschlernen-progreso-"+_t+".json","success");
  };
  el.appendChild(exportBtn);

  // ── Collapsible: Lapsed phrases ──
  var allLapsed=[].concat(state.session.saved).filter(function(p){return p.lapses>0;}).sort(function(a,b){return b.lapses-a.lapses;});
  if(allLapsed.length){
    var lapsCard=mk("div","","margin:0 0 18px;border:1px solid rgba(var(--red-rgb),0.18);border-radius:var(--r-lg);overflow:hidden;");
    var lapsHdr=mk("div","","display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:rgba(var(--red-rgb),0.05);cursor:pointer;");
    lapsHdr.setAttribute("role","button"); lapsHdr.setAttribute("tabindex","0");
    lapsHdr.appendChild(mk("p","⚠️ Más Falladas ("+allLapsed.length+")","font-size:12px;color:var(--red-text);font-weight:700;letter-spacing:1px;font-family:var(--font-label);"));
    var lapsArrow=mk("span","▼","font-size:12px;color:var(--muted);transition:transform 0.2s;");
    lapsHdr.appendChild(lapsArrow);
    lapsCard.appendChild(lapsHdr);
    var lapsBody=mk("div","","overflow:hidden;transition:max-height 0.3s;max-height:0;");
    var lapsList=mk("div","","padding:0 18px;");
    var lapsShown=false;
    lapsHdr.onclick=function(){
      lapsShown=!lapsShown;
      this.setAttribute("aria-expanded",lapsShown?"true":"false");
      lapsArrow.textContent=lapsShown?"▲":"▼";
      if(lapsShown){
        lapsList.innerHTML="";
        allLapsed.slice(0,10).forEach(function(p,i){
          var row=mk("div","","display:flex;align-items:center;gap:10px;padding:8px 0;"+(i<Math.min(allLapsed.length,10)-1?"border-bottom:1px solid rgba(255,255,255,0.04);":""));
          row.appendChild(mk("span",String(i+1),"font-size:12px;color:var(--muted);font-weight:700;min-width:16px;"));
          var txt=mk("div","","flex:1;");
          txt.appendChild(mk("p",p.de,"font-size:14px;color:var(--text);font-weight:700;"));
          txt.appendChild(mk("p",p.es,"font-size:12px;color:var(--muted);margin-top:1px;"));
          row.appendChild(txt);
          row.appendChild(mk("span",(p.lapses||0)+" fallos","font-size:12px;font-weight:900;color:var(--red-text);white-space:nowrap;"));
          lapsList.appendChild(row);
        });
        lapsBody.style.maxHeight="600px";
      } else {
        lapsBody.style.maxHeight="0";
      }
    };
    lapsCard.appendChild(lapsBody);
    lapsBody.appendChild(lapsList);
    el.appendChild(lapsCard);
  }
}
