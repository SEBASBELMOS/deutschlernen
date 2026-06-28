// ── Summary ───────────────────────────────────────────────────────────────────
function renderSummary() {
  const el=document.getElementById("s-resumen"); el.innerHTML="";
  const hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","TU PROGRESO","font-size:11px;color:var(--muted);letter-spacing:2px;font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","Resumen","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  el.appendChild(hdr);

  const streak=computeStreak();
  const streakBox=document.createElement("div");
  streakBox.style.cssText="background:linear-gradient(135deg,rgba(245,166,35,0.12),rgba(248,113,113,0.06));border:1px solid rgba(245,166,35,0.25);border-radius:16px;padding:16px 18px;margin-bottom:10px;display:flex;align-items:center;gap:14px;";
  streakBox.appendChild(mk("span","🔥","font-size:32px;flex-shrink:0;"));
  const sCol=mk("div","","flex:1;");
  sCol.appendChild(mk("p","RACHA","font-size:10px;color:#F5A623;letter-spacing:2.5px;font-weight:700;"));
  sCol.appendChild(mk("p",streak+(streak===1?" dia":" dias")+" seguidos","font-size:20px;font-weight:900;color:var(--text);letter-spacing:-0.02em;margin-top:2px;"));
  if(streak===0) sCol.appendChild(mk("p","Practica hoy para empezar","font-size:12px;color:var(--muted);margin-top:2px;font-weight:500;"));
  streakBox.appendChild(sCol);
  el.appendChild(streakBox);

  var lvlPct=computeLevelProgress();
  var lvlLabel=state.app.level==="A2"?"A2→B1":state.app.level==="B1"?"B1→B2":"B2+";
  var lvlBox=document.createElement("div");
  lvlBox.style.cssText="background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.2);border-radius:16px;padding:16px 18px;margin-bottom:10px;";
  var lvlTop=mk("div","","display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;");
  lvlTop.appendChild(mk("p","📈 "+lvlLabel,"font-size:10px;color:#A78BFA;letter-spacing:2.5px;font-weight:700;"));
  lvlTop.appendChild(mk("p",lvlPct+"%","font-size:22px;font-weight:900;color:#A78BFA;font-variant-numeric:tabular-nums;"));
  lvlBox.appendChild(lvlTop);
  var lvlBar=mk("div","","background:rgba(255,255,255,0.06);border-radius:8px;height:8px;overflow:hidden;");
  var lvlFill=mk("div","","background:linear-gradient(90deg,#A78BFA,#c4b5fd);height:100%;width:"+lvlPct+"%;transition:width 0.5s var(--ease-out);border-radius:8px;");
  lvlBar.appendChild(lvlFill); lvlBox.appendChild(lvlBar);
  var eff=state.session.saved.filter(function(p){return (p.box||0)>=2;}).length;
  var avgBx=state.session.saved.length?state.session.saved.reduce(function(s,p){return s+(p.box||0);},0)/state.session.saved.length:0;
  var gk=Object.keys(state.grammar.grammarStats||{}).length;
  var str=computeStreak();
  var breakdown=mk("div","","display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-top:8px;font-weight:500;");
  breakdown.appendChild(mk("span","Voc: "+eff+"→B1",""));
  breakdown.appendChild(mk("span","SRS: "+avgBx.toFixed(1)+"/5",""));
  breakdown.appendChild(mk("span","Gram: "+gk+"/"+GRAMMAR_TOPICS.length,""));
  breakdown.appendChild(mk("span","Racha: "+str+"d",""));
  lvlBox.appendChild(breakdown);
  el.appendChild(lvlBox);

  // ── Level History Chart (SVG) ──
  var histCard=document.createElement("div"); histCard.className="card";
  histCard.appendChild(mk("p","📈  NIVEL — HISTORIAL","font-size:10px;color:var(--gold-text);letter-spacing:2px;margin-bottom:12px;font-weight:700;"));
  histCard.appendChild(mk("p","Curva de porcentaje de nivel CEFR en el tiempo.","font-size:12px;color:var(--muted);line-height:1.45;margin-top:-6px;margin-bottom:10px;font-weight:500;"));
  var _pts=[];
  for(var _i=29;_i>=0;_i--){var _k=addDays(todayKey(),-_i);var _pct=state.session.levelLog&&state.session.levelLog[_k];if(typeof _pct==="number")_pts.push({date:_k,pct:_pct});}
  if(_pts.length>=2){
    var _cW=1000,_cH=200,_pT=20,_pR=20,_pB=30,_pL=40,_chW=_cW-_pL-_pR,_chH=_cH-_pT-_pB;
    var _mn=Math.max(0,Math.min.apply(null,_pts.map(function(p){return p.pct;}))-5);
    var _mx=Math.min(100,Math.max.apply(null,_pts.map(function(p){return p.pct;}))+5);
    var _rng=_mx-_mn||1;
    function _xS(i){return _pL+(i/(_pts.length-1))*_chW;}
    function _yS(v){return _pT+_chH-((v-_mn)/_rng)*_chH;}
    var _lnPts=_pts.map(function(p,i){return _xS(i)+","+_yS(p.pct);}).join(" ");
    var _arPts=_pL+","+_yS(_mn)+" "+_lnPts+" "+_xS(_pts.length-1)+","+_yS(_mn);
    var _sId="lgH"+Date.now();
    var _yLbls=[];
    for(var _yl=0;_yl<=100;_yl+=25){if(_yl>=_mn&&_yl<=_mx)_yLbls.push(_yl);}
    var _xLbls=_pts.filter(function(_,i){return i%Math.max(1,Math.floor(_pts.length/5))===0||i===_pts.length-1;});
    var _svg='<svg viewBox="0 0 '+_cW+' '+_cH+'" style="width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg">'
      +'<line x1="'+_pL+'" y1="'+_pT+'" x2="'+_pL+'" y2="'+(_pT+_chH)+'" style="stroke:var(--border)" stroke-width="1"/>'
      +'<line x1="'+_pL+'" y1="'+(_pT+_chH)+'" x2="'+(_pL+_chW)+'" y2="'+(_pT+_chH)+'" style="stroke:var(--border)" stroke-width="1"/>'
      +_yLbls.map(function(v){return'<text x="'+(_pL-8)+'" y="'+_yS(v)+'" text-anchor="end" font-size="10" style="fill:var(--muted)" dominant-baseline="middle">'+v+'%</text>';}).join("")
      +'<polygon points="'+_arPts+'" fill="url(#'+_sId+')" opacity="0.12"/>'
      +'<polyline points="'+_lnPts+'" fill="none" stroke="url(#lgGrad'+_sId+')" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>'
      +_pts.map(function(p,i){return'<circle cx="'+_xS(i)+'" cy="'+_yS(p.pct)+'" r="3" fill="rgba(245,166,35,0.5)" stroke="rgba(245,166,35,0.85)" stroke-width="1"/>';}).join("")
      +_xLbls.map(function(p){return'<text x="'+_xS(_pts.indexOf(p))+'" y="'+(_pT+_chH+18)+'" text-anchor="middle" font-size="9" style="fill:var(--muted)">'+p.date.slice(5)+'</text>';}).join("")
      +'<defs>'
      +'<linearGradient id="lgGrad'+_sId+'" x1="0" y1="0" x2="1" y2="0">'
      +'<stop offset="0%" stop-color="#F5A623"/><stop offset="100%" stop-color="#4ECDC4"/>'
      +'</linearGradient>'
      +'<linearGradient id="'+_sId+'" x1="0" y1="0" x2="0" y2="1">'
      +'<stop offset="0%" stop-color="#F5A623"/><stop offset="100%" stop-color="#4ECDC4"/>'
      +'</linearGradient>'
      +'</defs></svg>';
    histCard.innerHTML+=_svg;
    var _last=_pts[_pts.length-1];
    histCard.appendChild(mk("p","Último: "+_last.pct+"% ("+_last.date+") · "+_pts.length+" días registrados","font-size:11px;color:var(--muted);margin-top:8px;font-weight:500;text-align:center;"));
  } else {
    histCard.appendChild(mk("p","Todavía no hay datos históricos. Sigue practicando y en unos días aparecerá la curva.","font-size:13px;color:var(--muted);font-weight:500;line-height:1.5;"));
  }
  el.appendChild(histCard);

  const wk=weeklyMinutes();
  const pct=state.session.weeklyGoal>0?Math.min(100, Math.round((wk/state.session.weeklyGoal)*100)):0;
  const goalBox=document.createElement("div");
  goalBox.style.cssText="background:rgba(78,205,196,0.06);border:1px solid rgba(78,205,196,0.2);border-radius:16px;padding:16px 18px;margin-bottom:14px;";
  const gTop=mk("div","","display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;");
  const gL=mk("div","","");
  gL.appendChild(mk("p","🎯 META SEMANAL","font-size:10px;color:#4ECDC4;letter-spacing:2.5px;font-weight:700;"));
  gL.appendChild(mk("p",wk+" / "+state.session.weeklyGoal+" min","font-size:18px;font-weight:800;color:var(--text);margin-top:2px;letter-spacing:-0.01em;"));
  gTop.appendChild(gL);
  gTop.appendChild(mk("span",pct+"%","font-size:22px;font-weight:900;color:#4ECDC4;"));
  goalBox.appendChild(gTop);
  const bar=mk("div","","background:rgba(255,255,255,0.06);border-radius:8px;height:8px;overflow:hidden;");
  const fill=mk("div","","background:linear-gradient(90deg,#4ECDC4,#4ade80);height:100%;width:"+pct+"%;transition:width 0.4s;border-radius:8px;");
  bar.appendChild(fill); goalBox.appendChild(bar);
  el.appendChild(goalBox);

  [
    {label:"Frases exploradas", value:state.session.sessionPhrases, color:"#F5A623", icon:"📖"},
    {label:"Frases guardadas",  value:state.session.saved.length,   color:"#F87171", icon:"⭐"},
    {label:"Pendientes hoy",    value:reviewDueCount(), color:"#fbbf24", icon:"🎯"},
    {label:"Minutos practicados",value:state.session.sessionMinutes, color:"#4ECDC4", icon:"⏱️"},
    {label:"Chats guardados",   value:state.session.chatLogs.length, color:"#A78BFA", icon:"💬"}
  ].forEach(function(s,i){
    const row=document.createElement("div"); row.className="stat-row";
    row.style.borderColor=s.color+"22";
    row.style.animation="fadeUp 0.25s "+(i*0.05)+"s both";
    const left=mk("div","","display:flex;align-items:center;gap:10px;");
    left.appendChild(mk("span",s.icon,"font-size:20px;"));
    left.appendChild(mk("span",s.label,"font-size:14px;color:var(--text2);font-weight:600;"));
    const val=mk("span",String(s.value),"font-size:30px;font-weight:900;color:"+s.color+";letter-spacing:-0.03em;font-variant-numeric:tabular-nums;");
    row.appendChild(left); row.appendChild(val);
    el.appendChild(row);
  });

  const chartCard=document.createElement("div"); chartCard.className="card";
  chartCard.appendChild(mk("p","📈  ACTIVIDAD — 7 DIAS","font-size:10px;color:var(--gold-text);letter-spacing:2px;margin-bottom:12px;font-weight:700;"));
  chartCard.appendChild(mk("p","Cada número es un total diario: minutos + flashcards repasadas + drills hechos.","font-size:12px;color:var(--muted);line-height:1.45;margin-top:-6px;margin-bottom:10px;font-weight:500;"));
  const days=[];
  for(let i=6;i>=0;i--){ const k=addDays(todayKey(),-i); days.push({key:k,label:["Do","Lu","Ma","Mi","Ju","Vi","Sa"][new Date(k+"T00:00:00").getDay()]}); }
  const maxAct=Math.max(1,...days.map(function(d){const e=state.session.dailyLog[d.key]; return e?(e.minutes||0)+(e.phrasesReviewed||0)+(e.drillsDone||0):0;}));
  const chartRow=mk("div","","display:flex;align-items:flex-end;gap:6px;height:100px;");
  days.forEach(function(d){
    const e=state.session.dailyLog[d.key]||{};
    const total=(e.minutes||0)+(e.phrasesReviewed||0)+(e.drillsDone||0);
    const h=Math.max(2,Math.round((total/maxAct)*80));
    const col=mk("div","","display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;");
    const val=mk("p",total?total+" pts":"0","font-size:10px;color:var(--muted);font-weight:700;min-height:14px;");
    val.title="Minutos: "+(e.minutes||0)+" · Flashcards: "+(e.phrasesReviewed||0)+" · Drills: "+(e.drillsDone||0);
    const barEl=mk("div","","border-radius:4px 4px 0 0;height:"+h+"px;width:100%;transition:height 0.3s;background:"+(total>0?"linear-gradient(180deg,#F5A623,rgba(245,166,35,0.4))":"rgba(255,255,255,0.04)")+";");
    const lbl=mk("p",d.label,"font-size:10px;color:"+(d.key===todayKey()?"#F5A623":"var(--muted)")+";font-weight:"+(d.key===todayKey()?"800":"600")+";");
    col.appendChild(val); col.appendChild(barEl); col.appendChild(lbl);
    chartRow.appendChild(col);
  });
  chartCard.appendChild(chartRow);
  if(Object.values(state.session.dailyLog).every(function(e){return !e||(!e.minutes&&!e.phrasesReviewed&&!e.drillsDone);}))
    chartCard.appendChild(mk("p","Aun no hay actividad","font-size:12px;color:var(--muted);margin-top:8px;text-align:center;"));
  el.appendChild(chartCard);

  const srsCard=document.createElement("div"); srsCard.className="card";
  srsCard.appendChild(mk("p","📦  DISTRIBUCION SRS","font-size:10px;color:var(--purple-text);letter-spacing:2px;margin-bottom:12px;font-weight:700;"));
  srsCard.appendChild(mk("p","SRS es el sistema tipo Anki: mientras más alta la caja, mejor recordás esa flashcard. B0 = nueva/fallada; B5 = muy dominada.","font-size:12px;color:var(--muted);line-height:1.45;margin-top:-6px;margin-bottom:10px;font-weight:500;"));
  const boxColors=["#F87171","#F5A623","#fbbf24","#4ECDC4","#4ade80","#22c55e"];
  const boxNames=["Nueva o fallada","Primer repaso","Ya empieza a pegar","Fuerte","Dominada","Maestra"];
  const totalCards=state.session.saved.length||1;
  for(let b=0;b<=5;b++){
    const count=state.session.saved.filter(function(p){return p.box===b;}).length;
    const pct=Math.round((count/totalCards)*100);
    const row=mk("div","","display:flex;align-items:center;gap:8px;margin-bottom:6px;");
    row.title="B"+b+" · "+boxNames[b];
    const bLabel=mk("span","B"+b,"font-size:11px;color:var(--muted);font-weight:700;min-width:22px;");
    bLabel.title=boxNames[b];
    row.appendChild(bLabel);
    const barBg=mk("div","","flex:1;background:rgba(255,255,255,0.06);border-radius:4px;height:10px;overflow:hidden;");
    const barFill=mk("div","","background:"+boxColors[b]+";height:100%;width:"+pct+"%;transition:width 0.4s;border-radius:4px;");
    barBg.appendChild(barFill);
    row.appendChild(barBg);
    row.appendChild(mk("span",count+" tarjetas · "+pct+"%","font-size:11px;color:var(--muted);font-weight:600;min-width:92px;text-align:right;"));
    row.appendChild(mk("span",boxNames[b],"font-size:10px;color:var(--dim);font-weight:600;min-width:92px;text-align:left;"));
    srsCard.appendChild(row);
  }
  if(!state.session.saved.length) srsCard.appendChild(mk("p","Sin datos","font-size:12px;color:var(--muted);margin-top:4px;"));
  el.appendChild(srsCard);

  const allLapsed=[...state.session.saved].filter(function(p){return p.lapses>0;}).sort(function(a,b){return b.lapses-a.lapses;});
  var showAllLapsed=false;
  const lapsCard=document.createElement("div"); lapsCard.className="card";
  lapsCard.appendChild(mk("p","⚠️  MAS FALLADAS","font-size:10px;color:var(--red-text);letter-spacing:2px;margin-bottom:12px;font-weight:700;"));
  const lapsList=mk("div","","");
  lapsCard.appendChild(lapsList);
  function renderLapsedList(){
    lapsList.innerHTML="";
    var list=showAllLapsed?allLapsed:allLapsed.slice(0,5);
    list.forEach(function(p,i){
      const row=mk("div","","display:flex;align-items:center;gap:10px;padding:8px 0;"+(i<list.length-1?"border-bottom:1px solid rgba(255,255,255,0.04);":""));
      row.appendChild(mk("span",String(i+1),"font-size:13px;color:var(--muted);font-weight:700;min-width:18px;"));
      const txt=mk("div","","flex:1;");
      txt.appendChild(mk("p",p.de,"font-size:14px;color:var(--text);font-weight:700;"));
      txt.appendChild(mk("p",p.es,"font-size:12px;color:var(--muted);margin-top:1px;"));
      row.appendChild(txt);
      row.appendChild(mk("span",(p.lapses||0)+" fallos","font-size:13px;font-weight:900;color:var(--red-text);white-space:nowrap;"));
      lapsList.appendChild(row);
    });
  }
  if(allLapsed.length){
    renderLapsedList();
    if(allLapsed.length>5){
      var toggleLapses=mk("button","Ver todas ("+allLapsed.length+")","width:100%;margin-top:10px;padding:10px;border-radius:12px;border:1px solid rgba(248,113,113,0.22);background:rgba(248,113,113,0.06);color:var(--red-text);font-size:13px;font-weight:800;cursor:pointer;");
      toggleLapses.onclick=function(){showAllLapsed=!showAllLapsed;this.textContent=showAllLapsed?"Ver solo top 5":"Ver todas ("+allLapsed.length+")";renderLapsedList();};
      lapsCard.appendChild(toggleLapses);
    }
  } else {
    lapsCard.appendChild(mk("p","Todavia no has fallado ninguna. ¡Sigue asi!","font-size:13px;color:var(--muted);line-height:1.5;"));
  }
  el.appendChild(lapsCard);

  const msg=state.session.sessionPhrases+state.session.saved.length+state.session.sessionMinutes===0
    ?"Empieza a practicar y aqui veras tu progreso!"
    :"Gut gemacht! La consistencia es la clave. Sigue adelante!";
  const tip=mk("div","","background:rgba(78,205,196,0.06);border:1px solid rgba(78,205,196,0.18);border-radius:16px;padding:18px;margin-top:4px;display:flex;gap:12px;align-items:flex-start;");
  tip.appendChild(mk("span","💡","font-size:20px;flex-shrink:0;margin-top:1px;"));
  tip.appendChild(mk("p",msg,"font-size:14px;color:#4ECDC4;font-weight:600;line-height:1.55;"));
  el.appendChild(tip);

  var _insightShown=false;
  var insightCard=document.createElement("div"); insightCard.className="card";
  insightCard.style.cssText="margin-top:10px;";
  var insightHdr=document.createElement("div");
  insightHdr.style.cssText="display:flex;justify-content:space-between;align-items:center;cursor:pointer;";
  insightHdr.setAttribute("role","button"); insightHdr.setAttribute("tabindex","0"); insightHdr.setAttribute("aria-expanded","false");
  insightHdr.appendChild(mk("p","📊  INSIGHT SEMANAL","font-size:10px;color:var(--gold-text);letter-spacing:2px;font-weight:700;"));
  var insightArrow=mk("span","▼","font-size:12px;color:var(--muted);transition:transform 0.2s;");
  insightHdr.appendChild(insightArrow);
  insightCard.appendChild(insightHdr);
  var insightBody=mk("div","","overflow:hidden;transition:max-height 0.3s;max-height:0;");
  insightCard.appendChild(insightBody);
  insightHdr.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();this.click();}};
  insightHdr.onclick=function(){
    _insightShown=!_insightShown;
    this.setAttribute("aria-expanded",_insightShown?"true":"false");
    insightArrow.textContent=_insightShown?"▲":"▼";
    if(_insightShown) renderInsight(insightBody);
    else insightBody.style.maxHeight="0";
  };
  el.appendChild(insightCard);

  if(state.session.errorJournal.length){
    var fjCard=document.createElement("div"); fjCard.className="card";
    fjCard.style.cssText="margin-top:10px;border:1px solid rgba(248,113,113,0.15);";
    var fjHdr=document.createElement("div");
    fjHdr.style.cssText="display:flex;justify-content:space-between;align-items:center;cursor:pointer;";
    fjHdr.setAttribute("role","button"); fjHdr.setAttribute("tabindex","0"); fjHdr.setAttribute("aria-expanded","false");
    fjHdr.appendChild(mk("p","📓  DIARIO DE ERRORES","font-size:10px;color:var(--red-text);letter-spacing:2px;font-weight:700;"));
    var fjArrow=mk("span","▼","font-size:12px;color:var(--muted);transition:transform 0.2s;");
    fjHdr.appendChild(fjArrow);
    fjCard.appendChild(fjHdr);
    var fjBody=mk("div","","overflow:hidden;transition:max-height 0.3s;max-height:0;");
    fjCard.appendChild(fjBody);
    var _fjShown=false;
    fjHdr.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();this.click();}};
    fjHdr.onclick=function(){
      _fjShown=!_fjShown;
      this.setAttribute("aria-expanded",_fjShown?"true":"false");
      fjArrow.textContent=_fjShown?"▲":"▼";
      if(_fjShown){
        fjBody.style.maxHeight="2000px";
        fjBody.innerHTML="";
        var groups={};
        state.session.errorJournal.slice(0,50).forEach(function(e){
          if(!groups[e.source]) groups[e.source]={items:[], count:0};
          groups[e.source].items.push(e); groups[e.source].count++;
        });
        var sourceLabels={grammar:"📐 Gramatica",genero:"🎯 Genero",chat:"💬 Chat",shadowing:"🎤 Shadowing",corrigeme:"✏️ Corrígeme"};
        Object.keys(groups).forEach(function(src){
          var g=groups[src];
          var sec=document.createElement("div"); sec.style.cssText="margin-top:10px;";
          sec.appendChild(mk("p",(sourceLabels[src]||src)+" ("+g.count+")","font-size:11px;color:var(--dim);font-weight:700;letter-spacing:1px;margin-bottom:4px;"));
          g.items.slice(0,10).forEach(function(e){
            var row=mk("div","","display:flex;justify-content:space-between;align-items:flex-start;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.03);font-size:13px;");
            var left=mk("div","","flex:1;");
            left.appendChild(mk("span",e.original,"font-weight:700;color:var(--text);"));
            if(e.correction) left.appendChild(mk("span"," → "+e.correction,"font-weight:500;color:var(--red-text);"));
            row.appendChild(left);
            row.appendChild(mk("span",e.date,"font-size:10px;color:var(--dim);"));
            fjBody.appendChild(row);
          });
        });
      } else {
        fjBody.style.maxHeight="0";
      }
    };
    el.appendChild(fjCard);
  }
}
