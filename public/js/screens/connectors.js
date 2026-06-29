// ── Connectors ────────────────────────────────────────────────────────────────
function normalizeConnectorExercise(d){
  d=d||{};
  d.correct=String(d.correct||"").trim().toLowerCase();
  var opts=(Array.isArray(d.options)?d.options:[]).map(function(o){return String(o).trim().toLowerCase();}).filter(Boolean);
  var seen={}, clean=[];
  opts.forEach(function(o){ if(!seen[o]){seen[o]=true;clean.push(o);} });
  if(d.correct&&!seen[d.correct]){ clean.push(d.correct); seen[d.correct]=true; }
  CONNECTOR_CHOICES.forEach(function(o){ if(clean.length<4&&!seen[o]){clean.push(o);seen[o]=true;} });
  d.options=clean.slice(0,5);
  if(d.correct&&d.options.indexOf(d.correct)===-1) d.options[d.options.length-1]=d.correct;
  return d;
}
function renderConnectors(){
  const el=document.getElementById("s-conectores"); el.innerHTML="";
  // ── Header with accent ──
  const hdr=mk("div","","margin-bottom:18px;position:relative;");
  const accent=mk("div","","width:48px;height:3px;border-radius:3px;background:var(--purple);margin-bottom:10px;");
  hdr.appendChild(accent);
  hdr.appendChild(mk("p","CONECTORES Y SUBORDINADAS","font-size:10px;color:var(--dim);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
  hdr.appendChild(mk("h2","weil · obwohl · deshalb · dass · wenn","font-size:20px;font-weight:900;color:var(--text);letter-spacing:-0.03em;line-height:1.15;"));
  hdr.appendChild(mk("p","Elige el conector correcto. Atención al orden del verbo.","font-size:13px;color:var(--muted);margin-top:5px;font-weight:500;line-height:1.4;"));
  el.appendChild(hdr);

  if(_conDone){ renderConResults(el); return; }

  if(!_conData){
    el.appendChild(skelCard(5));
    ai('You are a German teacher at A2-B1 level. Generate 5 fill-in-the-blank connector exercises. Reply ONLY with valid JSON array, no markdown: [{"sentence":"Ich lerne Deutsch, ___ ich nach Deutschland ziehen möchte.","options":["weil","obwohl","deshalb","dass"],"correct":"weil","fullSentence":"Ich lerne Deutsch, weil ich nach Deutschland ziehen möchte.","tip":"weil envía el verbo conjugado al FINAL de la oración"}]. Use these connectors: weil, obwohl, deshalb, dass, wenn (each at least once). Include a brief Spanish tip about verb position for each.',[],800).then(function(txt){
      var arr=parseJSONArray(txt);
      if(!arr||!arr.length){ el.innerHTML="<p style='color:var(--red);text-align:center;padding:40px;'>Error generando ejercicios. Intenta de nuevo.</p>"; return; }
      _conData=arr.map(normalizeConnectorExercise); _conIdx=0; _conRight=0; _conWrong=0; _conDone=false; _conResults=[];
      el.innerHTML="";
      renderConCard(el, hdr);
    });
    return;
  }
  renderConCard(el, hdr);
}
function renderConCard(el, hdr){
  if(_conIdx>=_conData.length){ _conDone=true; el.innerHTML=""; renderConnectors(); return; }
  var d=normalizeConnectorExercise(_conData[_conIdx]);
  _conData[_conIdx]=d;
  el.innerHTML="";
  hdr.innerHTML="";
  var accent=mk("div","","width:48px;height:3px;border-radius:3px;background:var(--purple);margin-bottom:10px;");
  hdr.appendChild(accent);
  hdr.appendChild(mk("p","CONECTORES Y SUBORDINADAS","font-size:10px;color:var(--dim);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
  hdr.appendChild(mk("h2","Conector","font-size:20px;font-weight:900;color:var(--text);letter-spacing:-0.03em;line-height:1.15;"));
  // Progress metrics
  var prog=mk("div","","display:flex;gap:8px;margin-top:8px;");
  [
    {lbl:"Progreso",val:(_conIdx+1)+"/"+_conData.length,color:"var(--text2)"},
    {lbl:"Aciertos",val:_conRight,color:"var(--green-text)"},
    {lbl:"Fallos",val:_conWrong,color:"var(--red-text)"}
  ].forEach(function(m){
    var p=mk("div","","");
    p.appendChild(mk("span",String(m.val),"font-size:15px;font-weight:900;color:"+m.color+";font-variant-numeric:tabular-nums;"));
    p.appendChild(mk("span",m.lbl,"font-size:10px;color:var(--muted);font-weight:600;margin-left:6px;letter-spacing:1px;font-family:var(--font-label);"));
    prog.appendChild(p);
  });
  hdr.appendChild(prog);
  el.appendChild(hdr);

  // ── Sentence card ──
  var card=mk("div","","padding:24px 20px;margin-bottom:16px;border-radius:var(--r-xl);background:var(--surface);border:1px solid var(--border);box-shadow:0 4px 24px rgba(0,0,0,0.22);");
  card.appendChild(mk("p","Completa la oración:","font-size:10px;color:var(--dim);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:12px;"));
  var sentEl=mk("p","","font-size:18px;font-weight:700;color:var(--text);line-height:1.65;letter-spacing:-0.01em;");
  sentEl.innerHTML=d.sentence.replace(/___/g,'<span style="display:inline-block;background:rgba(var(--purple-rgb),0.15);color:var(--purple-text);padding:2px 10px;border-radius:var(--r-sm);font-weight:900;border:1px dashed rgba(var(--purple-rgb),0.35);">___</span>');
  card.appendChild(sentEl);
  el.appendChild(card);

  // ── Option buttons ──
  var row=mk("div","","display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;");
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  shuffle(d.options).forEach(function(opt){
    var btn=mk("button",opt,"padding:15px 12px;border-radius:var(--r-lg);border:2px solid rgba(var(--purple-rgb),0.25);background:rgba(var(--purple-rgb),0.08);color:var(--purple-text);font-size:16px;font-weight:800;cursor:pointer;transition:all 0.15s;text-transform:lowercase;min-height:54px;");
    btn.onmouseenter=function(){this.style.transform="translateY(-2px)";this.style.borderColor="var(--purple)";this.style.boxShadow="0 6px 20px rgba(var(--purple-rgb),0.2)";};
    btn.onmouseleave=function(){this.style.transform="";this.style.borderColor="rgba(var(--purple-rgb),0.25)";this.style.boxShadow="";};
    btn.onclick=function(){
      var correct=opt===d.correct;
      if(correct) _conRight++; else _conWrong++;
      _conResults[_conIdx]=correct;
      // Feedback
      var fb=mk("div","","padding:18px;margin-bottom:14px;border-radius:var(--r-lg);background:"+(correct?"rgba(var(--green-rgb),0.08)":"rgba(var(--red-rgb),0.08)")+";border:1px solid "+(correct?"rgba(var(--green-rgb),0.2)":"rgba(var(--red-rgb),0.2)")+";animation:fadeUp 0.2s ease;");
      fb.appendChild(mk("p",correct?"✓ ¡Correcto!":"✗ Incorrecto","font-size:16px;font-weight:900;color:"+(correct?"var(--green-text)":"var(--red-text)")+";margin-bottom:6px;"));
      fb.appendChild(mk("p",d.fullSentence,"font-size:15px;font-weight:700;color:var(--text);line-height:1.55;margin-bottom:10px;"));
      fb.appendChild(mk("p","💡 "+d.tip,"font-size:13px;color:var(--text);font-weight:500;line-height:1.55;background:rgba(var(--purple-rgb),0.08);padding:10px 14px;border-radius:var(--r-md);"));
      el.removeChild(row);
      el.insertBefore(fb, card.nextSibling);
      var nextBtn=mk("button","Siguiente →","width:100%;padding:14px;border-radius:var(--r-md);border:none;background:var(--gold);color:#000;font-size:14px;font-weight:800;cursor:pointer;margin-top:6px;box-shadow:0 4px 16px rgba(var(--gold-rgb),0.3);");
      nextBtn.onclick=function(){_conIdx++;renderConCard(el,hdr);};
      el.insertBefore(nextBtn, fb.nextSibling);
    };
    row.appendChild(btn);
  });
  el.appendChild(row);

  // ── Skip ──
  var skip=mk("button","Saltar →","display:block;margin:0 auto;background:transparent;border:none;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;padding:6px 12px;border-radius:var(--r-md);transition:all 0.12s;");
  skip.onmouseenter=function(){this.style.background="rgba(255,255,255,0.04)";this.style.color="var(--text2)";};
  skip.onmouseleave=function(){this.style.background="transparent";this.style.color="var(--muted)";};
  skip.onclick=function(){_conResults[_conIdx]=false;_conWrong++;_conIdx++;renderConCard(el,hdr);};
  el.appendChild(skip);
}
function renderConResults(el){
  el.innerHTML="";
  var hdr=mk("div","","margin-bottom:18px;");
  var accent=mk("div","","width:48px;height:3px;border-radius:3px;background:var(--purple);margin-bottom:10px;");
  hdr.appendChild(accent);
  hdr.appendChild(mk("p","CONECTORES Y SUBORDINADAS","font-size:10px;color:var(--dim);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
  hdr.appendChild(mk("h2","Resultados","font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.03em;line-height:1.1;"));
  el.appendChild(hdr);
  var total=_conRight+_conWrong, pct=total>0?Math.round(_conRight/total*100):0;
  var scoreColor=pct>=80?"var(--green-text)":pct>=50?"var(--gold-text)":"var(--red-text)";
  // Score card
  var resultCard=mk("div","","text-align:center;padding:28px;margin-bottom:18px;border-radius:var(--r-xl);background:var(--surface);border:1px solid var(--border);box-shadow:0 4px 24px rgba(0,0,0,0.22);");
  var scoreWrap=mk("div","","display:inline-flex;align-items:center;justify-content:center;width:110px;height:110px;border-radius:50%;border:4px solid;margin-bottom:10px;");
  scoreWrap.style.borderColor=scoreColor;
  scoreWrap.style.background="rgba(255,255,255,0.03)";
  scoreWrap.appendChild(mk("span",_conRight+"/"+total,"font-size:26px;font-weight:900;color:"+scoreColor+";font-variant-numeric:tabular-nums;line-height:1;"));
  resultCard.appendChild(scoreWrap);
  resultCard.appendChild(mk("p",pct+"% acierto","font-size:15px;font-weight:700;color:"+scoreColor+";margin-top:2px;"));
  el.appendChild(resultCard);

  var sumCard=mk("div","","padding:20px;margin-bottom:18px;border-radius:var(--r-xl);background:var(--surface);border:1px solid var(--border);box-shadow:0 4px 24px rgba(0,0,0,0.22);");
  sumCard.appendChild(mk("p","Lo que practicaste:","font-size:10px;color:var(--purple-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:12px;"));
  _conData.forEach(function(d,i){
    var color=_conResults[i]?"var(--green-text)":"var(--red-text)";
    var row=mk("div","","display:flex;align-items:center;padding:5px 0;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.04);");
    row.appendChild(mk("span",(i+1)+". "+d.fullSentence,"font-weight:700;color:"+color+";flex:1;line-height:1.45;"));
    sumCard.appendChild(row);
  });
  el.appendChild(sumCard);

  var restart=mk("button","← Otros 5 ejercicios","width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:var(--text2);border-radius:var(--r-md);padding:14px;font-size:14px;font-weight:700;margin-top:4px;cursor:pointer;transition:all 0.12s;");
  restart.onmouseenter=function(){this.style.background="rgba(255,255,255,0.08)";};
  restart.onmouseleave=function(){this.style.background="rgba(255,255,255,0.04)";};
  restart.onclick=function(){_conData=null;_conDone=false;renderConnectors();};
  el.appendChild(restart);
}
