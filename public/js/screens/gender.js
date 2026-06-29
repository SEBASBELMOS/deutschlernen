// ── Gender (der/die/das trainer) ──────────────────────────────────────────────
function genShuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.random()*(i+1)|0;var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function genCleanNouns(arr){
  var seen={};
  return (arr||[]).filter(function(n){return n&&n.noun&&n.article&&/^(der|die|das)$/.test(String(n.article).toLowerCase());})
    .map(function(n){return {noun:String(n.noun).trim(),article:String(n.article).toLowerCase(),plural:n.plural?String(n.plural).trim():"",meaning:n.meaning?String(n.meaning).trim():""};})
    .filter(function(n){var key=n.noun.toLowerCase(); if(seen[key]) return false; seen[key]=true; return true;});
}
function genPickNouns(aiNouns){
  var recent={}; _genRecentNouns.slice(-20).forEach(function(n){recent[n.toLowerCase()]=true;});
  var pool=genCleanNouns(aiNouns).concat(genShuffle(GENDER_NOUN_POOL));
  var picked=[], used={};
  pool.forEach(function(n){
    var key=n.noun.toLowerCase();
    if(picked.length<10 && !used[key] && !recent[key]){picked.push(n);used[key]=true;}
  });
  if(picked.length<10){
    pool.forEach(function(n){var key=n.noun.toLowerCase(); if(picked.length<10&&!used[key]){picked.push(n);used[key]=true;}});
  }
  _genRecentNouns=_genRecentNouns.concat(picked.map(function(n){return n.noun;})).slice(-30);
  return picked;
}
function renderGender(){
  const el=document.getElementById("s-genero"); el.innerHTML="";
  const hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","ENTRENADOR DE GENERO","font-size:11px;color:var(--muted);letter-spacing:2px;font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","\ud83c\udfaf der \u00b7 die \u00b7 das","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  hdr.appendChild(mk("p","Adivina el art\u00edculo correcto. Azul=der \u00b7 Rojo=die \u00b7 Verde=das.","font-size:13px;color:var(--muted);margin-top:4px;font-weight:500;"));
  el.appendChild(hdr);

  if(_genDone){ renderGenResults(el); return; }

  if(!_genNouns){
    el.appendChild(skelCard(6));
    ai('You are a German teacher. Generate 10 common German nouns at A2 level. Reply ONLY with valid JSON array, no markdown: [{"noun":"Tisch","article":"der","plural":"Tische","meaning":"mesa"}]. Avoid obscure words. Include 2-3 from each article group (der/die/das).',[],600).then(function(txt){
      var arr=genPickNouns(parseJSONArray(txt));
      if(!arr||!arr.length){ el.innerHTML="<p style='color:var(--red);text-align:center;padding:40px;'>Error generando sustantivos. Intenta de nuevo.</p>"; return; }
      _genNouns=arr; _genIdx=0; _genRight=0; _genWrong=0; _genMissed=[]; _genDone=false;
      el.innerHTML="";
      hdr.appendChild(mk("p","","font-size:13px;color:var(--muted);margin-top:4px;font-weight:500;"));
      renderGenCard(el, hdr);
    }).catch(function(){
      _genNouns=genPickNouns([]); _genIdx=0; _genRight=0; _genWrong=0; _genMissed=[]; _genDone=false;
      el.innerHTML=""; renderGenCard(el, hdr);
    });
    return;
  }
  renderGenCard(el, hdr);
}
function renderGenCard(el, hdr){
  if(_genIdx>=_genNouns.length){ _genDone=true; el.innerHTML=""; renderGender(); return; }
  var n=_genNouns[_genIdx];
  el.innerHTML="";
  hdr.innerHTML="";
  hdr.appendChild(mk("p","ENTRENADOR DE GENERO","font-size:11px;color:var(--muted);letter-spacing:2px;font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","\ud83c\udfaf der \u00b7 die \u00b7 das","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  hdr.appendChild(mk("p",(_genIdx+1)+"/"+_genNouns.length+" \u00b7 Aciertos: "+_genRight+" \u00b7 Fallos: "+_genWrong,"font-size:13px;color:var(--teal-text);margin-top:4px;font-weight:600;"));
  el.appendChild(hdr);
  var card=document.createElement("div"); card.className="card";
  card.style.cssText="text-align:center;padding:32px 16px;margin-bottom:16px;border-radius:var(--r-xl,20px);background:linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01));";
  card.appendChild(mk("p","\u00bfQu\u00e9 art\u00edculo?","font-size:11px;color:var(--muted);letter-spacing:1.5px;font-weight:600;margin-bottom:12px;"));
  var nounEl=mk("p",n.noun,"font-size:36px;font-weight:900;color:var(--text);letter-spacing:-0.02em;margin-bottom:8px;line-height:1.15;");
  if(n.plural) nounEl.appendChild(mk("span"," ("+n.plural+")","font-size:14px;color:var(--muted);font-weight:500;"));
  card.appendChild(nounEl);
  if(n.meaning) card.appendChild(mk("p",n.meaning,"font-size:14px;color:var(--dim);font-weight:500;margin-bottom:16px;"));
  el.appendChild(card);
  var row=mk("div","","display:flex;gap:10px;justify-content:center;margin-bottom:16px;");
  var articles=[
    {art:"der", color:"#60a5fa", text:"var(--text2)", bg:"rgba(96,165,250,0.1)", border:"rgba(96,165,250,0.3)"},
    {art:"die", color:"#ffb4ab", text:"var(--red-text)", bg:"rgba(var(--red-rgb),0.1)", border:"rgba(var(--red-rgb),0.3)"},
    {art:"das", color:"#7bd89b", text:"var(--green-text)", bg:"rgba(var(--green-rgb),0.1)", border:"rgba(var(--green-rgb),0.3)"}
  ];
  articles.forEach(function(a){
    var btn=mk("button",a.art,"padding:16px 36px;border-radius:var(--r-lg,16px);border:2px solid "+a.border+";background:"+a.bg+";color:"+a.text+";font-size:24px;font-weight:900;cursor:pointer;text-align:center;transition:transform 0.12s, box-shadow 0.12s;font-variant-numeric:tabular-nums;");
    btn.style.textTransform="uppercase";
    btn.onmouseenter=function(){this.style.transform="scale(1.05)";this.style.boxShadow="0 0 24px "+a.color+"44";};
    btn.onmouseleave=function(){this.style.transform="";this.style.boxShadow="";};
    btn.onclick=function(){
      var correct=n.article===a.art;
      if(correct) _genRight++; else{ _genWrong++; _genMissed.push(n); }
      var fb=document.createElement("div"); fb.className="card";
      fb.style.cssText="text-align:center;padding:16px;margin-bottom:10px;border-radius:var(--r-lg,16px);background:"+(correct?"rgba(var(--green-rgb),0.08)":"rgba(var(--red-rgb),0.08)")+";border:1px solid "+(correct?"rgba(var(--green-rgb),0.2)":"rgba(var(--red-rgb),0.2)")+";animation:fadeUp 0.2s ease;";
      fb.appendChild(mk("p",correct?"\u2713 Correcto!":"\u2717 Incorrecto","font-size:16px;font-weight:800;color:"+(correct?"var(--green-text)":"var(--red-text)")+";margin-bottom:4px;"));
      fb.appendChild(mk("p","La respuesta correcta es: "+(n.article==="der"?"\ud83d\udd35":n.article==="die"?"\ud83d\udd34":"\ud83d\udfe2")+" "+n.article+" "+n.noun,"font-size:14px;color:var(--text);font-weight:500;"));
      el.removeChild(row);
      el.insertBefore(fb, el.firstChild.nextSibling.nextSibling);
      var nextBtn=mk("button","Siguiente →","width:100%;padding:12px;border-radius:12px;border:none;background:rgba(var(--purple-rgb),0.12);color:var(--purple-text);font-size:13px;font-weight:800;cursor:pointer;margin-top:6px;");
      nextBtn.onclick=function(){_genIdx++;renderGenCard(el,hdr);};
      el.insertBefore(nextBtn, el.lastChild.nextSibling);
    };
    row.appendChild(btn);
  });
  el.appendChild(row);
  var skip=mk("button","Saltar \u2192","background:transparent;border:none;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;display:block;margin:0 auto;");
  skip.onclick=function(){_genWrong++;_genMissed.push(n);_genIdx++;renderGenCard(el,hdr);};
  el.appendChild(skip);
}
function renderGenResults(el){
  el.innerHTML="";
  var hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","ENTRENADOR DE GENERO","font-size:11px;color:var(--muted);letter-spacing:2px;font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","\ud83c\udfaf Resultados","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  el.appendChild(hdr);
  if(_genMissed.length && !window._genLogged){
    window._genLogged=true;
    _genMissed.forEach(function(n){ logError("genero", n.noun, n.article+" "+n.noun, n.meaning ? "Significa: "+n.meaning : ""); });
  }
  var total=_genRight+_genWrong, pct=total>0?Math.round(_genRight/total*100):0;
  var scoreColor=pct>=80?"var(--green-text)":pct>=50?"var(--gold-text)":"var(--red-text)";
  var resultCard=document.createElement("div"); resultCard.className="card";
  resultCard.style.cssText="text-align:center;padding:28px;margin-bottom:16px;";
  resultCard.appendChild(mk("p",_genRight+"/"+total,"font-size:42px;font-weight:900;color:"+scoreColor+";line-height:1;font-variant-numeric:tabular-nums;"));
  resultCard.appendChild(mk("p","Aciertos","font-size:13px;color:var(--muted);font-weight:600;margin-top:4px;"));
  resultCard.appendChild(mk("p",pct+"%","font-size:14px;font-weight:700;color:"+scoreColor+";margin-top:2px;"));
  el.appendChild(resultCard);
  if(_genMissed.length){
    var missCard=document.createElement("div"); missCard.className="card";
    missCard.appendChild(mk("p","Para repasar","font-size:10px;color:var(--red-text);letter-spacing:1.5px;font-weight:700;margin-bottom:8px;"));
    _genMissed.forEach(function(n){
      var artColor=n.article==="der"?"var(--text2)":n.article==="die"?"var(--red-text)":"var(--green-text)";
      var row=mk("div","","display:flex;justify-content:space-between;align-items:center;padding:4px 0;");
      row.appendChild(mk("span",n.article+" "+n.noun+(n.plural?" ("+n.plural+")":""),"font-size:14px;font-weight:600;color:"+artColor+";"));
      var save=document.createElement("button");
      save.textContent="\u2B50 Guardar";
      save.style.cssText="background:rgba(var(--gold-rgb),0.1);border:1px solid rgba(var(--gold-rgb),0.3);color:var(--gold-text);border-radius:12px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;";
      save.onclick=function(){
        var ph=ensureSrsFields({de:n.article+" "+n.noun+(n.plural?" ("+n.plural+")":""),es:n.meaning||n.noun,tip:n.article,source:"genero"});
        if(!state.session.saved.some(function(x){return x.de===ph.de;})){state.session.saved.push(ph);updateBadge();syncUp();showToast("Guardada!","success");}
        save.disabled=true; save.style.opacity="0.4"; save.textContent="\u2713";
      };
      row.appendChild(save);
      missCard.appendChild(row);
    });
    el.appendChild(missCard);
  }
  var restart=mk("button","\u2190 Otros 10 sustantivos","width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:var(--text2);border-radius:12px;padding:12px;font-size:13px;font-weight:600;margin-top:12px;cursor:pointer;");
  restart.onclick=function(){_genNouns=null;_genDone=false;renderGender();};
  el.appendChild(restart);
}
