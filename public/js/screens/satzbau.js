// ── Satzbau (word order drill with connectors, ported from Fable) ──

(function(){
// t: "sub" (verb-final) | "v2" (verb 2nd). Words include punctuation attached.
var POOL=[
 {t:"sub",k:"weil",w:["Ich","bleibe","zu","Hause,","weil","ich","m\u00fcde","bin."],es:"Me quedo en casa porque estoy cansado.",r:"<i style='color:var(--purple)'>weil</i> manda el verbo conjugado al FINAL: \u2026 weil ich m\u00fcde <b>bin</b>.",pair:{sub:"Ich bleibe zu Hause, <b>weil</b> ich m\u00fcde <b>bin</b>.",v2:"Ich bin m\u00fcde, <b>deshalb</b> <b>bleibe</b> ich zu Hause."}},
 {t:"sub",k:"dass",w:["Ich","denke,","dass","der","Film","gut","ist."],es:"Creo que la pel\u00edcula es buena.",r:"<i style='color:var(--purple)'>dass</i> \u2192 verbo al final: \u2026 dass der Film gut <b>ist</b>."},
 {t:"sub",k:"obwohl",w:["Er","geht","spazieren,","obwohl","es","regnet."],es:"\u00c9l sale a pasear aunque llueve.",r:"<i style='color:var(--purple)'>obwohl</i> \u2192 verbo al final: \u2026 obwohl es <b>regnet</b>."},
 {t:"sub",k:"wenn",w:["Wenn","ich","Zeit","habe,","lese","ich","ein","Buch."],es:"Cuando tengo tiempo, leo un libro.",r:"Subordinada primero \u2192 su verbo al final (<b>habe</b>), y el principal arranca EN VERBO: \u2026 , <b>lese</b> ich\u2026"},
 {t:"sub",k:"damit",w:["Ich","lerne","viel,","damit","ich","die","Pr\u00fcfung","bestehe."],es:"Estudio mucho para aprobar el examen.",r:"<i style='color:var(--purple)'>damit</i> \u2192 verbo al final: \u2026 damit ich die Pr\u00fcfung <b>bestehe</b>."},
 {t:"sub",k:"als",w:["Als","ich","klein","war,","wohnte","ich","in","Berlin."],es:"Cuando era peque\u00f1o, viv\u00eda en Berl\u00edn.",r:"<i style='color:var(--purple)'>als</i> (pasado \u00fanico) \u2192 verbo al final; luego el principal invierte: \u2026 , <b>wohnte</b> ich\u2026"},
 {t:"sub",k:"nachdem",w:["Nachdem","ich","gegessen","hatte,","ging","ich","spazieren."],es:"Despu\u00e9s de comer, sal\u00ed a pasear.",r:"<i style='color:var(--purple)'>nachdem</i> \u2192 verbo al final (<b>hatte</b>); el principal sigue con verbo: <b>ging</b> ich\u2026"},
 {t:"sub",k:"bevor",w:["Bevor","ich","schlafe,","lese","ich","ein","Buch."],es:"Antes de dormir, leo un libro.",r:"<i style='color:var(--purple)'>bevor</i> \u2192 verbo al final: Bevor ich <b>schlafe</b>, \u2026"},
 {t:"sub",k:"w\u00e4hrend",w:["W\u00e4hrend","ich","koche,","h\u00f6re","ich","Musik."],es:"Mientras cocino, escucho m\u00fasica.",r:"<i style='color:var(--purple)'>w\u00e4hrend</i> \u2192 verbo al final: W\u00e4hrend ich <b>koche</b>, \u2026"},
 {t:"sub",k:"seitdem",w:["Seitdem","ich","hier","wohne,","bin","ich","gl\u00fccklich."],es:"Desde que vivo aqu\u00ed, soy feliz.",r:"<i style='color:var(--purple)'>seitdem</i> \u2192 verbo al final: Seitdem ich hier <b>wohne</b>, \u2026"},
 {t:"sub",k:"weil",w:["Sie","lernt","Deutsch,","weil","sie","in","Wien","arbeitet."],es:"Ella aprende alem\u00e1n porque trabaja en Viena.",r:"<i style='color:var(--purple)'>weil</i> \u2192 verbo al final: \u2026 weil sie in Wien <b>arbeitet</b>."},
 {t:"sub",k:"dass",w:["Ich","hoffe,","dass","du","morgen","kommst."],es:"Espero que vengas ma\u00f1ana.",r:"<i style='color:var(--purple)'>dass</i> \u2192 verbo al final: \u2026 dass du morgen <b>kommst</b>."},
 {t:"v2",k:"deshalb",w:["Es","regnet,","deshalb","bleibe","ich","zu","Hause."],es:"Llueve, por eso me quedo en casa.",r:"<i style='color:var(--teal)'>deshalb</i> es adverbio \u2192 el verbo va JUSTO despu\u00e9s: deshalb <b>bleibe</b> ich\u2026",pair:{sub:"<b>Weil</b> es regnet, bleibe ich zu Hause.",v2:"Es regnet, <b>deshalb</b> <b>bleibe</b> ich zu Hause."}},
 {t:"v2",k:"trotzdem",w:["Ich","bin","m\u00fcde,","trotzdem","gehe","ich","zum","Sport."],es:"Estoy cansado, sin embargo voy al gimnasio.",r:"<i style='color:var(--teal)'>trotzdem</i> \u2192 verbo en posici\u00f3n 2: trotzdem <b>gehe</b> ich\u2026",pair:{sub:"<b>Obwohl</b> ich m\u00fcde <b>bin</b>, gehe ich zum Sport.",v2:"Ich bin m\u00fcde, <b>trotzdem</b> <b>gehe</b> ich zum Sport."}},
 {t:"v2",k:"dann",w:["Zuerst","fr\u00fchst\u00fccke","ich,","dann","gehe","ich","zur","Arbeit."],es:"Primero desayuno, despu\u00e9s voy al trabajo.",r:"<i style='color:var(--teal)'>dann</i> \u2192 verbo en posici\u00f3n 2: dann <b>gehe</b> ich\u2026"},
 {t:"v2",k:"also",w:["Ich","habe","Hunger,","also","mache","ich","etwas","zu","essen."],es:"Tengo hambre, as\u00ed que me preparo algo de comer.",r:"<i style='color:var(--teal)'>also</i> \u2192 verbo en posici\u00f3n 2: also <b>mache</b> ich\u2026"},
 {t:"v2",k:"deshalb",w:["Der","Bus","kommt","nicht,","deshalb","nehme","ich","das","Fahrrad."],es:"El bus no llega, por eso tomo la bicicleta.",r:"<i style='color:var(--teal)'>deshalb</i> \u2192 verbo en posici\u00f3n 2: deshalb <b>nehme</b> ich\u2026"},
 {t:"v2",k:"trotzdem",w:["Es","ist","kalt,","trotzdem","fahren","wir","ans","Meer."],es:"Hace fr\u00edo, sin embargo vamos al mar.",r:"<i style='color:var(--teal)'>trotzdem</i> \u2192 verbo en posici\u00f3n 2: trotzdem <b>fahren</b> wir\u2026"},
 {t:"sub",k:"wenn",w:["Wenn","es","schneit,","bleiben","wir","drinnen."],es:"Si nieva, nos quedamos adentro.",r:"<i style='color:var(--purple)'>wenn</i> \u2192 verbo al final (<b>schneit</b>); el principal invierte: <b>bleiben</b> wir\u2026"},
 {t:"v2",k:"dann",w:["Erst","dusche","ich,","dann","trinke","ich","einen","Kaffee."],es:"Primero me ducho, despu\u00e9s tomo un caf\u00e9.",r:"<i style='color:var(--teal)'>dann</i> \u2192 verbo en posici\u00f3n 2: dann <b>trinke</b> ich\u2026"},
 // \u2500\u2500 TeKaMoLo: orden de complementos Temporal \u2192 Kausal \u2192 Modal \u2192 Lokal \u2500\u2500
 {t:"tkml",k:"tekamolo",w:["Ich","fahre","morgen","mit","dem","Zug","nach","Berlin."],es:"Ma\u00f1ana voy en tren a Berl\u00edn.",r:"<b style='color:var(--gold)'>TeKaMoLo</b>: Temporal (morgen) \u2192 Modal (mit dem Zug) \u2192 Lokal (nach Berlin)."},
 {t:"tkml",k:"tekamolo",w:["Er","arbeitet","heute","wegen","des","Termins","im","B\u00fcro."],es:"Hoy trabaja en la oficina por la cita.",r:"<b style='color:var(--gold)'>TeKaMoLo</b>: Te (heute) \u2192 Ka (wegen des Termins) \u2192 Lo (im B\u00fcro)."},
 {t:"tkml",k:"tekamolo",w:["Wir","gehen","am","Samstag","zusammen","ins","Kino."],es:"El s\u00e1bado vamos juntos al cine.",r:"<b style='color:var(--gold)'>TeKaMoLo</b>: Te (am Samstag) \u2192 Mo (zusammen) \u2192 Lo (ins Kino)."},
 {t:"tkml",k:"tekamolo",w:["Sie","fliegt","n\u00e4chste","Woche","beruflich","nach","M\u00fcnchen."],es:"La pr\u00f3xima semana viaja por trabajo a M\u00fanich.",r:"<b style='color:var(--gold)'>TeKaMoLo</b>: Te (n\u00e4chste Woche) \u2192 Mo (beruflich) \u2192 Lo (nach M\u00fcnchen)."},
 {t:"tkml",k:"tekamolo",w:["Ich","gehe","heute","Abend","mit","Freunden","ins","Restaurant."],es:"Esta noche voy con amigos al restaurante.",r:"<b style='color:var(--gold)'>TeKaMoLo</b>: Te (heute Abend) \u2192 Mo (mit Freunden) \u2192 Lo (ins Restaurant)."},
 {t:"tkml",k:"tekamolo",w:["Er","lernt","jeden","Tag","flei\u00dfig","zu","Hause."],es:"Estudia con dedicaci\u00f3n en casa todos los d\u00edas.",r:"<b style='color:var(--gold)'>TeKaMoLo</b>: Te (jeden Tag) \u2192 Mo (flei\u00dfig) \u2192 Lo (zu Hause)."}
];
var ROUND=8, deck=[], idx=0, right=0, missed=[], chosen=[];

// ── Satzbau state init ──
if(!state.satzbau) state.satzbau={};
if(!state.satzbau._deck) state.satzbau._deck=[];
if(typeof state.satzbau._idx!=="number") state.satzbau._idx=0;
if(typeof state.satzbau._right!=="number") state.satzbau._right=0;

function shuffle(a){a=a.slice();for(var k=a.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1));var t=a[k];a[k]=a[j];a[j]=t;}return a;}

function sbStart(){
  deck=shuffle(POOL).slice(0,ROUND); idx=0; right=0; missed=[];
  state.satzbau._deck=deck; state.satzbau._idx=0; state.satzbau._right=0; state.satzbau._logged=false;
  sbRender();
}
function sbRender(){
 var el=document.getElementById("s-satzbau"); el.innerHTML="";
 if(!deck.length){sbStart();return;}
 if(idx>=deck.length){sbSummary(el);return;}
 var q=deck[idx]; chosen=[];
 // ── Header ──
 var hdr=mk("div","","margin-bottom:14px;");
 hdr.appendChild(mk("p","Gram\u00e1tica \u00b7 Orden de palabras","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
 var h2row=mk("div","","display:flex;align-items:center;gap:8px;margin:3px 0 4px;");
 h2row.appendChild(mk("h2","Satzbau","font-size:24px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin:0;color:var(--text);"));
 var hintBtn=mk("button","\ud83d\udca1","width:32px;height:32px;border-radius:10px;border:1px dashed rgba(var(--gold-rgb),.4);background:rgba(var(--gold-rgb),.06);font-size:15px;cursor:pointer;padding:0;line-height:1;transition:background .15s;");
 hintBtn.setAttribute("aria-label","Ver regla del conector"); hintBtn.setAttribute("aria-expanded","false");
 h2row.appendChild(hintBtn);
 hdr.appendChild(h2row);
 hdr.appendChild(mk("p","","font-size:13px;color:var(--muted);font-weight:500;margin-bottom:0;"));
 hdr.lastChild.innerHTML='Arma la oraci\u00f3n tocando las palabras. <b style="color:var(--purple)">Subordinada</b> = verbo al final \u00b7 <b style="color:var(--teal)">deshalb &amp; Co.</b> = verbo en posici\u00f3n 2.';
 el.appendChild(hdr);
 // Hint card (rule for the CURRENT connector, no answer leak)
 var hintCard=mk("div","","display:none;border-radius:12px;padding:11px 14px;margin-bottom:12px;background:rgba(var(--gold-rgb),.07);border:1px solid rgba(var(--gold-rgb),.25);font-size:12.5px;line-height:1.55;font-weight:500;color:var(--text);animation:fadeUp .15s ease;");
 var isSub=q.t==="sub";
 if(q.t==="tkml"){
   hintCard.innerHTML='\ud83d\udca1 <b style="color:var(--gold)">TeKaMoLo</b>: los complementos van en orden <b>Te</b>mporal (\u00bfcu\u00e1ndo?) \u2192 <b>Ka</b>usal (\u00bfpor qu\u00e9?) \u2192 <b>Mo</b>dal (\u00bfc\u00f3mo?/\u00bfcon qui\u00e9n?) \u2192 <b>Lo</b>kal (\u00bfd\u00f3nde?/\u00bfa d\u00f3nde?). El lugar SIEMPRE al final.';
 } else {
 hintCard.innerHTML='\ud83d\udca1 <b style="color:'+(isSub?"var(--purple)":"var(--teal)")+'">'+q.k+'</b> '
  +(isSub?'es conjunci\u00f3n subordinante: env\u00eda el verbo conjugado <b>al FINAL</b> de su oraci\u00f3n. Si la subordinada va primero, la principal arranca con el verbo.'
         :'es adverbio conector: el verbo va <b>inmediatamente despu\u00e9s</b> (posici\u00f3n 2) y luego el sujeto.');
 }
 hintBtn.onclick=function(){
   var open=hintCard.style.display==="block";
   hintCard.style.display=open?"none":"block";
   hintBtn.setAttribute("aria-expanded",open?"false":"true");
 };
 el.appendChild(hintCard);
 // ── Top bar: dots + score ──
 var top=mk("div","","display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;");
 var dots=mk("div","","display:flex;gap:5px;");
 dots.className="dots stagger";
 for(var k=0;k<deck.length;k++){
   var dot=mk("span","","width:22px;height:5px;border-radius:4px;background:rgba(255,255,255,.08);transition:background .25s;");
   if(k<idx) dot.style.background=missed.some(function(m){return m.q===deck[k];})?"var(--red)":"var(--green)";
   else if(k===idx) dot.style.background="var(--gold)";
   dots.appendChild(dot);
 }
 top.appendChild(dots);
 var sc=mk("span","","font-size:12px;font-weight:800;color:var(--muted);font-variant-numeric:tabular-nums;");
 sc.className="score";
 sc.innerHTML="<b style=color:var(--green);font-size:15px>"+right+"</b> / "+idx;
 top.appendChild(sc);
 el.appendChild(top);
 // ── Card ──
 var card=mk("div","","background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:18px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:18px;margin-bottom:12px;animation:slideUpFade .45s var(--ease-spring) both;");
 // ES hint
 card.appendChild(mk("p","\u00ab"+q.es+"\u00bb","text-align:center;font-size:13px;color:var(--muted);font-weight:600;margin-bottom:4px;"));
 // Connector tag
 var tagWrap=mk("div","","text-align:center;");
 var tagCSS="display:inline-block;font-size:9.5px;font-weight:900;letter-spacing:1.2px;padding:3px 10px;border-radius:99px;text-transform:uppercase;margin-bottom:12px;";
 var tagTxt=q.t==="tkml"?"TeKaMoLo \u00b7 Tiempo\u2192Causa\u2192Modo\u2192Lugar":q.k+" \u00b7 "+(q.t==="sub"?"verbo al final":"verbo en posici\u00f3n 2");
 var tag=mk("span",tagTxt,tagCSS);
 if(q.t==="sub"){tag.style.background="rgba(var(--purple-rgb),.14)"; tag.style.color="var(--purple)";}
 else if(q.t==="tkml"){tag.style.background="rgba(var(--gold-rgb),.14)"; tag.style.color="var(--gold)";}
 else{tag.style.background="rgba(var(--teal-rgb),.14)"; tag.style.color="var(--teal)";}
 tagWrap.appendChild(tag);
 card.appendChild(tagWrap);
 // Built sentence area
 var built=mk("div","","min-height:56px;border:1.5px dashed rgba(var(--gold-rgb),.4);border-radius:14px;background:rgba(var(--gold-rgb),.04);padding:10px;display:flex;flex-wrap:wrap;gap:7px;align-items:center;margin-bottom:12px;transition:border-color .2s,background .2s;");
 built.id="sb-built";
 built.appendChild(mk("span","Toca las palabras en orden\u2026","color:var(--dim);font-size:12px;font-weight:600;padding-left:4px;"));
 card.appendChild(built);
 // Bank of chips
 var bank=mk("div","","display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:4px;min-height:44px;");
 bank.id="sb-bank";
 var bankItems=shuffle(q.w.map(function(w,ix){return{w:w,ix:ix};}));
 for(var bi=0;bi<bankItems.length;bi++){
   var chip=mk("button",bankItems[bi].w,"padding:9px 14px;border-radius:11px;font-size:14.5px;font-weight:800;cursor:pointer;border:1.5px solid var(--border);background:rgba(255,255,255,.06);color:var(--text);font-family:inherit;transition:transform .1s,opacity .2s,border-color .15s;box-shadow:0 2px 8px rgba(0,0,0,.25);");
   chip.dataset.ix=bankItems[bi].ix; chip.className="sb-chip lift";chip.style.setProperty("--lift-rgb","var(--gold-rgb)");
   chip.onclick=function(){sbPick(this);};
   bank.appendChild(chip);
 }
 card.appendChild(bank);
 // Actions row
 var actions=mk("div","","display:flex;gap:8px;margin-top:12px;");
 var clearBtn=mk("button","\u21ba Limpiar","padding:14px 18px;border-radius:14px;border:1px solid var(--border);cursor:pointer;background:rgba(255,255,255,.05);color:var(--muted);font-size:13.5px;font-weight:800;font-family:inherit;");
 clearBtn.className="sb-clear";
 clearBtn.onclick=function(){sbClearAll();};
 actions.appendChild(clearBtn);
 var chkBtn=mk("button","Comprobar","flex:1;padding:14px;border-radius:14px;border:none;cursor:pointer;background:var(--gold);color:#291800;font-size:14.5px;font-weight:900;font-family:inherit;box-shadow:0 6px 20px rgba(var(--gold-rgb),.25);transition:opacity .2s;");
 chkBtn.id="sb-chk"; chkBtn.disabled=true; chkBtn.onclick=function(){sbCheck();};
 actions.appendChild(chkBtn);
 card.appendChild(actions);
 // Feedback
 var fb=mk("div","","border-radius:14px;padding:13px 15px;margin-top:12px;font-size:13.5px;line-height:1.55;font-weight:500;display:none;");
 fb.id="sb-fb";
 card.appendChild(fb);
 // Next button
 var nx=mk("button","Siguiente \u2192","width:100%;margin-top:12px;padding:13px;border-radius:14px;border:1px solid var(--border);background:rgba(255,255,255,.05);color:var(--text);font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;display:none;transition:background .15s;");
 nx.id="sb-nx"; nx.onclick=function(){idx++; state.satzbau._idx=idx; sbRender();};
 card.appendChild(nx);
 el.appendChild(card);
}
function sbPaintBuilt(){
 var b=document.getElementById("sb-built"); b.innerHTML="";
 if(!chosen.length){b.appendChild(mk("span","Toca las palabras en orden\u2026","color:var(--dim);font-size:12px;font-weight:600;padding-left:4px;")); return;}
 var q=deck[idx];
 chosen.forEach(function(ix,pos){
   var c=mk("button",q.w[ix],"padding:9px 14px;border-radius:11px;font-size:14.5px;font-weight:800;cursor:pointer;border:1.5px solid rgba(var(--gold-rgb),.45);background:rgba(var(--gold-rgb),.12);color:var(--gold);font-family:inherit;transition:transform .1s,opacity .2s;box-shadow:0 2px 8px rgba(0,0,0,.25);");
   c.className="sb-bchip";
   c.onclick=function(){
     if(document.getElementById("sb-nx").style.display==="block") return;
     chosen.splice(pos,1);
     var bankBtn=document.querySelector('#sb-bank .sb-chip[data-ix="'+ix+'"]');
     if(bankBtn){bankBtn.classList.remove("used"); bankBtn.style.opacity=""; bankBtn.style.pointerEvents="";}
     document.getElementById("sb-chk").disabled=chosen.length!==deck[idx].w.length;
     sbPaintBuilt();
   };
   b.appendChild(c);
 });
}
function sbPick(btn){
 if(btn.classList.contains("used")) return;
 btn.classList.add("used"); btn.style.opacity=".25"; btn.style.pointerEvents="none";
 chosen.push(+btn.dataset.ix); sbPaintBuilt();
 document.getElementById("sb-chk").disabled=chosen.length!==deck[idx].w.length;
}
function sbClearAll(){
 chosen=[];
 var chips=document.querySelectorAll("#sb-bank .sb-chip");
 for(var c=0;c<chips.length;c++){chips[c].classList.remove("used"); chips[c].style.opacity=""; chips[c].style.pointerEvents="";}
 sbPaintBuilt(); document.getElementById("sb-chk").disabled=true;
}
function sbCheck(){
 var q=deck[idx], ok=chosen.every(function(ix,pos){return q.w[ix]===q.w[pos];});
 var built=document.getElementById("sb-built");
 if(ok){built.style.borderColor="var(--green)"; built.style.background="rgba(var(--green-rgb),.07)"; built.style.borderStyle="solid";}
 else{built.style.borderColor="var(--red)"; built.style.background="rgba(var(--red-rgb),.06)"; built.style.borderStyle="solid";}
 // Re-paint each chip with correct/wrong styles
 var chips=built.querySelectorAll(".sb-bchip"); var firstBad=-1;
 chosen.forEach(function(ix,pos){
   var good=q.w[ix]===q.w[pos];
   if(good){chips[pos].style.background="rgba(var(--green-rgb),.13)"; chips[pos].style.borderColor="var(--green)"; chips[pos].style.color="var(--green)";}
   else{chips[pos].style.background="rgba(var(--red-rgb),.15)"; chips[pos].style.borderColor="var(--red)"; chips[pos].style.color="var(--red)"; if(firstBad<0) firstBad=pos;}
   chips[pos].onclick=null;
 });
 var correct=q.w.join(" ");
 var fb=document.getElementById("sb-fb"); fb.style.display="block";
 fb.style.background=ok?"rgba(var(--green-rgb),.09)":"rgba(var(--red-rgb),.08)";
 fb.style.border=ok?"1px solid rgba(var(--green-rgb),.3)":"1px solid rgba(var(--red-rgb),.3)";
 var html=(ok?"\u2713 \u00a1Richtig!":"\u2717 El orden correcto: <span style='font-weight:800;color:var(--green)'>"+correct+"</span>")
  +'<p style="color:var(--muted);font-size:12.5px;margin-top:4px;">'+q.r+'</p>';
 if(q.pair){
   html+='<div style="margin-top:12px;border-top:1px dashed rgba(255,255,255,.1);padding-top:11px;">'
   +'<p style="font-size:9.5px;letter-spacing:2px;font-weight:800;color:var(--dim);text-transform:uppercase;margin-bottom:7px;">Mismo significado \u00b7 distinta estructura</p>'
   +'<div style="display:flex;flex-direction:column;gap:6px;">'
   +'<div style="border-radius:11px;padding:9px 12px;font-size:12.5px;font-weight:600;line-height:1.5;background:rgba(var(--purple-rgb),.08);border:1px solid rgba(var(--purple-rgb),.25);">'
   +'<small style="display:block;font-size:10px;color:var(--dim);font-weight:700;letter-spacing:.8px;text-transform:uppercase;margin-bottom:2px;">Subordinada \u00b7 verbo al final</small>'
   +q.pair.sub+'</div>'
   +'<div style="border-radius:11px;padding:9px 12px;font-size:12.5px;font-weight:600;line-height:1.5;background:rgba(var(--teal-rgb),.08);border:1px solid rgba(var(--teal-rgb),.25);">'
   +'<small style="display:block;font-size:10px;color:var(--dim);font-weight:700;letter-spacing:.8px;text-transform:uppercase;margin-bottom:2px;">Adverbio \u00b7 verbo posici\u00f3n 2</small>'
   +q.pair.v2+'</div></div></div>';
 }
 fb.innerHTML=html;
 if(ok) right++; else missed.push({q:q,full:correct});
 state.satzbau._right=right;
 document.getElementById("sb-chk").style.display="none";
 var clearBtn=document.querySelector(".sb-clear"); if(clearBtn) clearBtn.style.display="none";
 document.getElementById("sb-bank").style.display="none";
 document.getElementById("sb-nx").style.display="block";
 // update dots
 var dots=document.querySelectorAll("#s-satzbau .dots span"); if(dots[idx]){dots[idx].style.background=ok?"var(--green)":"var(--red)";}
 var sc=document.querySelector("#s-satzbau .score"); if(sc)sc.innerHTML="<b style=color:var(--green);font-size:15px>"+right+"</b> / "+(idx+1);
}
function sbSummary(el){
 var pct=Math.round(right/deck.length*100);
 var em=pct>=90?"\ud83c\udfc6":pct>=70?"\ud83d\udcaa":pct>=50?"\ud83d\udcc8":"\ud83c\udf31";
 var ti=pct>=90?"\u00a1Sehr gut!":pct>=70?"\u00a1Buen ritmo!":"Sigue puliendo";
 // Header
 var hdr=mk("div","","margin-bottom:14px;");
 hdr.appendChild(mk("p","Gram\u00e1tica \u00b7 Orden de palabras","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
 hdr.appendChild(mk("h2","Satzbau","font-size:24px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin:3px 0 4px;color:var(--text);"));
 hdr.appendChild(mk("p","Resultados","font-size:13px;color:var(--muted);font-weight:500;margin-bottom:0;"));
 el.appendChild(hdr);
 // Summary card
 var card=mk("div","","background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:18px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:18px;margin-bottom:12px;text-align:center;animation:slideUpFade .45s var(--ease-spring) both;");
 card.appendChild(mk("p",em,"font-size:52px;margin:0;"));
 card.appendChild(mk("h2",ti,"font-size:24px;font-weight:900;margin:10px 0 4px;"));
 var pctEl=mk("p","","font-size:14px;color:var(--muted);font-weight:600;margin-bottom:18px;");
 pctEl.innerHTML=right+' de '+deck.length+' correctas \u00b7 <i style="font-style:normal;color:var(--gold);font-weight:900">'+pct+'%</i>';
 card.appendChild(pctEl);
 // Missed items
 if(missed.length){
   var missSec=mk("div","","text-align:left;border-top:1px dashed rgba(255,255,255,.1);padding-top:14px;");
   missSec.appendChild(mk("p","Para repasar \u00b7 "+missed.length,"font-size:9.5px;letter-spacing:2px;font-weight:800;color:var(--dim);text-transform:uppercase;margin-bottom:8px;"));
   for(var m=0;m<missed.length;m++){
     var mi=mk("div","","padding:8px 0;border-bottom:"+(m===missed.length-1?"none":"1px solid rgba(255,255,255,.05)")+";");
     mi.appendChild(mk("p",missed[m].full,"font-size:14px;font-weight:800;color:var(--green);margin:0 0 2px 0;"));
     var why=mk("p","","font-size:11.5px;color:var(--muted);font-weight:500;margin:0;");
     why.innerHTML=missed[m].q.r;
     mi.appendChild(why);
     missSec.appendChild(mi);
   }
   card.appendChild(missSec);
 }
 // Again button
 var again=mk("button","\ud83c\udfaf Otra ronda","width:100%;margin-top:16px;padding:15px;border-radius:15px;border:none;cursor:pointer;background:var(--gold);color:#291800;font-size:15px;font-weight:900;font-family:inherit;box-shadow:0 6px 20px rgba(var(--gold-rgb),.3);");
 again.onclick=function(){sbStart();};
 card.appendChild(again);
 el.appendChild(card);
  // Track activity (only once per round)
  if(!state.satzbau._logged){
    state.satzbau._logged=true;
    if(typeof logActivity==="function"){logActivity("drillsDone",1);}
    if(typeof syncUp==="function"){syncUp();}
  }
  // Save missed items to error journal (standard shape)
  if(missed.length && state.session && Array.isArray(state.session.errorJournal)){
    var now=Date.now();
    for(var e=0;e<missed.length;e++){
      var m=missed[e]; var rule=m.q.r||"";
      state.session.errorJournal.push({
        date:todayKey(), type:"grammar", source:"satzbau:"+(m.q.k||"orden"), original:m.q.es, correction:m.full, tip:rule
      });
    }
    if(state.session.errorJournal.length>50) state.session.errorJournal=state.session.errorJournal.slice(-50);
  }
  // Save missed items to SRS so failed word-orders resurface in flashcards
  if(missed.length && state.session && Array.isArray(state.session.saved)){
    missed.forEach(function(m){
      var key="satzbau:"+m.full;
      if(state.session.saved.some(function(x){return x.drillKey===key;})) return;
      var plainRule=(m.q.r||"").replace(/<[^>]*>/g,"");
      state.session.saved.push(ensureSrsFields({
        de:m.full, es:(m.q.es||plainRule), tip:plainRule, drillKey:key,
        source:"satzbau-drill", category:"Satzbau", box:0
      }));
    });
    if(typeof invalidateFlashcardQueues==="function") invalidateFlashcardQueues();
    if(typeof updateBadge==="function") updateBadge();
    syncUp();
  }
}
function renderSatzbau(){
 if(!state.satzbau._deck||!state.satzbau._deck.length){
   sbStart(); return;
 }
 deck=state.satzbau._deck; idx=state.satzbau._idx; right=state.satzbau._right; missed=[];
 sbRender();
}
window.renderSatzbau=renderSatzbau;
})();
