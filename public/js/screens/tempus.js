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
      var blank=mk("span","___","background:rgba(var(--gold-rgb),0.15);color:var(--gold-text);padding:2px 8px;border-radius:6px;font-weight:900;");
      host.appendChild(blank);
    }
  });
}
function renderTempus(){
  var el=document.getElementById("s-tempus"); el.innerHTML="";
  var hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","ALEMÁN · ANTES / DESPUÉS","font-size:10px;color:var(--gold-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","⏳ Antes / Después","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  hdr.appendChild(mk("p","vor/nach, bevor/nachdem, vorher/danach — el color diferencia la regla, no el tipo.","font-size:13px;color:var(--muted);margin-top:4px;font-weight:500;"));
  el.appendChild(hdr);

  if(state.tempus.tempusDone){ renderTempusResults(el); return; }
  if(state.tempus.tempusData&&state.tempus.tempusData.length){ renderTempusCard(el,hdr); return; }

  var refCard=document.createElement("div"); refCard.className="card";
  refCard.style.cssText="padding:16px;margin-bottom:14px;border-radius:var(--r-lg,16px);overflow-x:auto;";
  refCard.appendChild(mk("p","📋 Referencia","font-size:13px;font-weight:800;color:var(--text);margin-bottom:10px;"));
  var table=document.createElement("div");
  table.style.cssText="display:grid;grid-template-columns:110px 150px 140px minmax(200px,1fr);gap:1px;font-size:12px;min-width:600px;";
  ["Español","Alemán","Cuándo","Ejemplo"].forEach(function(hdrTxt){
    var th=mk("div",hdrTxt,"padding:8px 6px;font-weight:800;color:var(--text);background:var(--surface);font-size:11px;text-transform:uppercase;letter-spacing:0.04em;");
    table.appendChild(th);
  });
  var rows=[
    ["Antes (de)","vor (+ Dativ)","vor + sustantivo / evento","vor dem Unterricht (der Unterricht)"],
    ["Antes de que","bevor","bevor + oración subordinada","bevor der Unterricht anfängt"],
    ["Antes (adverbio)","vorher","solo, al final o inicio","Ich war vorher beim Arzt."],
    ["Antes (en el pasado)","früher","antes, en el pasado","Früher habe ich in Berlin gewohnt."],
    ["Después (de)","nach (+ Dativ)","nach + sustantivo / evento","nach der Schule (die Schule)"],
    ["Después de que","nachdem","nachdem + oración subordinada","nachdem ich gegessen habe"],
    ["Después (adverbio)","danach","solo, al final o inicio","Danach bin ich müde."],
    ["Más tarde","später","después, más tarde","Wir sehen uns später."]
  ];
  rows.forEach(function(r){
    r.forEach(function(cell,ci){
      var color=ci===1?"var(--gold-text)":ci===2?"var(--purple-text)":ci===3?"var(--text2)":"var(--text)";
      var weight=ci===1?"font-weight:800;":"";
      var td=mk("div",cell,"padding:8px 6px;color:"+color+";"+weight+"border-bottom:1px solid var(--border);");
      table.appendChild(td);
    });
  });
  refCard.appendChild(table);
  el.appendChild(refCard);

  var warn=document.createElement("div");
  warn.style.cssText="padding:14px 16px;margin-bottom:12px;border-radius:var(--r-md,12px);background:rgba(var(--red-rgb),0.06);border:1px solid rgba(var(--red-rgb),0.15);font-size:12px;color:var(--red-text);font-weight:600;line-height:1.5;";
  warn.textContent="⚠️ nach dem (2 palabras con artículo) ≠ nachdem (1 palabra, conjunción subordinante). Si ves 'dem' después de 'nach', es un DATIV con artículo, no una subordinada.";
  el.appendChild(warn);

  var ruleCard=document.createElement("div"); ruleCard.className="card";
  ruleCard.style.cssText="padding:16px;margin-bottom:14px;border-radius:var(--r-lg,16px);";
  ruleCard.appendChild(mk("p","📌 Regla express","font-size:13px;font-weight:800;color:var(--text);margin-bottom:8px;"));
  var rules=[
    "vor / nach + DATIV (sustantivo) → 2 palabras: vor dem Unterricht, nach der Schule",
    "bevor / nachdem + oración subordinada (verbo al FINAL) → 1 palabra: bevor ich esse, nachdem ich gegessen habe",
    "vorher / danach = adverbios solos, nunca llevan sustantivo"
  ];
  rules.forEach(function(r){
    ruleCard.appendChild(mk("p","• "+r,"font-size:12px;color:var(--text2);font-weight:500;line-height:1.6;margin-bottom:4px;"));
  });
  el.appendChild(ruleCard);

  var pracHdr=mk("p","🎯 PRACTICAR","font-size:11px;color:var(--gold-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:8px;");
  el.appendChild(pracHdr);
  var startBtn=mk("button","Iniciar ronda (24)","width:100%;padding:14px;border-radius:var(--r-lg,14px);border:none;background:rgba(var(--gold-rgb),0.12);color:var(--gold-text);font-size:15px;font-weight:800;cursor:pointer;");
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
  hdr.appendChild(mk("p","ALEMÁN · ANTES / DESPUÉS","font-size:10px;color:var(--gold-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","⏳ Antes / Después","font-size:17px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  hdr.appendChild(mk("p",(idx+1)+"/"+data.length+" · Aciertos: "+state.tempus.tempusRight+" · Fallos: "+state.tempus.tempusWrong,"font-size:13px;color:var(--gold-text);margin-top:4px;font-weight:600;"));
  el.appendChild(hdr);

  var card=document.createElement("div"); card.className="card";
  card.style.cssText="padding:24px 20px;margin-bottom:14px;border-radius:var(--r-xl,20px);";
  card.appendChild(mk("p","Completa la oración:","font-size:11px;color:var(--muted);letter-spacing:1.5px;font-family:var(--font-label);font-weight:600;margin-bottom:10px;"));
  var sent=document.createElement("p");
  sent.style.cssText="font-size:17px;font-weight:700;color:var(--text);line-height:1.6;letter-spacing:-0.01em;";
  appendTempusSentence(sent,d.sentence);
  card.appendChild(sent);
  el.appendChild(card);

  var hintBox=mk("div","","display:none;padding:10px 12px;border-radius:10px;background:rgba(var(--purple-rgb),0.08);border:1px solid rgba(var(--purple-rgb),0.2);color:var(--text);font-size:12px;font-weight:600;line-height:1.45;margin-bottom:8px;animation:fadeUp 0.15s ease;");
  hintBox.textContent="💡 "+d.tip;
  var hintBtn=mk("button","💡 Pista","margin-bottom:10px;background:transparent;border:1px dashed rgba(var(--purple-rgb),0.3);color:var(--purple-text);border-radius:8px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer;");
  hintBtn.setAttribute("aria-expanded","false");
  hintBtn.onclick=function(){
    if(hintBox.style.display==="block"){hintBox.style.display="none";hintBtn.setAttribute("aria-expanded","false");return;}
    hintBox.style.display="block";hintBtn.setAttribute("aria-expanded","true");
  };
  el.appendChild(hintBtn);
  el.appendChild(hintBox);

  var opts=d.options.slice();
  for(var i=opts.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=opts[i];opts[i]=opts[j];opts[j]=t;}
  var row=mk("div","","display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:12px;");
  opts.forEach(function(opt){
    var btn=mk("button",opt,"padding:12px 24px;border-radius:var(--r-lg,14px);border:2px solid rgba(var(--gold-rgb),0.25);background:rgba(var(--gold-rgb),0.08);color:var(--gold-text);font-size:16px;font-weight:800;cursor:pointer;transition:transform 0.12s;text-transform:lowercase;");
    btn.setAttribute("aria-label","Opción: "+opt);
    btn.onmouseenter=function(){this.style.transform="scale(1.06)";this.style.borderColor="var(--gold-text)";};
    btn.onmouseleave=function(){this.style.transform="";this.style.borderColor="rgba(var(--gold-rgb),0.25)";};
    btn.onclick=function(){
      var correct=opt===d.correct;
      if(correct) state.tempus.tempusRight++; else state.tempus.tempusWrong++;
      state.tempus.tempusResults[idx]=correct;
      state.tempus.tempusSkipped[idx]=false;
      var fb=document.createElement("div"); fb.className="card";
      fb.style.cssText="padding:16px;margin-bottom:10px;border-radius:var(--r-lg,14px);background:"+(correct?"rgba(var(--green-rgb),0.08)":"rgba(var(--red-rgb),0.08)")+";border:1px solid "+(correct?"rgba(var(--green-rgb),0.2)":"rgba(var(--red-rgb),0.2)")+";animation:fadeUp 0.2s ease;";
      fb.appendChild(mk("p",correct?"✓ Correcto! — "+d.sentence.replace("___",d.correct):"✗ Incorrecto — "+d.sentence.replace("___",d.correct),"font-size:14px;font-weight:700;color:"+(correct?"var(--green-text)":"var(--red-text)")+";margin-bottom:6px;line-height:1.5;"));
      fb.appendChild(mk("p","💡 "+d.tip,"font-size:12px;color:var(--text);font-weight:500;line-height:1.5;background:rgba(var(--gold-rgb),0.08);padding:8px 12px;border-radius:8px;"));
      el.removeChild(row);
      if(skip&&skip.parentNode) skip.parentNode.removeChild(skip);
      el.insertBefore(fb,card.nextSibling);
      var nextBtn=mk("button",(idx+1<data.length?"Siguiente →":"Ver resultado"),"width:100%;padding:12px;border-radius:12px;border:none;background:rgba(var(--gold-rgb),0.12);color:var(--gold-text);font-size:13px;font-weight:800;cursor:pointer;margin-top:6px;");
      nextBtn.setAttribute("aria-label",(idx+1<data.length?"Siguiente pregunta":"Ver resultado"));
      nextBtn.onclick=function(){state.tempus.tempusIdx++;renderTempusCard(el,hdr);};
      el.insertBefore(nextBtn,fb.nextSibling);
    };
    row.appendChild(btn);
  });
  el.appendChild(row);
  var skip=mk("button","Saltar →","background:transparent;border:none;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;display:block;margin:0 auto;");
  skip.setAttribute("aria-label","Saltar pregunta");
  skip.onclick=function(){state.tempus.tempusResults[idx]=false;state.tempus.tempusSkipped[idx]=true;state.tempus.tempusWrong++;state.tempus.tempusIdx++;renderTempusCard(el,hdr);};
  el.appendChild(skip);
}

function renderTempusResults(el){
  el.innerHTML="";
  var hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","ALEMÁN · ANTES / DESPUÉS","font-size:10px;color:var(--gold-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","⏳ Resultados","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  el.appendChild(hdr);
  var data=state.tempus.tempusData;
  var total=state.tempus.tempusRight+state.tempus.tempusWrong;
  var pct=total>0?Math.round(state.tempus.tempusRight/total*100):0;
  var scoreColor=pct>=80?"var(--green-text)":pct>=50?"var(--gold-text)":"var(--red-text)";
  var resultCard=document.createElement("div"); resultCard.className="card";
  resultCard.style.cssText="text-align:center;padding:28px;margin-bottom:16px;";
  resultCard.appendChild(mk("p",state.tempus.tempusRight+"/"+total,"font-size:42px;font-weight:900;color:"+scoreColor+";line-height:1;font-variant-numeric:tabular-nums;"));
  resultCard.appendChild(mk("p","Aciertos","font-size:13px;color:var(--muted);font-weight:600;margin-top:4px;"));
  resultCard.appendChild(mk("p",pct+"%","font-size:14px;font-weight:700;color:"+scoreColor+";margin-top:2px;"));
  el.appendChild(resultCard);

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

  var sumCard=document.createElement("div"); sumCard.className="card";
  sumCard.style.cssText="margin-bottom:16px;";
  sumCard.appendChild(mk("p","Lo que practicaste:","font-size:11px;color:var(--gold-text);letter-spacing:1.5px;font-family:var(--font-label);font-weight:700;margin-bottom:8px;"));
  data.forEach(function(d,i){
    var color=state.tempus.tempusResults[i]?"var(--green-text)":"var(--red-text)";
    var row=mk("div","","display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:13px;");
    var full=d.sentence.replace("___",d.correct);
    var mark=state.tempus.tempusResults[i]?"✓ ":"✗ ";
    if(state.tempus.tempusSkipped[i]) mark="Saltada · ";
    row.appendChild(mk("span",mark+(i+1)+". "+full,"font-weight:600;color:"+color+";flex:1;line-height:1.4;"));
    sumCard.appendChild(row);
  });
  el.appendChild(sumCard);

  var restart=mk("button","← Reiniciar","width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:var(--muted);border-radius:12px;padding:12px;font-size:13px;font-weight:600;margin-top:12px;cursor:pointer;");
  restart.onclick=function(){state.tempus.tempusData=null;state.tempus.tempusDone=false;state.tempus.tempusIdx=0;state.tempus.tempusRight=0;state.tempus.tempusWrong=0;state.tempus.tempusResults=[];state.tempus.tempusSkipped=[];state.tempus.tempusLogged=false;renderTempus();};
  el.appendChild(restart);

  if(!state.tempus.tempusLogged){
    state.tempus.tempusLogged=true;
    logActivity("drillsDone",1); syncUp();
  }
}
