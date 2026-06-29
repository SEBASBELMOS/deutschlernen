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
  // ── Header with accent bar ──
  const hdr=mk("div","","margin-bottom:18px;position:relative;");
  const accent=mk("div","","width:48px;height:3px;border-radius:3px;background:var(--purple);margin-bottom:10px;");
  hdr.appendChild(accent);
  hdr.appendChild(mk("p","ENTRENADOR DE GÉNERO","font-size:10px;color:var(--dim);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
  hdr.appendChild(mk("h2","der · die · das","font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.03em;line-height:1.1;"));
  hdr.appendChild(mk("p","Adivina el artículo. Azul=der · Rojo=die · Verde=das.","font-size:13px;color:var(--muted);margin-top:5px;font-weight:500;line-height:1.4;"));
  el.appendChild(hdr);

  if(_genDone){ renderGenResults(el); return; }

  if(!_genNouns){
    el.appendChild(skelCard(6));
    ai('You are a German teacher. Generate 10 common German nouns at A2 level. Reply ONLY with valid JSON array, no markdown: [{"noun":"Tisch","article":"der","plural":"Tische","meaning":"mesa"}]. Avoid obscure words. Include 2-3 from each article group (der/die/das).',[],600).then(function(txt){
      var arr=genPickNouns(parseJSONArray(txt));
      if(!arr||!arr.length){ el.innerHTML="<p style='color:var(--red);text-align:center;padding:40px;'>Error generando sustantivos. Intenta de nuevo.</p>"; return; }
      _genNouns=arr; _genIdx=0; _genRight=0; _genWrong=0; _genMissed=[]; _genDone=false;
      el.innerHTML=""; renderGenCard(el, hdr);
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
  var accent=mk("div","","width:48px;height:3px;border-radius:3px;background:var(--purple);margin-bottom:10px;");
  hdr.appendChild(accent);
  hdr.appendChild(mk("p","ENTRENADOR DE GÉNERO","font-size:10px;color:var(--dim);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
  hdr.appendChild(mk("h2","der · die · das","font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.03em;line-height:1.1;"));
  // Progress metrics
  var prog=mk("div","","display:flex;gap:8px;margin-top:8px;");
  [
    {lbl:"Progreso",val:(_genIdx+1)+"/"+_genNouns.length,color:"var(--text2)"},
    {lbl:"Aciertos",val:_genRight,color:"var(--green-text)"},
    {lbl:"Fallos",val:_genWrong,color:"var(--red-text)"}
  ].forEach(function(m){
    var p=mk("div","","");
    p.appendChild(mk("span",String(m.val),"font-size:15px;font-weight:900;color:"+m.color+";font-variant-numeric:tabular-nums;"));
    p.appendChild(mk("span",m.lbl,"font-size:10px;color:var(--muted);font-weight:600;margin-left:6px;letter-spacing:1px;font-family:var(--font-label);"));
    prog.appendChild(p);
  });
  hdr.appendChild(prog);
  el.appendChild(hdr);

  // ── Noun display card ──
  var card=mk("div","","text-align:center;padding:36px 20px 28px;margin-bottom:18px;border-radius:var(--r-xl);background:linear-gradient(160deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01));border:1px solid var(--border);box-shadow:0 8px 32px rgba(0,0,0,0.18);");
  card.appendChild(mk("p","¿Qué artículo?","font-size:10px;color:var(--dim);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:14px;"));
  var nounEl=mk("p",n.noun,"font-size:42px;font-weight:900;color:var(--text);letter-spacing:-0.03em;margin-bottom:8px;line-height:1.1;");
  if(n.plural) nounEl.appendChild(mk("span"," ("+n.plural+")","font-size:15px;color:var(--muted);font-weight:500;"));
  card.appendChild(nounEl);
  if(n.meaning) card.appendChild(mk("p",n.meaning,"font-size:14px;color:var(--dim);font-weight:600;margin-bottom:4px;"));
  // Word type badge
  var badgeEmoji=n.article==="der"?"🔵":n.article==="die"?"🔴":"🟢";
  var badge=mk("span",badgeEmoji,"font-size:20px;margin-top:6px;display:inline-block;");
  card.appendChild(badge);
  el.appendChild(card);

  // ── Article buttons ──
  var row=mk("div","","display:flex;gap:12px;justify-content:center;margin-bottom:16px;");
  var articles=[
    {art:"der", color:"#60a5fa", textColor:"var(--text)", bg:"rgba(96,165,250,0.08)", border:"rgba(96,165,250,0.25)", emoji:"🔵"},
    {art:"die", color:"#ffb4ab", textColor:"var(--text)", bg:"rgba(var(--red-rgb),0.08)", border:"rgba(var(--red-rgb),0.25)", emoji:"🔴"},
    {art:"das", color:"#7bd89b", textColor:"var(--text)", bg:"rgba(var(--green-rgb),0.08)", border:"rgba(var(--green-rgb),0.25)", emoji:"🟢"}
  ];
  articles.forEach(function(a){
    var btn=mk("button","","flex:1;padding:20px 12px;border-radius:var(--r-lg);border:2px solid "+a.border+";background:"+a.bg+";color:"+a.textColor+";font-size:22px;font-weight:900;cursor:pointer;text-align:center;transition:all 0.15s;display:flex;flex-direction:column;align-items:center;gap:6px;min-height:90px;");
    var em=mk("span",a.emoji,"font-size:28px;line-height:1;");
    btn.appendChild(em);
    btn.appendChild(document.createTextNode(a.art));
    btn.onmouseenter=function(){this.style.transform="translateY(-2px)";this.style.boxShadow="0 8px 24px "+a.color+"33";this.style.borderColor=a.color+"99";};
    btn.onmouseleave=function(){this.style.transform="";this.style.boxShadow="";this.style.borderColor=a.border;};
    btn.onclick=function(){
      var correct=n.article===a.art;
      if(correct) _genRight++; else{ _genWrong++; _genMissed.push(n); }
      // Remove buttons, show feedback
      el.removeChild(row);
      // Highlight the correct answer
      var fb=mk("div","","text-align:center;padding:20px;margin-bottom:14px;border-radius:var(--r-lg);background:"+(correct?"rgba(var(--green-rgb),0.08)":"rgba(var(--red-rgb),0.08)")+";border:1px solid "+(correct?"rgba(var(--green-rgb),0.2)":"rgba(var(--red-rgb),0.2)")+";animation:fadeUp 0.2s ease;");
      fb.appendChild(mk("p",correct?"✓ ¡Correcto!":"✗ Es "+n.article,"font-size:18px;font-weight:900;color:"+(correct?"var(--green-text)":"var(--red-text)")+";margin-bottom:6px;"));
      fb.appendChild(mk("p","🔵".repeat(n.article==="der"?1:0)+"🔴".repeat(n.article==="die"?1:0)+"🟢".repeat(n.article==="das"?1:0)+" "+n.article+" "+n.noun+(n.meaning?" — "+n.meaning:""),"font-size:17px;color:var(--text);font-weight:700;line-height:1.4;"));
      el.insertBefore(fb, el.querySelector("div").nextSibling.nextSibling);
      var nextBtn=mk("button","Siguiente →","width:100%;padding:14px;border-radius:var(--r-md);border:none;background:var(--gold);color:#000;font-size:14px;font-weight:800;cursor:pointer;margin-top:8px;box-shadow:0 4px 16px rgba(var(--gold-rgb),0.3);");
      nextBtn.onclick=function(){_genIdx++;renderGenCard(el,hdr);};
      el.insertBefore(nextBtn, fb.nextSibling);
    };
    row.appendChild(btn);
  });
  el.appendChild(row);

  // ── Skip button ──
  var skip=mk("button","Saltar →","display:block;margin:0 auto;background:transparent;border:none;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;padding:6px 12px;border-radius:var(--r-md);transition:all 0.12s;");
  skip.onmouseenter=function(){this.style.background="rgba(255,255,255,0.04)";this.style.color="var(--text2)";};
  skip.onmouseleave=function(){this.style.background="transparent";this.style.color="var(--muted)";};
  skip.onclick=function(){_genWrong++;_genMissed.push(n);_genIdx++;renderGenCard(el,hdr);};
  el.appendChild(skip);
}
function renderGenResults(el){
  el.innerHTML="";
  var hdr=mk("div","","margin-bottom:18px;");
  var accent=mk("div","","width:48px;height:3px;border-radius:3px;background:var(--purple);margin-bottom:10px;");
  hdr.appendChild(accent);
  hdr.appendChild(mk("p","ENTRENADOR DE GÉNERO","font-size:10px;color:var(--dim);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
  hdr.appendChild(mk("h2","Resultados","font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.03em;line-height:1.1;"));
  el.appendChild(hdr);
  if(_genMissed.length && !window._genLogged){
    window._genLogged=true;
    _genMissed.forEach(function(n){ logError("genero", n.noun, n.article+" "+n.noun, n.meaning ? "Significa: "+n.meaning : ""); });
  }
  var total=_genRight+_genWrong, pct=total>0?Math.round(_genRight/total*100):0;
  var scoreColor=pct>=80?"var(--green-text)":pct>=50?"var(--gold-text)":"var(--red-text)";
  // ── Score circle ──
  var resultCard=mk("div","","text-align:center;padding:32px;margin-bottom:18px;border-radius:var(--r-xl);background:var(--surface);border:1px solid var(--border);box-shadow:0 4px 24px rgba(0,0,0,0.22);");
  // Big score
  var scoreWrap=mk("div","","display:inline-flex;align-items:center;justify-content:center;width:120px;height:120px;border-radius:50%;border:4px solid;margin-bottom:12px;");
  scoreWrap.style.borderColor=scoreColor;
  scoreWrap.style.background="rgba(255,255,255,0.03)";
  var scoreNum=mk("span",_genRight+"/"+total,"font-size:28px;font-weight:900;color:"+scoreColor+";font-variant-numeric:tabular-nums;line-height:1;");
  scoreWrap.appendChild(scoreNum);
  resultCard.appendChild(scoreWrap);
  resultCard.appendChild(mk("p",pct+"% acierto","font-size:15px;font-weight:700;color:"+scoreColor+";margin-top:4px;"));
  resultCard.appendChild(mk("p","de "+total+" sustantivos","font-size:12px;color:var(--muted);font-weight:600;margin-top:2px;"));
  el.appendChild(resultCard);

  if(_genMissed.length){
    var missCard=mk("div","","border-radius:var(--r-xl);padding:20px;margin-bottom:18px;background:var(--surface);border:1px solid var(--border);box-shadow:0 4px 24px rgba(0,0,0,0.22);");
    missCard.appendChild(mk("p","Para repasar","font-size:10px;color:var(--red-text);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:12px;"));
    _genMissed.forEach(function(n){
      var artColor=n.article==="der"?"var(--text2)":n.article==="die"?"var(--red-text)":"var(--green-text)";
      var row=mk("div","","display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);");
      row.appendChild(mk("span",n.article+" "+n.noun+(n.plural?" ("+n.plural+")":""),"font-size:14px;font-weight:700;color:"+artColor+";"));
      var save=mk("button","⭐","background:rgba(var(--gold-rgb),0.1);border:1px solid rgba(var(--gold-rgb),0.3);color:var(--gold-text);border-radius:var(--r-md);padding:6px 12px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.12s;");
      save.onmouseenter=function(){this.style.background="rgba(var(--gold-rgb),0.2)";};
      save.onmouseleave=function(){this.style.background="rgba(var(--gold-rgb),0.1)";};
      save.onclick=function(){
        var ph=ensureSrsFields({de:n.article+" "+n.noun+(n.plural?" ("+n.plural+")":""),es:n.meaning||n.noun,tip:n.article,source:"genero"});
        if(!state.session.saved.some(function(x){return x.de===ph.de;})){state.session.saved.push(ph);updateBadge();syncUp();showToast("Guardada!","success");}
        save.disabled=true; save.style.opacity="0.4"; save.textContent="✓";
      };
      row.appendChild(save);
      missCard.appendChild(row);
    });
    el.appendChild(missCard);
  }
  var restart=mk("button","← Otros 10 sustantivos","width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:var(--text2);border-radius:var(--r-md);padding:14px;font-size:14px;font-weight:700;margin-top:4px;cursor:pointer;transition:all 0.12s;");
  restart.onmouseenter=function(){this.style.background="rgba(255,255,255,0.08)";};
  restart.onmouseleave=function(){this.style.background="rgba(255,255,255,0.04)";};
  restart.onclick=function(){_genNouns=null;_genDone=false;renderGender();};
  el.appendChild(restart);
}
