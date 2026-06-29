// ── SRS / activity helpers ────────────────────────────────────────────────────
function todayKey(){
  const d=new Date(); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,"0"); const dd=String(d.getDate()).padStart(2,"0");
  return y+"-"+m+"-"+dd;
}
function addDays(dateStr, n){
  const d=new Date(dateStr+"T00:00:00"); d.setDate(d.getDate()+n);
  const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,"0"); const dd=String(d.getDate()).padStart(2,"0");
  return y+"-"+m+"-"+dd;
}
function ensureSrsFields(ph){
  if(typeof ph.box!=="number") ph.box=0;
  if(!ph.nextReview) ph.nextReview=todayKey();
  if(typeof ph.lapses!=="number") ph.lapses=0;
  if(!ph.added) ph.added=new Date().toISOString();
  if(!ph.source) ph.source="manual";
  if(typeof ph.category!=="string") ph.category="";
  return ph;
}
function srsUpdate(ph, grade){
  // grade: "fail" | "hard" | "good" | "easy"
  ensureSrsFields(ph);
  if(grade==="fail"){ ph.box=0; ph.lapses=(ph.lapses||0)+1; }
  else if(grade==="hard"){ /* same box */ }
  else if(grade==="good"){ ph.box=Math.min(5, ph.box+1); }
  else if(grade==="easy"){ ph.box=Math.min(5, ph.box+2); }
  const interval=BOX_INTERVALS[ph.box]||0;
  ph.nextReview=addDays(todayKey(), interval);
  ph.lastReviewed=new Date().toISOString();
  return ph;
}
function logActivity(kind, amount){
  // kind: "minutes" | "phrasesReviewed" | "drillsDone"
  if(["minutes","phrasesReviewed","drillsDone"].indexOf(kind)===-1) return;
  const k=todayKey();
  if(!state.session.dailyLog[k]) state.session.dailyLog[k]={minutes:0,phrasesReviewed:0,drillsDone:0};
  state.session.dailyLog[k][kind]=(state.session.dailyLog[k][kind]||0)+(amount||1);
}
function cleanDailyLog(raw){
  var cleaned={}, levelLog={};
  if(!raw||typeof raw!=="object") return {dailyLog:cleaned,levelLog:levelLog};
  Object.keys(raw).forEach(function(k){
    var e=raw[k]||{};
    cleaned[k]={
      minutes:Number(e.minutes)||0,
      phrasesReviewed:Number(e.phrasesReviewed)||0,
      drillsDone:Number(e.drillsDone)||0
    };
    if(typeof e.levelPct==="number") levelLog[k]=e.levelPct;
  });
  return {dailyLog:cleaned,levelLog:levelLog};
}
function logError(source, original, correction, tip){
  state.session.errorJournal.unshift({date:todayKey(), source:source, original:original, correction:correction, tip:tip||""});
  if(state.session.errorJournal.length>200) state.session.errorJournal=state.session.errorJournal.slice(0,200);
}
function computeStreak(){
  let streak=0; let cursor=todayKey();
  // If today has activity, count it; else start from yesterday
  const todayHas=state.session.dailyLog[cursor]&&(state.session.dailyLog[cursor].minutes>0||state.session.dailyLog[cursor].phrasesReviewed>0||state.session.dailyLog[cursor].drillsDone>0);
  if(!todayHas){ cursor=addDays(cursor,-1); }
  for(let i=0;i<400;i++){
    const e=state.session.dailyLog[cursor];
    if(e&&(e.minutes>0||e.phrasesReviewed>0||e.drillsDone>0)){ streak++; cursor=addDays(cursor,-1); }
    else break;
  }
  return streak;
}
function weeklyMinutes(){
  let sum=0; let cursor=todayKey();
  for(let i=0;i<7;i++){
    const e=state.session.dailyLog[cursor]; if(e) sum+=(e.minutes||0);
    cursor=addDays(cursor,-1);
  }
  return sum;
}
function reviewDueCount(){
  const t=todayKey();
  return state.session.saved.filter(function(p){ensureSrsFields(p);return p.nextReview<=t;}).length;
}
function computeLevelProgress(){
  var saved=state.session.saved, slen=saved.length;
  if(!slen) return 0;
  // Vocabulary depth (40%) — words in box 2+ are "learning", cap at 400 for B1
  var effectiveVocab=0, totalBox=0;
  saved.forEach(function(p){
    ensureSrsFields(p);
    var b=p.box||0; totalBox+=b;
    if(b>=2) effectiveVocab++;
  });
  var vocabScore=Math.min(effectiveVocab/400,1)*40;
  // Grammar mastery (25%) — average accuracy across all topics
  var gStats=state.grammar.grammarStats||{}, gramSum=0, gramCount=0;
  Object.keys(gStats).forEach(function(k){
    var s=gStats[k];
    if(s.right+s.wrong>0){gramSum+=s.right/(s.right+s.wrong);gramCount++;}
  });
  var gramScore=gramCount>0?(gramSum/GRAMMAR_TOPICS.length)*25:0;
  // SRS retention (20%) — avg box weighted by volume
  var avgBox=slen>0?totalBox/slen:0;
  var srsScore=(avgBox/5)*Math.min(slen/50,1)*20;
  // Consistency (15%) — streak + weekly reviews
  var str=computeStreak();
  var streakScore=Math.min(str/21,1)*8;
  var weekReviews=0;
  for(var i=0;i<7;i++){
    var d=addDays(todayKey(),-i);
    weekReviews+=(state.session.dailyLog[d]&&state.session.dailyLog[d].phrasesReviewed)||0;
  }
  var reviewScore=Math.min(weekReviews/100,1)*7;
  return Math.min(100,Math.round(vocabScore+gramScore+srsScore+streakScore+reviewScore));
}
function getStudyRecommendation(){
  const saved=state.session.saved, slen=saved.length;
  if(!slen) return null;
  // Recompute components (avoid full computeLevelProgress which we need raw values from)
  var effectiveVocab=0, totalBox=0;
  saved.forEach(function(p){
    ensureSrsFields(p);
    var b=p.box||0; totalBox+=b;
    if(b>=2) effectiveVocab++;
  });
  var vocabPct=Math.min(effectiveVocab/400,1);
  var gStats=state.grammar.grammarStats||{}, gramSum=0, gramCount=0;
  Object.keys(gStats).forEach(function(k){
    var s=gStats[k];
    if(s.right+s.wrong>0){gramSum+=s.right/(s.right+s.wrong);gramCount++;}
  });
  var gramPct=gramCount>0?gramSum/GRAMMAR_TOPICS.length:0;
  var avgBox=slen>0?totalBox/slen:0;
  var srsPct=(avgBox/5)*Math.min(slen/50,1);
  var str=computeStreak();
  var weekReviews=0;
  for(var i=0;i<7;i++){var d=addDays(todayKey(),-i);weekReviews+=(state.session.dailyLog[d]&&state.session.dailyLog[d].phrasesReviewed)||0;}
  var consistencyPct=Math.min(str/21,1)*0.53+Math.min(weekReviews/100,1)*0.47;
  var scores=[
    {key:"vocab", pct:vocabPct, max:400, label:"Vocabulario", icon:"📖", color:"#ffb955",
     msg: effectiveVocab<400 ? "Para medir avance hacia B1 cuento palabras que ya superaron los primeros repasos (caja 2 o más). Tienes "+effectiveVocab+" / 400; objetivo sugerido: guardar y repasar 10 por día." : null},
    {key:"grammar", pct:gramPct, max:GRAMMAR_TOPICS.length, label:"Gram\u00e1tica", icon:"📐", color:"#c4a7e7",
     msg: gramCount===0 ? "Todav\u00eda no practicaste gram\u00e1tica. Haz un drill hoy." : null},
    {key:"srs", pct:srsPct, max:1, label:"Retenci\u00f3n SRS", icon:"🔄", color:"#5dd9d0",
     msg: srsPct<0.6 ? "Tu retenci\u00f3n SRS necesita trabajo. Repasa flashcards a diario." : null},
    {key:"consistency", pct:consistencyPct, max:1, label:"Consistencia", icon:"🔥", color:"#ffb4ab",
     msg: str<5 ? "Tu racha es corta. Intenta 5 min por d\u00eda para mantenerla." : weekReviews<50 ? "Tus revisiones semanales son bajas. Aumenta el ritmo." : null}
  ];
  // Fill grammar specific message
  if(gramCount===0){
    scores[1].msg="Todav\u00eda no practicaste gram\u00e1tica. Haz un drill de Art\u00edculos hoy.";
  } else {
    var worstKey=null, worstAcc=1;
    Object.keys(gStats).forEach(function(k){
      var s=gStats[k];
      if(s.right+s.wrong===0){worstKey=k;worstAcc=0;}
      else{var acc=s.right/(s.right+s.wrong);if(acc<worstAcc){worstKey=k;worstAcc=acc;}}
    });
    var tname=({articles:"Art\u00edculos",perfekt:"Perfekt",wortstellung:"Orden",adjendings:"Adjetivos",separable:"Separables",praeteritum:"Pr\u00e4teritum",conectores:"Conectores",conjugacion:"Conjugaci\u00f3n",konjunktiv2:"Konjunktiv II",plurales:"Plurales"})[worstKey]||worstKey;
    scores[1].msg="Tu punto d\u00e9bil es Gram\u00e1tica: **"+tname+"**. Practícalo hoy \u2192 +4%.";
  }
  // Pick the weakest one that HAS an actionable tip (not just the weakest outright)
  scores.sort(function(a,b){return a.pct-b.pct;});
  var weakest=null;
  for(var j=0;j<scores.length;j++){ if(scores[j].msg && scores[j].pct<0.8){ weakest=scores[j]; break; } }
  return weakest;
}
function getContextualTip(){
  // Based on real user data, returns a tip object or null
  var saved=state.session.saved;
  // 1. High-lapse words (≥3 lapses) — most actionable
  var highLapse=saved.filter(function(p){return (p.lapses||0)>=3;}).sort(function(a,b){return (b.lapses||0)-(a.lapses||0);});
  if(highLapse.length){
    var w=highLapse[0];
    return {icon:"\ud83d\udd01",msg:"Te cuesta recordar <b>"+w.de+"</b> ("+w.es+")<br><span style='font-size:11px;color:var(--muted);'>Lleva "+w.lapses+" fallos. Presta atenci\u00f3n extra al repasarla.</span>",color:"#ffb4ab"};
  }
  // 2. Weak grammar topic (accuracy < 50%)
  var gStats=state.grammar.grammarStats||{};
  var weakTopics=Object.keys(gStats).filter(function(k){
    var s=gStats[k]; if(!s.right&&!s.wrong) return true;
    return s.right/(s.right+s.wrong)<0.5;
  }).map(function(k){
    var s=gStats[k];
    var total=s.right+s.wrong;
    return {key:k,acc:total?s.right/total:0};
  }).sort(function(a,b){return a.acc-b.acc;});
  if(weakTopics.length){
    var tname=({articles:"Art\u00edculos",perfekt:"Perfekt",wortstellung:"Orden",adjendings:"Adjetivos",separable:"Separables",praeteritum:"Pr\u00e4teritum",conectores:"Conectores",conjugacion:"Conjugaci\u00f3n",konjunktiv2:"Konjunktiv II",plurales:"Plurales"})[weakTopics[0].key]||weakTopics[0].key;
    return {icon:"\ud83d\udcd0",msg:tname+" te est\u00e1 costando (<b>"+Math.round(weakTopics[0].acc*100)+"%</b> de aciertos).<br><span style='font-size:11px;color:var(--muted);'>Toca para practicar un drill de gram\u00e1tica.</span>",color:"#c4a7e7",tab:"gramatica"};
  }
  // 3. Fehlerjournal pattern — recent errors
  var ej=state.session.errorJournal||[];
  var recent=ej.filter(function(e){
    return e.date===todayKey()||e.date===addDays(todayKey(),-1);
  });
  if(recent.length>=3){
    return {icon:"\ud83d\udcd3",msg:"Tienes "+recent.length+" errores registrados hoy/ayer.<br><span style='font-size:11px;color:var(--muted);'>Revísalos en Resumen para ver patrones.</span>",color:"#ffb955",tab:"resumen"};
  }
  // 4. Streak at risk — no activity today
  var todayL=state.session.dailyLog[todayKey()];
  var str=computeStreak();
  if(str>0&&(!todayL||(!todayL.minutes&&!todayL.phrasesReviewed&&!todayL.drillsDone))){
    return {icon:"\u26a0\ufe0f",msg:"Hoy todav\u00eda no practicaste.<br><span style='font-size:11px;color:var(--muted);'>Un minuto alcanza para mantener tu racha de "+str+" d\u00edas.</span>",color:"#ffb4ab"};
  }
  return null;
}
function getDailyGoal(){
  var total=0, days=0;
  for(var i=1;i<=7;i++){
    var d=addDays(todayKey(),-i);
    var mins=(state.session.dailyLog[d]&&state.session.dailyLog[d].minutes)||0;
    if(mins>0){total+=mins;days++;}
  }
  if(days===0) return 5; // default 5 min if no history
  var avg=total/days;
  return Math.round(Math.max(5,Math.min(avg*1.15,60))); // +15% buffer, cap 60, integer
}
function getWeakWords(){
  if(!state.session.saved.length) return null;
  var weak=state.session.saved.filter(function(p){return p.lapses>=2||p.box<=1;});
  if(!weak.length) return null;
  weak.sort(function(a,b){return (b.lapses||0)-(a.lapses||0);});
  var top=weak.slice(0,5);
  return top.map(function(p){return p.de+" → "+p.es;});
}

// ── MIN TIMER ──
function startMinTimer() {
  clearInterval(state.session.minTimer);
  state.session.minTimer=setInterval(function(){state.session.sessionMinutes++;logActivity("minutes",1);},60000);
}

// ── INSIGHT DATA (shared by Today and Summary) ──
function getWeekKey(){
  var d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+3-(d.getDay()+6)%7);
  var w=Math.floor((d.getTime()-new Date(d.getFullYear(),0,4).getTime())/604800000);
  return d.getFullYear()+"-W"+(w<10?"0":"")+w;
}
function getInsightData(){
  var topLapses=[...state.session.saved].filter(function(p){return p.lapses>0;}).sort(function(a,b){return b.lapses-a.lapses;}).slice(0,5);
  var gram=state.grammar.grammarStats||{};
  var weakestGrammar=null, weakestRate=1;
  Object.keys(gram).forEach(function(k){var s=gram[k];var total=(s.right||0)+(s.wrong||0);if(total){var rate=(s.right||0)/total;if(rate<weakestRate){weakestRate=rate;weakestGrammar=k;}}});
  var wDays=0, weekReviews=0, weekDrills=0, weekMinutes=0;
  for(var i=6;i>=0;i--){ var k=addDays(todayKey(),-i); var e=state.session.dailyLog[k]||{}; if(e.minutes||e.phrasesReviewed||e.drillsDone) wDays++; weekMinutes+=(e.minutes||0); weekReviews+=(e.phrasesReviewed||0); weekDrills+=(e.drillsDone||0); }
  var learned="Esta semana estuviste activo "+wDays+" de 7 días: "+weekMinutes+" min, "+weekReviews+" flashcards y "+weekDrills+" drills.";
  var error=topLapses.length?"La tarjeta que más se repite es “"+topLapses[0].de+"” ("+(topLapses[0].lapses||0)+" fallos).":"Todavía no hay una palabra claramente problemática.";
  if(weakestGrammar) error+=" Gramática más débil: "+weakestGrammar+".";
  var tip=topLapses.length?"Hoy repasa primero las más falladas y después haz 1 ronda corta de gramática.":"Guarda 5 frases nuevas y haz una ronda de flashcards para crear historial real.";
  return {learned:learned, error:error, tip:tip};
}
function renderInsight(host){
  host.innerHTML="";
  host.style.maxHeight="2000px";
  var week=getWeekKey();
  var d=getInsightData();
  var learned=d.learned, error=d.error, tip=d.tip;
  host.innerHTML="<div style='padding:10px 0;'>"+
    "<div style='margin-bottom:12px;'><p style='font-size:11px;color:var(--teal-text);font-weight:700;letter-spacing:1.5px;margin-bottom:4px;'>📖 Qué hiciste</p><p style='font-size:14px;color:var(--text);font-weight:600;line-height:1.5;'>"+learned+"</p></div>"+
    "<div style='margin-bottom:12px;'><p style='font-size:11px;color:var(--red-text);font-weight:700;letter-spacing:1.5px;margin-bottom:4px;'>⚠️ Qué conviene reforzar</p><p style='font-size:14px;color:var(--text);font-weight:600;line-height:1.5;'>"+error+"</p></div>"+
    "<div style='background:rgba(255,185,85,0.08);border:1px solid rgba(255,185,85,0.2);border-radius:12px;padding:12px;'><p style='font-size:11px;color:var(--gold-text);font-weight:700;letter-spacing:1.5px;margin-bottom:4px;'>💡 Próximo paso</p><p style='font-size:14px;color:var(--gold-text);font-weight:700;line-height:1.5;'>"+tip+"</p></div>"+
    "<p style='font-size:10px;color:var(--dim);margin-top:12px;'>Semana "+week+" · Datos locales de los últimos 7 días</p></div>";
}
