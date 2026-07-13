// ── Gender (der/die/das trainer) ──────────────────────────────────────────────
// Ported from Fable's genero.html — 24 tech nouns with rules
// State: state.gender.{mode,deck,idx,correct,total,streak,feedback,done}

const GENDER_NOUNS = [
  {de:"Laptop",art:"der",es:"el portátil",rule:"Anglicismos de aparatos suelen ser DER (der Computer, der Monitor)."},
  {de:"API",art:"die",es:"la API",rule:"Siglas toman el género de la palabra base: die Schnittstelle → DIE API."},
  {de:"Deployment",art:"das",es:"el despliegue",rule:"Sustantivos en -ment son siempre DAS (das Management, das Deployment)."},
  {de:"Datenbank",art:"die",es:"la base de datos",rule:"La última palabra manda: die Bank → DIE Datenbank."},
  {de:"Server",art:"der",es:"el servidor",rule:"Sustantivos en -er (agente/aparato) casi siempre DER."},
  {de:"Update",art:"das",es:"la actualización",rule:"Anglicismos en -ate/-up suelen ser DAS (das Update, das Startup)."},
  {de:"Analyse",art:"die",es:"el análisis",rule:"Sustantivos en -e son ~90% DIE (die Analyse, die Tabelle)."},
  {de:"Code",art:"der",es:"el código",rule:"DER Code — se alinea con der Kodex. Memorizalo como excepción útil."},
  {de:"Datei",art:"die",es:"el archivo",rule:"Terminación -ei es siempre DIE (die Datei, die Bäckerei)."},
  {de:"Passwort",art:"das",es:"la contraseña",rule:"La última palabra manda: das Wort → DAS Passwort."},
  {de:"Bildschirm",art:"der",es:"la pantalla",rule:"Der Schirm (paraguas/pantalla) → DER Bildschirm."},
  {de:"Anwendung",art:"die",es:"la aplicación",rule:"Palabras en -ung son SIEMPRE DIE. Sin excepciones."},
  {de:"Netzwerk",art:"das",es:"la red",rule:"Das Werk → DAS Netzwerk. La última palabra manda."},
  {de:"Fehler",art:"der",es:"el error / bug",rule:"Sustantivos en -er casi siempre DER (der Fehler, der Rechner)."},
  {de:"Tastatur",art:"die",es:"el teclado",rule:"Terminación -ur es casi siempre DIE (die Tastatur, die Natur)."},
  {de:"Backup",art:"das",es:"la copia de seguridad",rule:"Anglicismos con -up son DAS (das Backup, das Setup)."},
  {de:"Speicher",art:"der",es:"la memoria / almacenamiento",rule:"-er de aparato/agente → DER Speicher."},
  {de:"Sicherheit",art:"die",es:"la seguridad",rule:"Palabras en -heit / -keit son SIEMPRE DIE."},
  {de:"Betriebssystem",art:"das",es:"el sistema operativo",rule:"Das System → DAS Betriebssystem. La última palabra manda."},
  {de:"Browser",art:"der",es:"el navegador",rule:"Aparato en -er → DER Browser."},
  {de:"Schnittstelle",art:"die",es:"la interfaz",rule:"Die Stelle → DIE Schnittstelle. Además termina en -e."},
  {de:"Dashboard",art:"das",es:"el dashboard",rule:"Das Brett (tabla) → los -board ingleses se tratan como DAS."},
  {de:"Algorithmus",art:"der",es:"el algoritmo",rule:"Terminación -us (grecolatina) es casi siempre DER."},
  {de:"Automatisierung",art:"die",es:"la automatización",rule:"-ung es SIEMPRE DIE. Tu palabra n8n favorita 😉."}
];

(function(){
  var _kbBound = false;

  function shuffleGender(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

  function cssVar(name){return getComputedStyle(document.documentElement).getPropertyValue("--"+name).trim();}

  function genderText(s){
    var d=document.createElement("div");
    d.textContent=String(s==null?"":s);
    return d.innerHTML;
  }

  function ensureGenderState(){
    if(!state.gender) state.gender={};
    var g=state.gender;
    if(!g.mode) g.mode="ronda";
    if(!Array.isArray(g.deck)) g.deck=[];
    if(typeof g.idx!=="number") g.idx=0;
    if(typeof g.correct!=="number") g.correct=0;
    if(typeof g.total!=="number") g.total=0;
    if(typeof g.streak!=="number") g.streak=0;
    if(typeof g.locked!=="boolean") g.locked=false;
    if(g.feedback===undefined) g.feedback=null;
    if(typeof g.done!=="boolean") g.done=false;
    return g;
  }

  function currentNoun(g){return g.deck[g.idx % g.deck.length];}

  function paintScore(g){
    var sc=document.getElementById("geno-score");if(sc)sc.textContent=g.correct+" / "+g.total;
    var st=document.getElementById("geno-streak");if(st)st.textContent=g.streak;
  }

  function burst(btn){
    var stage=document.getElementById("geno-stage");if(!stage||!btn)return;
    var colors=["#F5A623","#4ade80","#4ECDC4","#A78BFA"];
    var r=btn.getBoundingClientRect(),s=stage.getBoundingClientRect();
    for(var i=0;i<14;i++){
      var p=document.createElement("span");p.className="geno-particle";
      p.style.background=colors[i%colors.length];
      p.style.left=(r.left-s.left+r.width/2)+"px";
      p.style.top=(s.height-6)+"px";
      var ang=Math.PI*(0.15+0.7*Math.random()),d=50+70*Math.random();
      p.style.setProperty("--dx",(Math.cos(ang)*d*(Math.random()<.5?-1:1))+"px");
      p.style.setProperty("--dy",(-Math.sin(ang)*d-40)+"px");
      stage.appendChild(p);setTimeout(function(){p.remove();},750);
    }
  }

  window.answerGender=function(art){
    var g=ensureGenderState();if(g.locked)return;
    g.locked=true;g.total++;
    if(typeof logActivity==="function"){logActivity("drillsDone",1);} if(typeof syncUp==="function"){syncUp();}
    var n=currentNoun(g),ok=art===n.art;
    var chosen=document.getElementById("geno-b-"+art),rightBtn=document.getElementById("geno-b-"+n.art);
    var stage=document.getElementById("geno-stage");
    ["der","die","das"].forEach(function(a){var b=document.getElementById("geno-b-"+a);if(b)b.disabled=true;});
    if(ok){
      g.correct++;g.streak++;
      if(chosen)chosen.classList.add("geno-right");
      if(stage)stage.classList.add("geno-hit");
      burst(chosen);
      var flame=document.getElementById("geno-flame");if(flame){flame.classList.add("geno-grow");setTimeout(function(){flame.classList.remove("geno-grow");},300);}
      paintScore(g);
      g.idx++;g.feedback=null;
      if(g.mode==="ronda"&&g.total>=20){g.done=true;renderGender();return;}
      if(g.idx%g.deck.length===0)g.deck=shuffleGender(GENDER_NOUNS);
      setTimeout(function(){renderGender();},600);
    }else{
      g.streak=0;g.feedback={de:n.de,art:n.art,rule:n.rule,chosen:art};
      if(chosen)chosen.classList.add("geno-wrong");
      if(rightBtn)rightBtn.classList.add("geno-right");
      if(stage)stage.classList.add("geno-miss");
      paintScore(g);
      // Feed the error journal so misses resurface in the error-review session
      if(state.session && Array.isArray(state.session.errorJournal)){
        state.session.errorJournal.push({
          date:todayKey(), type:"grammar", source:"genero", original:n.de,
          correction:n.art+" "+n.de, tip:n.rule
        });
        if(state.session.errorJournal.length>50) state.session.errorJournal=state.session.errorJournal.slice(-50);
      }
      var rule=document.getElementById("geno-rule"),ruleTxt=document.getElementById("geno-ruletxt");
      var nextBtn=document.getElementById("geno-next");
      if(ruleTxt)ruleTxt.innerHTML='<span style="font-weight:900;color:'+cssVar(n.art)+'">'+genderText(n.art.toUpperCase()+" "+n.de)+"</span> — "+genderText(n.rule);
      if(rule)rule.style.display="block";
      if(nextBtn)nextBtn.style.display="block";
    }
  };

  window.nextGender=function(){
    var g=ensureGenderState();
    if(g.mode==="ronda"&&g.total>=20){g.done=true;renderGender();return;}
    g.idx++;g.locked=false;g.feedback=null;
    if(g.idx%g.deck.length===0)g.deck=shuffleGender(GENDER_NOUNS);
    renderGender();
  };

  window.restartGender=function(){
    var g=ensureGenderState();
    g.deck=shuffleGender(GENDER_NOUNS);g.idx=0;g.correct=0;g.total=0;g.streak=0;
    g.locked=false;g.feedback=null;g.done=false;
    renderGender();
  };

  window.renderGender=function(){
    // Keyboard binding — once
    if(!_kbBound){_kbBound=true;
      document.addEventListener("keydown",function(e){
        var g=ensureGenderState();if(g.done)return;
        var screen=document.getElementById("s-genero");
        if(!screen||!screen.classList.contains("active"))return;
        if(e.key==="1")answerGender("der");
        else if(e.key==="2")answerGender("die");
        else if(e.key==="3")answerGender("das");
        else if(e.key==="Enter"&&g.locked&&g.feedback)nextGender();
      });
    }

    var g=ensureGenderState(),el=document.getElementById("s-genero");el.innerHTML="";
    // 💡 Static gender-rules overlay (curated, no AI)
    var ruleRow=mk("div","","display:flex;justify-content:flex-end;margin-bottom:8px;");
    var ruleBtn=mk("button","💡 Reglas de género","padding:8px 14px;border-radius:12px;border:1px dashed rgba(var(--purple-rgb),0.45);background:rgba(var(--purple-rgb),0.08);color:var(--purple-text,var(--purple));font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;transition:background .15s;");
    ruleBtn.setAttribute("aria-haspopup","dialog");
    ruleBtn.onclick=function(){genderRulesOverlay();};
    ruleRow.appendChild(ruleBtn);
    el.appendChild(ruleRow);
    if(g.done){renderGenderResult(el,g);return;}
    if(!g.deck.length){g.deck=shuffleGender(GENDER_NOUNS);g.idx=0;g.correct=0;g.total=0;g.streak=0;}

    var n=currentNoun(g),showFb=g.feedback!==null,isRonda=g.mode==="ronda";
    if(!showFb) g.locked=false;
    var dispNoun=showFb?{de:g.feedback.de,es:(GENDER_NOUNS.find(function(x){return x.de===g.feedback.de;})||{}).es||""}:{de:n.de,es:n.es||""};

    // ── Header ──
    var hdr=mk("div","","margin-bottom:18px;");
    hdr.appendChild(mk("p","Drill · Artículos","font-size:10px;letter-spacing:2.5px;font-weight:700;color:var(--muted);text-transform:uppercase;font-family:var(--font-label);"));
    hdr.appendChild(mk("h2","der · die · das","font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.03em;margin-top:2px;line-height:1.1;"));
    el.appendChild(hdr);

    // ── Mode toggle ──
    var modeRow=mk("div","","display:flex;gap:6px;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:4px;margin-bottom:16px;");
    var rondaBtn=mk("button","🎯 Ronda (20)","flex:1;padding:9px;border-radius:10px;border:none;cursor:pointer;font-size:13px;font-weight:700;transition:background .2s,color .2s;"+(isRonda?"background:var(--gold);color:#000;box-shadow:0 2px 12px rgba(245,166,35,.3);":"background:transparent;color:var(--muted);"));
    rondaBtn.onclick=function(){g.mode="ronda";restartGender();};
    modeRow.appendChild(rondaBtn);
    var infBtn=mk("button","♾️ Infinito","flex:1;padding:9px;border-radius:10px;border:none;cursor:pointer;font-size:13px;font-weight:700;transition:background .2s,color .2s;"+(!isRonda?"background:var(--gold);color:#000;box-shadow:0 2px 12px rgba(245,166,35,.3);":"background:transparent;color:var(--muted);"));
    infBtn.onclick=function(){g.mode="inf";restartGender();};
    modeRow.appendChild(infBtn);
    el.appendChild(modeRow);

    // ── Score bar ──
    var sb=mk("div","","display:flex;gap:10px;margin-bottom:18px;");
    var scChip=mk("div","","flex:1;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:10px 14px;");
    scChip.appendChild(mk("p","Aciertos","font-size:9px;letter-spacing:2px;font-weight:700;color:var(--muted);text-transform:uppercase;font-family:var(--font-label);"));
    scChip.appendChild(mk("p",g.correct+" / "+g.total,"font-size:20px;font-weight:900;letter-spacing:-0.02em;margin-top:2px;color:var(--green-text);"));
    scChip.lastChild.id="geno-score";
    sb.appendChild(scChip);
    var stChip=mk("div","","flex:1;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:10px 14px;");
    stChip.appendChild(mk("p","Racha","font-size:9px;letter-spacing:2px;font-weight:700;color:var(--muted);text-transform:uppercase;font-family:var(--font-label);"));
    var stVal=mk("p","","font-size:20px;font-weight:900;letter-spacing:-0.02em;margin-top:2px;color:var(--gold-text);");
    var flame=mk("span","🔥","display:inline-block;transition:transform .25s cubic-bezier(.34,1.56,.64,1);");
    flame.id="geno-flame";
    stVal.appendChild(flame);
    stVal.appendChild(document.createTextNode(" "));
    var streakEl=mk("span",String(g.streak),"");
    streakEl.id="geno-streak";
    stVal.appendChild(streakEl);
    stChip.appendChild(stVal);
    sb.appendChild(stChip);
    el.appendChild(sb);

    // ── Stage (noun card) ──
    var stage=mk("div","","position:relative;background:var(--surface);border:1px solid var(--border);border-radius:22px;padding:44px 20px 36px;text-align:center;margin-bottom:16px;overflow:hidden;transition:border-color .25s,box-shadow .25s;");
    stage.id="geno-stage";
    var qc=mk("span","","position:absolute;top:14px;right:16px;font-size:11px;font-weight:800;color:var(--dim);");
    qc.id="geno-qcount";qc.textContent=isRonda?(g.total+1)+" / 20":"∞";stage.appendChild(qc);
    stage.appendChild(mk("p",dispNoun.de,"font-size:44px;font-weight:900;letter-spacing:-0.04em;line-height:1.05;color:var(--text);"));
    if(dispNoun.es)stage.appendChild(mk("p",dispNoun.es,"font-size:13px;font-weight:600;color:var(--muted);margin-top:8px;"));
    el.appendChild(stage);

    // ── Article buttons ──
    var artRow=mk("div","","display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;");
    var arts=[
      {art:"der",label:"DER",sub:"MASC."},
      {art:"die",label:"DIE",sub:"FEM."},
      {art:"das",label:"DAS",sub:"NEUT."}
    ];
    arts.forEach(function(a){
      var c=cssVar(a.art),cr=cssVar(a.art+"-rgb");
      var btn=mk("button","","padding:22px 0 18px;border-radius:18px;font-size:22px;font-weight:900;letter-spacing:.02em;color:"+c+";border:1px solid rgba("+cr+",.45);background:linear-gradient(160deg,rgba("+cr+",.24),rgba("+cr+",.08));cursor:pointer;transition:transform .1s,filter .15s,opacity .2s;position:relative;");
      btn.id="geno-b-"+a.art;
      btn.appendChild(document.createTextNode(a.label));
      btn.appendChild(mk("small",a.sub,"display:block;font-size:9px;font-weight:700;letter-spacing:2px;opacity:.75;margin-top:3px;"));
      btn.onclick=function(){answerGender(a.art);};
      if(showFb){btn.disabled=true;if(a.art===g.feedback.art)btn.classList.add("geno-right");if(a.art===g.feedback.chosen)btn.classList.add("geno-wrong");}
      artRow.appendChild(btn);
    });
    el.appendChild(artRow);

    // ── Rule card ──
    var rule=mk("div","","background:linear-gradient(135deg,rgba(245,166,35,.1),rgba(245,166,35,.02));border:1px solid rgba(245,166,35,.3);border-radius:16px;padding:14px 16px;margin-bottom:14px;"+(showFb?"display:block;":"display:none;"));
    rule.id="geno-rule";
    rule.appendChild(mk("p","Regla","font-size:9px;letter-spacing:2.5px;font-weight:800;color:var(--gold);text-transform:uppercase;font-family:var(--font-label);margin-bottom:5px;"));
    var ruleTxt=mk("p","","font-size:13.5px;font-weight:600;line-height:1.5;color:var(--text);");
    ruleTxt.id="geno-ruletxt";
    if(showFb)ruleTxt.innerHTML='<span style="font-weight:900;color:'+cssVar(g.feedback.art)+'">'+genderText(g.feedback.art.toUpperCase()+" "+g.feedback.de)+"</span> — "+genderText(g.feedback.rule);
    rule.appendChild(ruleTxt);
    el.appendChild(rule);

    // ── Next button ──
    var nextBtn=mk("button","Siguiente →","width:100%;padding:15px;border-radius:16px;background:var(--gold);color:#000;font-size:15px;font-weight:900;border:none;cursor:pointer;"+(showFb?"display:block;":"display:none;"));
    nextBtn.id="geno-next";nextBtn.onclick=function(){nextGender();};
    el.appendChild(nextBtn);

    // Apply feedback visual state on stage
    if(showFb){stage.classList.add("geno-miss");}
  };

  function renderGenderResult(el,g){
    var pct=g.total>0?Math.round(g.correct/g.total*100):0;
    var emoji=pct>=90?"🏆":pct>=70?"💪":pct>=50?"📈":"🌱";
    var title=pct>=90?"¡Sehr gut!":pct>=70?"¡Buen ritmo!":"Sigue puliendo";

    var hdr=mk("div","","margin-bottom:18px;");
    hdr.appendChild(mk("p","Drill · Artículos","font-size:10px;letter-spacing:2.5px;font-weight:700;color:var(--muted);text-transform:uppercase;font-family:var(--font-label);"));
    hdr.appendChild(mk("h2","Resultados","font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.03em;margin-top:2px;line-height:1.1;"));
    el.appendChild(hdr);

    var res=mk("div","","text-align:center;padding:40px 10px;");
    res.appendChild(mk("p",emoji,"font-size:56px;"));
    res.appendChild(mk("h2",title,"font-size:26px;font-weight:900;margin:10px 0 4px;color:var(--text);"));
    var sub=mk("p","","color:var(--muted);font-size:14px;font-weight:600;margin-bottom:22px;");
    sub.innerHTML=g.correct+" de "+g.total+" correctas · <span style='color:var(--gold);'>"+pct+"%</span>";
    res.appendChild(sub);
    var btn=mk("button","🎯 Otra ronda","width:100%;padding:15px;border-radius:16px;background:var(--gold);color:#000;font-size:15px;font-weight:900;border:none;cursor:pointer;");
    btn.onclick=function(){restartGender();};
    res.appendChild(btn);
    el.appendChild(res);
  }
})();

// ── Gender rules overlay (curated mnemonics, static content) ──────────────────
function genderRulesOverlay(){
  var overlay=mk("div","","position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0.62);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto;opacity:0;transition:opacity .18s ease;");
  var card=mk("div","","background:var(--surface);border:1px solid rgba(var(--purple-rgb),0.35);border-radius:20px;padding:20px;width:100%;max-width:480px;margin:16px 0;box-shadow:0 16px 48px rgba(0,0,0,0.55);transform:scale(.97);transition:transform .18s cubic-bezier(.16,1,.3,1);");
  card.setAttribute("role","dialog"); card.setAttribute("aria-modal","true"); card.setAttribute("aria-label","Reglas de género en alemán");
  var top=mk("div","","display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;");
  top.appendChild(mk("p","🔤 Reglas de género","font-size:16px;font-weight:900;color:var(--text);letter-spacing:-0.01em;"));
  var closeBtn=mk("button","✕","width:32px;height:32px;border-radius:10px;border:none;background:rgba(255,255,255,0.06);color:var(--muted);font-size:15px;cursor:pointer;font-family:inherit;");
  closeBtn.setAttribute("aria-label","Cerrar");
  top.appendChild(closeBtn);
  card.appendChild(top);
  function section(color,rgb,title,items,ej){
    var s=mk("div","","border-radius:13px;padding:12px 14px;margin-bottom:9px;background:rgba("+rgb+",0.06);border:1px solid rgba("+rgb+",0.22);");
    s.appendChild(mk("p",title,"font-size:12.5px;font-weight:900;color:"+color+";margin-bottom:6px;letter-spacing:0.3px;"));
    items.forEach(function(it){ s.appendChild(mk("p","• "+it,"font-size:12px;color:var(--text2);font-weight:500;line-height:1.55;")); });
    s.appendChild(mk("p","Ej: "+ej,"font-size:11.5px;color:var(--muted);font-weight:600;margin-top:5px;font-style:italic;"));
    return s;
  }
  card.appendChild(section("var(--teal)","var(--teal-rgb)","DER (masculino) — la mayoría de:",
    ["Sustantivos en -er, -el, -en, -ig, -ich, -ling, -ismus","Días, meses, estaciones, puntos cardinales","Marcas de auto, bebidas alcohólicas"],
    "der Computer, der Montag, der Norden"));
  card.appendChild(section("var(--red)","var(--red-rgb)","DIE (femenino) — casi siempre:",
    ["Sustantivos en -ung, -heit, -keit, -schaft, -tion, -ie, -ei, -ik, -ur, -tät, -enz","Números usados como sustantivo (die Eins)"],
    "die Zeitung, die Freiheit, die Universität, die Bäckerei"));
  card.appendChild(section("var(--green)","var(--green-rgb)","DAS (neutro) — generalmente:",
    ["Sustantivos en -chen, -lein (diminutivos)","Sustantivos en -ment, -tum, -um","Infinitivos usados como sustantivo (das Essen)","Colores usados como sustantivo"],
    "das Mädchen, das Instrument, das Lesen"));
  var trick=mk("div","","border-radius:13px;padding:12px 14px;background:rgba(var(--gold-rgb),0.08);border:1px solid rgba(var(--gold-rgb),0.3);font-size:12px;line-height:1.6;font-weight:600;color:var(--text);");
  trick.innerHTML="⚠️ <b>TRUCO:</b> la última palabra manda en compuestos.<br>die Bank + der Automat = <b style='color:var(--teal)'>DER</b> Bankautomat (no DIE).";
  card.appendChild(trick);
  overlay.appendChild(card);
  function close(){ overlay.style.opacity="0"; card.style.transform="scale(.97)";
    document.removeEventListener("keydown",onKey);
    setTimeout(function(){ if(overlay.parentNode) overlay.parentNode.removeChild(overlay); },180); }
  function onKey(e){ if(e.key==="Escape") close(); }
  overlay.onclick=function(e){ if(e.target===overlay) close(); };
  closeBtn.onclick=close;
  document.addEventListener("keydown",onKey);
  document.body.appendChild(overlay);
  requestAnimationFrame(function(){ overlay.style.opacity="1"; card.style.transform="scale(1)"; });
  closeBtn.focus();
}
