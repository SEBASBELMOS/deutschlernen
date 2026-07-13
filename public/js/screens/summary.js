// ── Summary (Fable visual port) ────────────────────────────────────────────────
function renderSummary() {
  const el=document.getElementById("s-resumen"); el.innerHTML="";

  // ── Data ──
  const streak=computeStreak();
  const lvlPct=computeLevelProgress();
  const dueN=reviewDueCount();
  const wkMins=weeklyMinutes();
  const totalPhrases=state.session.sessionPhrases;
  const savedWithSrs=state.session.saved.map(function(p){return ensureSrsFields(p);});
  const vocabMastered=savedWithSrs.filter(function(p){return (p.box||0)>=4;}).length;

  // Grammar overall accuracy
  var gramStats=state.grammar.grammarStats||{};
  var grammarRight=0, grammarTotal=0;
  Object.keys(gramStats).forEach(function(k){grammarRight+=(gramStats[k].right||0);grammarTotal+=(gramStats[k].right||0)+(gramStats[k].wrong||0);});
  var grammarPct=grammarTotal>0?Math.round(grammarRight/grammarTotal*100):0;

  // ── Fable header: greeting + date ──
  var hour=new Date().getHours();
  var greeting=hour<12?"Buenos días":hour<18?"Buenas tardes":"Buenas noches";
  var daysES=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  var monthsES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  var now=new Date();
  var dateStr=daysES[now.getDay()]+", "+now.getDate()+" de "+monthsES[now.getMonth()];

  var hdr=mk("div","","margin-bottom:14px;");
  hdr.appendChild(mk("p","Tu progreso","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
  var h1=mk("h2","¡"+greeting+", Sebastian!","font-size:24px;font-weight:900;letter-spacing:-0.03em;line-height:1.15;margin:3px 0 2px;color:var(--text);");
  hdr.appendChild(h1);
  hdr.appendChild(mk("p",dateStr+" · así va tu alemán","font-size:12.5px;color:var(--muted);font-weight:500;margin-bottom:0;"));
  // Tier badge (streak-based rank + distance to the next one)
  var tierS=computeTier(streak);
  var tierPill=mk("div","","display:inline-flex;align-items:center;gap:7px;margin-top:8px;padding:6px 13px;border-radius:99px;background:linear-gradient(135deg,rgba("+tierS.rgb+",0.16),rgba("+tierS.rgb+",0.05));border:1px solid rgba("+tierS.rgb+",0.4);");
  tierPill.appendChild(mk("span",tierS.icon+" "+tierS.label,"font-size:12px;font-weight:800;color:"+tierS.color+";letter-spacing:0.3px;"));
  if(tierS.nextAt) tierPill.appendChild(mk("span","· "+(tierS.nextAt-streak)+"d para "+tierS.next,"font-size:10.5px;color:var(--muted);font-weight:600;"));
  if(streak>=7){
    var shield=mk("span","· 🛡️ 1 día de gracia","font-size:10.5px;color:var(--teal-text);font-weight:700;");
    shield.title="Con racha de 7+, un día sin practicar no la rompe (una vez).";
    tierPill.appendChild(shield);
  }
  hdr.appendChild(tierPill);
  el.appendChild(hdr);

  // ── Stats grid 2×2 ──
  var statsGrid=mk("div","","display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-bottom:12px;");
  var statsData=[
    {ico:"🔥",val:streak,lbl:"días de racha",isStreak:true},
    {ico:"⏱️",val:Math.round(state.session.sessionMinutes||0),lbl:"minutos totales",isStreak:false},
    {ico:"📖",val:state.session.saved.length,lbl:"frases guardadas",isStreak:false},
    {ico:"🎯",val:grammarPct+"%",lbl:"acierto gramática",isStreak:false}
  ];
  statsData.forEach(function(st){
    var card=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:15px;padding:14px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);");
    if(st.isStreak){
      card.style.borderColor="rgba(var(--gold-rgb),0.35)";
      card.style.background="linear-gradient(150deg,rgba(var(--gold-rgb),0.1),rgba(var(--gold-rgb),0.02))";
    }
    card.appendChild(mk("span",st.ico,"font-size:16px;margin-bottom:6px;display:block;"));
    var valEl=mk("b",String(st.val),"display:block;font-size:26px;font-weight:900;letter-spacing:-0.03em;line-height:1;font-variant-numeric:tabular-nums;");
    if(st.isStreak) valEl.style.color="var(--gold-text)";
    card.appendChild(valEl);
    card.appendChild(mk("span",st.lbl,"display:block;font-size:10.5px;color:var(--muted);font-weight:700;margin-top:5px;letter-spacing:.8px;text-transform:uppercase;"));
    statsGrid.appendChild(card);
  });
  el.appendChild(statsGrid);

  // ── Weekly activity chart ──
  var chartCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:16px;margin-bottom:12px;");
  chartCard.appendChild(mk("p","Actividad · 7 días","font-size:11px;letter-spacing:2px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:12px;"));

  var daysShort=["Do","Lu","Ma","Mi","Ju","Vi","Sa"];
  var days=[];
  for(var di=6;di>=0;di--){
    var dk=addDays(todayKey(),-di);
    days.push({key:dk,label:daysShort[new Date(dk+"T00:00:00").getDay()],isToday:dk===todayKey()});
  }
  var maxV=1;
  days.forEach(function(d){
    var e=state.session.dailyLog[d.key]||{};
    var v=(e.minutes||0)+(e.phrasesReviewed||0)+(e.drillsDone||0);
    d.val=v; if(v>maxV) maxV=v;
  });

  var chart=mk("div","","display:grid;grid-template-columns:repeat(7,1fr);gap:9px;align-items:end;height:120px;padding-top:18px;border-bottom:1px solid rgba(255,255,255,0.09);");
  days.forEach(function(d,i){
    var col=mk("div","","flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;position:relative;");
    if(d.isToday&&d.val>0){
      var valLabel=mk("span",String(d.val),"position:absolute;top:-4px;font-size:11px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;");
      col.appendChild(valLabel);
    }
    var bar=mk("div","","width:100%;max-width:34px;border-radius:4px 4px 0 0;min-height:2px;");
    var barH=Math.max(4,Math.round(d.val/maxV*72));
    bar.style.height=barH+"px";
    bar.style.animation="slideUpFade 0.35s var(--ease-spring) "+(i*0.07)+"s both";
    if(d.isToday){
      bar.style.background="var(--gold)";
      bar.style.boxShadow="0 0 16px rgba(var(--gold-rgb),0.35)";
    }else{
      bar.style.background="rgba(var(--teal-rgb),0.4)";
    }
    col.appendChild(bar);
    chart.appendChild(col);
  });
  chartCard.appendChild(chart);

  var dayLabels=mk("div","","display:grid;grid-template-columns:repeat(7,1fr);gap:9px;margin-top:7px;");
  days.forEach(function(d){
    var ds=mk("span",d.label,"text-align:center;font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;");
    if(d.isToday) ds.style.color="var(--gold)";
    dayLabels.appendChild(ds);
  });
  chartCard.appendChild(dayLabels);

  var chartNote=mk("p","Cada barra = minutos + repasos + drills del día.","font-size:11px;color:var(--dim);font-weight:600;margin-top:10px;");
  chartCard.appendChild(chartNote);
  el.appendChild(chartCard);

  // ── Grammar progress (compact) ──
  var gramCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:16px;margin-bottom:12px;");
  gramCard.appendChild(mk("p","Gramática","font-size:11px;letter-spacing:2px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:12px;"));

  var scoredGrammar=GRAMMAR_TOPICS.map(function(t){
    var stat=gramStats[t.key];
    var pct=stat&&((stat.right||0)+(stat.wrong||0))?Math.round((stat.right||0)/((stat.right||0)+(stat.wrong||0))*100):0;
    var hasData=stat&&((stat.right||0)+(stat.wrong||0))>0;
    return {topic:t, pct:pct, hasData:hasData};
  });
  scoredGrammar.sort(function(a,b){return a.pct-b.pct;});
  scoredGrammar.forEach(function(st,i){
    if(i>=5&&st.hasData===false) return;
    if(i>=7) return;
    var isWeak=st.hasData&&st.pct<50;
    var row=mk("div","","display:flex;align-items:center;gap:10px;padding:8px 0;");
    var label=mk("b",st.topic.label,"width:130px;font-size:12.5px;font-weight:700;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text);");
    row.appendChild(label);
    var gbar=mk("div","","flex:1;height:5px;border-radius:4px;background:rgba(255,255,255,0.06);overflow:hidden;");
    var gfill=mk("div","","display:block;height:100%;border-radius:4px;");
    gfill.style.width=st.pct+"%";
    gfill.style.background=isWeak?"var(--red)":"var(--purple)";
    gbar.appendChild(gfill);
    row.appendChild(gbar);
    var pctEl=mk("span",st.pct+"%","width:38px;text-align:right;font-size:12px;font-weight:800;flex-shrink:0;font-variant-numeric:tabular-nums;");
    pctEl.style.color=isWeak?"var(--red)":"var(--muted)";
    row.appendChild(pctEl);
    gramCard.appendChild(row);
  });
  var seeAll=mk("span","Ver los "+GRAMMAR_TOPICS.length+" temas →","display:block;text-align:center;font-size:12px;font-weight:700;color:var(--muted);margin-top:8px;cursor:pointer;");
  seeAll.onclick=function(){
    state.app.currentTab="gramatica";
    showScreen("gramatica");
  };
  gramCard.appendChild(seeAll);
  el.appendChild(gramCard);

  // ── Top 5 failed phrases ──
  var allLapsed=[].concat(state.session.saved).filter(function(p){return p.lapses>0;}).sort(function(a,b){return b.lapses-a.lapses;});
  var lapsCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:16px;margin-bottom:12px;");
  lapsCard.appendChild(mk("p","Las que más fallas","font-size:11px;letter-spacing:2px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:12px;"));
  if(allLapsed.length){
    allLapsed.slice(0,5).forEach(function(p,i){
      var row=mk("div","","display:flex;align-items:center;gap:11px;padding:10px 0;border-bottom:1px dashed rgba(255,255,255,0.07);");
      if(i===Math.min(allLapsed.length,5)-1) row.style.borderBottom="none";
      var rank=mk("span",String(i+1),"width:24px;height:24px;border-radius:8px;background:rgba(255,255,255,0.06);color:var(--muted);font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;");
      if(i===0){rank.style.background="rgba(var(--red-rgb),0.15)";rank.style.color="var(--red)";}
      row.appendChild(rank);
      var mid=mk("div","","flex:1;min-width:0;");
      mid.appendChild(mk("p",p.de,"font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text);"));
      mid.appendChild(mk("p",p.es||"","font-size:11px;color:var(--muted);font-weight:500;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"));
      row.appendChild(mid);
      var lapsesBadge=mk("span",(p.lapses||0)+" fallos","flex-shrink:0;font-size:10.5px;font-weight:800;color:var(--red);background:rgba(var(--red-rgb),0.11);border-radius:99px;padding:4px 10px;font-variant-numeric:tabular-nums;");
      row.appendChild(lapsesBadge);
      lapsCard.appendChild(row);
    });
  } else {
    var emptyDiv=mk("div","","text-align:center;padding:24px 16px;border:1px dashed rgba(255,255,255,0.1);border-radius:12px;margin-top:4px;");
    emptyDiv.appendChild(mk("p","Todavía no hay frases con fallos. ¡Buen trabajo!","font-size:13px;color:var(--muted);font-weight:600;"));
    lapsCard.appendChild(emptyDiv);
  }
  el.appendChild(lapsCard);

  // ── SRS distribution (compact shelf) ──
  if(savedWithSrs.length){
    var srsCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:16px;margin-bottom:12px;");
    srsCard.appendChild(mk("p","Distribución SRS","font-size:11px;letter-spacing:2px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:12px;"));
    // Busuu-style strength groups (weak B0-B1 · medium B2-B3 · strong B4-B5)
    var srsBoxes=mk("div","","display:grid;grid-template-columns:repeat(3,1fr);gap:8px;");
    [srsStrength(0),srsStrength(2),srsStrength(4)].forEach(function(g){
      var count=savedWithSrs.filter(function(p){return g.boxes.indexOf(p.box||0)>=0;}).length;
      var pct=savedWithSrs.length?Math.round(count/savedWithSrs.length*100):0;
      var bx=mk("div","","text-align:center;");
      var barH=Math.max(4,pct*0.7);
      var barOuter=mk("div","","height:38px;border-radius:8px 8px 4px 4px;position:relative;background:rgba(255,255,255,0.05);overflow:hidden;margin-bottom:4px;");
      var barFill=mk("div","","position:absolute;bottom:0;left:0;right:0;border-radius:8px 8px 0 0;transition:height 0.5s cubic-bezier(.16,1,.3,1);height:"+barH+"px;background:"+g.color+";");
      barOuter.appendChild(barFill);
      bx.appendChild(barOuter);
      bx.appendChild(mk("span",String(count),"font-size:12px;font-weight:900;display:block;color:var(--text);"));
      bx.appendChild(mk("span",g.plural+" · B"+g.boxes[0]+"-"+g.boxes[1],"font-size:8.5px;font-weight:700;color:var(--dim);letter-spacing:.5px;"));
      srsBoxes.appendChild(bx);
    });
    srsCard.appendChild(srsBoxes);
    el.appendChild(srsCard);
  }

  // ── Export ghost button ──
  var exportBtn=mk("button","⬇ Exportar progreso (JSON)","width:100%;background:rgba(255,255,255,0.04);border:1px dashed rgba(255,255,255,0.15);color:var(--muted);border-radius:13px;padding:13px;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s,color .15s;font-family:inherit;");
  exportBtn.onmouseenter=function(){this.style.background="rgba(255,255,255,0.07)";this.style.color="var(--text)";};
  exportBtn.onmouseleave=function(){this.style.background="rgba(255,255,255,0.04)";this.style.color="var(--muted)";};
  exportBtn.onclick=exportFullProgress;
  el.appendChild(exportBtn);
}
