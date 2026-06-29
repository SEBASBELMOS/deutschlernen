// ── Cases (4-case trainer: Nom/Akk/Dat/Gen) ───────────────────────────────────
function casesCaseForQuestion(q){
  if(q.caso) return q.caso;
  var src=(q.de||q.sentence||q.why||"");
  var m=src.match(/c-(nom|akk|dat|gen)|\b(Nominativ|Akkusativ|Dativ|Genitiv)\b/i);
  if(!m) return "";
  if(m[1]) return m[1];
  return {nominativ:"nom",akkusativ:"akk",dativ:"dat",genitiv:"gen"}[m[2].toLowerCase()]||"";
}
function casesFailureTip(q){
  var cs=casesCaseForQuestion(q);
  if(!cs || !CASES_TIPS[cs]) return "";
  if(state.cases.casesWrongStreak>=2 || (state.cases.casesCaseMisses[cs]||0)>=2) return CASES_TIPS[cs];
  return "";
}

function renderCases() {
  const el=document.getElementById("s-casos"); el.innerHTML="";
  // ── Header with accent bar ──
  const hdr=mk("div","","margin-bottom:18px;position:relative;");
  const accent=mk("div","","width:48px;height:3px;border-radius:3px;background:var(--gold);margin-bottom:10px;");
  hdr.appendChild(accent);
  hdr.appendChild(mk("p","ALEMÁN · LOS 4 CASOS","font-size:10px;color:var(--dim);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
  hdr.appendChild(mk("h2","Casos","font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.03em;line-height:1.1;"));
  hdr.appendChild(mk("p","El color es la función. Apréndete el color, no la regla.","font-size:13px;color:var(--muted);margin-top:5px;font-weight:500;line-height:1.4;"));
  el.appendChild(hdr);

  // ── Legend cards ──
  const legend=mk("div","","display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px;");
  [
    {c:"nom",t:"Nominativ",s:"el que ACTÚA · ¿quién?"},
    {c:"akk",t:"Akkusativ",s:"RECIBE la acción · ¿qué?"},
    {c:"dat",t:"Dativ",s:"a/para quién · prep. Dativ"},
    {c:"gen",t:"Genitiv",s:"de quién · de qué"}
  ].forEach(function(l){
    var d=mk("div","","border-radius:var(--r-lg);padding:14px;border:1px solid;border-top-width:4px;border-top-color:var(--"+l.c+");border-color:var(--"+l.c+"-line);background:linear-gradient(160deg,var(--"+l.c+"-bg),rgba(255,255,255,0.02));");
    d.appendChild(mk("b",l.t,"font-size:14px;font-weight:800;color:var(--"+l.c+");display:block;margin-bottom:3px;"));
    d.appendChild(mk("span",l.s,"font-size:11px;color:var(--muted);line-height:1.35;display:block;"));
    legend.appendChild(d);
  });
  el.appendChild(legend);

  // ── Subtabs ──
  var sub=mk("div","","display:flex;gap:8px;margin-bottom:16px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;");
  [
    {id:"identificar",lbl:"1 · Identificar"},
    {id:"transformar",lbl:"2 · Transformar"},
    {id:"reglas",lbl:"3 · Reglas"},
    {id:"practicar",lbl:"4 · Practicar"}
  ].forEach(function(s){
    var b=mk("button",s.lbl,"flex:0 0 auto;font-size:12px;font-weight:700;padding:9px 15px;border-radius:var(--r-pill);border:1.5px solid var(--border);background:rgba(255,255,255,0.03);color:var(--muted);white-space:nowrap;transition:all 0.18s;");
    if(state.cases.casesSubtab===s.id){
      b.style.background="var(--text)";b.style.color="var(--bg)";b.style.borderColor="var(--text)";b.style.fontWeight="800";
    }
    b.onclick=function(){state.cases.casesSubtab=s.id;renderCases();};
    sub.appendChild(b);
  });
  el.appendChild(sub);

  var body=mk("div","",""); el.appendChild(body);
  if(state.cases.casesSubtab==="identificar") casesIdentify(body);
  else if(state.cases.casesSubtab==="transformar") casesTransform(body);
  else if(state.cases.casesSubtab==="reglas") casesRules(body);
  else if(state.cases.casesSubtab==="practicar") casesPractice(body);
}

function casesIdentify(host){
  var c1=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:20px;margin-bottom:14px;box-shadow:0 4px 24px rgba(0,0,0,0.22);");
  c1.appendChild(mk("h3","¿Qué caso es? En 3 preguntas","font-size:17px;font-weight:800;color:var(--text);margin-bottom:4px;letter-spacing:-0.02em;"));
  c1.appendChild(mk("p","Hazlas en orden. La primera que diga \"sí\" gana.","font-size:13px;color:var(--muted);margin-bottom:16px;font-weight:500;line-height:1.4;"));
  c1.innerHTML += '<div class="cs-step" style="border-left-color:var(--dat);"><div class="q">① ¿Hay una preposición antes? (mit, für, an, in, von, wegen…)</div><div class="a">Sí → <b>la preposición manda el caso</b>. Ni mires el verbo. Ve a "Reglas".</div></div>'
    + '<div class="cs-arrow">▼ si no hay preposición ▼</div>'
    + '<div class="cs-step" style="border-left-color:var(--nom);"><div class="q">② ¿Es el que hace la acción? (el sujeto)</div><div class="a"><span class="cs-tag nom">Nominativ</span> — el típico der/die/das de diccionario.</div></div>'
    + '<div class="cs-arrow">▼ si no ▼</div>'
    + '<div class="cs-step" style="border-left-color:var(--akk);"><div class="q">③ ¿Qué o a quién recibe directamente la acción?</div><div class="a"><span class="cs-tag akk">Akkusativ</span> — el objeto directo. Aquí <b>solo</b> el masculino cambia: der → <b>den</b>.</div></div>'
    + '<div class="cs-arrow">▼ si le doy / digo / ayudo A alguien ▼</div>'
    + '<div class="cs-step" style="border-left-color:var(--dat);"><div class="q">④ ¿A quién / para quién? (segundo objeto)</div><div class="a"><span class="cs-tag dat">Dativ</span> — receptor. Verbos clave: helfen, danken, geben, erklären, gehören.</div></div>'
    + '<div class="cs-arrow">▼ si es "de quién / de qué" ▼</div>'
    + '<div class="cs-step" style="border-left-color:var(--gen);"><div class="q">⑤ ¿De quién es / parte de qué?</div><div class="a"><span class="cs-tag gen">Genitiv</span> — posesión. "el inicio <b>del</b> video".</div></div>';
  host.appendChild(c1);

  var c2=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:20px;box-shadow:0 4px 24px rgba(0,0,0,0.22);");
  c2.appendChild(mk("h3","El truco del masculino","font-size:17px;font-weight:800;color:var(--text);margin-bottom:4px;letter-spacing:-0.02em;"));
  c2.appendChild(mk("p","El femenino y el neutro casi no se mueven. Tu energía va al masculino:","font-size:13px;color:var(--muted);margin-bottom:14px;font-weight:500;line-height:1.5;"));
  c2.appendChild(mk("p","der → den → dem → des","font-size:26px;font-weight:900;letter-spacing:0.03em;margin-bottom:16px;background:linear-gradient(90deg,var(--nom),var(--akk),var(--dat),var(--gen));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;"));
  var examples=mk("div","","border-left:3px solid var(--border);padding-left:14px;");
  [
    {a:"Der",c:"nom",d:"Der Laptop ist neu.",e:"— ¿quién es nuevo? Nominativ."},
    {a:"den",c:"akk",d:"Ich benutze den Laptop.",e:"— recibe la acción. Akkusativ."},
    {a:"dem",c:"dat",d:"Ich arbeite mit dem Laptop.",e:"— \"mit\" manda Dativ."},
    {a:"des",c:"gen",d:"Die Tastatur des Laptops ist gut.",e:"— ¿de quién? Genitiv (+s)."}
  ].forEach(function(x){
    var row=mk("div","","margin:7px 0;font-size:14px;color:var(--text2);line-height:1.5;");
    var colored=row.innerHTML='<span style="color:var(--'+x.c+');font-weight:800;">'+x.a+'</span> '+x.d.replace(x.a+' ','')+' <span style="color:var(--muted);font-size:12px;">'+x.e+'</span>';
    examples.appendChild(row);
  });
  c2.appendChild(examples);
  host.appendChild(c2);
}

function casesTransform(host){
  var c=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:20px;margin-bottom:14px;box-shadow:0 4px 24px rgba(0,0,0,0.22);");
  c.appendChild(mk("h3","Transformador de artículos","font-size:17px;font-weight:800;color:var(--text);margin-bottom:4px;letter-spacing:-0.02em;"));
  c.appendChild(mk("p","Elige una palabra de tu mundo y el tipo de artículo. Ves los 4 casos al instante con su color.","font-size:13px;color:var(--muted);margin-bottom:16px;font-weight:500;line-height:1.5;"));

  var sel=document.createElement("select"); sel.className="cs-select"; sel.style.marginBottom="12px";
  CASES_NOUNS.forEach(function(n,i){
    var art=n.gen==='m'?'der':n.gen==='f'?'die':'das';
    var o=document.createElement("option"); o.value=i; o.textContent=art+" "+n.f[0]+" — "+n.es;
    if(i===state.cases.casesNounIdx) o.selected=true;
    sel.appendChild(o);
  });
  sel.onchange=function(){state.cases.casesNounIdx=+this.value;paintCasesTable(out,note);};
  c.appendChild(sel);

  var seg=mk("div","","display:inline-flex;border:1px solid var(--border);border-radius:var(--r-md);overflow:hidden;margin-bottom:12px;");
  [["der","der/die/das"],["ein","ein"],["mein","mein"]].forEach(function(a){
    var b=mk("button",a[1],"font-size:13px;font-weight:700;padding:10px 16px;border:0;background:transparent;color:var(--muted);transition:all 0.15s;");
    if(state.cases.casesArt===a[0]){b.style.background="var(--text)";b.style.color="var(--bg)";b.style.fontWeight="800";}
    b.onclick=function(){state.cases.casesArt=a[0];paintCasesTable(out,note);};
    seg.appendChild(b);
  });
  c.appendChild(seg);

  var note=mk("p","","font-size:12px;color:var(--muted);margin-bottom:12px;font-weight:600;"); c.appendChild(note);
  var out=mk("div","",""); out.className="cs-tcase"; c.appendChild(out);
  c.appendChild(mk("p","Las frases molde siempre son correctas: sehen obliga Akkusativ, mit obliga Dativ, \"die Idee…\" obliga Genitiv.","font-size:12px;color:var(--dim);margin-top:14px;font-weight:500;line-height:1.5;"));
  host.appendChild(c);
  paintCasesTable(out,note);
}

function paintCasesTable(out, note){
  var n=CASES_NOUNS[state.cases.casesNounIdx];
  var arts=CASES_ART[state.cases.casesArt][n.gen];
  var genName={m:'masculino',f:'femenino',n:'neutro'}[n.gen];
  note.innerHTML="Género: <b style='color:var(--text2)'>"+genName+"</b>"
    +(n.weak?" · ojo, sustantivo débil (-n en Akk/Dat/Gen)":"")
    +(n.gen==='f'?" · el femenino casi no cambia":"");
  var frames=[
    function(a){return {de:cap(a)+" "+n.f[0]+" ist hier.", es:capEs(n.es)+" está aquí."};},
    function(a){return {de:"Ich sehe "+a+" "+n.f[1]+".", es:"Veo "+n.es+"."};},
    function(a){return {de:"Ich arbeite mit "+a+" "+n.f[2]+".", es:"Trabajo con "+n.es+"."};},
    function(a){return {de:"die Idee "+a+" "+n.f[3], es:"la idea de "+n.es};}
  ];
  out.innerHTML="";
  CASES_CASES.forEach(function(cs,i){
    var fr=frames[i](arts[i]);
    var row=mk("div","","display:grid;grid-template-columns:auto 1fr;border-bottom:1px solid var(--border);");
    if(i===3) row.style.borderBottom="none";
    var lbl=mk("div","","font-size:11px;font-weight:800;padding:14px 14px;display:flex;align-items:center;gap:8px;background:var(--"+cs.cls+"-bg);color:var(--"+cs.cls+");");
    var dot=mk("span","","width:8px;height:8px;border-radius:50%;background:"+cs.dot+";display:inline-block;");
    lbl.appendChild(dot);
    lbl.appendChild(document.createTextNode(cs.name));
    row.appendChild(lbl);
    var val=mk("div","","padding:14px;border-left:1px solid var(--border);");
    val.appendChild(mk("div",arts[i]+" "+n.f[i],"font-size:18px;font-weight:800;color:var(--text);"));
    val.appendChild(mk("div",fr.de,"font-size:13px;color:var(--text2);font-weight:600;margin-top:4px;"));
    val.appendChild(mk("div",fr.es,"font-size:11px;color:var(--muted);margin-top:2px;"));
    row.appendChild(val);
    out.appendChild(row);
  });
}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function capEs(s){return s.charAt(0).toUpperCase()+s.slice(1);}

function casesRules(host){
  var c=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:20px;box-shadow:0 4px 24px rgba(0,0,0,0.22);");
  c.innerHTML = '<h3 style="font-size:17px;font-weight:800;color:var(--text);margin-bottom:4px;letter-spacing:-0.02em;">Reglas express</h3>'
    + '<p style="font-size:13px;color:var(--muted);margin-bottom:16px;font-weight:500;line-height:1.4;">Cerradas para que no te abrumen. Abre solo la que necesites.</p>'
    + '<details class="cs-acc" open><summary>Preposiciones que SIEMPRE mandan caso</summary><div class="cs-accbody">'
      + '<p style="margin:8px 0 2px;font-size:13px;"><span class="cs-tag akk">Akkusativ</span> siempre:</p>'
      + '<div class="cs-chips"><span class="cs-chip akk">durch</span><span class="cs-chip akk">für</span><span class="cs-chip akk">gegen</span><span class="cs-chip akk">ohne</span><span class="cs-chip akk">um</span><span class="cs-chip akk">bis</span></div>'
      + '<p class="cs-ex">Ich kaufe ein Kabel für <span class="c-akk">den</span> Computer.</p>'
      + '<p class="cs-ex">Ich kann nicht ohne <span class="c-akk">meinen</span> Laptop arbeiten.</p>'
      + '<p style="margin:14px 0 2px;font-size:13px;"><span class="cs-tag dat">Dativ</span> siempre:</p>'
      + '<div class="cs-chips"><span class="cs-chip dat">aus</span><span class="cs-chip dat">bei</span><span class="cs-chip dat">mit</span><span class="cs-chip dat">nach</span><span class="cs-chip dat">seit</span><span class="cs-chip dat">von</span><span class="cs-chip dat">zu</span></div>'
      + '<p class="cs-ex">Ich arbeite mit <span class="c-dat">dem</span> MacBook.</p>'
      + '<p class="cs-ex">Das Video ist von <span class="c-dat">meinem</span> Kunden.</p>'
      + '<p style="margin:14px 0 2px;font-size:13px;"><span class="cs-tag gen">Genitiv</span> (frecuente en textos):</p>'
      + '<div class="cs-chips"><span class="cs-chip gen">wegen</span><span class="cs-chip gen">während</span><span class="cs-chip gen">trotz</span><span class="cs-chip gen">statt</span></div>'
      + '<p class="cs-ex">Während <span class="c-gen">des</span> Meetings mache ich Notizen.</p>'
      + '<p class="cs-ex">Trotz <span class="c-gen">des</span> Problems mache ich weiter.</p>'
    + '</div></details>'
    + '<details class="cs-acc"><summary>Preposiciones mixtas: movimiento vs. ubicación</summary><div class="cs-accbody">'
      + '<p style="color:var(--muted);font-size:13px;margin-top:8px;">an, auf, hinter, in, neben, über, unter, vor, zwischen</p>'
      + '<p style="margin:8px 0;font-size:14px;"><b style="color:var(--akk);">¿A DÓNDE? (movimiento)</b> → <span class="cs-tag akk">Akkusativ</span></p>'
      + '<p class="cs-ex">Ich lege das MacBook auf <span class="c-akk">den</span> Tisch. <span style="color:var(--muted);">(lo muevo ahí)</span></p>'
      + '<p style="margin:8px 0;font-size:14px;"><b style="color:var(--dat);">¿DÓNDE? (ya está fijo)</b> → <span class="cs-tag dat">Dativ</span></p>'
      + '<p class="cs-ex">Das MacBook liegt auf <span class="c-dat">dem</span> Tisch. <span style="color:var(--muted);">(está ahí, quieto)</span></p>'
    + '</div></details>'
    + '<details class="cs-acc"><summary>Verbos clave de tu contexto y su caso</summary><div class="cs-accbody">'
      + '<p class="cs-ex">benutzen, schreiben, lesen, bauen, schneiden, suchen, sehen → <span class="cs-tag akk">Akkusativ</span></p>'
      + '<p class="cs-ex">helfen, danken, gehören, antworten → <span class="cs-tag dat">Dativ</span></p>'
      + '<p class="cs-ex">geben, erklären, schicken, zeigen → <span class="cs-tag dat">Dativ</span> (a quién) + <span class="cs-tag akk">Akkusativ</span> (qué)</p>'
      + '<p class="cs-ex">denken an + <span class="cs-tag akk">Akk</span> · warten auf + <span class="cs-tag akk">Akk</span> · arbeiten an + <span class="cs-tag dat">Dativ</span></p>'
    + '</div></details>'
    + '<details class="cs-acc"><summary>Tus errores típicos</summary><div class="cs-accbody">'
      + '<div class="cs-err">Ich sehe <s>der Lehrer</s> → Ich sehe <span class="fix">den Lehrer</span><br><span style="color:var(--muted);">"ver" recibe objeto directo → Akkusativ.</span></div>'
      + '<div class="cs-err">Ich spreche mit <s>den Kunden</s> → mit <span class="fix">dem Kunden</span><br><span style="color:var(--muted);">"mit" siempre Dativ.</span></div>'
      + '<div class="cs-err">ein Teil <s>des Text</s> → des <span class="fix">Textes</span><br><span style="color:var(--muted);">Genitiv masc/neutro: la palabra suele llevar -s o -es.</span></div>'
      + '<div class="cs-err">Das MacBook liegt auf <s>den Tisch</s> → auf <span class="fix">dem Tisch</span><br><span style="color:var(--muted);">está quieto = ubicación = Dativ.</span></div>'
    + '</div></details>'
    + '<details class="cs-acc"><summary>Tabla completa</summary><div class="cs-accbody">'
      + '<div class="cs-tcase" style="margin-top:8px;">'
        + '<div class="cs-trow"><div class="cs-tlbl" style="background:rgba(255,255,255,0.04);">Género</div><div class="cs-tval" style="display:flex;gap:8px;font-size:11px;font-weight:800;"><span style="color:var(--nom);flex:1;">Nom</span><span style="color:var(--akk);flex:1;">Akk</span><span style="color:var(--dat);flex:1;">Dat</span><span style="color:var(--gen);flex:1;">Gen</span></div></div>'
        + '<div class="cs-trow"><div class="cs-tlbl">Masc</div><div class="cs-tval" style="display:flex;gap:8px;font-size:13px;"><span style="flex:1;">der</span><span style="flex:1;color:var(--akk);font-weight:800;">den</span><span style="flex:1;">dem</span><span style="flex:1;">des·s</span></div></div>'
        + '<div class="cs-trow"><div class="cs-tlbl">Fem</div><div class="cs-tval" style="display:flex;gap:8px;font-size:13px;"><span style="flex:1;">die</span><span style="flex:1;">die</span><span style="flex:1;">der</span><span style="flex:1;">der</span></div></div>'
        + '<div class="cs-trow"><div class="cs-tlbl">Neutro</div><div class="cs-tval" style="display:flex;gap:8px;font-size:13px;"><span style="flex:1;">das</span><span style="flex:1;">das</span><span style="flex:1;">dem</span><span style="flex:1;">des·s</span></div></div>'
        + '<div class="cs-trow"><div class="cs-tlbl">Plural</div><div class="cs-tval" style="display:flex;gap:8px;font-size:13px;"><span style="flex:1;">die</span><span style="flex:1;">die</span><span style="flex:1;">den·n</span><span style="flex:1;">der</span></div></div>'
      + '</div>'
      + '<p style="color:var(--muted);font-size:12px;margin-top:8px;">Femenino casi no cambia, neutro tampoco. El que se mueve es el masculino.</p>'
    + '</div></details>';
  host.appendChild(c);
}

function casesPractice(host){
  var c=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:20px;box-shadow:0 4px 24px rgba(0,0,0,0.22);");
  c.appendChild(mk("h3","Practicar","font-size:17px;font-weight:800;color:var(--text);margin-bottom:4px;letter-spacing:-0.02em;"));
  c.appendChild(mk("p","Eliges, te corrige ahí mismo y te dice el porqué.","font-size:13px;color:var(--muted);margin-bottom:14px;font-weight:500;"));

  // Mode pills
  var modes=mk("div","","display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px;");
  [["all","Mezcla"],["articulo","Artículos"],["caso","Identificar"],["mov","Movimiento"],["traduccion","Traducir"]].forEach(function(m){
    var b=mk("button",m[1],"font-size:12px;font-weight:700;padding:8px 14px;border-radius:var(--r-pill);border:1.5px solid var(--border);background:rgba(255,255,255,0.03);color:var(--muted);transition:all 0.15s;");
    if(state.cases.casesQuizMode===m[0]){
      b.style.background="var(--text)";b.style.color="var(--bg)";b.style.borderColor="var(--text)";b.style.fontWeight="800";
    }
    b.onclick=function(){state.cases.casesQuizMode=m[0];casesBuildPool();casesNextQ();renderCases();};
    modes.appendChild(b);
  });
  c.appendChild(modes);

  // Score metrics row
  var score=mk("div","","display:flex;gap:12px;margin-bottom:16px;");
  [
    {lbl:"Aciertos",val:state.cases.casesHits+"/"+state.cases.casesTotal,idHint:"cs-hit"},
    {lbl:"Racha",val:state.cases.casesStreak,color:state.cases.casesStreak>2?"var(--gold-text)":"var(--text2)",idHint:"cs-streak"},
    {lbl:"%",val:state.cases.casesTotal?Math.round(state.cases.casesHits/state.cases.casesTotal*100)+'%':'—',idHint:"cs-pct"}
  ].forEach(function(m){
    var metric=mk("div","","flex:1;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:var(--r-md);padding:12px;text-align:center;");
    var valEl=mk("span",String(m.val),"display:block;font-size:22px;font-weight:900;color:"+(m.color||"var(--text)")+";line-height:1.1;font-variant-numeric:tabular-nums;letter-spacing:-0.02em;");
    valEl.id=m.idHint;
    metric.appendChild(valEl);
    metric.appendChild(mk("span",m.lbl,"display:block;font-size:10px;color:var(--muted);font-weight:700;margin-top:3px;letter-spacing:1px;font-family:var(--font-label);"));
    score.appendChild(metric);
  });
  c.appendChild(score);

  var mount=mk("div","",""); mount.id="cs-quiz-mount"; c.appendChild(mount);
  host.appendChild(c);
  if(!state.cases.casesPool.length) casesBuildPool();
  casesRenderQ(mount);
}

function casesShuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.random()*(i+1)|0;var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function casesBuildPool(){ state.cases.casesPool=casesShuffle(state.cases.casesQuizMode==='all'?CASES_Q:CASES_Q.filter(function(q){return q.mode===state.cases.casesQuizMode;})); state.cases.casesIdx=0; }
function casesUpdateScore(){
  var ms=document.querySelectorAll("#s-casos [id]");
  Array.prototype.forEach.call(ms,function(el){
    if(el.id==="cs-hit") el.textContent=state.cases.casesHits+"/"+state.cases.casesTotal;
    if(el.id==="cs-streak"){el.textContent=state.cases.casesStreak;el.style.color=state.cases.casesStreak>2?"var(--gold-text)":"var(--text2)";}
    if(el.id==="cs-pct") el.textContent=state.cases.casesTotal?Math.round(state.cases.casesHits/state.cases.casesTotal*100)+'%':'—';
  });
}
function casesNextQ(){ if(state.cases.casesIdx>=state.cases.casesPool.length){ state.cases.casesPool=casesShuffle(state.cases.casesPool); state.cases.casesIdx=0; } var m=document.getElementById("cs-quiz-mount"); if(m) casesRenderQ(m); }

function casesRenderQ(mount){
  if(!state.cases.casesPool.length){ mount.innerHTML="<p style='color:var(--muted);font-size:13px;text-align:center;padding:24px;'>Sin preguntas en este mode.</p>"; return; }
  if(state.cases.casesIdx>=state.cases.casesPool.length){ state.cases.casesPool=casesShuffle(state.cases.casesPool); state.cases.casesIdx=0; }
  var q=state.cases.casesPool[state.cases.casesIdx]; state.cases.casesAnswered=false;
  if(q.mode==='traduccion'){ casesRenderTrad(q,mount); return; }
  var modeLbl={articulo:'Elige el artículo',caso:'¿Qué caso es?',mov:'Movimiento o ubicación'}[q.mode];
  var sentence=q.sentence.replace('___','<span style="display:inline-block;min-width:48px;border-bottom:2px dashed var(--muted);text-align:center;font-weight:900;color:var(--gold-text);padding:0 4px;">___</span>');
  mount.innerHTML='<div style="border:1px solid var(--border);border-radius:var(--r-lg);padding:18px;background:linear-gradient(160deg,rgba(255,255,255,0.02),rgba(255,255,255,0.05));">'
    +'<div style="font-size:10px;color:var(--dim);font-weight:700;letter-spacing:2px;font-family:var(--font-label);margin-bottom:10px;">'+modeLbl+'</div>'
    +'<p style="font-size:19px;line-height:1.55;margin-bottom:6px;color:var(--text);font-weight:700;">'+sentence+'</p>'
    +(q.hint?'<p style="font-size:12px;color:var(--muted);margin-bottom:16px;font-weight:500;">'+q.hint+'</p>':'<div style="margin-bottom:16px;"></div>')
    +'<div id="cs-opts" style="display:grid;grid-template-columns:repeat(2,1fr);gap:9px;"></div>'
    +'<div id="cs-hint" style="margin-top:10px;display:none;padding:12px 14px;border-radius:var(--r-md);background:rgba(var(--gold-rgb),0.08);border:1px solid rgba(var(--gold-rgb),0.2);color:var(--text);font-size:13px;font-weight:600;line-height:1.5;animation:fadeUp 0.15s ease;"></div>'
    +'<div id="cs-fb" style="margin-top:16px;display:none;"></div>'
    +'<div id="cs-next" style="margin-top:16px;display:none;justify-content:flex-end;">'
    +'<button id="cs-nextbtn" style="font-size:14px;font-weight:800;padding:12px 20px;border-radius:var(--r-md);border:0;background:var(--gold);color:#000;box-shadow:0 4px 16px rgba(var(--gold-rgb),0.3);">Siguiente →</button></div>'
    +'</div>';
  var opts=document.getElementById("cs-opts");
  q.op.forEach(function(o){
    var b=mk("button",o,"font-size:15px;font-weight:700;padding:14px;border-radius:var(--r-md);border:1.5px solid var(--border);background:rgba(255,255,255,0.04);color:var(--text);transition:all 0.12s;");
    b.onmouseenter=function(){this.style.borderColor="var(--gold)";this.style.background="rgba(var(--gold-rgb),0.06)";};
    b.onmouseleave=function(){if(!this.classList.contains("correct")&&!this.classList.contains("wrong")&&!this.classList.contains("dim")){this.style.borderColor="var(--border)";this.style.background="rgba(255,255,255,0.04)";}};
    b.onclick=function(){casesChoose(q,o,opts,b);};
    opts.appendChild(b);
  });
  var hintBtn=mk("button","💡 Pista","margin-top:10px;background:transparent;border:1px dashed rgba(var(--gold-rgb),0.3);color:var(--gold-text);border-radius:var(--r-md);padding:8px 14px;font-size:11px;font-weight:700;cursor:pointer;transition:all 0.12s;");
  hintBtn.setAttribute("aria-expanded","false");
  hintBtn.onmouseenter=function(){this.style.borderColor="rgba(var(--gold-rgb),0.6)";this.style.background="rgba(var(--gold-rgb),0.06)";};
  hintBtn.onmouseleave=function(){this.style.borderColor="rgba(var(--gold-rgb),0.3)";this.style.background="transparent";};
  hintBtn.onclick=function(){
    var h=document.getElementById("cs-hint");
    if(h.style.display==="block"){h.style.display="none";hintBtn.setAttribute("aria-expanded","false");return;}
    var css=casesCaseForQuestion(q);
    var tip=casesFailureTip(q)||(CASES_TIPS[css]||"Pista: mira el verbo y la preposición para decidir el caso.");
    h.innerHTML="💡 "+tip; h.style.display="block"; hintBtn.setAttribute("aria-expanded","true");
  };
  opts.parentNode.insertBefore(hintBtn,opts.nextSibling);
  var nb=document.getElementById("cs-nextbtn"); if(nb) nb.onclick=function(){state.cases.casesIdx++;casesNextQ();};
}

function casesChoose(q,o,opts,btn){
  if(state.cases.casesAnswered) return; state.cases.casesAnswered=true;
  var correct=o===q.ok;
  state.cases.casesTotal++; if(correct){state.cases.casesHits++;state.cases.casesStreak++;state.cases.casesWrongStreak=0;} else {state.cases.casesStreak=0;state.cases.casesWrongStreak=(state.cases.casesWrongStreak||0)+1; var missCase=casesCaseForQuestion(q); if(missCase) state.cases.casesCaseMisses[missCase]=(state.cases.casesCaseMisses[missCase]||0)+1;}
  logActivity("drillsDone",1); syncUp();
  casesUpdateScore();
  Array.prototype.forEach.call(opts.children,function(b){
    if(b.textContent===q.ok){b.style.borderColor="var(--akk)";b.style.background="var(--akk-bg)";b.style.color="var(--green-text)";}
    else if(b===btn){b.style.borderColor="var(--red)";b.style.background="rgba(var(--red-rgb),0.1)";b.style.color="var(--red-text)";}
    else b.style.opacity="0.4";
    b.style.pointerEvents="none";
  });
  var fb=document.getElementById("cs-fb");
  var caseNames={nom:'Nominativ',akk:'Akkusativ',dat:'Dativ',gen:'Genitiv'};
  var tag=q.caso?'<span class="cs-tag '+q.caso+'">'+caseNames[q.caso]+'</span> ':'';
  fb.style.display="block";
  fb.style.cssText="margin-top:16px;display:block;border-radius:var(--r-md);padding:16px;font-size:14px;background:"+(correct?"var(--akk-bg)":"rgba(var(--red-rgb),0.08)")+";border:1px solid "+(correct?"var(--akk-line)":"rgba(var(--red-rgb),0.25)")+";";
  var tip=correct?"":casesFailureTip(q);
  fb.innerHTML='<div style="font-weight:900;font-size:15px;color:'+(correct?"var(--green-text)":"var(--red-text)")+';margin-bottom:6px;">'+(correct?'✓ Correcto':'✗ Casi · la respuesta es '+q.ok)+'</div>'
    +'<div style="color:var(--text2);line-height:1.55;font-size:14px;">'+tag+q.why+'</div>'
    +(tip?'<div style="margin-top:12px;padding:12px 14px;border-radius:var(--r-md);background:rgba(var(--gold-rgb),0.10);border:1px solid rgba(var(--gold-rgb),0.24);color:var(--text);font-size:13px;line-height:1.5;font-weight:600;">💡 '+tip+'</div>':'');
  document.getElementById("cs-next").style.display="flex";
}

function casesRenderTrad(q,mount){
  mount.innerHTML="";
  var targetText=q.de.replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim();
  var targetWords=targetText.replace(/[.!?]$/g,"").split(" ").filter(Boolean);
  var distractors=["ich","du","wir","der","die","das","ein","eine","einen","dem","den","mit","für","auf","neben","ist","bin","habe","mache","lerne","arbeite","suche","gut","wichtig"];
  var used={}; targetWords.forEach(function(w){used[w.toLowerCase()]=true;});
  var extras=distractors.filter(function(w){return !used[w.toLowerCase()];}).slice(0,4);
  var bank=casesShuffle(targetWords.concat(extras));
  var chosen=[];
  var card=mk("div","","border:1px solid var(--border);border-radius:var(--r-lg);padding:18px;background:linear-gradient(160deg,rgba(255,255,255,0.02),rgba(255,255,255,0.05));");
  card.appendChild(mk("div","Ordena las palabras","font-size:10px;color:var(--dim);font-weight:700;letter-spacing:2px;font-family:var(--font-label);margin-bottom:10px;"));
  card.appendChild(mk("p",q.es,"font-size:19px;line-height:1.5;margin-bottom:16px;color:var(--text);font-weight:700;"));
  var answer=mk("div","","min-height:52px;border:2px dashed rgba(var(--purple-rgb),0.35);border-radius:var(--r-md);padding:10px;display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;background:rgba(var(--purple-rgb),0.05);");
  var bankEl=mk("div","","display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;");
  var fb=mk("div","","display:none;margin-top:14px;padding:16px;border-radius:var(--r-md);font-size:14px;");
  var row=mk("div","","display:flex;gap:10px;margin-top:14px;");
  var check=mk("button","Comprobar","flex:1;font-size:14px;font-weight:800;padding:12px 18px;border-radius:var(--r-md);border:0;background:var(--gold);color:#000;box-shadow:0 4px 16px rgba(var(--gold-rgb),0.3);");
  var clear=mk("button","Limpiar","font-size:14px;font-weight:700;padding:12px 18px;border-radius:var(--r-md);border:1px solid var(--border);background:rgba(255,255,255,0.04);color:var(--text);");
  function normalize(s){return s.toLowerCase().replace(/[.,!?;:]/g,"").replace(/\s+/g," ").trim();}
  function makeChip(word,fromAnswer){
    var b=mk("button",word,"font-size:14px;font-weight:800;padding:10px 14px;border-radius:var(--r-md);border:1px solid var(--border);background:rgba(255,255,255,0.06);color:var(--text);transition:all 0.12s;");
    b.onmouseenter=function(){if(!this.disabled)this.style.borderColor="var(--gold)";};
    b.onmouseleave=function(){if(!this.disabled)this.style.borderColor="var(--border)";};
    b.onclick=function(){
      if(state.cases.casesAnswered) return;
      if(fromAnswer){ chosen.splice(chosen.indexOf(word),1); render(); }
      else { chosen.push(word); b.disabled=true; b.style.opacity="0.35"; renderAnswer(); }
    };
    return b;
  }
  function renderAnswer(){ answer.innerHTML=""; chosen.forEach(function(w){answer.appendChild(makeChip(w,true));}); }
  function render(){ bankEl.innerHTML=""; bank.forEach(function(w){var chip=makeChip(w,false); if(chosen.indexOf(w)>=0){chip.disabled=true;chip.style.opacity="0.35";} bankEl.appendChild(chip);}); renderAnswer(); }
  check.onclick=function(){
    if(state.cases.casesAnswered) return;
    var target=normalize(targetWords.join(" "));
    var got=normalize(chosen.join(" "));
    var correct=got===target;
    state.cases.casesAnswered=true;
    state.cases.casesTotal++; if(correct){state.cases.casesHits++;state.cases.casesStreak++;state.cases.casesWrongStreak=0;} else {state.cases.casesStreak=0;state.cases.casesWrongStreak=(state.cases.casesWrongStreak||0)+1; var missCase=casesCaseForQuestion(q); if(missCase) state.cases.casesCaseMisses[missCase]=(state.cases.casesCaseMisses[missCase]||0)+1;}
    logActivity("drillsDone",1); syncUp(); casesUpdateScore();
    fb.style.display="block";
    fb.style.background=correct?"var(--akk-bg)":"rgba(var(--red-rgb),0.08)";
    fb.style.border="1px solid "+(correct?"var(--akk-line)":"rgba(var(--red-rgb),0.25)");
    var tip=correct?"":casesFailureTip(q);
    fb.innerHTML='<div style="font-weight:900;font-size:15px;color:'+(correct?'var(--green-text)':'var(--red-text)')+';margin-bottom:6px;">'+(correct?'✓ Correcto':'✗ Casi')+'</div>'
      +'<div style="font-size:17px;font-weight:700;color:var(--text);line-height:1.5;">'+q.de+'</div>'
      +'<div style="margin-top:8px;font-size:14px;color:var(--text2);line-height:1.55;">'+q.why+'</div>'
      +(tip?'<div style="margin-top:12px;padding:12px 14px;border-radius:var(--r-md);background:rgba(var(--gold-rgb),0.10);border:1px solid rgba(var(--gold-rgb),0.24);color:var(--text);font-size:13px;line-height:1.5;font-weight:600;">💡 '+tip+'</div>':'')
      +'<button id="cs-nexttrad" style="margin-top:14px;width:100%;font-size:14px;font-weight:800;padding:12px 18px;border-radius:var(--r-md);border:0;background:var(--gold);color:#000;box-shadow:0 4px 16px rgba(var(--gold-rgb),0.3);">Siguiente →</button>';
    setTimeout(function(){var nb=document.getElementById("cs-nexttrad");if(nb)nb.onclick=function(){state.cases.casesIdx++;casesNextQ();};},0);
  };
  clear.onclick=function(){ if(state.cases.casesAnswered) return; chosen=[]; render(); };
  var hintBox=mk("div","","display:none;margin-top:10px;padding:12px 14px;border-radius:var(--r-md);background:rgba(var(--gold-rgb),0.08);border:1px solid rgba(var(--gold-rgb),0.2);color:var(--text);font-size:13px;font-weight:600;line-height:1.5;animation:fadeUp 0.15s ease;");
  var hintBtn=mk("button","💡 Pista","margin-top:10px;background:transparent;border:1px dashed rgba(var(--gold-rgb),0.3);color:var(--gold-text);border-radius:var(--r-md);padding:8px 14px;font-size:11px;font-weight:700;cursor:pointer;transition:all 0.12s;");
  hintBtn.setAttribute("aria-expanded","false");
  hintBtn.onclick=function(){
    if(hintBox.style.display==="block"){hintBox.style.display="none";hintBtn.setAttribute("aria-expanded","false");return;}
    var css=casesCaseForQuestion(q);
    hintBox.textContent="💡 "+(CASES_TIPS[css]||"Identifica la función (sujeto, objeto, receptor) para elegir el caso.");
    hintBox.style.display="block"; hintBtn.setAttribute("aria-expanded","true");
  };
  card.appendChild(answer); card.appendChild(bankEl); card.appendChild(hintBtn); card.appendChild(hintBox); row.appendChild(check); row.appendChild(clear); card.appendChild(row); card.appendChild(fb); mount.appendChild(card); render();
}
