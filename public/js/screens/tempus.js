// ── Tempus (before/after: vor/nach, bevor/nachdem, vorher/danach, früher/später) ───
function normalizeTempusExercise(d){
  d=d||{};
  d.correct=String(d.correct||"").trim().toLowerCase();
  d.sentence=String(d.sentence||"").trim();
  d.tip=String(d.tip||"").trim();
  var opts=(Array.isArray(d.options)?d.options:[]).map(function(o){return String(o).trim().toLowerCase();}).filter(Boolean);
  var seen={}, clean=[];
  opts.forEach(function(o){ if(!seen[o]){seen[o]=true;clean.push(o);} });
  if(d.correct&&!seen[d.correct]){ clean.push(d.correct); seen[d.correct]=true; }
  TEMPUS_CHOICES.forEach(function(o){ if(clean.length<4&&!seen[o]){clean.push(o);seen[o]=true;} });
  d.options=clean.slice(0,5);
  if(d.correct&&d.options.indexOf(d.correct)===-1) d.options[d.options.length-1]=d.correct;
  return d;
}
function validTempusExercise(d){
  return d&&d.sentence.indexOf("___")>=0&&TEMPUS_CHOICES.indexOf(d.correct)>=0&&d.options.indexOf(d.correct)>=0;
}
function prepareTempusExercises(raw){
  var arr=(Array.isArray(raw)?raw:[]).map(normalizeTempusExercise).filter(validTempusExercise);
  if(arr.length<24) return TEMPUS_CURATED.map(normalizeTempusExercise);
  return arr.slice(0,24);
}
function resetTempusRound(data){
  state.tempus.tempusData=prepareTempusExercises(data);
  state.tempus.tempusIdx=0;
  state.tempus.tempusRight=0;
  state.tempus.tempusWrong=0;
  state.tempus.tempusDone=false;
  state.tempus.tempusResults=[];
  state.tempus.tempusSkipped=[];
  state.tempus.tempusLogged=false;
}
function appendTempusSentence(host,sentence){
  var parts=String(sentence||"").split("___");
  parts.forEach(function(part,i){
    if(part) host.appendChild(document.createTextNode(part));
    if(i<parts.length-1){
      var blank=mk("span","___","display:inline-block;background:rgba(var(--gold-rgb),0.15);color:var(--gold-text);padding:2px 10px;border-radius:var(--r-sm);font-weight:900;border:1px dashed rgba(var(--gold-rgb),0.35);");
      host.appendChild(blank);
    }
  });
}
function renderTempus(){
  var el=document.getElementById("s-tempus"); el.innerHTML="";
  // ── Header ──
  var hdr=mk("div","","margin-bottom:18px;position:relative;");
  var accent=mk("div","","width:48px;height:3px;border-radius:3px;background:var(--gold);margin-bottom:10px;");
  hdr.appendChild(accent);
  hdr.appendChild(mk("p","ALEMÁN · ANTES / DESPUÉS","font-size:10px;color:var(--dim);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
  hdr.appendChild(mk("h2","Antes / Después","font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.03em;line-height:1.1;"));
  hdr.appendChild(mk("p","vor/nach, bevor/nachdem, vorher/danach — el color diferencia la regla.","font-size:13px;color:var(--muted);margin-top:5px;font-weight:500;line-height:1.4;"));
  el.appendChild(hdr);

  if(state.tempus.tempusDone){ renderTempusResults(el); return; }
  if(state.tempus.tempusData&&state.tempus.tempusData.length){ renderTempusCard(el,hdr); return; }

  // ── Reference Table ──
  var refCard=mk("div","","padding:18px;margin-bottom:16px;border-radius:var(--r-xl);background:var(--surface);border:1px solid var(--border);box-shadow:0 4px 24px rgba(0,0,0,0.22);overflow-x:auto;");
  refCard.appendChild(mk("p","📋 Referencia rápida","font-size:14px;font-weight:800;color:var(--text);margin-bottom:12px;"));
  var table=mk("div","","display:grid;grid-template-columns:110px 150px 140px minmax(200px,1fr);gap:1px;font-size:12px;min-width:600px;");
  ["Español","Alemán","Cuándo","Ejemplo"].forEach(function(hdrTxt){
    table.appendChild(mk("div",hdrTxt,"padding:9px 8px;font-weight:800;color:var(--text);background:var(--surface-2);font-size:10px;text-transform:uppercase;letter-spacing:1px;font-family:var(--font-label);"));
  });
  var rows=[
    ["Antes (de)","vor (+ Dativ)","vor + sustantivo / evento","vor dem Unterricht"],
    ["Antes de que","bevor","bevor + oración subordinada","bevor der Unterricht anfängt"],
    ["Antes (adverbio)","vorher","solo, al final o inicio","Ich war vorher beim Arzt."],
    ["Antes (en el pasado)","früher","antes, en el pasado","Früher habe ich in Berlin gewohnt."],
    ["Después (de)","nach (+ Dativ)","nach + sustantivo / evento","nach der Schule"],
    ["Después de que","nachdem","nachdem + oración subordinada","nachdem ich gegessen habe"],
    ["Después (adverbio)","danach","solo, al final o inicio","Danach bin ich müde."],
    ["Más tarde","später","después, más tarde","Wir sehen uns später."]
  ];
  rows.forEach(function(r){
    r.forEach(function(cell,ci){
      var color=ci===1?"var(--gold-text)":ci===2?"var(--purple-text)":ci===3?"var(--text2)":"var(--text)";
      var weight=ci===1?"font-weight:800;":"font-weight:600;";
      table.appendChild(mk("div",cell,"padding:9px 8px;color:"+color+";"+weight+"border-bottom:1px solid var(--border);line-height:1.4;"));
    });
  });
  refCard.appendChild(table);
  el.appendChild(refCard);

  // Warning
  var warn=mk("div","","padding:14px 16px;margin-bottom:14px;border-radius:var(--r-md);background:rgba(var(--red-rgb),0.06);border:1px solid rgba(var(--red-rgb),0.15);font-size:12px;color:var(--red-text);font-weight:600;line-height:1.5;");
  warn.textContent="⚠️ nach dem (2 palabras con artículo) ≠ nachdem (1 palabra, conjunción subordinante). Si ves 'dem' después de 'nach', es DATIV con artículo, no subordinada.";
  el.appendChild(warn);

  // Rules card
  var ruleCard=mk("div","","padding:18px;margin-bottom:16px;border-radius:var(--r-xl);background:var(--surface);border:1px solid var(--border);box-shadow:0 4px 24px rgba(0,0,0,0.22);");
  ruleCard.appendChild(mk("p","📌 Regla express","font-size:14px;font-weight:800;color:var(--text);margin-bottom:10px;"));
  var rules=[
    "vor / nach + DATIV (sustantivo) → 2 palabras: vor dem Unterricht, nach der Schule",
    "bevor / nachdem + oración subordinada (verbo al FINAL) → 1 palabra",
    "vorher / danach = adverbios solos, nunca llevan sustantivo"
  ];
  rules.forEach(function(r){
    ruleCard.appendChild(mk("p","• "+r,"font-size:12px;color:var(--text2);font-weight:500;line-height:1.6;margin-bottom:5px;"));
  });
  el.appendChild(ruleCard);

  // Start button
  var pracHdr=mk("p","🎯 PRACTICAR","font-size:10px;color:var(--gold-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:10px;");
  el.appendChild(pracHdr);
  var startBtn=mk("button","Iniciar ronda (24)","width:100%;padding:15px;border-radius:var(--r-md);border:none;background:var(--gold);color:#000;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(var(--gold-rgb),0.3);transition:all 0.12s;");
  startBtn.onmouseenter=function(){this.style.boxShadow="0 6px 24px rgba(var(--gold-rgb),0.4)";};
  startBtn.onmouseleave=function(){this.style.boxShadow="0 4px 16px rgba(var(--gold-rgb),0.3)";};
  startBtn.setAttribute("aria-label","Iniciar ronda de 24 ejercicios de antes/después");
  startBtn.onclick=function(){
    el.innerHTML=""; el.appendChild(hdr);
    el.appendChild(skelCard(5));
    var sys='You are a German teacher at A2-B1 level. Generate 24 fill-in-the-blank temporal connector exercises. Spread across: vor (3), bevor (3), vorher (3), früher (3), nach (3), nachdem (3), danach (3), später (3). Reply ONLY with a valid JSON array, no markdown: [{"sentence":"___ dem Essen wasche ich die Hände.","options":["vor","bevor","vorher","früher"],"correct":"vor","tip":"<15 words Spanish explaining the rule>"}]. Distractors must be plausible temporal connectors from the same group. Level '+lvlRange()+'.';
    ai(sys,[],1800).then(function(txt){
      var arr=parseJSONArray(txt);
      resetTempusRound(arr);
      el.innerHTML="";
      renderTempusCard(el,hdr);
    }).catch(function(){
      resetTempusRound(TEMPUS_CURATED);
      el.innerHTML="";
      renderTempusCard(el,hdr);
    });
  };
  el.appendChild(startBtn);
}

function renderTempusCard(el,hdr){
  var data=state.tempus.tempusData;
  var idx=state.tempus.tempusIdx;
  if(idx>=data.length){ state.tempus.tempusDone=true; el.innerHTML=""; renderTempus(); return; }
  var d=data[idx]; d=normalizeTempusExercise(d); data[idx]=d;
  el.innerHTML="";
  hdr.innerHTML="";
  var accent=mk("div","","width:48px;height:3px;border-radius:3px;background:var(--gold);margin-bottom:10px;");
  hdr.appendChild(accent);
  hdr.appendChild(mk("p","ALEMÁN · ANTES / DESPUÉS","font-size:10px;color:var(--dim);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
  hdr.appendChild(mk("h2","Antes / Después","font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.03em;line-height:1.15;"));
  // Progress
  var prog=mk("div","","display:flex;gap:8px;margin-top:8px;");
  [
    {lbl:"Progreso",val:(idx+1)+"/"+data.length,color:"var(--text2)"},
    {lbl:"Aciertos",val:state.tempus.tempusRight,color:"var(--green-text)"},
    {lbl:"Fallos",val:state.tempus.tempusWrong,color:"var(--red-text)"}
  ].forEach(function(m){
    var p=mk("div","","");
    p.appendChild(mk("span",String(m.val),"font-size:15px;font-weight:900;color:"+m.color+";font-variant-numeric:tabular-nums;"));
    p.appendChild(mk("span",m.lbl,"font-size:10px;color:var(--muted);font-weight:600;margin-left:6px;letter-spacing:1px;font-family:var(--font-label);"));
    prog.appendChild(p);
  });
  hdr.appendChild(prog);
  el.appendChild(hdr);

  // Sentence card
  var card=mk("div","","padding:24px 20px;margin-bottom:16px;border-radius:var(--r-xl);background:var(--surface);border:1px solid var(--border);box-shadow:0 4px 24px rgba(0,0,0,0.22);");
  card.appendChild(mk("p","Completa la oración:","font-size:10px;color:var(--dim);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:12px;"));
  var sent=document.createElement("p");
  sent.style.cssText="font-size:18px;font-weight:700;color:var(--text);line-height:1.65;letter-spacing:-0.01em;";
  appendTempusSentence(sent,d.sentence);
  card.appendChild(sent);
  el.appendChild(card);

  // Hint
  var hintBox=mk("div","","display:none;padding:12px 14px;border-radius:var(--r-md);background:rgba(var(--purple-rgb),0.08);border:1px solid rgba(var(--purple-rgb),0.2);color:var(--text);font-size:13px;font-weight:600;line-height:1.5;margin-bottom:10px;animation:fadeUp 0.15s ease;");
  hintBox.textContent="💡 "+d.tip;
  var hintBtn=mk("button","💡 Pista","margin-bottom:12px;background:transparent;border:1px dashed rgba(var(--purple-rgb),0.3);color:var(--purple-text);border-radius:var(--r-md);padding:8px 14px;font-size:11px;font-weight:700;cursor:pointer;transition:all 0.12s;");
  hintBtn.setAttribute("aria-expanded","false");
  hintBtn.onmouseenter=function(){this.style.borderColor="rgba(var(--purple-rgb),0.6)";this.style.background="rgba(var(--purple-rgb),0.06)";};
  hintBtn.onmouseleave=function(){this.style.borderColor="rgba(var(--purple-rgb),0.3)";this.style.background="transparent";};
  hintBtn.onclick=function(){
    if(hintBox.style.display==="block"){hintBox.style.display="none";hintBtn.setAttribute("aria-expanded","false");return;}
    hintBox.style.display="block";hintBtn.setAttribute("aria-expanded","true");
  };
  el.appendChild(hintBtn);
  el.appendChild(hintBox);

  // Options
  var opts=d.options.slice();
  for(var i=opts.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=opts[i];opts[i]=opts[j];opts[j]=t;}
  var row=mk("div","","display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;");
  opts.forEach(function(opt){
    var btn=mk("button",opt,"padding:15px 12px;border-radius:var(--r-lg);border:2px solid rgba(var(--gold-rgb),0.25);background:rgba(var(--gold-rgb),0.08);color:var(--gold-text);font-size:16px;font-weight:800;cursor:pointer;transition:all 0.15s;text-transform:lowercase;min-height:54px;");
    btn.setAttribute("aria-label","Opción: "+opt);
    btn.onmouseenter=function(){this.style.transform="translateY(-2px)";this.style.borderColor="var(--gold)";this.style.boxShadow="0 6px 20px rgba(var(--gold-rgb),0.2)";};
    btn.onmouseleave=function(){this.style.transform="";this.style.borderColor="rgba(var(--gold-rgb),0.25)";this.style.boxShadow="";};
    btn.onclick=function(){
      var correct=opt===d.correct;
      if(correct) state.tempus.tempusRight++; else state.tempus.tempusWrong++;
      state.tempus.tempusResults[idx]=correct;
      state.tempus.tempusSkipped[idx]=false;
      var fb=mk("div","","padding:18px;margin-bottom:14px;border-radius:var(--r-lg);background:"+(correct?"rgba(var(--green-rgb),0.08)":"rgba(var(--red-rgb),0.08)")+";border:1px solid "+(correct?"rgba(var(--green-rgb),0.2)":"rgba(var(--red-rgb),0.2)")+";animation:fadeUp 0.2s ease;");
      fb.appendChild(mk("p",correct?"✓ ¡Correcto!":"✗ Incorrecto","font-size:16px;font-weight:900;color:"+(correct?"var(--green-text)":"var(--red-text)")+";margin-bottom:6px;"));
      fb.appendChild(mk("p",d.sentence.replace("___",d.correct),"font-size:15px;font-weight:700;color:var(--text);line-height:1.55;margin-bottom:10px;"));
      fb.appendChild(mk("p","💡 "+d.tip,"font-size:13px;color:var(--text);font-weight:500;line-height:1.55;background:rgba(var(--gold-rgb),0.08);padding:10px 14px;border-radius:var(--r-md);"));
      el.removeChild(row);
      if(skip&&skip.parentNode) skip.parentNode.removeChild(skip);
      el.insertBefore(fb,card.nextSibling);
      var nextBtn=mk("button",(idx+1<data.length?"Siguiente →":"Ver resultado"),"width:100%;padding:14px;border-radius:var(--r-md);border:none;background:var(--gold);color:#000;font-size:14px;font-weight:800;cursor:pointer;margin-top:6px;box-shadow:0 4px 16px rgba(var(--gold-rgb),0.3);");
      nextBtn.setAttribute("aria-label",(idx+1<data.length?"Siguiente pregunta":"Ver resultado"));
      nextBtn.onclick=function(){state.tempus.tempusIdx++;renderTempusCard(el,hdr);};
      el.insertBefore(nextBtn,fb.nextSibling);
    };
    row.appendChild(btn);
  });
  el.appendChild(row);

  var skip=mk("button","Saltar →","display:block;margin:0 auto;background:transparent;border:none;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;padding:6px 12px;border-radius:var(--r-md);transition:all 0.12s;");
  skip.setAttribute("aria-label","Saltar pregunta");
  skip.onmouseenter=function(){this.style.background="rgba(255,255,255,0.04)";this.style.color="var(--text2)";};
  skip.onmouseleave=function(){this.style.background="transparent";this.style.color="var(--muted)";};
  skip.onclick=function(){state.tempus.tempusResults[idx]=false;state.tempus.tempusSkipped[idx]=true;state.tempus.tempusWrong++;state.tempus.tempusIdx++;renderTempusCard(el,hdr);};
  el.appendChild(skip);
}

function renderTempusResults(el){
  el.innerHTML="";
  var hdr=mk("div","","margin-bottom:18px;");
  var accent=mk("div","","width:48px;height:3px;border-radius:3px;background:var(--gold);margin-bottom:10px;");
  hdr.appendChild(accent);
  hdr.appendChild(mk("p","ALEMÁN · ANTES / DESPUÉS","font-size:10px;color:var(--dim);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
  hdr.appendChild(mk("h2","Resultados","font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.03em;line-height:1.1;"));
  el.appendChild(hdr);
  var data=state.tempus.tempusData;
  var total=state.tempus.tempusRight+state.tempus.tempusWrong;
  var pct=total>0?Math.round(state.tempus.tempusRight/total*100):0;
  var scoreColor=pct>=80?"var(--green-text)":pct>=50?"var(--gold-text)":"var(--red-text)";
  // Score
  var resultCard=mk("div","","text-align:center;padding:28px;margin-bottom:18px;border-radius:var(--r-xl);background:var(--surface);border:1px solid var(--border);box-shadow:0 4px 24px rgba(0,0,0,0.22);");
  var scoreWrap=mk("div","","display:inline-flex;align-items:center;justify-content:center;width:110px;height:110px;border-radius:50%;border:4px solid;margin-bottom:10px;");
  scoreWrap.style.borderColor=scoreColor;
  scoreWrap.style.background="rgba(255,255,255,0.03)";
  scoreWrap.appendChild(mk("span",state.tempus.tempusRight+"/"+total,"font-size:26px;font-weight:900;color:"+scoreColor+";font-variant-numeric:tabular-nums;line-height:1;"));
  resultCard.appendChild(scoreWrap);
  resultCard.appendChild(mk("p",pct+"% acierto","font-size:15px;font-weight:700;color:"+scoreColor+";margin-top:2px;"));
  el.appendChild(resultCard);

  // Auto-save missed
  data.forEach(function(d,i){
    if(state.tempus.tempusResults[i]===false&&!state.tempus.tempusSkipped[i]){
      var fullDe=d.sentence.replace("___",d.correct);
      var phr=ensureSrsFields({de:fullDe,es:d.tip,tip:d.correct,source:"antes-despues"});
      if(!state.session.saved.some(function(x){return x.de===phr.de;})){
        state.session.saved.push(phr);
      }
    }
  });
  updateBadge();

  var sumCard=mk("div","","padding:20px;margin-bottom:18px;border-radius:var(--r-xl);background:var(--surface);border:1px solid var(--border);box-shadow:0 4px 24px rgba(0,0,0,0.22);");
  sumCard.appendChild(mk("p","Lo que practicaste:","font-size:10px;color:var(--gold-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:12px;"));
  data.forEach(function(d,i){
    var color=state.tempus.tempusResults[i]?"var(--green-text)":"var(--red-text)";
    var row=mk("div","","display:flex;align-items:center;padding:5px 0;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.04);");
    var full=d.sentence.replace("___",d.correct);
    var mark=state.tempus.tempusResults[i]?"✓ ":"✗ ";
    if(state.tempus.tempusSkipped[i]) mark="Saltada · ";
    row.appendChild(mk("span",mark+(i+1)+". "+full,"font-weight:700;color:"+color+";flex:1;line-height:1.45;"));
    sumCard.appendChild(row);
  });
  el.appendChild(sumCard);

  var restart=mk("button","← Reiniciar","width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:var(--text2);border-radius:var(--r-md);padding:14px;font-size:14px;font-weight:700;margin-top:4px;cursor:pointer;transition:all 0.12s;");
  restart.onmouseenter=function(){this.style.background="rgba(255,255,255,0.08)";};
  restart.onmouseleave=function(){this.style.background="rgba(255,255,255,0.04)";};
  restart.onclick=function(){state.tempus.tempusData=null;state.tempus.tempusDone=false;state.tempus.tempusIdx=0;state.tempus.tempusRight=0;state.tempus.tempusWrong=0;state.tempus.tempusResults=[];state.tempus.tempusSkipped=[];state.tempus.tempusLogged=false;renderTempus();};
  el.appendChild(restart);

  if(!state.tempus.tempusLogged){
    state.tempus.tempusLogged=true;
    logActivity("drillsDone",1); syncUp();
  }
}
