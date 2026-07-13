// ── Trennbare Verben (separable-verb position drill) ──────────────────────────
(function(){
// Each item: sentence with 1–2 gaps; pick the combo with verb + prefix in the
// right position. correct fills the gaps in order (split on space for 2 gaps).
var TRENNBAR_POOL=[
 {s:"Ich ___ meinen Freund ___.", correct:"rufe an", d:["anrufe","ruft an"], full:"Ich rufe meinen Freund an.", r:"anrufen: en presente el prefijo <b>an</b> va AL FINAL. En subordinada van juntos: ..., weil ich ihn anrufe."},
 {s:"Er ___ um 7 Uhr ___.", correct:"steht auf", d:["aufsteht","stehst auf"], full:"Er steht um 7 Uhr auf.", r:"aufstehen: er steh<b>t</b>... auf. El prefijo cierra la frase."},
 {s:"Ich ___ im Supermarkt ___.", correct:"kaufe ein", d:["einkaufe","kauft ein"], full:"Ich kaufe im Supermarkt ein.", r:"einkaufen: ich kauf<b>e</b>... ein."},
 {s:"___ du mich heute Abend ___?", correct:"Rufst an", d:["Anrufst","Rufe an"], full:"Rufst du mich heute Abend an?", r:"Pregunta: verbo conjugado primero, sujeto después, prefijo al final."},
 {s:"Ich ___ um 8 Uhr mit dem Zug ___.", correct:"fahre los", d:["losfahre","fährt los"], full:"Ich fahre um 8 Uhr mit dem Zug los.", r:"losfahren = partir. ich fahr<b>e</b>... los."},
 {s:"Sie ___ ihre Familie zum Essen ___.", correct:"lädt ein", d:["einlädt","ladet ein"], full:"Sie lädt ihre Familie zum Essen ein.", r:"einladen (a→ä): sie <b>lädt</b>... ein. 'ladet' no existe en singular."},
 {s:"Wir ___ das Projekt diese Woche ___.", correct:"schließen ab", d:["abschließen","schließt ab"], full:"Wir schließen das Projekt diese Woche ab.", r:"abschließen = terminar/cerrar. wir schließ<b>en</b>... ab."},
 {s:"Ich ___ dich morgen vom Flughafen ___.", correct:"hole ab", d:["abhole","holst ab"], full:"Ich hole dich morgen vom Flughafen ab.", r:"abholen = recoger. ich hol<b>e</b>... ab."},
 {s:"___ du heute Abend ___?", correct:"Kommst mit", d:["Mitkommst","Kommen mit"], full:"Kommst du heute Abend mit?", r:"mitkommen = acompañar. Pregunta: Kommst du... mit?"},
 {s:"Die Firma ___ neue Leute ___.", correct:"stellt ein", d:["einstellt","stellst ein"], full:"Die Firma stellt neue Leute ein.", r:"einstellen = contratar. die Firma (sie) stell<b>t</b>... ein."},
 {s:"Ich ___ beim Wettbewerb ___.", correct:"mache mit", d:["mitmache","machst mit"], full:"Ich mache beim Wettbewerb mit.", r:"mitmachen = participar. ich mach<b>e</b>... mit."},
 {s:"Er ___ mir das Geld ___.", correct:"gibt zurück", d:["zurückgibt","gebe zurück"], full:"Er gibt mir das Geld zurück.", r:"zurückgeben (e→i): er <b>gibt</b>... zurück."},
 {s:"Ich ___ mir jeden Tag die Nachrichten ___.", correct:"sehe an", d:["ansehe","siehst an"], full:"Ich sehe mir jeden Tag die Nachrichten an.", r:"sich (Dat.) ansehen = mirar. ich seh<b>e</b> mir... an."},
 {s:"___ du bitte das Fenster ___?", correct:"Machst zu", d:["Zumachst","Mache zu"], full:"Machst du bitte das Fenster zu?", r:"zumachen = cerrar. Machst du... zu?"},
 {s:"Ich muss dich später ___.", correct:"anrufen", d:["rufe an","an rufen"], full:"Ich muss dich später anrufen.", r:"Con verbo modal (muss), el separable va JUNTO al final en infinitivo: anrufen."},
 {s:"Ich bin müde, weil ich so früh ___.", correct:"aufstehe", d:["stehe auf","auf stehe"], full:"Ich bin müde, weil ich so früh aufstehe.", r:"Subordinada (weil): el verbo separable va JUNTO al final: ...aufstehe."}
];
var ROUND=10, deck=[], idx=0, right=0, missed=[], locked=false;

if(!state.trennbare) state.trennbare={};
if(!state.trennbare._deck) state.trennbare._deck=[];
if(typeof state.trennbare._idx!=="number") state.trennbare._idx=0;
if(typeof state.trennbare._right!=="number") state.trennbare._right=0;

function shuffle(a){a=a.slice();for(var k=a.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1));var t=a[k];a[k]=a[j];a[j]=t;}return a;}

function trennStart(){
  deck=shuffle(TRENNBAR_POOL).slice(0,ROUND); idx=0; right=0; missed=[]; locked=false;
  state.trennbare._deck=deck; state.trennbare._idx=0; state.trennbare._right=0; state.trennbare._logged=false;
  trennRender();
}
function trennRender(){
 var el=document.getElementById("s-trennbare"); if(!el) return; el.innerHTML="";
 if(!deck.length){trennStart();return;}
 if(idx>=deck.length){trennSummary(el);return;}
 var q=deck[idx]; locked=false;
 // ── Header ──
 var hdr=mk("div","","margin-bottom:14px;");
 hdr.appendChild(mk("p","Gramática · Verbos separables","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
 var h2row=mk("div","","display:flex;align-items:center;gap:8px;margin:3px 0 4px;");
 h2row.appendChild(mk("h2","Trennbare Verben","font-size:24px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin:0;color:var(--text);"));
 var refBtn=mk("button","📗","background:none;border:none;font-size:20px;cursor:pointer;opacity:0.6;transition:opacity .15s;padding:2px;");
 refBtn.title="Reglas de posición del prefijo"; refBtn.setAttribute("aria-label","Reglas de los verbos separables");
 refBtn.onmouseenter=function(){this.style.opacity="1";}; refBtn.onmouseleave=function(){this.style.opacity="0.6";};
 refBtn.onclick=trennRefModal;
 h2row.appendChild(refBtn);
 hdr.appendChild(h2row);
 hdr.appendChild(mk("p","Elige la forma con el verbo y el prefijo en la posición correcta.","font-size:13px;color:var(--muted);font-weight:500;margin-bottom:0;"));
 el.appendChild(hdr);
 // ── Dots + score ──
 var top=mk("div","","display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;");
 var dots=mk("div","","display:flex;gap:5px;"); dots.className="dots stagger";
 for(var k=0;k<deck.length;k++){
   var dot=mk("span","","width:22px;height:5px;border-radius:4px;background:rgba(255,255,255,.08);transition:background .25s;");
   if(k<idx) dot.style.background=missed.some(function(m){return m.q===deck[k];})?"var(--red)":"var(--green)";
   else if(k===idx) dot.style.background="var(--gold)";
   dots.appendChild(dot);
 }
 top.appendChild(dots);
 var sc=mk("span","","font-size:12px;font-weight:800;color:var(--muted);font-variant-numeric:tabular-nums;"); sc.className="score";
 sc.innerHTML="<b style=color:var(--green);font-size:15px>"+right+"</b> / "+idx;
 top.appendChild(sc);
 el.appendChild(top);
 // ── Card ──
 var card=mk("div","","border-radius:20px;padding:20px 18px;margin-bottom:12px;"); card.className="stitch-glass anim-in";
 var sent=mk("p","","font-size:19px;font-weight:700;line-height:1.55;text-align:center;color:var(--text);margin-bottom:16px;");
 var parts=q.s.split("___"), gaps=[];
 sent.appendChild(document.createTextNode(parts[0]));
 for(var p=1;p<parts.length;p++){
   var gap=mk("span","____","display:inline-block;min-width:60px;border-bottom:2px dashed rgba(var(--gold-rgb),.5);text-align:center;color:var(--gold);font-weight:900;padding:0 6px;");
   gaps.push(gap); sent.appendChild(gap);
   if(parts[p]) sent.appendChild(document.createTextNode(parts[p]));
 }
 card.appendChild(sent);
 // ── Options ──
 var opts=mk("div","","display:flex;flex-direction:column;gap:8px;");
 shuffle([q.correct].concat(q.d)).forEach(function(o){
   var b=mk("button",o,"text-align:center;padding:13px;border-radius:13px;font-size:15px;font-weight:800;cursor:pointer;border:1.5px solid var(--border);background:rgba(255,255,255,0.05);color:var(--text);font-family:inherit;transition:border-color .15s,background .15s;");
   b.className="lift"; b.style.setProperty("--lift-rgb","var(--gold-rgb)");
   b.dataset.v=o;
   b.onclick=function(){trennPick(b,q,opts,gaps);};
   opts.appendChild(b);
 });
 card.appendChild(opts);
 // ── Feedback + next ──
 var fb=mk("div","","display:none;border-radius:13px;padding:12px 14px;margin-top:14px;font-size:13px;line-height:1.55;font-weight:500;"); fb.id="trenn-fb";
 card.appendChild(fb);
 var nx=mk("button","Siguiente →","width:100%;margin-top:12px;padding:13px;border-radius:14px;border:1px solid var(--border);background:rgba(255,255,255,0.05);color:var(--text);font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;display:none;"); nx.id="trenn-nx";
 nx.onclick=function(){ idx++; state.trennbare._idx=idx; trennRender(); };
 card.appendChild(nx);
 el.appendChild(card);
 el.appendChild(mk("p",(idx+1)+" de "+deck.length,"font-size:11px;color:var(--dim);font-weight:600;text-align:center;font-variant-numeric:tabular-nums;"));
}
function trennPick(btn,q,opts,gaps){
 if(locked) return; locked=true;
 var ok=btn.dataset.v===q.correct;
 opts.querySelectorAll("button").forEach(function(b){
   b.disabled=true; b.classList.remove("lift");
   if(b.dataset.v===q.correct){ b.style.background="rgba(var(--green-rgb),0.14)"; b.style.borderColor="var(--green)"; b.style.color="var(--green)"; }
   else if(b===btn){ b.style.background="rgba(var(--red-rgb),0.12)"; b.style.borderColor="var(--red)"; b.style.color="var(--red)"; }
   else b.style.opacity="0.45";
 });
 // Fill the gaps with the correct answer (first token / rest)
 var toks=q.correct.split(" ");
 gaps.forEach(function(g,i){
   g.textContent=gaps.length===1?q.correct:(i===0?toks[0]:toks.slice(1).join(" "));
   g.style.borderBottomColor="transparent"; g.style.color=ok?"var(--green)":"var(--red)";
 });
 var fb=document.getElementById("trenn-fb"); fb.style.display="block"; fb.className="anim-in";
 fb.style.background=ok?"rgba(var(--green-rgb),0.09)":"rgba(var(--red-rgb),0.08)";
 fb.style.border=ok?"1px solid rgba(var(--green-rgb),0.3)":"1px solid rgba(var(--red-rgb),0.3)";
 fb.innerHTML='<b style="display:block;font-size:14px;font-weight:800;margin-bottom:4px;color:'+(ok?"var(--green)":"var(--red)")+';">'+(ok?"✓ ":"✗ ")+q.full+'</b><span style="color:var(--muted);">'+q.r+'</span>';
 if(ok) right++; else missed.push({q:q});
 state.trennbare._right=right;
 document.getElementById("trenn-nx").style.display="block";
 var dots=document.querySelectorAll("#s-trennbare .dots span"); if(dots[idx]) dots[idx].style.background=ok?"var(--green)":"var(--red)";
 var scEl=document.querySelector("#s-trennbare .score"); if(scEl) scEl.innerHTML="<b style=color:var(--green);font-size:15px>"+right+"</b> / "+(idx+1);
}
function trennSummary(el){
 var pct=Math.round(right/deck.length*100);
 var em=pct>=90?"🏆":pct>=70?"💪":pct>=50?"📈":"🌱";
 var ti=pct>=90?"¡Sehr gut!":pct>=70?"¡Buen ritmo!":"Sigue puliendo";
 var hdr=mk("div","","margin-bottom:14px;");
 hdr.appendChild(mk("p","Gramática · Verbos separables","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
 hdr.appendChild(mk("h2","Trennbare Verben","font-size:24px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin:3px 0 4px;color:var(--text);"));
 el.appendChild(hdr);
 var card=mk("div","","border-radius:20px;padding:24px 18px;text-align:center;"); card.className="stitch-glass anim-in";
 card.appendChild(mk("p",em,"font-size:52px;margin:0;"));
 card.appendChild(mk("h3",ti,"font-size:22px;font-weight:900;letter-spacing:-.02em;margin:10px 0 4px;color:var(--text);"));
 var pctEl=mk("p","","font-size:14px;color:var(--muted);font-weight:600;margin-bottom:16px;");
 pctEl.innerHTML=right+' de '+deck.length+' correctas · <i style="font-style:normal;color:var(--gold);font-weight:900">'+pct+'%</i>';
 card.appendChild(pctEl);
 if(missed.length){
   var miss=mk("div","","text-align:left;border-top:1px dashed rgba(255,255,255,.1);padding-top:14px;margin-bottom:4px;");
   miss.appendChild(mk("p","Para repasar · "+missed.length,"font-size:9.5px;letter-spacing:2px;font-weight:800;color:var(--dim);text-transform:uppercase;margin-bottom:8px;"));
   missed.forEach(function(m,i){
     var mi=mk("div","","padding:8px 0;border-bottom:"+(i===missed.length-1?"none":"1px solid rgba(255,255,255,.05)")+";");
     mi.appendChild(mk("p",m.q.full,"font-size:14px;font-weight:800;color:var(--green);margin:0 0 2px 0;"));
     var why=mk("p","","font-size:11.5px;color:var(--muted);font-weight:500;margin:0;"); why.innerHTML=m.q.r; mi.appendChild(why);
     miss.appendChild(mi);
   });
   card.appendChild(miss);
 }
 var again=mk("button","🎯 Otra ronda","width:100%;margin-top:16px;padding:15px;border-radius:15px;border:none;cursor:pointer;background:var(--gold);color:#291800;font-size:15px;font-weight:900;font-family:inherit;box-shadow:0 6px 20px rgba(var(--gold-rgb),.3);");
 again.onclick=trennStart; card.appendChild(again);
 el.appendChild(card);
 if(!state.trennbare._logged){
   state.trennbare._logged=true;
   if(typeof logActivity==="function") logActivity("drillsDone",1);
   if(missed.length && state.session && Array.isArray(state.session.errorJournal)){
     missed.forEach(function(m){
       state.session.errorJournal.push({date:todayKey(), type:"grammar", source:"trennbare", original:m.q.s, correction:m.q.full, tip:(m.q.r||"").replace(/<[^>]*>/g,"")});
     });
     if(state.session.errorJournal.length>50) state.session.errorJournal=state.session.errorJournal.slice(-50);
   }
   if(typeof syncUp==="function") syncUp();
 }
}

// ── 📗 Reference: prefix position rules by sentence structure ─────────────────
function trennRefModal(){
  var o=document.createElement("div");
  o.style.cssText="position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0.6);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto;opacity:0;transition:opacity .18s ease;";
  function closeRef(){o.style.opacity="0";setTimeout(function(){if(o.parentNode)o.parentNode.removeChild(o);},180);}
  o.onclick=function(e){if(e.target===o)closeRef();};
  var c=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:22px;padding:22px;max-width:580px;width:100%;margin:16px 0;box-shadow:0 20px 60px rgba(0,0,0,0.5);");
  c.setAttribute("role","dialog"); c.setAttribute("aria-modal","true"); c.setAttribute("aria-label","Verbos separables");
  c.onclick=function(e){e.stopPropagation();};
  c.appendChild(mk("p","Verbos separables — reglas","font-size:15px;font-weight:900;color:var(--text);margin-bottom:2px;letter-spacing:-0.02em;"));
  c.appendChild(mk("p","Prefijos: an · auf · ein · aus · mit · ab · bei · los · vor · zu · weg · zurück · her · hin · fest...","font-size:11px;color:var(--muted);font-weight:500;margin-bottom:14px;line-height:1.5;"));
  function sec(color,rgb,title,items){
    var s=mk("div","","border-radius:13px;padding:12px 14px;margin-bottom:9px;background:rgba("+rgb+",0.06);border:1px solid rgba("+rgb+",0.22);");
    s.appendChild(mk("p",title,"font-size:12.5px;font-weight:900;color:"+color+";margin-bottom:6px;"));
    items.forEach(function(it){var p=mk("p","","font-size:12px;color:var(--text2);font-weight:500;line-height:1.55;");p.innerHTML="• "+it;s.appendChild(p);});
    return s;
  }
  c.appendChild(sec("var(--gold)","var(--gold-rgb)","1 · Presente / Präteritum → prefijo AL FINAL:",
   ["Ich rufe meinen Freund <b>an</b>.","Ich rief meinen Freund <b>an</b>."]));
  c.appendChild(sec("var(--teal)","var(--teal-rgb)","2 · Subordinada (weil, dass, obwohl...) → JUNTOS al final:",
   ["..., weil ich meinen Freund <b>anrufe</b>."]));
  c.appendChild(sec("var(--purple)","var(--purple-rgb)","3 · Con verbo modal (können, müssen...) → infinitivo JUNTO al final:",
   ["Ich möchte meinen Freund <b>anrufen</b>."]));
  c.appendChild(sec("var(--green)","var(--green-rgb)","4 · Partizip II → -ge- entre prefijo y raíz:",
   ["Ich habe meinen Freund <b>an<u>ge</u>rufen</b>."]));
  c.appendChild(sec("var(--red)","var(--red-rgb)","5 · zu + Infinitiv → -zu- entre prefijo y verbo:",
   ["Ich versuche, meinen Freund <b>an<u>zu</u>rufen</b>."]));
  var close=mk("button","Cerrar","width:100%;padding:13px;border-radius:13px;border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-size:13px;font-weight:700;cursor:pointer;margin-top:14px;font-family:inherit;");
  close.onclick=closeRef; c.appendChild(close); o.appendChild(c);
  document.body.appendChild(o);
  requestAnimationFrame(function(){o.style.opacity="1";});
}

function renderTrennbare(){
  if(!state.trennbare._deck||!state.trennbare._deck.length){ trennStart(); return; }
  deck=state.trennbare._deck; idx=state.trennbare._idx; right=state.trennbare._right; missed=[]; locked=false;
  trennRender();
}
window.renderTrennbare=renderTrennbare;
})();
