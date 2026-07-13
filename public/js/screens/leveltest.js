// ── Level Test (adaptive A1→B2 placement, curated questions) ──────────────────
// Maps test result onto the app's level scale (A2 / A2-B1 / B1 / B1-B2).

// Sets the user level from the test result (companion to cycleLevel in level.js)
function setUserLevel(lvl){
  if(LEVELS.indexOf(lvl)<0) return;
  userLevel=lvl;
  localStorage.setItem("dl_level",userLevel);
  state.app.level=userLevel.indexOf("B1")>=0?"B1":userLevel.indexOf("B2")>=0?"B2":"A2";
  paintLevelPill();
  syncUp();
}

(function(){
// t: gram|vocab|comp · d: difficulty band · op: options · ok: index of correct
var LT_BASE=[
 // ── Fáciles (A1/A2) ──
 {t:"gram", d:"A1", q:"___ Tisch ist groß.", hint:"der Tisch · masculino, sujeto", op:["Der","Den","Dem","Des"], ok:0, why:"Sujeto → Nominativ: <b>der</b> Tisch."},
 {t:"vocab",d:"A1", q:"¿Qué significa «bekommen»?", op:["recibir","preguntar","traer","buscar"], ok:0, why:"<b>bekommen</b> = recibir. Falso amigo: NO es “become”."},
 {t:"gram", d:"A1", q:"Ich ___ Sebastian.", hint:"presentarse", op:["heiße","heißt","heißen","heißest"], ok:0, why:"ich → <b>heiße</b>."},
 {t:"vocab",d:"A2", q:"«der Chef» significa…", op:["el jefe","el cocinero","el chofer","el cheque"], ok:0, why:"Falso amigo: <b>der Chef</b> = el jefe (cocinero = der Koch)."},
 {t:"comp", d:"A2", ctx:"Anna wohnt in Berlin. Sie arbeitet als Ärztin und fährt jeden Tag mit dem Fahrrad zur Arbeit.", q:"¿Cómo va Anna al trabajo?", op:["en bicicleta","en auto","a pie","en tren"], ok:0, why:"«mit dem Fahrrad» = en bicicleta."},
 // ── Intermedias (A2/B1) ──
 {t:"gram", d:"A2", q:"Ich ___ nach Hause ___. (gehen)", hint:"Perfekt", op:["bin · gegangen","habe · gegangen","bin · gegeht","habe · geht"], ok:0, why:"Movimiento → <b>sein</b>; Partizip irregular: <b>gegangen</b>."},
 {t:"gram", d:"A2", q:"Ich warte ___ den Bus.", op:["auf","mit","zu","für"], ok:0, why:"<b>warten auf</b> + Akkusativ — verbo con preposición fija."},
 {t:"vocab",d:"A2", q:"¿Cuál es el artículo de «Mädchen» (niña)?", op:["das","die","der","den"], ok:0, why:"Diminutivos en <b>-chen</b> son SIEMPRE das — aunque sea una niña."},
 {t:"gram", d:"B1", q:"Ich bleibe zu Hause, ___ es regnet.", op:["weil","deshalb","trotzdem","dann"], ok:0, why:"<b>weil</b> introduce la causa (y manda el verbo al final)."},
 {t:"comp", d:"B1", ctx:"— Entschuldigung, ist dieser Platz noch frei?\n— Nein, leider ist er schon besetzt.", q:"¿Qué le responden?", op:["que el asiento está ocupado","que el asiento está libre","que no entiende","que espere un momento"], ok:0, why:"«besetzt» = ocupado."},
 // ── Difíciles (B1/B2) ──
 {t:"gram", d:"B1", q:"Orden correcto: «weil / müde / ich / bin»", op:["… weil ich müde bin","… weil ich bin müde","… weil bin ich müde","… weil müde ich bin"], ok:0, why:"<b>weil</b> → verbo conjugado al FINAL: weil ich müde <b>bin</b>."},
 {t:"gram", d:"B1", q:"Ich helfe ___ Mann.", hint:"der Mann", op:["dem","den","der","des"], ok:0, why:"<b>helfen</b> siempre rige Dativ: der → <b>dem</b>."},
 {t:"vocab",d:"B1", q:"«Ich habe die Frist verlängert» — ¿qué hizo?", op:["extendió el plazo","canceló la cita","perdió el documento","firmó el contrato"], ok:0, why:"<b>die Frist verlängern</b> = extender el plazo."},
 {t:"comp", d:"B2", ctx:"Obwohl er kaum Zeit hatte, hat er das Projekt rechtzeitig abgeschlossen.", q:"¿Qué pasó con el proyecto?", op:["lo terminó a tiempo pese a tener poco tiempo","no lo terminó por falta de tiempo","lo canceló a tiempo","pidió más tiempo para terminarlo"], ok:0, why:"<b>obwohl</b> = aunque; <b>rechtzeitig abgeschlossen</b> = terminado a tiempo."},
 {t:"gram", d:"B2", q:"Wenn ich mehr Zeit ___, würde ich Deutsch lernen.", op:["hätte","habe","hatte","haben würde"], ok:0, why:"Konjunktiv II irreal: wenn ich mehr Zeit <b>hätte</b>…"}
];
// Alternate hard tail — swapped in when the user is acing the test
var LT_HARD=[
 {t:"gram", d:"B2", q:"Das ist der Kollege, ___ ich das Dokument gegeben habe.", op:["dem","den","der","dessen"], ok:0, why:"Relativo en Dativ (geben + a quién): <b>dem</b>."},
 {t:"vocab",d:"B2", q:"«die Reichweite» (de un video) significa…", op:["el alcance","la duración","la calidad","la audiencia local"], ok:0, why:"<b>die Reichweite</b> = alcance."},
 {t:"gram", d:"B2", q:"Nachdem er gegessen ___, ging er spazieren.", op:["hatte","hat","ist","war"], ok:0, why:"<b>nachdem</b> + Plusquamperfekt: gegessen <b>hatte</b>."},
 {t:"comp", d:"B2", ctx:"Der Vortrag wurde wegen technischer Probleme auf nächste Woche verschoben.", q:"¿Qué pasó con la charla?", op:["se pospuso a la próxima semana","se canceló definitivamente","se acortó por problemas técnicos","se dio sin micrófono"], ok:0, why:"<b>verschoben</b> = pospuesta; <b>wegen</b> + Genitiv = por causa de."},
 {t:"gram", d:"B2", q:"Je mehr ich übe, ___ besser spreche ich.", op:["desto","umso mehr","dann","so"], ok:0, why:"Correlativo: <b>je</b> … <b>desto</b> + comparativo."}
];

function ltShuffleOps(q){
  // Shuffle options, track new correct index
  var pairs=q.op.map(function(o,i){return{o:o,i:i};});
  for(var k=pairs.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1));var t=pairs[k];pairs[k]=pairs[j];pairs[j]=t;}
  return {op:pairs.map(function(p){return p.o;}), ok:pairs.findIndex(function(p){return p.i===q.ok;})};
}
function ltState(){
  if(!state.leveltest) state.leveltest={};
  var s=state.leveltest;
  if(!s.phase) s.phase="intro";
  if(!Array.isArray(s.deck)) s.deck=[];
  if(typeof s.idx!=="number") s.idx=0;
  if(typeof s.correct!=="number") s.correct=0;
  if(!s.cat) s.cat={gram:{ok:0,tot:0},vocab:{ok:0,tot:0},comp:{ok:0,tot:0}};
  if(typeof s.locked!=="boolean") s.locked=false;
  return s;
}
function ltStart(){
  var s=ltState();
  s.phase="test"; s.idx=0; s.correct=0; s.locked=false;
  s.cat={gram:{ok:0,tot:0},vocab:{ok:0,tot:0},comp:{ok:0,tot:0}};
  s.deck=LT_BASE.map(function(q){var sh=ltShuffleOps(q);return{t:q.t,d:q.d,q:q.q,ctx:q.ctx||null,hint:q.hint||null,op:sh.op,ok:sh.ok,why:q.why,answered:null};});
  s.hardTail=false; s.shortened=false;
  renderLeveltest();
}
function ltLevel(score){ return score<=5?"A1":score<=9?"A2":score<=12?"B1":"B2"; }
function ltAppLevel(lvl){ return {A1:"A2",A2:"A2",B1:"B1",B2:"B1-B2"}[lvl]||"A2-B1"; }
function ltReco(lvl){
  return {
    A1:"Tu base recién arranca — empieza por <b>Frases</b> y <b>Género</b> para construir vocabulario, y haz <b>Flashcards</b> todos los días.",
    A2:"Buena base. Consolidá con <b>Casos</b> y <b>Perfekt</b>, y suma <b>Shadowing</b> para soltar el oído y la pronunciación.",
    B1:"Tu nivel es B1 — te recomendamos empezar con <b>Perfekt</b> y <b>Satzbau</b> para consolidar, luego pasar a <b>conversación libre</b>.",
    B2:"Nivel alto — ve directo a <b>Conversar</b> y <b>Lectura</b>; usa los drills solo para pulir detalles finos como Konjunktiv II."
  }[lvl];
}

window.renderLeveltest=function(){
  var s=ltState();
  var el=document.getElementById("s-leveltest"); el.innerHTML="";

  // ── Header ──
  var hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","Diagnóstico · A1 → B2","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","Test de nivel","font-size:26px;font-weight:900;letter-spacing:-0.03em;line-height:1.15;margin:3px 0 4px;color:var(--text);"));
  el.appendChild(hdr);

  if(s.phase==="intro") return ltIntro(el);
  if(s.phase==="done") return ltResults(el);
  ltQuestion(el,s);
};

function ltIntro(el){
  var hero=mk("section","","position:relative;overflow:hidden;border-radius:24px;padding:26px 22px;margin-bottom:14px;background:linear-gradient(140deg,var(--primary-container),rgba(var(--primary-rgb),0.14) 65%);border:1px solid rgba(var(--primary-rgb),0.28);box-shadow:0 14px 40px rgba(0,0,0,0.32);");
  hero.className="anim-in";
  hero.appendChild(mk("span","","position:absolute;top:-40px;right:-40px;width:180px;height:180px;background:rgba(var(--primary-rgb),0.14);border-radius:50%;filter:blur(38px);pointer-events:none;"));
  var z=mk("div","","position:relative;z-index:1;");
  z.appendChild(mk("h3","Evalúa tu nivel","font-size:22px;font-weight:900;letter-spacing:-0.03em;color:var(--on-primary-container);margin-bottom:8px;"));
  z.appendChild(mk("p","15 preguntas de dificultad creciente — gramática, vocabulario y comprensión. Unos 3 minutos, resultado y recomendación al final.","font-size:13.5px;color:rgba(222,224,255,0.78);font-weight:500;line-height:1.55;margin-bottom:16px;"));
  var chips=mk("div","","display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;");
  [["⏱️","~3 min"],["📝","15 preguntas"],["🎯","resultado A1–B2"]].forEach(function(c){
    var ch=mk("span",c[0]+" "+c[1],"font-size:11px;font-weight:700;padding:6px 12px;border-radius:99px;background:rgba(15,20,62,0.30);border:1px solid rgba(255,255,255,0.12);color:rgba(222,224,255,0.85);");
    chips.appendChild(ch);
  });
  z.appendChild(chips);
  var start=mk("button","Comenzar →","width:100%;padding:15px;border-radius:15px;border:none;background:var(--primary);color:var(--on-primary);font-size:15px;font-weight:900;cursor:pointer;font-family:inherit;--glow-rgb:var(--primary-rgb);");
  start.className="pulse-glow";
  start.onclick=ltStart;
  z.appendChild(start);
  hero.appendChild(z);
  el.appendChild(hero);
  el.appendChild(mk("p","Tu nivel actual: "+userLevel.replace("-","–")+" · el test puede ajustarlo automaticamente.","font-size:12px;color:var(--muted);font-weight:500;text-align:center;"));
}

function ltQuestion(el,s){
  var q=s.deck[s.idx];
  // ── Adaptive: shortened path already handled in ltAnswer ──
  // Progress dots
  var dots=mk("div","","display:flex;gap:4px;flex-wrap:wrap;margin-bottom:14px;");
  dots.className="stagger";
  s.deck.forEach(function(dq,i){
    var d=mk("span",String(i+1),"width:26px;height:22px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;font-variant-numeric:tabular-nums;");
    if(i<s.idx){ d.style.background=dq.answered?"rgba(var(--green-rgb),0.16)":"rgba(var(--red-rgb),0.14)"; d.style.color=dq.answered?"var(--green)":"var(--red)"; }
    else if(i===s.idx){ d.style.background="var(--gold)"; d.style.color="#291800"; d.style.boxShadow="0 3px 12px rgba(var(--gold-rgb),0.4)"; }
    else { d.style.background="rgba(255,255,255,0.05)"; d.style.color="var(--dim)"; }
    dots.appendChild(d);
  });
  el.appendChild(dots);

  var card=mk("div","","border-radius:20px;padding:20px 18px;margin-bottom:12px;");
  card.className="stitch-glass anim-in";
  var catLbl={gram:"Gramática",vocab:"Vocabulario",comp:"Comprensión"}[q.t];
  card.appendChild(mk("p",catLbl+" · "+q.d,"font-size:9.5px;letter-spacing:2px;font-weight:800;color:var(--primary);text-transform:uppercase;margin-bottom:10px;"));
  if(q.ctx){
    var ctx=mk("p","","font-size:14px;font-weight:600;line-height:1.65;color:var(--text2);background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:12px 14px;margin-bottom:12px;white-space:pre-line;");
    ctx.textContent=q.ctx;
    card.appendChild(ctx);
  }
  card.appendChild(mk("p",q.q,"font-size:18px;font-weight:800;line-height:1.5;color:var(--text);letter-spacing:-0.01em;margin-bottom:"+(q.hint?"4px":"14px")+";"));
  if(q.hint) card.appendChild(mk("p",q.hint,"font-size:12px;color:var(--muted);font-weight:500;margin-bottom:14px;"));

  var opts=mk("div","","display:flex;flex-direction:column;gap:8px;");
  q.op.forEach(function(o,oi){
    var b=mk("button",o,"text-align:left;padding:13px 15px;border-radius:13px;font-size:14px;font-weight:700;cursor:pointer;border:1.5px solid var(--border);background:rgba(255,255,255,0.05);color:var(--text);font-family:inherit;transition:border-color .15s,background .15s,transform .1s;");
    b.className="lift"; b.style.setProperty("--lift-rgb","var(--primary-rgb)");
    b.onmouseenter=function(){if(!s.locked)b.style.borderColor="rgba(var(--primary-rgb),0.5)";};
    b.onmouseleave=function(){if(!s.locked)b.style.borderColor="var(--border)";};
    b.onclick=function(){ltAnswer(oi,opts,card,el);};
    opts.appendChild(b);
  });
  card.appendChild(opts);

  var fb=mk("div","","display:none;border-radius:13px;padding:12px 14px;margin-top:12px;font-size:13px;line-height:1.55;font-weight:500;");
  fb.id="lt-fb";
  card.appendChild(fb);
  var nx=mk("button","Siguiente →","width:100%;margin-top:12px;padding:13px;border-radius:14px;border:1px solid var(--border);background:rgba(255,255,255,0.05);color:var(--text);font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;display:none;");
  nx.id="lt-nx";
  nx.onclick=function(){ s.idx++; s.locked=false; if(s.idx>=s.deck.length){s.phase="done";} renderLeveltest(); };
  card.appendChild(nx);
  el.appendChild(card);
  el.appendChild(mk("p","Pregunta "+(s.idx+1)+" de "+s.deck.length,"font-size:11px;color:var(--dim);font-weight:600;text-align:center;font-variant-numeric:tabular-nums;"));
}

function ltAnswer(oi,opts,card,el){
  var s=ltState(); if(s.locked) return; s.locked=true;
  var q=s.deck[s.idx];
  var ok=oi===q.ok;
  q.answered=ok;
  if(ok) s.correct++;
  s.cat[q.t].tot++; if(ok) s.cat[q.t].ok++;
  var btns=opts.querySelectorAll("button");
  for(var i=0;i<btns.length;i++){
    btns[i].disabled=true;
    if(i===q.ok){ btns[i].style.background="rgba(var(--green-rgb),0.14)"; btns[i].style.borderColor="var(--green)"; btns[i].style.color="var(--green)"; }
    else if(i===oi){ btns[i].style.background="rgba(var(--red-rgb),0.12)"; btns[i].style.borderColor="var(--red)"; btns[i].style.color="var(--red)"; }
    else btns[i].style.opacity="0.45";
  }
  var fb=document.getElementById("lt-fb");
  fb.style.display="block";
  fb.className="anim-in";
  fb.style.background=ok?"rgba(var(--green-rgb),0.09)":"rgba(var(--red-rgb),0.08)";
  fb.style.border=ok?"1px solid rgba(var(--green-rgb),0.3)":"1px solid rgba(var(--red-rgb),0.3)";
  fb.innerHTML=(ok?"✓ ¡Richtig! ":"✗ ")+q.why;
  document.getElementById("lt-nx").style.display="block";

  // ── Adaptive logic ──
  var answered=s.idx+1;
  var wrongSoFar=answered-s.correct;
  // Struggling early → shorten (end after Q10, level lands lower naturally)
  if(!s.shortened && answered===7 && wrongSoFar>=3 && s.deck.length>10){
    s.deck=s.deck.slice(0,10); s.shortened=true;
  }
  // Acing the first 10 → swap in the hard tail
  if(!s.hardTail && !s.shortened && answered===10 && s.correct>=8){
    var tail=LT_HARD.map(function(hq){var sh=ltShuffleOps(hq);return{t:hq.t,d:hq.d,q:hq.q,ctx:hq.ctx||null,hint:hq.hint||null,op:sh.op,ok:sh.ok,why:hq.why,answered:null};});
    s.deck=s.deck.slice(0,10).concat(tail); s.hardTail=true;
  }
}

function ltResults(el){
  var s=ltState();
  var total=s.deck.length, score=s.correct;
  var lvl=ltLevel(score);
  var appLvl=ltAppLevel(lvl);
  var lvlColor={A1:"var(--red)",A2:"var(--gold)",B1:"var(--teal)",B2:"var(--green)"}[lvl];
  var lvlRgb={A1:"var(--red-rgb)",A2:"var(--gold-rgb)",B1:"var(--teal-rgb)",B2:"var(--green-rgb)"}[lvl];

  var card=mk("div","","border-radius:22px;padding:26px 20px;margin-bottom:12px;text-align:center;");
  card.className="stitch-glass anim-in";
  card.appendChild(mk("p","Tu nivel detectado","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:10px;"));
  var big=mk("p",lvl,"font-size:64px;font-weight:900;letter-spacing:-0.04em;line-height:1;color:"+lvlColor+";text-shadow:0 0 34px rgba("+lvlRgb+",0.45);margin-bottom:14px;");
  card.appendChild(big);

  // Score ring
  var ringWrap=mk("div","","position:relative;width:104px;height:104px;margin:0 auto 14px;");
  var C=2*Math.PI*45;
  ringWrap.innerHTML='<svg width="104" height="104" viewBox="0 0 104 104" style="transform:rotate(-90deg)"><circle cx="52" cy="52" r="45" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="8"/><circle cx="52" cy="52" r="45" fill="none" stroke="'+lvlColor.replace(/var\((--[a-z-]+)\)/,"var($1)")+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-score/total)).toFixed(1)+'" style="transition:stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)"/></svg>';
  var rIn=mk("div","","position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;");
  rIn.appendChild(mk("b",score+"/"+total,"font-size:20px;font-weight:900;color:var(--text);font-variant-numeric:tabular-nums;"));
  rIn.appendChild(mk("span","aciertos","font-size:9px;color:var(--muted);font-weight:700;letter-spacing:1px;text-transform:uppercase;"));
  ringWrap.appendChild(rIn);
  card.appendChild(ringWrap);

  // Category breakdown
  var bd=mk("div","","display:flex;flex-direction:column;gap:9px;text-align:left;border-top:1px dashed rgba(255,255,255,0.1);padding-top:14px;margin-bottom:14px;");
  bd.className="stagger";
  [["gram","Gramática","var(--purple)","var(--purple-rgb)"],["vocab","Vocabulario","var(--gold)","var(--gold-rgb)"],["comp","Comprensión","var(--teal)","var(--teal-rgb)"]].forEach(function(c){
    var st=s.cat[c[0]], pct=st.tot?Math.round(st.ok/st.tot*100):0;
    var row=mk("div","","display:flex;align-items:center;gap:10px;");
    row.appendChild(mk("span",c[1],"width:104px;font-size:12.5px;font-weight:700;color:var(--text2);flex-shrink:0;"));
    var bar=mk("div","","flex:1;height:6px;border-radius:5px;background:rgba(255,255,255,0.06);overflow:hidden;");
    bar.appendChild(mk("i","","display:block;height:100%;border-radius:5px;background:"+c[2]+";width:"+pct+"%;transition:width .6s cubic-bezier(.16,1,.3,1);"));
    row.appendChild(bar);
    row.appendChild(mk("span",st.ok+"/"+st.tot,"width:36px;text-align:right;font-size:12px;font-weight:800;color:var(--muted);font-variant-numeric:tabular-nums;flex-shrink:0;"));
    bd.appendChild(row);
  });
  card.appendChild(bd);

  // Recommendation
  var reco=mk("div","","text-align:left;border-radius:13px;padding:13px 15px;background:rgba(var(--gold-rgb),0.07);border:1px solid rgba(var(--gold-rgb),0.25);font-size:13px;line-height:1.6;font-weight:500;color:var(--text);margin-bottom:16px;");
  reco.innerHTML="💡 "+ltReco(lvl);
  card.appendChild(reco);

  var apply=mk("button","Aplicar nivel "+appLvl.replace("-","–"),"width:100%;padding:15px;border-radius:15px;border:none;background:var(--primary);color:var(--on-primary);font-size:15px;font-weight:900;cursor:pointer;font-family:inherit;--glow-rgb:var(--primary-rgb);");
  apply.className="pulse-glow";
  apply.onclick=function(){
    setUserLevel(appLvl);
    showToast("Nivel ajustado a "+appLvl+" — los ejercicios se adaptan","success",2400);
    state.app.currentTab="hoy"; renderTabs(); showScreen("hoy");
  };
  card.appendChild(apply);
  var again=mk("button","↻ Repetir test","width:100%;margin-top:8px;padding:12px;border-radius:13px;border:1px dashed var(--border);background:transparent;color:var(--muted);font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;");
  again.onclick=ltStart;
  card.appendChild(again);
  el.appendChild(card);
  if(score/total>=0.5 && typeof fireConfetti==="function") fireConfetti();
}
})();
