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
  const hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","CONECTORES Y SUBORDINADAS","font-size:11px;color:var(--muted);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","\ud83d\udd17 weil \u00b7 obwohl \u00b7 deshalb \u00b7 dass \u00b7 wenn","font-size:17px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  hdr.appendChild(mk("p","Elige el conector correcto. Atenci\u00f3n al orden del verbo.","font-size:13px;color:var(--muted);margin-top:4px;font-weight:500;"));
  el.appendChild(hdr);

  if(_conDone){ renderConResults(el); return; }

  if(!_conData){
    el.appendChild(skelCard(5));
    ai('You are a German teacher at A2-B1 level. Generate 5 fill-in-the-blank connector exercises. Reply ONLY with valid JSON array, no markdown: [{"sentence":"Ich lerne Deutsch, ___ ich nach Deutschland ziehen m\u00f6chte.","options":["weil","obwohl","deshalb","dass"],"correct":"weil","fullSentence":"Ich lerne Deutsch, weil ich nach Deutschland ziehen m\u00f6chte.","tip":"weil env\u00eda el verbo conjugado al FINAL de la oraci\u00f3n"}]. Use these connectors: weil, obwohl, deshalb, dass, wenn (each at least once). Include a brief Spanish tip about verb position for each.',[],800).then(function(txt){
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
  hdr.appendChild(mk("p","CONECTORES Y SUBORDINADAS","font-size:11px;color:var(--muted);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","\ud83d\udd17 Conector","font-size:17px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  hdr.appendChild(mk("p",(_conIdx+1)+"/"+_conData.length+" \u00b7 Aciertos: "+_conRight+" \u00b7 Fallos: "+_conWrong,"font-size:13px;color:var(--purple-text);margin-top:4px;font-weight:600;"));
  el.appendChild(hdr);

  var card=document.createElement("div"); card.className="card";
  card.style.cssText="padding:24px 20px;margin-bottom:14px;border-radius:var(--r-xl,20px);";
  card.appendChild(mk("p","Completa la oraci\u00f3n:","font-size:11px;color:var(--muted);letter-spacing:1.5px;font-family:var(--font-label);font-weight:600;margin-bottom:10px;"));
  var sentEl=mk("p",d.sentence,"font-size:17px;font-weight:700;color:var(--text);line-height:1.6;letter-spacing:-0.01em;");
  sentEl.innerHTML=d.sentence.replace(/___/g,'<span style="background:rgba(var(--purple-rgb),0.15);color:var(--purple-text);padding:2px 8px;border-radius:6px;font-weight:900;">___</span>');
  card.appendChild(sentEl);
  el.appendChild(card);

  var row=mk("div","","display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:12px;");
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  shuffle(d.options).forEach(function(opt){
    var btn=mk("button",opt,"padding:12px 24px;border-radius:var(--r-lg,14px);border:2px solid rgba(var(--purple-rgb),0.25);background:rgba(var(--purple-rgb),0.08);color:var(--purple-text);font-size:16px;font-weight:800;cursor:pointer;transition:transform 0.12s;text-transform:lowercase;font-variant-numeric:tabular-nums;");
    btn.onmouseenter=function(){this.style.transform="scale(1.06)";this.style.borderColor="var(--purple)";};
    btn.onmouseleave=function(){this.style.transform="";this.style.borderColor="rgba(var(--purple-rgb),0.25)";};
    btn.onclick=function(){
      var correct=opt===d.correct;
      if(correct) _conRight++; else _conWrong++;
      _conResults[_conIdx]=correct;
      var fb=document.createElement("div"); fb.className="card";
      fb.style.cssText="padding:16px;margin-bottom:10px;border-radius:var(--r-lg,14px);background:"+(correct?"rgba(var(--green-rgb),0.08)":"rgba(var(--red-rgb),0.08)")+";border:1px solid "+(correct?"rgba(var(--green-rgb),0.2)":"rgba(var(--red-rgb),0.2)")+";animation:fadeUp 0.2s ease;";
      fb.appendChild(mk("p",correct?"\u2713 Correcto! \u2014 "+d.fullSentence:"\u2717 Incorrecto \u2014 "+d.fullSentence,"font-size:14px;font-weight:700;color:"+(correct?"var(--green-text)":"var(--red-text)")+";margin-bottom:6px;line-height:1.5;"));
      fb.appendChild(mk("p","\ud83d\udca1 "+d.tip,"font-size:12px;color:var(--text);font-weight:500;line-height:1.5;background:rgba(var(--purple-rgb),0.08);padding:8px 12px;border-radius:8px;"));
      el.removeChild(row);
      el.insertBefore(fb, el.querySelector(".card").nextSibling);
      var nextBtn=mk("button","Siguiente →","width:100%;padding:12px;border-radius:12px;border:none;background:rgba(var(--purple-rgb),0.12);color:var(--purple-text);font-size:13px;font-weight:800;cursor:pointer;margin-top:6px;");
      nextBtn.onclick=function(){_conIdx++;renderConCard(el,hdr);};
      el.insertBefore(nextBtn, fb.nextSibling);
    };
    row.appendChild(btn);
  });
  el.appendChild(row);
  var skip=mk("button","Saltar \u2192","background:transparent;border:none;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;display:block;margin:0 auto;cursor:pointer;");
  skip.onclick=function(){_conResults[_conIdx]=false;_conWrong++;_conIdx++;renderConCard(el,hdr);};
  el.appendChild(skip);
}
function renderConResults(el){
  el.innerHTML="";
  var hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","CONECTORES Y SUBORDINADAS","font-size:11px;color:var(--muted);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","\ud83d\udd17 Resultados","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  el.appendChild(hdr);
  var total=_conRight+_conWrong, pct=total>0?Math.round(_conRight/total*100):0;
  var scoreColor=pct>=80?"var(--green-text)":pct>=50?"var(--gold-text)":"var(--red-text)";
  var resultCard=document.createElement("div"); resultCard.className="card";
  resultCard.style.cssText="text-align:center;padding:28px;margin-bottom:16px;";
  resultCard.appendChild(mk("p",_conRight+"/"+total,"font-size:42px;font-weight:900;color:"+scoreColor+";line-height:1;font-variant-numeric:tabular-nums;"));
  resultCard.appendChild(mk("p","Aciertos","font-size:13px;color:var(--muted);font-weight:600;margin-top:4px;"));
  resultCard.appendChild(mk("p",pct+"%","font-size:14px;font-weight:700;color:"+scoreColor+";margin-top:2px;"));
  el.appendChild(resultCard);
  var sumCard=document.createElement("div"); sumCard.className="card";
  sumCard.style.cssText="margin-bottom:16px;";
  sumCard.appendChild(mk("p","Lo que practicaste:","font-size:11px;color:var(--purple-text);letter-spacing:1.5px;font-family:var(--font-label);font-weight:700;margin-bottom:8px;"));
  _conData.forEach(function(d,i){
    var color=_conResults[i]?"var(--green-text)":"var(--red-text)";
    var row=mk("div","","display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:13px;");
    row.appendChild(mk("span",(i+1)+". "+d.fullSentence,"font-weight:600;color:"+color+";flex:1;line-height:1.4;"));
    sumCard.appendChild(row);
  });
  el.appendChild(sumCard);
  var restart=mk("button","\u2190 Otros 5 ejercicios","width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:var(--text2);border-radius:12px;padding:12px;font-size:13px;font-weight:600;margin-top:12px;cursor:pointer;");
  restart.onclick=function(){_conData=null;_conDone=false;renderConnectors();};
  el.appendChild(restart);
}
