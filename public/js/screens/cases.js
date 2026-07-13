// ── Cases (Fable visual port + state.js CASOS_* constants) ─────
// Note: CASOS_NOUNS, CASOS_ART, CASOS_CASES, CASOS_Q are declared in state.js (loaded first).
// state.js uses English property names: .mode, .sentence, .hint

// State
function casesInitState(){
  state.cases = state.cases || {};
  if(["identificar","transformar","reglas","practicar"].indexOf(state.cases.casesSubtab)<0) state.cases.casesSubtab = "identificar";
  if(!CASOS_ART[state.cases.casesArt]) state.cases.casesArt = "der";
  if(typeof state.cases.casesNounIdx!=="number") state.cases.casesNounIdx = 0;
  state.cases.casesNounIdx=Math.max(0,Math.min(CASOS_NOUNS.length-1,state.cases.casesNounIdx|0));
  if(["all","articulo","caso","mov","traduccion"].indexOf(state.cases.casesQuizMode)<0) state.cases.casesQuizMode = "all";
  if(!Array.isArray(state.cases.casesPool)) state.cases.casesPool = [];
  if(typeof state.cases.casesIdx!=="number") state.cases.casesIdx = 0;
  state.cases.casesIdx=Math.max(0,state.cases.casesIdx|0);
  if(typeof state.cases.casesHits!=="number") state.cases.casesHits = 0;
  if(typeof state.cases.casesTotal!=="number") state.cases.casesTotal = 0;
  if(typeof state.cases.casesStreak!=="number") state.cases.casesStreak = 0;
  state.cases.casesHits=Math.max(0,state.cases.casesHits|0);
  state.cases.casesTotal=Math.max(0,state.cases.casesTotal|0);
  state.cases.casesStreak=Math.max(0,state.cases.casesStreak|0);
  if(state.cases.casesHits>state.cases.casesTotal) state.cases.casesHits=state.cases.casesTotal;
  if(!state.cases.casesLastAnswer||typeof state.cases.casesLastAnswer!=="object") state.cases.casesLastAnswer=null;
  if(typeof state.cases.casesAnswered!=="boolean") state.cases.casesAnswered=false;
}
function getCasesSyncState(){
  casesInitState();
  return {
    casesSubtab:state.cases.casesSubtab,
    casesArt:state.cases.casesArt,
    casesNounIdx:state.cases.casesNounIdx,
    casesQuizMode:state.cases.casesQuizMode,
    casesHits:state.cases.casesHits,
    casesTotal:state.cases.casesTotal,
    casesStreak:state.cases.casesStreak
  };
}
casesInitState();

function casesText(s){
  return String(s==null?"":s).replace(/[&<>"']/g,function(ch){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];
  });
}
function casesInlineHtml(s){
  s=String(s==null?"":s);
  var out="", last=0;
  var re=/<\/?(?:b|span)(?:\s+class="(?:cs-de|c-nom|c-akk|c-dat|c-gen)")?\s*>/g;
  var m;
  while((m=re.exec(s))){
    out+=casesText(s.slice(last,m.index))+m[0];
    last=re.lastIndex;
  }
  return out+casesText(s.slice(last));
}
function casesQuestionKey(q){
  return q.mode+"|"+(q.sentence||q.es||q.ok||"");
}

function renderCases() {
  casesInitState();
  var el=document.getElementById("s-casos"); el.innerHTML="";

  // ── Stitch header ──
  var hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","Alemán · Los 4 casos","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
  var h2row=mk("div","","display:flex;align-items:center;gap:10px;margin:3px 0 4px;");
  h2row.appendChild(mk("h2","Casos","font-size:28px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin:0;color:var(--text);"));
  var hintBtn=mk("button","💡","width:34px;height:34px;border-radius:12px;border:1px solid rgba(var(--gold-rgb),0.35);background:rgba(var(--gold-rgb),0.08);font-size:16px;cursor:pointer;padding:0;line-height:1;transition:background .15s,transform .1s;");
  hintBtn.setAttribute("aria-label","Recordatorio rápido de los casos"); hintBtn.setAttribute("aria-expanded","false");
  hintBtn.onmouseenter=function(){hintBtn.style.background="rgba(var(--gold-rgb),0.15)";};
  hintBtn.onmouseleave=function(){hintBtn.style.background="rgba(var(--gold-rgb),0.08)";};
  h2row.appendChild(hintBtn);
  // 📗 Full declension table (der/ein/mein) in a modal — quick reference mid-quiz
  var refBtn=mk("button","📗","background:none;border:none;font-size:20px;cursor:pointer;opacity:0.6;transition:opacity .15s;padding:2px;");
  refBtn.title="Tabla de declinación (artículos + ein/dein)";
  refBtn.setAttribute("aria-label","Tabla completa de casos");
  refBtn.onmouseenter=function(){this.style.opacity="1";};
  refBtn.onmouseleave=function(){this.style.opacity="0.6";};
  refBtn.onclick=function(){
    var o=document.createElement("div");
    o.style.cssText="position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0.6);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto;opacity:0;transition:opacity .18s ease;";
    function closeRef(){o.style.opacity="0";setTimeout(function(){if(o.parentNode)o.parentNode.removeChild(o);},180);}
    o.onclick=function(e){if(e.target===o)closeRef();};
    var c=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:22px;padding:22px;max-width:580px;width:100%;margin:16px 0;box-shadow:0 20px 60px rgba(0,0,0,0.5);");
    c.setAttribute("role","dialog"); c.setAttribute("aria-modal","true"); c.setAttribute("aria-label","Tabla completa de casos");
    c.onclick=function(e){e.stopPropagation();};
    c.appendChild(mk("p","Tabla de declinación","font-size:15px;font-weight:900;color:var(--text);margin-bottom:2px;letter-spacing:-0.02em;"));
    c.appendChild(mk("p","Cada celda: artículo · ein/dein. Los ein-Wörter (mein, dein, sein, kein, ihr…) se declinan TODOS igual que ein.","font-size:11px;color:var(--muted);font-weight:500;margin-bottom:12px;line-height:1.5;"));
    // Full declension grid: 4 cases × (Mask / Fem / Neut / Plural), definite + ein·dein per cell
    var CASE_ROWS=[
      {c:"nom",lbl:"Nominativ",cells:[["der","ein · dein"],["die","eine · deine"],["das","ein · dein"],["die","— · deine"]]},
      {c:"akk",lbl:"Akkusativ",cells:[["den","einen · deinen"],["die","eine · deine"],["das","ein · dein"],["die","— · deine"]]},
      {c:"dat",lbl:"Dativ",   cells:[["dem","einem · deinem"],["der","einer · deiner"],["dem","einem · deinem"],["den","— · deinen"]]},
      {c:"gen",lbl:"Genitiv", cells:[["des","eines · deines"],["der","einer · deiner"],["des","eines · deines"],["der","— · deiner"]]}
    ];
    var caseColor={nom:"var(--teal-text)",akk:"var(--green-text)",dat:"var(--gold-text)",gen:"var(--purple-text)"};
    var scroll=mk("div","","overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:12px;border:1px solid var(--border);");
    var html='<table style="border-collapse:collapse;width:100%;min-width:420px;font-size:11.5px;">';
    html+='<thead><tr>'
      +'<th style="text-align:left;padding:8px 10px;color:var(--muted);font-weight:800;font-size:10px;letter-spacing:1px;">CASO</th>'
      +'<th style="padding:8px 8px;color:var(--text);font-weight:800;">Mask.</th>'
      +'<th style="padding:8px 8px;color:var(--text);font-weight:800;">Fem.</th>'
      +'<th style="padding:8px 8px;color:var(--text);font-weight:800;">Neut.</th>'
      +'<th style="padding:8px 8px;color:var(--text);font-weight:800;">Plural</th>'
      +'</tr></thead><tbody>';
    CASE_ROWS.forEach(function(row){
      html+='<tr style="border-top:1px solid var(--border);">'
        +'<td style="padding:9px 10px;font-weight:800;color:'+caseColor[row.c]+';white-space:nowrap;">'+row.lbl+'</td>';
      row.cells.forEach(function(cell){
        html+='<td style="padding:9px 8px;text-align:center;line-height:1.5;">'
          +'<span style="font-weight:800;color:var(--text);">'+cell[0]+'</span><br>'
          +'<span style="font-size:10px;color:var(--muted);font-weight:600;">'+cell[1]+'</span></td>';
      });
      html+='</tr>';
    });
    html+='</tbody></table>';
    scroll.innerHTML=html;
    c.appendChild(scroll);
    var note=mk("div","","margin-top:12px;font-size:12px;color:var(--text2);line-height:1.7;font-weight:500;");
    note.innerHTML='<b style="color:var(--red-text);">Reglas clave:</b><br>'
      +'• Akkusativ cambia SOLO en masculino: der→den, ein→einen, dein→deinen. Fem/Neut NO cambian.<br>'
      +'• Dativ: dem/einem (masc·neut), der/einer (fem), den/deinen (plural, +n al sustantivo).<br>'
      +'• ein no tiene plural (—), pero dein/mein/kein sí: deine, deinen…';
    c.appendChild(note);
    var close=mk("button","Cerrar","width:100%;padding:13px;border-radius:13px;border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-size:13px;font-weight:700;cursor:pointer;margin-top:14px;font-family:inherit;");
    close.onclick=closeRef;
    c.appendChild(close);o.appendChild(c);
    document.body.appendChild(o);
    requestAnimationFrame(function(){o.style.opacity="1";});
  };
  h2row.appendChild(refBtn);
  hdr.appendChild(h2row);
  hdr.appendChild(mk("p","El color es la función. Apréndete el color, no la regla.","font-size:13px;color:var(--text2);font-weight:500;margin-bottom:0;"));
  el.appendChild(hdr);
  // Quick case reminder (toggled by the bulb)
  var hintCard=mk("div","","display:none;border-radius:12px;padding:12px 14px;margin-bottom:14px;background:rgba(var(--gold-rgb),.07);border:1px solid rgba(var(--gold-rgb),.25);font-size:12.5px;line-height:1.7;font-weight:500;color:var(--text);animation:fadeUp .15s ease;");
  hintCard.innerHTML=
    '<b style="color:var(--teal)">Nominativ</b> — ¿quién? / ¿qué es? → el sujeto<br>'
   +'<b style="color:var(--green)">Akkusativ</b> — ¿qué? / ¿a quién? → objeto directo<br>'
   +'<b style="color:var(--gold)">Dativ</b> — ¿a quién? / ¿para quién? → objeto indirecto · con <b>mit, zu, bei, von</b><br>'
   +'<b style="color:var(--purple)">Genitiv</b> — ¿de quién? → posesión · con <b>während, trotz, wegen</b><br><br>'
   +'<b>der/die/das</b><br>'
   +'<span style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px 8px;margin-top:4px;font-variant-numeric:tabular-nums;">'
   +'<span> </span><span><b>M</b></span><span><b>F</b></span><span><b>N</b></span>'
   +'<span style="color:var(--teal)">Nom</span><span>der</span><span>die</span><span>das</span>'
   +'<span style="color:var(--green)">Akk</span><span>den</span><span>die</span><span>das</span>'
   +'<span style="color:var(--gold)">Dat</span><span>dem</span><span>der</span><span>dem</span>'
   +'<span style="color:var(--purple)">Gen</span><span>des</span><span>der</span><span>des</span>'
   +'</span><br>'
   +'<span style="font-size:10.5px;color:var(--dim);">ein/eine: mismo patrón, pero <b>Nom.m ein</b>, <b>Nom.n ein</b> y <b>Akk.n ein</b> no llevan sufijo.</span>';
  hintBtn.onclick=function(){
    var open=hintCard.style.display==="block";
    hintCard.style.display=open?"none":"block";
    hintBtn.setAttribute("aria-expanded",open?"false":"true");
  };
  el.appendChild(hintCard);

  // ── Signature: 4-color spectrum legend (Stitch card style) ──
  var spectrum=mk("div","","display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:18px;");
  [
    {c:"nom",n:"Nominativ",s:"el que ACTÚA",s2:"¿quién?"},
    {c:"akk",n:"Akkusativ",s:"RECIBE acción",s2:"¿qué?"},
    {c:"dat",n:"Dativ",s:"a / para quién",s2:"mit, zu…"},
    {c:"gen",n:"Genitiv",s:"posesión",s2:"¿de quién?"}
  ].forEach(function(l){
    var spec=mk("div","","border-radius:14px;padding:12px 10px 10px;border:1.5px solid;background:var(--surface);box-shadow:0 2px 14px rgba(0,0,0,0.18);");
    spec.style.borderColor="var(--"+l.c+"-line)";
    spec.appendChild(mk("b",l.n,"display:block;font-size:13px;font-weight:800;letter-spacing:-0.01em;color:var(--"+l.c+");"));
    spec.appendChild(mk("span",l.s,"display:block;font-size:9.5px;color:var(--text2);font-weight:700;margin-top:3px;line-height:1.3;"));
    spec.appendChild(mk("span",l.s2,"display:block;font-size:9px;color:var(--muted);font-weight:500;margin-top:1px;line-height:1.2;"));
    spectrum.appendChild(spec);
  });
  el.appendChild(spectrum);

  // ── Subtabs (Stitch pill-tab bar) ──
  var sub=mk("div","","display:flex;gap:6px;background:var(--surface);border:1px solid rgba(143,144,158,0.35);border-radius:16px;padding:5px;margin-bottom:18px;overflow-x:auto;box-shadow:0 2px 12px rgba(0,0,0,0.14);");
  [
    {id:"identificar",lbl:"1 · Identificar"},
    {id:"transformar",lbl:"2 · Transformar"},
    {id:"reglas",lbl:"3 · Reglas"},
    {id:"practicar",lbl:"4 · Practicar"}
  ].forEach(function(s){
    var b=mk("button",s.lbl,"flex:1;text-align:center;padding:10px 6px;border-radius:12px;font-size:12px;font-weight:700;border:none;white-space:nowrap;cursor:pointer;transition:background .2s,color .2s,box-shadow .2s;font-family:inherit;");
    if(state.cases.casesSubtab===s.id){
      b.style.background="rgba(var(--primary-rgb),0.15)";b.style.color="var(--primary)";b.style.boxShadow="0 2px 12px rgba(0,0,0,.24)";
    }else{
      b.style.background="transparent";b.style.color="var(--text2)";
    }
    b.onclick=function(){state.cases.casesSubtab=s.id;renderCases();};
    sub.appendChild(b);
  });
  el.appendChild(sub);

  var body=mk("div","","animation:fadeUp 0.25s ease;");
  el.appendChild(body);
  if(state.cases.casesSubtab==="identificar") casosIdentificar(body);
  else if(state.cases.casesSubtab==="transformar") casosTransformar(body);
  else if(state.cases.casesSubtab==="reglas") casosReglas(body);
  else if(state.cases.casesSubtab==="practicar") casosPracticar(body);
}

function casosIdentificar(host){
  // Keep existing logic — port visual only
  var c1=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:16px;margin-bottom:12px;");
  c1.appendChild(mk("p","¿Qué caso es? En 5 pasos","font-size:16px;font-weight:800;color:var(--text);margin-bottom:4px;"));
  c1.appendChild(mk("p","Hazlas en orden. La primera que diga \"sí\" gana.","font-size:13px;color:var(--muted);margin-bottom:12px;font-weight:500;"));
  // Flow steps — Fable style
  var flow=mk("div","","position:relative;padding-left:18px;");
  flow.innerHTML=
    '<div style="position:absolute;left:5px;top:14px;bottom:14px;width:2px;background:linear-gradient(180deg,var(--nom),var(--akk),var(--dat),var(--gen));border-radius:2px;opacity:.5;"></div>'+
    '<div class="cs-step" style="border:1px solid var(--border);border-left-width:4px;border-radius:12px;padding:13px 14px;background:rgba(255,255,255,0.03);margin-bottom:10px;position:relative;border-left-color:var(--nom);">'+
    '<div style="position:absolute;left:-17.5px;top:16px;width:9px;height:9px;border-radius:99px;background:var(--nom);"></div>'+
    '<div style="font-size:14px;font-weight:700;color:var(--text);line-height:1.4;">① ¿Hay una preposición antes? (mit, für, an, in, von, wegen…)</div>'+
    '<div style="font-size:13px;color:var(--text2);margin-top:5px;line-height:1.5;">Sí → <b>la preposición manda el caso</b>. Ni mires el verbo. Ve a "Reglas".</div></div>'+
    '<div style="text-align:center;font-size:10.5px;color:var(--dim);font-weight:700;letter-spacing:1px;margin:2px 0 10px;text-transform:uppercase;">▼ si no hay preposición</div>'+
    '<div class="cs-step" style="border:1px solid var(--border);border-left-width:4px;border-radius:12px;padding:13px 14px;background:rgba(255,255,255,0.03);margin-bottom:10px;position:relative;border-left-color:var(--nom);">'+
    '<div style="position:absolute;left:-17.5px;top:16px;width:9px;height:9px;border-radius:99px;background:var(--nom);"></div>'+
    '<div style="font-size:14px;font-weight:700;color:var(--text);line-height:1.4;">② ¿Es el que hace la acción? (el sujeto)</div>'+
    '<div style="font-size:13px;color:var(--text2);margin-top:5px;line-height:1.5;"><span class="cs-tag nom">Nominativ</span> — el típico der/die/das de diccionario.</div></div>'+
    '<div style="text-align:center;font-size:10.5px;color:var(--dim);font-weight:700;letter-spacing:1px;margin:2px 0 10px;text-transform:uppercase;">▼ si no</div>'+
    '<div class="cs-step" style="border:1px solid var(--border);border-left-width:4px;border-radius:12px;padding:13px 14px;background:rgba(255,255,255,0.03);margin-bottom:10px;position:relative;border-left-color:var(--akk);">'+
    '<div style="position:absolute;left:-17.5px;top:16px;width:9px;height:9px;border-radius:99px;background:var(--akk);"></div>'+
    '<div style="font-size:14px;font-weight:700;color:var(--text);line-height:1.4;">③ ¿Qué o a quién recibe directamente la acción?</div>'+
    '<div style="font-size:13px;color:var(--text2);margin-top:5px;line-height:1.5;"><span class="cs-tag akk">Akkusativ</span> — el objeto directo. Aquí <b>solo</b> el masculino cambia: der → <b>den</b>.</div></div>'+
    '<div style="text-align:center;font-size:10.5px;color:var(--dim);font-weight:700;letter-spacing:1px;margin:2px 0 10px;text-transform:uppercase;">▼ si le doy / digo / ayudo a alguien</div>'+
    '<div class="cs-step" style="border:1px solid var(--border);border-left-width:4px;border-radius:12px;padding:13px 14px;background:rgba(255,255,255,0.03);margin-bottom:10px;position:relative;border-left-color:var(--dat);">'+
    '<div style="position:absolute;left:-17.5px;top:16px;width:9px;height:9px;border-radius:99px;background:var(--dat);"></div>'+
    '<div style="font-size:14px;font-weight:700;color:var(--text);line-height:1.4;">④ ¿A quién / para quién? (segundo objeto)</div>'+
    '<div style="font-size:13px;color:var(--text2);margin-top:5px;line-height:1.5;"><span class="cs-tag dat">Dativ</span> — receptor. Verbos clave: helfen, danken, geben, erklären, gehören.</div></div>'+
    '<div style="text-align:center;font-size:10.5px;color:var(--dim);font-weight:700;letter-spacing:1px;margin:2px 0 10px;text-transform:uppercase;">▼ si es "de quién / de qué"</div>'+
    '<div class="cs-step" style="border:1px solid var(--border);border-left-width:4px;border-radius:12px;padding:13px 14px;background:rgba(255,255,255,0.03);margin-bottom:10px;position:relative;border-left-color:var(--gen);">'+
    '<div style="position:absolute;left:-17.5px;top:16px;width:9px;height:9px;border-radius:99px;background:var(--gen);"></div>'+
    '<div style="font-size:14px;font-weight:700;color:var(--text);line-height:1.4;">⑤ ¿De quién es / parte de qué?</div>'+
    '<div style="font-size:13px;color:var(--text2);margin-top:5px;line-height:1.5;"><span class="cs-tag gen">Genitiv</span> — posesión. "el inicio <b>del</b> video".</div></div>';
  c1.appendChild(flow);
  host.appendChild(c1);

  // Card 2: El truco del masculino
  var c2=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:16px;margin-bottom:12px;");
  c2.appendChild(mk("p","El truco del masculino","font-size:16px;font-weight:800;color:var(--text);margin-bottom:4px;"));
  c2.appendChild(mk("p","El femenino y el neutro casi no se mueven. Tu energía va al masculino:","font-size:13px;color:var(--muted);margin-bottom:12px;font-weight:500;"));
  c2.appendChild(mk("p","der → den → dem → des","font-size:22px;font-weight:800;letter-spacing:0.02em;margin-bottom:14px;color:var(--text);"));
  var borderBox=mk("div","","border-left:3px solid var(--border);padding-left:12px;");
  borderBox.innerHTML='<p style="margin:6px 0;font-size:14px;color:var(--text2);"><span class="c-nom">Der</span> Laptop ist neu. <span style="color:var(--muted);font-size:12px;">— ¿quién es nuevo? Nominativ.</span></p>'+
    '<p style="margin:6px 0;font-size:14px;color:var(--text2);">Ich benutze <span class="c-akk">den</span> Laptop. <span style="color:var(--muted);font-size:12px;">— recibe la acción. Akkusativ.</span></p>'+
    '<p style="margin:6px 0;font-size:14px;color:var(--text2);">Ich arbeite mit <span class="c-dat">dem</span> Laptop. <span style="color:var(--muted);font-size:12px;">— "mit" manda Dativ.</span></p>'+
    '<p style="margin:6px 0;font-size:14px;color:var(--text2);">Die Tastatur <span class="c-gen">des</span> Laptops ist gut. <span style="color:var(--muted);font-size:12px;">— ¿de quién? Genitiv (+s).</span></p>';
  c2.appendChild(borderBox);
  host.appendChild(c2);
}

function casosTransformar(host){
  var c=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:16px;margin-bottom:12px;");
  c.appendChild(mk("p","Transformador de artículos","font-size:16px;font-weight:800;color:var(--text);margin-bottom:4px;"));
  c.appendChild(mk("p","Elige una palabra de tu mundo y el tipo de artículo. Ves los 4 casos al instante con su color.","font-size:13px;color:var(--muted);margin-bottom:14px;font-weight:500;line-height:1.5;"));

  var sel=document.createElement("select"); sel.className="cs-select"; sel.style.marginBottom="10px";
  [["m","Masculino"],["f","Femenino"],["n","Neutro"]].forEach(function(group){
    var og=document.createElement("optgroup"); og.label=group[1];
    CASOS_NOUNS.forEach(function(n,i){
      if(n.gen!==group[0]) return;
      var art=n.gen==='m'?'der':n.gen==='f'?'die':'das';
      var o=document.createElement("option"); o.value=i; o.textContent=art+" "+n.f[0]+" — "+n.es;
      if(i===state.cases.casesNounIdx) o.selected=true;
      og.appendChild(o);
    });
    sel.appendChild(og);
  });
  sel.onchange=function(){state.cases.casesNounIdx=+this.value;paintCasosTable(out,note);};
  c.appendChild(sel);

  var seg=mk("div","","display:inline-flex;border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:10px;");
  [["der","der/die/das"],["ein","ein"],["mein","mein"]].forEach(function(a){
    var b=mk("button",a[1],"font-size:13px;font-weight:700;padding:9px 14px;border:0;background:transparent;color:var(--muted);cursor:pointer;font-family:inherit;");
    if(state.cases.casesArt===a[0]){b.style.background="var(--text)";b.style.color="var(--bg)";}
    b.onclick=function(){state.cases.casesArt=a[0];paintCasosTable(out,note);
      Array.prototype.forEach.call(seg.children,function(x){x.style.background="transparent";x.style.color="var(--muted)";}); b.style.background="var(--text)";b.style.color="var(--bg)";};
    seg.appendChild(b);
  });
  c.appendChild(seg);

  var note=mk("p","","font-size:12px;color:var(--muted);margin-bottom:10px;font-weight:500;"); c.appendChild(note);
  var out=mk("div","",""); out.className="cs-tcase"; c.appendChild(out);
  c.appendChild(mk("p","Las frases molde siempre son correctas: sehen obliga Akkusativ, mit obliga Dativ, \"die Idee…\" obliga Genitiv.","font-size:12px;color:var(--dim);margin-top:12px;font-weight:500;line-height:1.5;"));
  host.appendChild(c);
  paintCasosTable(out,note);
}

function paintCasosTable(out, note){
  var n=CASOS_NOUNS[state.cases.casesNounIdx];
  var arts=CASOS_ART[state.cases.casesArt][n.gen];
  var genName={m:'masculino',f:'femenino',n:'neutro'}[n.gen];
  note.innerHTML="Género: <b style='color:var(--text2)'>"+casesText(genName)+"</b>"
    +(n.weak?" · ojo, sustantivo débil (-n en Akk/Dat/Gen)":"")
    +(n.gen==='f'?" · el femenino casi no cambia":"");
  var frames=[
    function(a){return {de:cap(a)+" "+n.f[0]+" ist hier.", es:capEs(n.es)+" está aquí."};},
    function(a){return {de:"Ich sehe "+a+" "+n.f[1]+".", es:"Veo "+n.es+"."};},
    function(a){return {de:"Ich arbeite mit "+a+" "+n.f[2]+".", es:"Trabajo con "+n.es+"."};},
    function(a){return {de:"die Idee "+a+" "+n.f[3], es:"la idea de "+n.es};}
  ];
  out.innerHTML="";
  CASOS_CASES.forEach(function(cs,i){
    var fr=frames[i](arts[i]);
    var row=mk("div","","display:grid;grid-template-columns:auto 1fr;border-bottom:1px solid var(--border);");
    if(i===3) row.style.borderBottom="0";
    var lbl=mk("div","","font-size:11px;font-weight:800;padding:12px;display:flex;align-items:center;gap:7px;background:var(--"+cs.cls+"-bg);color:var(--"+cs.cls+");");
    lbl.innerHTML='<span style="width:8px;height:8px;border-radius:50%;background:'+cs.dot+';display:inline-block;flex-shrink:0;"></span>'+casesText(cs.name);
    row.appendChild(lbl);
    var val=mk("div","","padding:12px 14px;border-left:1px solid var(--border);");
    val.innerHTML='<div style="font-size:17px;font-weight:800;color:var(--text);">'+casesText(arts[i]+" "+n.f[i])+'</div>'
      +'<div style="font-size:13px;margin-top:3px;color:var(--text2);font-weight:600;">'+casesText(fr.de)+'</div>'
      +'<div style="font-size:11px;color:var(--muted);margin-top:1px;">'+casesText(fr.es)+'</div>';
    row.appendChild(val);
    out.appendChild(row);
  });
}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function capEs(s){return s.charAt(0).toUpperCase()+s.slice(1);}

function casosReglas(host){
  var c=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:16px;margin-bottom:12px;");
  c.innerHTML = '<p style="font-size:16px;font-weight:800;color:var(--text);margin-bottom:4px;">Reglas express</p>'
    + '<p style="font-size:13px;color:var(--muted);margin-bottom:14px;font-weight:500;">Cerradas para que no te abrumen. Abre solo la que necesites.</p>'
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
    + '<details class="cs-acc"><summary>Verbos y el caso que mandan (rección)</summary><div class="cs-accbody">'
      + '<p style="margin:8px 0 2px;font-size:13px;"><span class="cs-tag nom">Nominativ</span> — copulativos: lo que sigue NO es objeto, es el mismo sujeto:</p>'
      + '<div class="cs-chips"><span class="cs-chip nom">sein</span><span class="cs-chip nom">werden</span><span class="cs-chip nom">bleiben</span><span class="cs-chip nom">heißen</span></div>'
      + '<p class="cs-ex">Er ist <span class="c-nom">der</span> Chef. <span style="color:var(--muted);">(¡no "den"! — sein no lleva Akkusativ)</span></p>'
      + '<p class="cs-ex">Das bleibt <span class="c-nom">ein</span> Problem.</p>'
      + '<p style="margin:14px 0 2px;font-size:13px;"><span class="cs-tag akk">Akkusativ</span> — la gran mayoría (objeto directo, ¿qué?):</p>'
      + '<div class="cs-chips"><span class="cs-chip akk">haben</span><span class="cs-chip akk">machen</span><span class="cs-chip akk">sehen</span><span class="cs-chip akk">kaufen</span><span class="cs-chip akk">brauchen</span><span class="cs-chip akk">suchen</span><span class="cs-chip akk">finden</span><span class="cs-chip akk">benutzen</span><span class="cs-chip akk">es gibt</span></div>'
      + '<p class="cs-ex">Ich brauche <span class="c-akk">einen</span> neuen Laptop.</p>'
      + '<p class="cs-ex">Es gibt <span class="c-akk">einen</span> Fehler im Code.</p>'
      + '<p style="margin:14px 0 2px;font-size:13px;"><span class="cs-tag dat">Dativ</span> — el grupo que se memoriza (la "víctima" es persona):</p>'
      + '<div class="cs-chips"><span class="cs-chip dat">helfen</span><span class="cs-chip dat">danken</span><span class="cs-chip dat">gefallen</span><span class="cs-chip dat">gehören</span><span class="cs-chip dat">antworten</span><span class="cs-chip dat">glauben</span><span class="cs-chip dat">folgen</span><span class="cs-chip dat">passen</span><span class="cs-chip dat">schmecken</span></div>'
      + '<p class="cs-ex">Ich helfe <span class="c-dat">dem</span> Mann. <span style="color:var(--muted);">(nunca "den Mann")</span></p>'
      + '<p class="cs-ex">Das Handy gehört <span class="c-dat">meiner</span> Schwester.</p>'
      + '<p style="margin:14px 0 2px;font-size:13px;"><span class="cs-tag dat">Dat</span> + <span class="cs-tag akk">Akk</span> — dar ALGO (Akk) a ALGUIEN (Dat):</p>'
      + '<div class="cs-chips"><span class="cs-chip dat">geben</span><span class="cs-chip dat">schenken</span><span class="cs-chip dat">zeigen</span><span class="cs-chip dat">erklären</span><span class="cs-chip dat">bringen</span><span class="cs-chip dat">schicken</span><span class="cs-chip dat">empfehlen</span></div>'
      + '<p class="cs-ex">Ich gebe <span class="c-dat">dem</span> Kunden <span class="c-akk">den</span> Report.</p>'
      + '<p style="margin:14px 0 2px;font-size:13px;">Verbo + preposición fija (el caso lo manda la preposición):</p>'
      + '<p class="cs-ex">denken an + <span class="cs-tag akk">Akk</span> · warten auf + <span class="cs-tag akk">Akk</span> · sich freuen auf + <span class="cs-tag akk">Akk</span> · arbeiten an + <span class="cs-tag dat">Dat</span> · träumen von + <span class="cs-tag dat">Dat</span></p>'
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

function casosPracticar(host){
  var c=mk("div","","background:var(--surface);border:1px solid rgba(143,144,158,0.35);border-radius:20px;padding:20px;margin-bottom:12px;box-shadow:0 4px 24px rgba(0,0,0,0.22);");
  c.appendChild(mk("p","Practicar","font-size:18px;font-weight:900;color:var(--text);margin-bottom:4px;letter-spacing:-0.02em;"));
  c.appendChild(mk("p","Eliges, te corrige ahí mismo y te dice el porqué.","font-size:13px;color:var(--text2);margin-bottom:14px;font-weight:500;"));

  var modes=mk("div","","display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;");
  [["all","Mezcla"],["articulo","Artículos"],["caso","Identificar"],["mov","Movimiento"],["traduccion","Traducir"]].forEach(function(m){
    var b=mk("button",m[1],"font-size:12px;font-weight:700;padding:8px 14px;border-radius:22px;border:1.5px solid rgba(143,144,158,0.3);background:rgba(255,255,255,0.04);color:var(--text2);font-family:inherit;cursor:pointer;transition:all .2s;");
    if(state.cases.casesQuizMode===m[0]){b.style.background="var(--primary)";b.style.color="var(--on-primary)";b.style.borderColor="var(--primary)";b.style.boxShadow="0 4px 16px rgba(var(--primary-rgb),0.25)";}
    b.onclick=function(){state.cases.casesQuizMode=m[0];state.cases.casesLastAnswer=null;casesBuildPool();casesNextQ();renderCases();};
    modes.appendChild(b);
  });
  c.appendChild(modes);

  var hit=state.cases.casesHits, tot=state.cases.casesTotal, str=state.cases.casesStreak;
  var score=mk("div","","display:flex;gap:20px;align-items:baseline;margin-bottom:16px;font-size:13px;");
  score.innerHTML='<span style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:var(--muted);font-weight:700;letter-spacing:1px;">ACIERTOS<b id="cs-hit" style="color:var(--text);font-size:22px;font-weight:900;">'+hit+'</b> <span style="font-weight:600;color:var(--dim);">de <b id="cs-tot" style="color:var(--text);font-weight:800;">'+tot+'</b></span></span>'
    +'<span style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:var(--muted);font-weight:700;letter-spacing:1px;">RACHA<b id="cs-streak" style="color:var(--gold-text);font-size:22px;font-weight:900;">'+str+'</b></span>'
    +'<span style="display:flex;flex-direction:column;gap:2px;font-size:10px;color:var(--muted);font-weight:700;letter-spacing:1px;">%<b id="cs-pct" style="color:var(--text);font-size:22px;font-weight:900;">'+(tot?Math.round(hit/tot*100)+'%':'—')+'</b></span>';
  c.appendChild(score);

  var mount=mk("div","",""); mount.id="cs-quiz-mount"; c.appendChild(mount);
  host.appendChild(c);
  if(!state.cases.casesPool.length) casesBuildPool();
  casosRenderQ(mount);
}

function casesShuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.random()*(i+1)|0;var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function casesBuildPool(){ state.cases.casesPool=casesShuffle(state.cases.casesQuizMode==='all'?CASOS_Q:CASOS_Q.filter(function(q){return q.mode===state.cases.casesQuizMode;})); state.cases.casesIdx=0; state.cases.casesLastAnswer=null; }
function casesUpdateScore(){
  var h=document.getElementById("cs-hit"); if(!h) return;
  h.textContent=state.cases.casesHits; document.getElementById("cs-tot").textContent=state.cases.casesTotal;
  document.getElementById("cs-streak").textContent=state.cases.casesStreak;
  document.getElementById("cs-pct").textContent=state.cases.casesTotal?Math.round(state.cases.casesHits/state.cases.casesTotal*100)+'%':'—';
}
function casesNextQ(){
  if(state.cases.casesIdx>=state.cases.casesPool.length){ state.cases.casesPool=casesShuffle(state.cases.casesPool); state.cases.casesIdx=0; }
  var m=document.getElementById("cs-quiz-mount"); if(m) casosRenderQ(m);
}
function casesAdvanceQ(){
  state.cases.casesIdx++;
  state.cases.casesLastAnswer=null;
  casesNextQ();
}
function casesRecordResult(correct){
  state.cases.casesTotal++;
  if(correct){state.cases.casesHits++;state.cases.casesStreak++;}
  else state.cases.casesStreak=0;
  logActivity("drillsDone",1);
  syncUp();
  casesUpdateScore();
}

function casosRenderQ(mount){
  if(!state.cases.casesPool.length){ mount.innerHTML="<p style='color:var(--muted);font-size:13px;text-align:center;padding:20px;'>Sin preguntas en este modo.</p>"; return; }
  if(state.cases.casesIdx>=state.cases.casesPool.length){ state.cases.casesPool=casesShuffle(state.cases.casesPool); state.cases.casesIdx=0; }
  var q=state.cases.casesPool[state.cases.casesIdx];
  var last=state.cases.casesLastAnswer;
  state.cases.casesAnswered=!!(last&&last.key===casesQuestionKey(q)&&last.idx===state.cases.casesIdx);
  if(q.mode==='traduccion'){ casosRenderTrad(q,mount); return; }
  var modoLbl={articulo:'Elige el artículo',caso:'¿Qué caso es?',mov:'Movimiento o ubicación'}[q.mode];
  var sentence=casesInlineHtml(q.sentence).replace('___','<span class="cs-blank">___</span>');
  mount.innerHTML='<div style="border:1.5px solid rgba(143,144,158,0.3);border-radius:18px;padding:20px;background:rgba(255,255,255,0.02);box-shadow:0 4px 18px rgba(0,0,0,0.16);">'
    +'<div style="font-size:11px;color:var(--muted);font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px;">'+casesText(modoLbl)+'</div>'
    +'<p style="font-size:18px;line-height:1.5;margin-bottom:4px;color:var(--text);">'+sentence+'</p>'
    +(q.hint?'<p style="font-size:12px;color:var(--muted);margin-bottom:14px;">'+casesText(q.hint)+'</p>':'<div style="margin-bottom:14px;"></div>')
    +'<div class="cs-opts" id="cs-opts"></div>'
    +'<div id="cs-fb" style="margin-top:14px;display:none;"></div>'
    +'<div id="cs-next" style="margin-top:14px;display:none;justify-content:flex-end;">'
    +'<button id="cs-nextbtn" style="font-size:14px;font-weight:700;padding:10px 18px;border-radius:11px;border:0;background:var(--primary);color:var(--on-primary);cursor:pointer;">Siguiente →</button></div>'
    +'</div>';
  var opts=document.getElementById("cs-opts");
  q.op.forEach(function(o){
    var b=mk("button",o,"font-size:15px;font-weight:700;padding:14px;border-radius:14px;border:1.5px solid rgba(143,144,158,0.35);background:var(--surface);color:var(--text);transition:transform .05s,border-color .15s;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.1);");
    b.onclick=function(){casesChoose(q,o,opts,b);};
    opts.appendChild(b);
  });
  var nb=document.getElementById("cs-nextbtn"); if(nb) nb.onclick=casesAdvanceQ;
  if(last&&last.key===casesQuestionKey(q)&&last.idx===state.cases.casesIdx){
    var selectedBtn=null;
    Array.prototype.forEach.call(opts.children,function(b){if(b.textContent===last.selected) selectedBtn=b;});
    casesPaintChoice(q,last.selected,opts,selectedBtn,last.correct,false);
  }
}

function casesChoose(q,o,opts,btn){
  if(state.cases.casesAnswered) return; state.cases.casesAnswered=true;
  var correct=o===q.ok;
  state.cases.casesLastAnswer={key:casesQuestionKey(q),idx:state.cases.casesIdx,selected:o,correct:correct};
  casesRecordResult(correct);
  casesPaintChoice(q,o,opts,btn,correct,true);
}

function casesPaintChoice(q,o,opts,btn,correct,focusNext){
  Array.prototype.forEach.call(opts.children,function(b){
    if(b.textContent===q.ok){ b.style.borderColor="var(--akk)";b.style.background="var(--akk-bg)";b.style.color="var(--green-text)"; }
    else if(b===btn){ b.style.borderColor="var(--red)";b.style.background="rgba(var(--red-rgb),0.1)";b.style.color="var(--red-text)"; }
    else b.style.opacity="0.4";
    b.style.pointerEvents="none";
  });
  var fb=document.getElementById("cs-fb");
  var caseNames={nom:'Nominativ',akk:'Akkusativ',dat:'Dativ',gen:'Genitiv'};
  var tag=q.caso?'<span class="cs-tag '+q.caso+'">'+caseNames[q.caso]+'</span> ':'';
  fb.style.display="block";
  fb.style.cssText="margin-top:14px;display:block;border-radius:12px;padding:13px;font-size:14px;background:"+(correct?"var(--akk-bg)":"rgba(var(--red-rgb),0.08)")+";border:1px solid "+(correct?"var(--akk-line)":"rgba(var(--red-rgb),0.25)")+";";
  fb.innerHTML='<div style="font-weight:800;color:'+(correct?"var(--green-text)":"var(--red-text)")+';margin-bottom:5px;">'+(correct?'✓ Correcto':'✗ Casi · la respuesta es '+casesText(q.ok))+'</div>'
    +'<div style="color:var(--text2);line-height:1.5;">'+tag+casesText(q.why)+'</div>';
  document.getElementById("cs-next").style.display="flex";
  var nb=document.getElementById("cs-nextbtn");
  if(focusNext&&nb) setTimeout(function(){nb.focus();},0);
}

function casosRenderTrad(q,mount){
  mount.innerHTML='<div style="border:1px solid var(--border);border-radius:14px;padding:16px;background:rgba(255,255,255,0.03);">'
    +'<div style="font-size:11px;color:var(--muted);font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px;">Tradúcelo en tu cabeza</div>'
    +'<p style="font-size:18px;line-height:1.5;margin-bottom:14px;color:var(--text);">'+casesText(q.es)+'</p>'
    +'<button id="cs-rev" style="font-size:14px;font-weight:700;padding:10px 16px;border-radius:11px;border:1px solid var(--border);background:rgba(255,255,255,0.04);color:var(--text);cursor:pointer;">Ver respuesta</button>'
    +'<div id="cs-ans" style="display:none;margin-top:14px;padding:13px;border-radius:12px;background:var(--akk-bg);border:1px solid var(--akk-line);">'
      +'<div style="font-size:16px;font-weight:600;color:var(--text);">'+casesInlineHtml(q.de)+'</div>'
      +'<div style="margin-top:6px;font-size:13px;color:var(--text2);line-height:1.5;">'+casesText(q.why)+'</div>'
      +'<div style="margin-top:12px;display:flex;gap:8px;">'
        +'<button id="cs-got" style="font-size:13px;font-weight:700;padding:9px 14px;border-radius:11px;border:1px solid var(--border);background:rgba(255,255,255,0.04);color:var(--text);cursor:pointer;">La tenía ✓</button>'
        +'<button id="cs-miss" style="font-size:13px;font-weight:700;padding:9px 14px;border-radius:11px;border:1px solid var(--border);background:rgba(255,255,255,0.04);color:var(--text);cursor:pointer;">Fallé</button>'
      +'</div></div></div>';
  document.getElementById("cs-rev").onclick=function(){
    document.getElementById("cs-ans").style.display="block"; this.style.display="none";
    var got=document.getElementById("cs-got"); if(got) got.focus();
  };
  document.getElementById("cs-got").onclick=function(){
    casesRecordResult(true);
    casesAdvanceQ();
  };
  document.getElementById("cs-miss").onclick=function(){
    casesRecordResult(false);
    casesAdvanceQ();
  };
}
