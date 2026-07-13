// ── Adjektive (adjective-ending drill: weak / mixed declension) ───────────────
(function(){
// Each item: pick article+adjective (2 words); noun stays in the sentence.
// correct = right combo · d = distractors · r = rule (Spanish, HTML ok — static, not AI)
var ADJ_POOL=[
 // ── ein-Wörter (mixta) ──
 {s:"Ich habe ___ Freund.", correct:"einen neuen", d:["einen neue","ein neuen"], full:"Ich habe einen neuen Freund.", r:"Mask. Akkusativ (ein-): <b>einen</b> marca el caso → adjetivo relajado <b>-en</b>."},
 {s:"Das ist ___ Wein.", correct:"ein guter", d:["ein gute","einen guter"], full:"Das ist ein guter Wein.", r:"Mask. Nominativ (ein-): <b>ein</b> NO marca → el adjetivo compensa: <b>-er</b>."},
 {s:"Das ist ___ Haus.", correct:"ein schönes", d:["ein schöne","ein schönen"], full:"Das ist ein schönes Haus.", r:"Neut. Nominativ (ein-): <b>ein</b> NO marca → adjetivo <b>-es</b>."},
 {s:"Ich wohne in ___ Zimmer.", correct:"einem kleinen", d:["einem kleines","einem kleiner"], full:"Ich wohne in einem kleinen Zimmer.", r:"Neut. Dativ: <b>einem</b> marca → adjetivo <b>-en</b>."},
 {s:"Ich suche ___ Wohnung.", correct:"eine große", d:["eine großen","einen große"], full:"Ich suche eine große Wohnung.", r:"Fem. Akkusativ: femenino no cambia; adjetivo <b>-e</b>."},
 {s:"Er wohnt in ___ Stadt.", correct:"einer kleinen", d:["eine kleinen","einer kleine"], full:"Er wohnt in einer kleinen Stadt.", r:"Fem. Dativ: <b>einer</b> marca → adjetivo <b>-en</b>."},
 {s:"Ich habe ___ Bruder.", correct:"einen älteren", d:["einen älter","ein älteren"], full:"Ich habe einen älteren Bruder.", r:"Mask. Akkusativ: <b>einen</b> marca → älter + <b>-en</b> = älteren."},
 {s:"Sie kommt aus ___ Land.", correct:"einem weiten", d:["einem weites","ein weiten"], full:"Sie kommt aus einem weiten Land.", r:"Neut. Dativ: <b>einem</b> marca → adjetivo <b>-en</b>."},
 // ── Posesivos (= ein-Wörter) ──
 {s:"Ich suche ___ Wohnung.", correct:"meine neue", d:["meine neuen","meinen neue"], full:"Ich suche meine neue Wohnung.", r:"Posesivo = ein-Wort. Fem. Akk: meine + adjetivo <b>-e</b>."},
 {s:"Er wohnt in ___ Stadt.", correct:"seiner großen", d:["seine großen","seiner große"], full:"Er wohnt in seiner großen Stadt.", r:"Fem. Dativ: <b>seiner</b> marca → adjetivo <b>-en</b>."},
 {s:"Das ist ___ Problem.", correct:"ihr großes", d:["ihre großes","ihr große"], full:"Das ist ihr großes Problem.", r:"Neut. Nominativ: <b>ihr</b> (posesivo) NO marca → adjetivo <b>-es</b>."},
 {s:"Ich mag ___ Bruder.", correct:"meinen älteren", d:["meinen älter","mein älteren"], full:"Ich mag meinen älteren Bruder.", r:"Mask. Akk: <b>meinen</b> marca → adjetivo <b>-en</b>."},
 // ── der-Wörter (débil) ──
 {s:"___ Mann kommt zuerst.", correct:"Der erste", d:["Der ersten","Den erste"], full:"Der erste Mann kommt zuerst.", r:"Mask. Nominativ débil (der): <b>der</b> marca → adjetivo <b>-e</b>."},
 {s:"Ich sehe ___ Mann.", correct:"den ersten", d:["den erste","dem ersten"], full:"Ich sehe den ersten Mann.", r:"Mask. Akkusativ débil: <b>den</b> marca → adjetivo <b>-en</b>."},
 {s:"___ Kind lernt schnell.", correct:"Das erste", d:["Das ersten","Dem erste"], full:"Das erste Kind lernt schnell.", r:"Neut. Nominativ débil: <b>das</b> marca → adjetivo <b>-e</b>."},
 {s:"___ Kinder sind schon da.", correct:"Die ersten", d:["Die erste","Den ersten"], full:"Die ersten Kinder sind schon da.", r:"Plural débil: SIEMPRE <b>-en</b> (die ersten Kinder)."}
];

// ── Débil (der/die/das) ──
var ADJ_WEAK=[
 {t:"weak", s:"___ Mann ist freundlich.", correct:"Der kleine", d:["Der kleiner","Ein kleine"], full:"Der kleine Mann ist freundlich.", r:"Mask. Nom, débil: <b>der</b> marca el género → adjetivo <b>-e</b>."},
 {t:"weak", s:"Ich sehe ___ Mann.", correct:"den kleinen", d:["der kleinen","den kleine"], full:"Ich sehe den kleinen Mann.", r:"Mask. Akk, débil: <b>den</b> marca → adjetivo <b>-en</b>."},
 {t:"weak", s:"Ich helfe ___ Mann.", correct:"dem kleinen", d:["den kleinen","dem kleine"], full:"Ich helfe dem kleinen Mann.", r:"Mask. Dat, débil: <b>dem</b> marca → adjetivo <b>-en</b>."},
 {t:"weak", s:"___ Frau wohnt hier.", correct:"Die große", d:["Die großen","Eine große"], full:"Die große Frau wohnt hier.", r:"Fem. Nom: <b>die</b> marca → <b>-e</b>."},
 {t:"weak", s:"Ich mag ___ Frau.", correct:"die große", d:["die großen","der große"], full:"Ich mag die große Frau.", r:"Fem. Akk: die → die (no cambia). Adjetivo <b>-e</b>."},
 {t:"weak", s:"Ich wohne bei ___ Frau.", correct:"der großen", d:["die großen","der große"], full:"Ich wohne bei der großen Frau.", r:"Fem. Dat: <b>der</b> marca → adjetivo <b>-en</b>."},
 {t:"weak", s:"___ Haus ist schön.", correct:"Das alte", d:["Das alter","Ein altes"], full:"Das alte Haus ist schön.", r:"Neut. Nom: <b>das</b> marca → <b>-e</b>."},
 {t:"weak", s:"Ich renoviere ___ Haus.", correct:"das alte", d:["das alten","dem alte"], full:"Ich renoviere das alte Haus.", r:"Neut. Akk: das → das. <b>-e</b>."},
 {t:"weak", s:"___ Kind spielt draußen.", correct:"Das kleine", d:["Der kleine","Ein kleines"], full:"Das kleine Kind spielt draußen.", r:"Neut. Nom: <b>das</b> → <b>-e</b>."},
 {t:"weak", s:"Die Farbe ___ Hauses ist blau.", correct:"des alten", d:["das alte","des alter"], full:"Die Farbe des alten Hauses ist blau.", r:"Genitiv, débil: <b>des</b> → adjetivo <b>-en</b>."}
];

// ── Fuerte (sin artículo — sustantivos incontables, abstractos o plural) ──
var ADJ_STRONG=[
 {t:"strong", s:"___ Kaffee schmeckt gut.", correct:"Starker", d:["Starke","Starken"], full:"Starker Kaffee schmeckt gut.", r:"Mask. Nom, fuerte: sin artículo el adjetivo marca el género → <b>-er</b>."},
 {t:"strong", s:"Ich esse gern ___ Käse.", correct:"frischen", d:["frischer","frisches"], full:"Ich esse gern frischen Käse.", r:"Mask. Akk, fuerte: <b>-en</b>."},
 {t:"strong", s:"Mit ___ Wein geht's besser.", correct:"gutem", d:["guten","guter"], full:"Mit gutem Wein geht's besser.", r:"Mask. Dat, fuerte: <b>-em</b>."},
 {t:"strong", s:"___ Liebe ist schön.", correct:"Große", d:["Großer","Großen"], full:"Große Liebe ist schön.", r:"Fem. Nom, fuerte: <b>-e</b>."},
 {t:"strong", s:"Ich trinke ___ Milch.", correct:"frische", d:["frischer","frischen"], full:"Ich trinke frische Milch.", r:"Fem. Akk, fuerte: <b>-e</b> (no cambia)."},
 {t:"strong", s:"Mit ___ Geduld schaffst du's.", correct:"großer", d:["große","großen"], full:"Mit großer Geduld schaffst du's.", r:"Fem. Dat, fuerte: <b>-er</b>."},
 {t:"strong", s:"___ Brot liegt auf dem Tisch.", correct:"Frisches", d:["Frischer","Frischen"], full:"Frisches Brot liegt auf dem Tisch.", r:"Neut. Nom, fuerte: <b>-es</b>."},
 {t:"strong", s:"Ich esse ___ Brot.", correct:"frisches", d:["frischer","frischen"], full:"Ich esse frisches Brot.", r:"Neut. Akk, fuerte: <b>-es</b> (no cambia)."},
 {t:"strong", s:"___ Wasser tut gut.", correct:"Kaltes", d:["Kalter","Kalten"], full:"Kaltes Wasser tut gut.", r:"Neut. Nom, fuerte: <b>-es</b>."},
 {t:"strong", s:"Ich warte auf ___ Nachrichten.", correct:"wichtige", d:["wichtigen","wichtiger"], full:"Ich warte auf wichtige Nachrichten.", r:"Plural Akk, fuerte: <b>-e</b>."}
];

// ── Comparativo / Superlativo ──
var ADJ_COMP=[
 {t:"comp", s:"Ein Elefant ist ___ als eine Maus.", correct:"größer", d:["großer","am größten"], full:"Ein Elefant ist größer als eine Maus.", r:"Comparativo: Adjektiv + <b>-er</b>. a/o/u → Umlaut: groß → größer."},
 {t:"comp", s:"Deutsch finde ich ___ als Englisch.", correct:"schwerer", d:["schwer","schweresten"], full:"Deutsch finde ich schwerer als Englisch.", r:"Regular: schwer + <b>-er</b>. Sin Umlaut (la vocal es e)."},
 {t:"comp", s:"Der Mount Everest ist ___.", correct:"am höchsten", d:["höher","hochste"], full:"Der Mount Everest ist am höchsten.", r:"Superlativo: <b>am</b> + Adjektiv + <b>-sten</b>. hoch → höchst- (Umlaut)."},
 {t:"comp", s:"Mein Kaffee ist ___ als deiner.", correct:"heißer", d:["heiß","am heißesten"], full:"Mein Kaffee ist heißer als deiner.", r:"Regular: heiß + <b>-er</b>. Sin Umlaut (ei es diptongo)."},
 {t:"comp", s:"Im Sommer ist es ___.", correct:"am wärmsten", d:["wärmer","warmen"], full:"Im Sommer ist es am wärmsten.", r:"Superlativo: warm → am wärmsten (Umlaut)."},
 {t:"comp", s:"Sie läuft ___ als ich.", correct:"schneller", d:["schnell","am schnellsten"], full:"Sie läuft schneller als ich.", r:"Regular: schnell + <b>-er</b>."},
 {t:"comp", s:"Er ist der ___ Schüler in der Klasse.", correct:"beste", d:["besser","guteste"], full:"Er ist der beste Schüler in der Klasse.", r:"Superlativo como adjetivo: gut → <b>beste</b>. der/die/das + adjetivo + -e."},
 {t:"comp", s:"Das Essen schmeckt mir heute ___.", correct:"am besten", d:["besser","gut"], full:"Das Essen schmeckt mir heute am besten.", r:"Superlativo: <b>am besten</b>. gut → besser → am besten (irregular)."},
 {t:"comp", s:"Diese Aufgabe ist ___ als die letzte.", correct:"leichter", d:["leicht","am leichtsten"], full:"Diese Aufgabe ist leichter als die letzte.", r:"Regular: leicht + <b>-er</b>."},
 {t:"comp", s:"Das ist der ___ Film, den ich kenne.", correct:"langweiligste", d:["langweiliger","am langweiligsten"], full:"Das ist der langweiligste Film, den ich kenne.", r:"Superlativo con der/die/das: Adjektiv + <b>-ste</b>."},
 {t:"comp", s:"Im Winter ist es ___ als im Herbst.", correct:"kälter", d:["kalt","am kältsten"], full:"Im Winter ist es kälter als im Herbst.", r:"kalt → <b>kälter</b> (Umlaut) + -er."},
 {t:"comp", s:"Sie ist die ___ Sängerin der Welt.", correct:"berühmteste", d:["berühmter","am berühmtesten"], full:"Sie ist die berühmteste Sängerin der Welt.", r:"Superlativo con artículo: berühmt + <b>-este</b> (por terminar en -t)."}
];
var ROUND=10, deck=[], idx=0, right=0, missed=[], locked=false;

if(!state.adjektive) state.adjektive={};
if(!state.adjektive._deck) state.adjektive._deck=[];
if(typeof state.adjektive._idx!=="number") state.adjektive._idx=0;
if(typeof state.adjektive._right!=="number") state.adjektive._right=0;

function shuffle(a){a=a.slice();for(var k=a.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1));var t=a[k];a[k]=a[j];a[j]=t;}return a;}

function adjStart(){
  var mode=state.adjektive.mode||"mixed";
  var src=mode==="weak"?ADJ_WEAK:mode==="strong"?ADJ_STRONG:mode==="comp"?ADJ_COMP:ADJ_POOL;
  deck=shuffle(src).slice(0,ROUND); idx=0; right=0; missed=[]; locked=false;
  state.adjektive._deck=deck; state.adjektive._idx=0; state.adjektive._right=0; state.adjektive._logged=false;
  adjRender();
}
function adjRender(){
 var el=document.getElementById("s-adjektive"); if(!el) return; el.innerHTML="";
 if(!deck.length){adjStart();return;}
 if(idx>=deck.length){adjSummary(el);return;}
 var q=deck[idx]; locked=false;
 var mode=state.adjektive.mode||"mixed";
 // ── Header ──
 var hdr=mk("div","","margin-bottom:14px;");
 hdr.appendChild(mk("p","Gramática · Terminaciones","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
 var h2row=mk("div","","display:flex;align-items:center;gap:8px;margin:3px 0 4px;");
 h2row.appendChild(mk("h2","Adjektive","font-size:24px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin:0;color:var(--text);"));
 var refBtn=mk("button","📗","background:none;border:none;font-size:20px;cursor:pointer;opacity:0.6;transition:opacity .15s;padding:2px;");
 refBtn.title="Tabla completa de declinación"; refBtn.setAttribute("aria-label","Tabla completa de declinación del adjetivo");
 refBtn.onmouseenter=function(){this.style.opacity="1";}; refBtn.onmouseleave=function(){this.style.opacity="0.6";};
 refBtn.onclick=adjRefModal;
 h2row.appendChild(refBtn);
 var tipBtn=mk("button","💡","background:none;border:none;font-size:20px;cursor:pointer;opacity:0.6;transition:opacity .15s;padding:2px;");
 tipBtn.title="Adjetivos útiles y comparativos irregulares"; tipBtn.setAttribute("aria-label","Adjetivos útiles y comparativos irregulares");
 tipBtn.onmouseenter=function(){this.style.opacity="1";}; tipBtn.onmouseleave=function(){this.style.opacity="0.6";};
 tipBtn.onclick=adjTipsModal;
 h2row.appendChild(tipBtn);
 hdr.appendChild(h2row);
 hdr.appendChild(mk("p",mode==="comp"?"Elige la forma correcta del comparativo o superlativo."
   :mode==="strong"?"Sin artículo: el adjetivo marca el caso. Elige la terminación."
   :mode==="weak"?"Tras der/die/das el artículo ya marca. Elige la combinación."
   :"Elige el artículo + adjetivo con la terminación correcta.","font-size:13px;color:var(--muted);font-weight:500;margin-bottom:0;"));
 el.appendChild(hdr);
 // ── Mode toggle: Mixta | Débil | Fuerte | Comp./Sup. ──
 var modeBtns=mk("div","","display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:16px;");
 [["mixed","Mixta"],["weak","Débil"],["strong","Fuerte"],["comp","Comp./Sup."]].forEach(function(m){
   var active=mode===m[0];
   var mb=mk("button",m[1],"padding:8px;border-radius:10px;border:none;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;white-space:nowrap;transition:all .15s;color:"+(active?"#061111":"var(--muted)")+";background:"+(active?"var(--teal)":"var(--surface-2)")+";");
   mb.onclick=function(){ state.adjektive.mode=m[0]; adjStart(); };
   modeBtns.appendChild(mb);
 });
 el.appendChild(modeBtns);
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
 var parts=q.s.split("___");
 sent.appendChild(document.createTextNode(parts[0]));
 var gap=mk("span","______","display:inline-block;min-width:90px;border-bottom:2px dashed rgba(var(--gold-rgb),.5);text-align:center;color:var(--gold);font-weight:900;padding:0 6px;");
 gap.id="adj-gap"; sent.appendChild(gap);
 if(parts[1]) sent.appendChild(document.createTextNode(parts[1]));
 card.appendChild(sent);
 // ── Options ──
 var opts=mk("div","","display:flex;flex-direction:column;gap:8px;");
 shuffle([q.correct].concat(q.d)).forEach(function(o){
   var b=mk("button",o,"text-align:center;padding:13px;border-radius:13px;font-size:15px;font-weight:800;cursor:pointer;border:1.5px solid var(--border);background:rgba(255,255,255,0.05);color:var(--text);font-family:inherit;transition:border-color .15s,background .15s;");
   b.className="lift"; b.style.setProperty("--lift-rgb","var(--gold-rgb)");
   b.dataset.v=o;
   b.onclick=function(){adjPick(b,q,opts,gap);};
   opts.appendChild(b);
 });
 card.appendChild(opts);
 // ── Feedback + next ──
 var fb=mk("div","","display:none;border-radius:13px;padding:12px 14px;margin-top:14px;font-size:13px;line-height:1.55;font-weight:500;"); fb.id="adj-fb";
 card.appendChild(fb);
 var nx=mk("button","Siguiente →","width:100%;margin-top:12px;padding:13px;border-radius:14px;border:1px solid var(--border);background:rgba(255,255,255,0.05);color:var(--text);font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;display:none;"); nx.id="adj-nx";
 nx.onclick=function(){ idx++; state.adjektive._idx=idx; adjRender(); };
 card.appendChild(nx);
 el.appendChild(card);
 el.appendChild(mk("p",(idx+1)+" de "+deck.length,"font-size:11px;color:var(--dim);font-weight:600;text-align:center;font-variant-numeric:tabular-nums;"));
}
function adjPick(btn,q,opts,gap){
 if(locked) return; locked=true;
 var ok=btn.dataset.v===q.correct;
 opts.querySelectorAll("button").forEach(function(b){
   b.disabled=true; b.classList.remove("lift");
   if(b.dataset.v===q.correct){ b.style.background="rgba(var(--green-rgb),0.14)"; b.style.borderColor="var(--green)"; b.style.color="var(--green)"; }
   else if(b===btn){ b.style.background="rgba(var(--red-rgb),0.12)"; b.style.borderColor="var(--red)"; b.style.color="var(--red)"; }
   else b.style.opacity="0.45";
 });
 if(gap){ gap.textContent=q.correct; gap.style.borderBottomColor="transparent"; gap.style.color=ok?"var(--green)":"var(--red)"; }
 var fb=document.getElementById("adj-fb"); fb.style.display="block"; fb.className="anim-in";
 fb.style.background=ok?"rgba(var(--green-rgb),0.09)":"rgba(var(--red-rgb),0.08)";
 fb.style.border=ok?"1px solid rgba(var(--green-rgb),0.3)":"1px solid rgba(var(--red-rgb),0.3)";
 fb.innerHTML='<b style="display:block;font-size:14px;font-weight:800;margin-bottom:4px;color:'+(ok?"var(--green)":"var(--red)")+';">'+(ok?"✓ ":"✗ ")+q.full+'</b><span style="color:var(--muted);">'+q.r+'</span>';
 if(ok) right++; else missed.push({q:q});
 state.adjektive._right=right;
 document.getElementById("adj-nx").style.display="block";
 var dots=document.querySelectorAll("#s-adjektive .dots span"); if(dots[idx]) dots[idx].style.background=ok?"var(--green)":"var(--red)";
 var scEl=document.querySelector("#s-adjektive .score"); if(scEl) scEl.innerHTML="<b style=color:var(--green);font-size:15px>"+right+"</b> / "+(idx+1);
}
function adjSummary(el){
 var pct=Math.round(right/deck.length*100);
 var em=pct>=90?"🏆":pct>=70?"💪":pct>=50?"📈":"🌱";
 var ti=pct>=90?"¡Sehr gut!":pct>=70?"¡Buen ritmo!":"Sigue puliendo";
 var hdr=mk("div","","margin-bottom:14px;");
 hdr.appendChild(mk("p","Gramática · Terminaciones","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
 hdr.appendChild(mk("h2","Adjektive","font-size:24px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin:3px 0 4px;color:var(--text);"));
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
 again.onclick=adjStart; card.appendChild(again);
 el.appendChild(card);
 if(!state.adjektive._logged){
   state.adjektive._logged=true;
   if(typeof logActivity==="function") logActivity("drillsDone",1);
   // Feed the error journal so missed endings resurface in the error-review session
   if(missed.length && state.session && Array.isArray(state.session.errorJournal)){
     missed.forEach(function(m){
       state.session.errorJournal.push({date:todayKey(), type:"grammar", source:"adjektive", original:m.q.s.replace("___","___"), correction:m.q.full, tip:(m.q.r||"").replace(/<[^>]*>/g,"")});
     });
     if(state.session.errorJournal.length>50) state.session.errorJournal=state.session.errorJournal.slice(-50);
   }
   if(typeof syncUp==="function") syncUp();
 }
}

// ── 📗 Reference: weak/mixed ending tables + the "turnos" rule + ordinal dates ─
function adjRefModal(){
  var o=document.createElement("div");
  o.style.cssText="position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0.6);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto;opacity:0;transition:opacity .18s ease;";
  function closeRef(){o.style.opacity="0";setTimeout(function(){if(o.parentNode)o.parentNode.removeChild(o);},180);}
  o.onclick=function(e){if(e.target===o)closeRef();};
  var c=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:22px;padding:22px;max-width:580px;width:100%;margin:16px 0;box-shadow:0 20px 60px rgba(0,0,0,0.5);");
  c.setAttribute("role","dialog"); c.setAttribute("aria-modal","true"); c.setAttribute("aria-label","Terminaciones del adjetivo");
  c.onclick=function(e){e.stopPropagation();};
  c.appendChild(mk("p","Terminaciones del adjetivo","font-size:15px;font-weight:900;color:var(--text);margin-bottom:2px;letter-spacing:-0.02em;"));
  c.appendChild(mk("p","El artículo y el adjetivo se turnan: solo UNO marca el caso. Si el artículo ya marca, el adjetivo se relaja.","font-size:11px;color:var(--muted);font-weight:500;margin-bottom:14px;line-height:1.5;"));
  function tableBlock(title,rows){
    c.appendChild(mk("p",title,"font-size:11px;font-weight:800;color:var(--gold-text);text-transform:uppercase;letter-spacing:1px;margin:8px 0 6px;"));
    var scroll=mk("div","","overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:12px;border:1px solid var(--border);margin-bottom:6px;");
    var h='<table style="border-collapse:collapse;width:100%;min-width:380px;font-size:12px;">'
      +'<thead><tr><th style="text-align:left;padding:7px 10px;color:var(--muted);font-weight:800;font-size:10px;letter-spacing:1px;">CASO</th>'
      +'<th style="padding:7px;color:var(--text);font-weight:800;">Mask.</th><th style="padding:7px;color:var(--text);font-weight:800;">Fem.</th>'
      +'<th style="padding:7px;color:var(--text);font-weight:800;">Neut.</th><th style="padding:7px;color:var(--text);font-weight:800;">Plural</th></tr></thead><tbody>';
    var cc={Nominativ:"var(--teal-text)",Akkusativ:"var(--green-text)",Dativ:"var(--gold-text)",Genitiv:"var(--purple-text)"};
    rows.forEach(function(r){
      h+='<tr style="border-top:1px solid var(--border);"><td style="padding:8px 10px;font-weight:800;color:'+cc[r[0]]+';white-space:nowrap;">'+r[0]+'</td>';
      for(var i=1;i<r.length;i++) h+='<td style="padding:8px;text-align:center;font-weight:700;color:var(--text);">'+r[i]+'</td>';
      h+='</tr>';
    });
    h+='</tbody></table>';
    scroll.innerHTML=h; c.appendChild(scroll);
  }
  tableBlock("Débil — tras der / die / das",[
    ["Nominativ","-e","-e","-e","-en"],
    ["Akkusativ","-en","-e","-e","-en"],
    ["Dativ","-en","-en","-en","-en"],
    ["Genitiv","-en","-en","-en","-en"]
  ]);
  tableBlock("Mixta — tras ein / mein / kein",[
    ["Nominativ","-er","-e","-es","-en"],
    ["Akkusativ","-en","-e","-es","-en"],
    ["Dativ","-en","-en","-en","-en"],
    ["Genitiv","-en","-en","-en","-en"]
  ]);
  tableBlock("Fuerte — sin artículo",[
    ["Nominativ","-er","-e","-es","-e"],
    ["Akkusativ","-en","-e","-es","-e"],
    ["Dativ","-em","-er","-em","-en"],
    ["Genitiv","-en","-er","-en","-er"]
  ]);
  var rule=mk("div","","margin-top:10px;font-size:12px;color:var(--text2);line-height:1.7;font-weight:500;");
  rule.innerHTML='<b style="color:var(--red-text);">La lógica (turnos):</b><br>'
    +'• Si <b>ein</b> NO marca (mask. Nom → ein, neut. Nom/Akk → ein), el adjetivo COMPENSA: <b>-er</b> / <b>-es</b>.<br>'
    +'• Si el artículo ya marca (einen, einem, der, den…), el adjetivo se relaja a <b>-en</b> (o <b>-e</b> en los suaves).<br>'
    +'• Por eso nunca «einem erstem»: einem ya gritó «¡Dativ!» → adjetivo -en.<br>'
    +'• Sin artículo (fuerte): el adjetivo hace TODO el trabajo — toma la terminación del artículo (Dativ <b>-em</b>, fem. Dat <b>-er</b>).';
  c.appendChild(rule);
  var dates=mk("div","","margin-top:12px;padding:12px 14px;border-radius:12px;background:rgba(var(--gold-rgb),0.07);border:1px solid rgba(var(--gold-rgb),0.25);font-size:12px;color:var(--text2);line-height:1.7;font-weight:500;");
  dates.innerHTML='<b style="color:var(--gold-text);">📅 Ordinales en fechas — am + ordinal + mes:</b><br>'
    +'• Heute ist <b>der erste</b> März. (der 1. März)<br>'
    +'• Mein Geburtstag ist <b>am dritten</b> April. (am 3. April)<br>'
    +'• Wir treffen uns <b>am zwanzigsten</b> Januar. (am 20. Januar)<br>'
    +'<span style="color:var(--muted);">El punto tras el número = ordinal: 3. = dritten.</span>';
  c.appendChild(dates);
  var close=mk("button","Cerrar","width:100%;padding:13px;border-radius:13px;border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-size:13px;font-weight:700;cursor:pointer;margin-top:14px;font-family:inherit;");
  close.onclick=closeRef; c.appendChild(close); o.appendChild(c);
  document.body.appendChild(o);
  requestAnimationFrame(function(){o.style.opacity="1";});
}

// ── 💡 Tips: useful adjectives by theme + irregular comparatives ──────────────
function adjTipsModal(){
  var o=document.createElement("div");
  o.style.cssText="position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0.6);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto;opacity:0;transition:opacity .18s ease;";
  function closeTips(){o.style.opacity="0";setTimeout(function(){if(o.parentNode)o.parentNode.removeChild(o);},180);}
  o.onclick=function(e){if(e.target===o)closeTips();};
  var c=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:22px;padding:22px;max-width:420px;width:100%;margin:16px 0;box-shadow:0 20px 60px rgba(0,0,0,0.5);");
  c.setAttribute("role","dialog"); c.setAttribute("aria-modal","true"); c.setAttribute("aria-label","Adjetivos útiles");
  c.onclick=function(e){e.stopPropagation();};
  c.appendChild(mk("p","Adjetivos útiles para practicar","font-size:14px;font-weight:800;color:var(--text);margin-bottom:10px;letter-spacing:-0.01em;"));
  var body=mk("div","","font-size:11.5px;color:var(--text2);line-height:1.9;font-weight:500;");
  body.innerHTML='<b style="color:var(--teal-text);">Básicos:</b> groß, klein, neu, alt, jung, lang, kurz, gut, schlecht<br>'
    +'<b style="color:var(--gold-text);">Descripción:</b> schön, wichtig, einfach, schwer, leicht, schnell, langsam<br>'
    +'<b style="color:var(--purple-text);">Temperatura:</b> warm, kalt, heiß, kühl, frisch<br>'
    +'<b style="color:var(--green-text);">Colores:</b> rot, blau, grün, gelb, schwarz, weiß, bunt<br>'
    +'<b style="color:var(--teal-text);">Carácter:</b> freundlich, müde, lustig, fleißig, ruhig, laut, leise<br>'
    +'<br>☝️ <b style="color:var(--red-text);">Comparativo/Superlativo irregulares:</b><br>'
    +'gut → besser → <b>am besten</b><br>'
    +'viel → mehr → <b>am meisten</b><br>'
    +'gern → lieber → <b>am liebsten</b><br>'
    +'hoch → höher → <b>am höchsten</b><br>'
    +'nah → näher → <b>am nächsten</b>';
  c.appendChild(body);
  var close=mk("button","Cerrar","width:100%;padding:13px;border-radius:13px;border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-size:13px;font-weight:700;cursor:pointer;margin-top:14px;font-family:inherit;");
  close.onclick=closeTips; c.appendChild(close); o.appendChild(c);
  document.body.appendChild(o);
  requestAnimationFrame(function(){o.style.opacity="1";});
}

function renderAdjektive(){
  if(!state.adjektive._deck||!state.adjektive._deck.length){ adjStart(); return; }
  deck=state.adjektive._deck; idx=state.adjektive._idx; right=state.adjektive._right; missed=[]; locked=false;
  adjRender();
}
window.renderAdjektive=renderAdjektive;
})();
