// ── Perfekt (haben/sein + Partizip II drill, ported from Fable) ──

(function(){
var POOL=[
 // sein
 {v:"fahren",aux:"sein",pz:"gefahren",d:["gefahrt","fahren"],s:"Ich __ nach Berlin __.",r:"Movimiento de A a B \u2192 <i style=color:var(--teal)>sein</i>. Verbo fuerte: ge-fahr-en."},
 {v:"gehen",aux:"sein",pz:"gegangen",d:["gegeht","gangen"],s:"Wir __ zu Fu\u00df __.",r:"Movimiento \u2192 <i style=color:var(--teal)>sein</i>. Irregular: gegangen."},
 {v:"laufen",aux:"sein",pz:"gelaufen",d:["gelauft","laufen"],s:"Er __ einen Marathon __.",r:"Movimiento \u2192 <i style=color:var(--teal)>sein</i>. Verbo fuerte: gelaufen."},
 {v:"fliegen",aux:"sein",pz:"geflogen",d:["gefliegt","geflugen"],s:"Sie __ nach Wien __.",r:"Movimiento \u2192 <i style=color:var(--teal)>sein</i>. ie\u2192o: geflogen."},
 {v:"kommen",aux:"sein",pz:"gekommen",d:["gekommt","kommen"],s:"Du __ sp\u00e4t nach Hause __.",r:"Movimiento \u2192 <i style=color:var(--teal)>sein</i>. Irregular: gekommen."},
 {v:"bleiben",aux:"sein",pz:"geblieben",d:["gebleibt","bleiben"],s:"Ich __ gestern zu Hause __.",r:"Excepci\u00f3n sin movimiento: bleiben, sein, werden van con <i style=color:var(--teal)>sein</i>."},
 {v:"werden",aux:"sein",pz:"geworden",d:["gewerdet","worden"],s:"Sie __ \u00c4rztin __.",r:"Cambio de estado \u2192 <i style=color:var(--teal)>sein</i>. Irregular: geworden."},
 {v:"sein",aux:"sein",pz:"gewesen",d:["gesein","gewest"],s:"Ich __ noch nie in M\u00fcnchen __.",r:"sein va con <i style=color:var(--teal)>sein</i>: ich bin gewesen."},
 {v:"aufstehen",aux:"sein",pz:"aufgestanden",d:["aufgesteht","geaufstanden"],s:"Ich __ um sechs Uhr __.",r:"Cambio de estado \u2192 <i style=color:var(--teal)>sein</i>. Separable: auf<b>ge</b>standen."},
 {v:"einschlafen",aux:"sein",pz:"eingeschlafen",d:["eingeschlaft","geeinschlafen"],s:"Das Kind __ sofort __.",r:"Cambio de estado \u2192 <i style=color:var(--teal)>sein</i>. Separable: ein<b>ge</b>schlafen."},
 // haben
 {v:"machen",aux:"haben",pz:"gemacht",d:["gemachen","macht"],s:"Ich __ die Hausaufgaben __.",r:"Objeto directo \u2192 <i style=color:var(--teal)>haben</i>. Regular: ge-mach-t."},
 {v:"kaufen",aux:"haben",pz:"gekauft",d:["gekaufen","kauft"],s:"Wir __ ein neues Auto __.",r:"Transitivo \u2192 <i style=color:var(--teal)>haben</i>. Regular: gekauft."},
 {v:"essen",aux:"haben",pz:"gegessen",d:["geesst","gegesst"],s:"Er __ eine Pizza __.",r:"Transitivo \u2192 <i style=color:var(--teal)>haben</i>. Ojo: ge<b>g</b>essen (doble g)."},
 {v:"trinken",aux:"haben",pz:"getrunken",d:["getrinkt","trunken"],s:"Sie __ einen Kaffee __.",r:"Transitivo \u2192 <i style=color:var(--teal)>haben</i>. i\u2192u: getrunken."},
 {v:"lesen",aux:"haben",pz:"gelesen",d:["gelest","geliest"],s:"Ich __ das Buch __.",r:"Transitivo \u2192 <i style=color:var(--teal)>haben</i>. Fuerte: gelesen."},
 {v:"schreiben",aux:"haben",pz:"geschrieben",d:["geschreibt","schrieben"],s:"Du __ eine E-Mail __.",r:"Transitivo \u2192 <i style=color:var(--teal)>haben</i>. ei\u2192ie: geschrieben."},
 {v:"sehen",aux:"haben",pz:"gesehen",d:["geseht","gesieht"],s:"Wir __ den Film __.",r:"Transitivo \u2192 <i style=color:var(--teal)>haben</i>. Fuerte: gesehen."},
 {v:"finden",aux:"haben",pz:"gefunden",d:["gefindet","funden"],s:"Ich __ meine Schl\u00fcssel __.",r:"Transitivo \u2192 <i style=color:var(--teal)>haben</i>. i\u2192u: gefunden."},
 {v:"nehmen",aux:"haben",pz:"genommen",d:["genehmt","nehmen"],s:"Er __ den Bus __.",r:"Transitivo \u2192 <i style=color:var(--teal)>haben</i>. Irregular: genommen."},
 {v:"bringen",aux:"haben",pz:"gebracht",d:["gebringt","gebrungen"],s:"Sie __ einen Kuchen __.",r:"Mixto \u2192 <i style=color:var(--teal)>haben</i>: gebracht (como denken\u2192gedacht)."},
 {v:"denken",aux:"haben",pz:"gedacht",d:["gedenkt","gedunken"],s:"Ich __ an dich __.",r:"Mixto \u2192 <i style=color:var(--teal)>haben</i>: gedacht."},
 {v:"wissen",aux:"haben",pz:"gewusst",d:["gewisst","gewussen"],s:"Das __ ich nicht __.",r:"Mixto \u2192 <i style=color:var(--teal)>haben</i>: gewusst."},
 {v:"arbeiten",aux:"haben",pz:"gearbeitet",d:["gearbeit","gearbeitete"],s:"Ich __ am Wochenende __.",r:"Actividad sin movimiento \u2192 <i style=color:var(--teal)>haben</i>. -t- extra: gearbeit<b>et</b>."},
 {v:"lernen",aux:"haben",pz:"gelernt",d:["gelernen","lernt"],s:"Wir __ Deutsch __.",r:"Regular \u2192 <i style=color:var(--teal)>haben</i>: gelernt."},
 {v:"mitnehmen",aux:"haben",pz:"mitgenommen",d:["mitgenehmt","gemitnommen"],s:"Ich __ einen Regenschirm __.",r:"Separable \u2192 mit<b>ge</b>nommen. Transitivo \u2192 <i style=color:var(--teal)>haben</i>."},
 {v:"aufmachen",aux:"haben",pz:"aufgemacht",d:["aufgemachen","geaufmacht"],s:"Er __ das Fenster __.",r:"Separable \u2192 auf<b>ge</b>macht. Transitivo \u2192 <i style=color:var(--teal)>haben</i>."}
];
var ROUND=10, deck=[], idx=0, right=0, missed=[], selAux=null, selPz=null;

// ── Perfekt state init ──
if(!state.perfekt) state.perfekt={};
if(!state.perfekt._deck) state.perfekt._deck=[];
if(typeof state.perfekt._idx!=="number") state.perfekt._idx=0;
if(typeof state.perfekt._right!=="number") state.perfekt._right=0;

function shuffle(a){a=a.slice();for(var k=a.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1));var t=a[k];a[k]=a[j];a[j]=t;}return a;}
function auxForm(q){
 // Futur/Konjunktiv II mode: the option IS already the conjugated werden/würde form
 if(q.f||q.k||["werde","wirst","wird","werden","werdet","würde","würdest","würden","würdet"].indexOf(q.aux)>=0) return q.aux;
 var w=q.s.split(" ")[0].toLowerCase();
 if(state.perfekt.mode==="plusq"){
   var pmap={ich:{haben:"hatte",sein:"war"},du:{haben:"hattest",sein:"warst"},er:{haben:"hatte",sein:"war"},sie:{haben:"hatte",sein:"war"},es:{haben:"hatte",sein:"war"},das:{haben:"hatte",sein:"war"},wir:{haben:"hatten",sein:"waren"},ihr:{haben:"hattet",sein:"wart"}};
   return (pmap[w]||pmap.ich)[q.aux];
 }
 var map={ich:{haben:"habe",sein:"bin"},du:{haben:"hast",sein:"bist"},er:{haben:"hat",sein:"ist"},sie:{haben:"hat",sein:"ist"},das:{haben:"hat",sein:"ist"},wir:{haben:"haben",sein:"sind"}};
 return (map[w]||map.ich)[q.aux];}
var MODE_SUB={perfekt:"Gramática · Pasado compuesto",futur:"Gramática · Futuro",konj2:"Gramática · Condicional / irreal",plusq:"Gramática · Pasado del pasado"};
var MODE_TITLE={perfekt:"Perfekt",futur:"Futur I",konj2:"Konjunktiv II",plusq:"Plusquamperfekt"};

function perfStart(){
  var m=state.perfekt.mode||"perfekt";
  var src=m==="futur"?FUTUR_POOL:m==="konj2"?KONJ2_POOL:m==="plusq"?PLUSQ_POOL:POOL;
  deck=shuffle(src).slice(0,ROUND); idx=0; right=0; missed=[];
  state.perfekt._deck=deck; state.perfekt._idx=0; state.perfekt._right=0; state.perfekt._logged=false;
  perfRender();
}
function perfRender(){
 var el=document.getElementById("s-perfekt"); el.innerHTML="";
 if(!deck.length){perfStart();return;}
 if(idx>=deck.length){perfSummary(el);return;}
 var q=deck[idx]; selAux=null; selPz=null;
 // ── Header ──
 var mode=state.perfekt.mode||"perfekt";
 var isFutur=mode==="futur", isKonj2=mode==="konj2", isPlusq=mode==="plusq";
 var hdr=mk("div","","margin-bottom:14px;");
 hdr.appendChild(mk("p",MODE_SUB[mode],"font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
 var h2row=mk("div","","display:flex;align-items:center;gap:8px;margin:3px 0 4px;");
 h2row.appendChild(mk("h2",MODE_TITLE[mode],"font-size:24px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin:0;color:var(--text);"));
 var pfHint=mk("button","\ud83d\udca1","width:32px;height:32px;border-radius:10px;border:1px dashed rgba(var(--gold-rgb),.4);background:rgba(var(--gold-rgb),.06);font-size:15px;cursor:pointer;padding:0;line-height:1;transition:background .15s;");
 pfHint.setAttribute("aria-label","Trucos de los tiempos verbales"); pfHint.setAttribute("aria-haspopup","dialog");
 pfHint.onclick=function(){perfektRulesOverlay();};
 h2row.appendChild(pfHint);
 hdr.appendChild(h2row);
 hdr.appendChild(mk("p","","font-size:13px;color:var(--muted);font-weight:500;margin-bottom:0;"));
 hdr.lastChild.innerHTML=isFutur
   ?'Elige <b style="color:var(--teal)">werden</b> conjugado y el infinitivo \u2014 que va AL FINAL.'
   :isKonj2
   ?'Elige <b style="color:var(--teal)">w\u00fcrde</b> conjugado y el infinitivo al final. Deseos y situaciones irreales.'
   :isPlusq
   ?'Elige <b style="color:var(--teal)">hatte/war</b> y el Partizip II. Acci\u00f3n anterior a otra acci\u00f3n pasada.'
   :'Elige el auxiliar y el Partizip II. <b style="color:var(--teal)">sein</b> = movimiento o cambio de estado.';
 el.appendChild(hdr);
 // \u2500\u2500 Mode toggle: Perfekt | Futur \u2500\u2500
 var pfModeRow=mk("div","","display:grid;grid-template-columns:repeat(4,1fr);gap:5px;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:4px;margin-bottom:14px;");
 [["perfekt","\u23ea Perfekt"],["futur","\u23e9 Futur"],["konj2","\ud83d\udcad Konj. II"],["plusq","\u23ee Plusq."]].forEach(function(m){
   var mb=mk("button",m[1],"padding:9px 2px;border-radius:10px;border:none;cursor:pointer;font-size:11.5px;font-weight:700;font-family:inherit;white-space:nowrap;transition:background .2s,color .2s;");
   var active=mode===m[0];
   if(active){mb.style.background="var(--gold)";mb.style.color="#291800";mb.style.boxShadow="0 2px 12px rgba(var(--gold-rgb),.3)";}
   else{mb.style.background="transparent";mb.style.color="var(--muted)";}
   mb.onclick=function(){ state.perfekt.mode=m[0]; perfStart(); };
   pfModeRow.appendChild(mb);
 });
 el.appendChild(pfModeRow);
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
 // Sentence
 var sent=mk("p","","font-size:21px;line-height:1.6;font-weight:700;text-align:center;margin:6px 0 4px;");
 var parts=q.s.split("__");
 sent.appendChild(document.createTextNode(parts[0]));
 var g1=mk("span","\u2026","display:inline-block;min-width:58px;border-bottom:2px dashed rgba(var(--gold-rgb),.5);text-align:center;color:var(--gold);font-weight:900;padding:0 4px;");
 g1.id="pf-g1";
 sent.appendChild(g1);
 sent.appendChild(document.createTextNode(parts[1]));
 var g2=mk("span","\u2026","display:inline-block;min-width:58px;border-bottom:2px dashed rgba(var(--gold-rgb),.5);text-align:center;color:var(--gold);font-weight:900;padding:0 4px;");
 g2.id="pf-g2";
 sent.appendChild(g2);
 if(parts[2]) sent.appendChild(document.createTextNode(parts[2]));
 card.appendChild(sent);
 // Verb label
 var vbl=mk("p","","text-align:center;font-size:12.5px;color:var(--muted);font-weight:600;margin-bottom:16px;");
 vbl.innerHTML='verbo: <b style="color:var(--teal);font-weight:800">'+q.v+'</b> \u00b7 '+(idx+1)+' de '+deck.length;
 card.appendChild(vbl);
  // Aux label
  card.appendChild(mk("p",q.f?"1 · werden (conjugado)":q.k?"1 · würde (conjugado)":isPlusq?"1 · hatte / war":"1 · Auxiliar","font-size:9.5px;letter-spacing:2px;font-weight:800;color:var(--dim);text-transform:uppercase;margin:12px 0 7px;"));
   // Aux row — show conjugated forms for the sentence subject
   var auxRow=mk("div","","display:grid;grid-template-columns:1fr 1fr;gap:9px;");
  var auxCSS="padding:14px;border-radius:14px;font-size:16px;font-weight:900;text-align:center;cursor:pointer;background:rgba(255,255,255,.05);border:1.5px solid var(--border);color:var(--text);font-family:inherit;transition:transform .1s,border-color .15s,background .15s;";
  if(q.f||q.k){
    // Futur/Konjunktiv II: two conjugations of werden/würde (correct + distractor), shuffled
    shuffle([q.aux,q.auxD]).forEach(function(wf){
      var bw=mk("button",wf,auxCSS); bw.dataset.a=wf; bw.className="pf-aux lift";bw.style.setProperty("--lift-rgb","var(--teal-rgb)");
      bw.onclick=function(){perfPickAux(this);};
      auxRow.appendChild(bw);
    });
  } else {
  var subj=q.s.split(" ")[0].toLowerCase();
  var habenForm=isPlusq
    ?({ich:"hatte",du:"hattest",er:"hatte",sie:"hatte",es:"hatte",das:"hatte",wir:"hatten",ihr:"hattet"})[subj]||"hatte"
    :({ich:"habe",du:"hast",er:"hat",sie:"hat",es:"hat",das:"hat",wir:"haben",ihr:"habt"})[subj]||"haben";
  var seinForm=isPlusq
    ?({ich:"war",du:"warst",er:"war",sie:"war",es:"war",das:"war",wir:"waren",ihr:"wart"})[subj]||"war"
    :({ich:"bin",du:"bist",er:"ist",sie:"ist",es:"ist",das:"ist",wir:"sind",ihr:"seid"})[subj]||"sein";
  var btnH=mk("button",habenForm,auxCSS); btnH.dataset.a="haben"; btnH.className="pf-aux lift";btnH.style.setProperty("--lift-rgb","var(--teal-rgb)");
  btnH.title="haben → "+habenForm;
  btnH.onclick=function(){perfPickAux(this);};
  auxRow.appendChild(btnH);
  var btnS=mk("button",seinForm,auxCSS); btnS.dataset.a="sein"; btnS.className="pf-aux lift";btnS.style.setProperty("--lift-rgb","var(--teal-rgb)");
  btnS.title="sein → "+seinForm;
  btnS.onclick=function(){perfPickAux(this);};
  auxRow.appendChild(btnS);
  }
 card.appendChild(auxRow);
 // PZ label
 card.appendChild(mk("p",(q.f||q.k)?"2 \u00b7 Infinitivo (al final)":"2 \u00b7 Partizip II","font-size:9.5px;letter-spacing:2px;font-weight:800;color:var(--dim);text-transform:uppercase;margin:12px 0 7px;"));
 // PZ row
 var pzRow=mk("div","","display:grid;grid-template-columns:repeat(3,1fr);gap:8px;");
 var opts=shuffle([q.pz].concat(q.d));
 var pzCSS="padding:12px 6px;border-radius:13px;font-size:14.5px;font-weight:800;text-align:center;cursor:pointer;background:rgba(255,255,255,.05);border:1.5px solid var(--border);color:var(--text);font-family:inherit;transition:transform .1s,border-color .15s,background .15s;";
 for(var o=0;o<opts.length;o++){
   var b=mk("button",opts[o],pzCSS); b.dataset.p=opts[o]; b.className="pf-pz lift";b.style.setProperty("--lift-rgb","var(--gold-rgb)");
   b.onclick=function(){perfPickPz(this);};
   pzRow.appendChild(b);
 }
 card.appendChild(pzRow);
 // Check button
 var chk=mk("button","Comprobar","width:100%;margin-top:16px;padding:15px;border-radius:15px;border:none;cursor:pointer;background:var(--gold);color:#291800;font-size:15px;font-weight:900;font-family:inherit;box-shadow:0 6px 20px rgba(var(--gold-rgb),.25);transition:transform .1s,opacity .2s;");
 chk.id="pf-chk"; chk.disabled=true; chk.onclick=function(){perfCheck();};
 card.appendChild(chk);
 // Feedback
 var fb=mk("div","","border-radius:14px;padding:13px 15px;margin-top:14px;font-size:13.5px;line-height:1.55;font-weight:500;display:none;");
 fb.id="pf-fb";
 card.appendChild(fb);
 // Next button
 var nx=mk("button","Siguiente \u2192","width:100%;margin-top:12px;padding:13px;border-radius:14px;border:1px solid var(--border);background:rgba(255,255,255,.05);color:var(--text);font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;display:none;transition:background .15s;");
 nx.id="pf-nx"; nx.onclick=function(){idx++; state.perfekt._idx=idx; perfRender();};
 card.appendChild(nx);
 el.appendChild(card);
 el.appendChild(perfConjTable());
}
// ── Conjugation reference table (collapsible, below the drill) ──
function perfConjTable(){
 var wrap=mk("div","","margin-bottom:12px;");
 var mode=state.perfekt.mode||"perfekt";
 var isFut=mode==="futur"||mode==="konj2";
 var lbl=mode==="futur"?"📖 Conjugación werden":mode==="konj2"?"📖 Conjugación würde":mode==="plusq"?"📖 Conjugación hatte / war":"📖 Conjugación haben / sein";
 var tgl=mk("button",lbl,"width:100%;padding:11px;border-radius:12px;border:1px dashed var(--border);background:rgba(255,255,255,.03);color:var(--muted);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s;");
 tgl.setAttribute("aria-expanded", state.perfekt._tableOpen?"true":"false");
 var card=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:12px 14px;margin-top:8px;display:"+(state.perfekt._tableOpen?"block":"none")+";");
 var rows=mode==="futur"
   ?[["ich","werde"],["du","wirst"],["er/sie","wird"],["wir","werden"],["ihr","werdet"],["sie","werden"]]
   :mode==="konj2"
   ?[["ich","würde"],["du","würdest"],["er/sie","würde"],["wir","würden"],["ihr","würdet"],["sie","würden"]]
   :mode==="plusq"
   ?[["ich","hatte","war"],["du","hattest","warst"],["er/sie","hatte","war"],["wir","hatten","waren"],["ihr","hattet","wart"],["sie","hatten","waren"]]
   :[["ich","habe","bin"],["du","hast","bist"],["er/sie","hat","ist"],["wir","haben","sind"],["ihr","habt","seid"],["sie","haben","sind"]];
 var tbl=mk("div","","display:grid;grid-template-columns:"+(isFut?"1fr 1fr":"1fr 1fr 1fr")+";gap:2px 10px;font-size:12.5px;");
 tbl.appendChild(mk("span","",""));
 tbl.appendChild(mk("span",mode==="futur"?"werden":mode==="konj2"?"würde":mode==="plusq"?"hatte":"haben","font-weight:800;color:var(--gold);font-size:11px;letter-spacing:1px;text-transform:uppercase;"));
 if(!isFut) tbl.appendChild(mk("span",mode==="plusq"?"war":"sein","font-weight:800;color:var(--teal);font-size:11px;letter-spacing:1px;text-transform:uppercase;"));
 rows.forEach(function(r){
   tbl.appendChild(mk("span",r[0],"color:var(--muted);font-weight:600;padding:2px 0;"));
   tbl.appendChild(mk("span",r[1],"font-family:'SF Mono',ui-monospace,Menlo,monospace;font-weight:700;color:var(--text);padding:2px 0;"));
   if(!isFut) tbl.appendChild(mk("span",r[2],"font-family:'SF Mono',ui-monospace,Menlo,monospace;font-weight:700;color:var(--text);padding:2px 0;"));
 });
 card.appendChild(tbl);
 tgl.onclick=function(){
   state.perfekt._tableOpen=!state.perfekt._tableOpen;
   card.style.display=state.perfekt._tableOpen?"block":"none";
   tgl.setAttribute("aria-expanded",state.perfekt._tableOpen?"true":"false");
 };
 wrap.appendChild(tgl); wrap.appendChild(card);
 return wrap;
}
function perfReady(){document.getElementById("pf-chk").disabled=!(selAux&&selPz);}
function perfPickAux(b){if(b.disabled)return; selAux=b.dataset.a;
 var all=document.querySelectorAll(".pf-aux"); for(var x=0;x<all.length;x++){all[x].style.cssText=all[x].style.cssText.replace(/border-color:[^;]*;/,"border-color:var(--border);").replace(/background:[^;]*;/,"background:rgba(255,255,255,.05);").replace(/color:[^;]*;/,"color:var(--text);");}
 b.style.background="rgba(var(--teal-rgb),.14)"; b.style.borderColor="var(--teal)"; b.style.color="var(--teal)";
 var g1=document.getElementById("pf-g1"); if(g1){g1.textContent=auxForm({s:deck[idx].s,aux:selAux}); g1.style.borderBottomColor="transparent";}
 perfReady();}
function perfPickPz(b){if(b.disabled)return; selPz=b.dataset.p;
 var all=document.querySelectorAll(".pf-pz"); for(var x=0;x<all.length;x++){all[x].style.cssText=all[x].style.cssText.replace(/border-color:[^;]*;/,"border-color:var(--border);").replace(/background:[^;]*;/,"background:rgba(255,255,255,.05);").replace(/color:[^;]*;/,"color:var(--text);");}
 b.style.background="rgba(var(--gold-rgb),.14)"; b.style.borderColor="var(--gold)"; b.style.color="var(--gold)";
 var g2=document.getElementById("pf-g2"); if(g2){g2.textContent=selPz; g2.style.borderBottomColor="transparent";}
 perfReady();}
function perfCheck(){
 var q=deck[idx], okA=selAux===q.aux, okP=selPz===q.pz, ok=okA&&okP;
 var auxs=document.querySelectorAll(".pf-aux"); for(var x=0;x<auxs.length;x++){auxs[x].disabled=true;
   if(auxs[x].dataset.a===q.aux){auxs[x].style.background="rgba(var(--green-rgb),.16)"; auxs[x].style.borderColor="var(--green)"; auxs[x].style.color="var(--green)";}
   else if(auxs[x].dataset.a===selAux){auxs[x].style.background="rgba(var(--red-rgb),.14)"; auxs[x].style.borderColor="var(--red)"; auxs[x].style.color="var(--red)";}
 }
 var pzs=document.querySelectorAll(".pf-pz"); for(var y=0;y<pzs.length;y++){pzs[y].disabled=true;
   if(pzs[y].dataset.p===q.pz){pzs[y].style.background="rgba(var(--green-rgb),.16)"; pzs[y].style.borderColor="var(--green)"; pzs[y].style.color="var(--green)";}
   else if(pzs[y].dataset.p===selPz){pzs[y].style.background="rgba(var(--red-rgb),.14)"; pzs[y].style.borderColor="var(--red)"; pzs[y].style.color="var(--red)";}
 }
 var full=q.s.replace("__",auxForm(q)).replace("__",q.pz);
 var fb=document.getElementById("pf-fb");
 fb.style.display="block";
 fb.style.background=ok?"rgba(var(--green-rgb),.09)":"rgba(var(--red-rgb),.08)";
 fb.style.border=ok?"1px solid rgba(var(--green-rgb),.3)":"1px solid rgba(var(--red-rgb),.3)";
 fb.innerHTML='<b style="display:block;font-size:15px;font-weight:800;margin-bottom:5px;">'+(ok?"\u2713 ":"\u2717 ")+full+'</b>'
  +'<p style="color:var(--muted);font-size:12.5px;margin:0">'+q.r+'</p>';
 if(ok) right++; else missed.push({q:q,full:full});
 state.perfekt._right=right;
 document.getElementById("pf-chk").style.display="none";
 document.getElementById("pf-nx").style.display="block";
 // update dots
 var dots=document.querySelectorAll("#s-perfekt .dots span"); if(dots[idx]){dots[idx].style.background=ok?"var(--green)":"var(--red)";}
 var sc=document.querySelector("#s-perfekt .score"); if(sc)sc.innerHTML="<b style=color:var(--green);font-size:15px>"+right+"</b> / "+(idx+1);
}
function perfSummary(el){
 var pct=Math.round(right/deck.length*100);
 var em=pct>=90?"\ud83c\udfc6":pct>=70?"\ud83d\udcaa":pct>=50?"\ud83d\udcc8":"\ud83c\udf31";
 var ti=pct>=90?"\u00a1Sehr gut!":pct>=70?"\u00a1Buen ritmo!":"Sigue puliendo";
 // Header
 var mode=state.perfekt.mode||"perfekt";
 var hdr=mk("div","","margin-bottom:14px;");
 hdr.appendChild(mk("p",MODE_SUB[mode],"font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
 hdr.appendChild(mk("h2",MODE_TITLE[mode],"font-size:24px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin:3px 0 4px;color:var(--text);"));
 hdr.appendChild(mk("p","Resultados","font-size:13px;color:var(--muted);font-weight:500;margin-bottom:0;"));
 el.appendChild(hdr);
 // Summary card
 var card=mk("div","","background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:18px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:18px;margin-bottom:12px;text-align:center;animation:slideUpFade .45s var(--ease-spring) both;");
 var emo=mk("p",em,"font-size:52px;margin:0;");
 card.appendChild(emo);
 card.appendChild(mk("h2",ti,"font-size:24px;font-weight:900;letter-spacing:-.02em;margin:10px 0 4px;"));
 var pctEl=mk("p","","font-size:14px;color:var(--muted);font-weight:600;margin-bottom:18px;");
 pctEl.innerHTML=right+' de '+deck.length+' correctas \u00b7 <i style="font-style:normal;color:var(--gold);font-weight:900">'+pct+'%</i>';
 card.appendChild(pctEl);
 // Missed items
 if(missed.length){
   var missSec=mk("div","","text-align:left;border-top:1px dashed rgba(255,255,255,.1);padding-top:14px;margin-top:6px;");
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
 again.onclick=function(){perfStart();};
 card.appendChild(again);
 el.appendChild(card);
  // Track activity (only once per round)
  if(!state.perfekt._logged){
    state.perfekt._logged=true;
    if(typeof logActivity==="function"){logActivity("drillsDone",1);}
    if(typeof syncUp==="function"){syncUp();}
  }
  // Save missed items to error journal (standard shape)
  if(missed.length && state.session && Array.isArray(state.session.errorJournal)){
    var now=Date.now();
    for(var e=0;e<missed.length;e++){
      state.session.errorJournal.push({
        date:todayKey(), type:"grammar", source:"perfekt", original:missed[e].q.v, correction:missed[e].full, tip:missed[e].q.r
      });
    }
    if(state.session.errorJournal.length>50) state.session.errorJournal=state.session.errorJournal.slice(-50);
  }
  // Save missed items to SRS so failed forms resurface in flashcards
  if(missed.length && state.session && Array.isArray(state.session.saved)){
    missed.forEach(function(m){
      var key="perfekt:"+m.q.v+(mode==="perfekt"?"":":"+mode);
      if(state.session.saved.some(function(x){return x.drillKey===key;})) return;
      var plainRule=(m.q.r||"").replace(/<[^>]*>/g,"");
      state.session.saved.push(ensureSrsFields({
        de:m.full, es:plainRule, tip:plainRule, drillKey:key,
        source:mode+"-drill",
        category:MODE_TITLE[mode], box:0
      }));
    });
    if(typeof invalidateFlashcardQueues==="function") invalidateFlashcardQueues();
    if(typeof updateBadge==="function") updateBadge();
    syncUp();
  }
}
function renderPerfekt(){
 if(!state.perfekt._deck||!state.perfekt._deck.length){
   perfStart(); return;
 }
 deck=state.perfekt._deck; idx=state.perfekt._idx; right=state.perfekt._right; missed=[];
 perfRender();
}
window.renderPerfekt=renderPerfekt;
})();

// ── Futur I pool (werden + infinitive; f:1 marks futur items) ─────────────────
var FUTUR_POOL=[
 {f:1,v:"fahren",aux:"werde",auxD:"wirst",pz:"fahren",d:["gefahren","fährt"],s:"Ich __ morgen nach Berlin __.",r:"Futur I = werden + INFINITIVO al final. ich → <i>werde</i>."},
 {f:1,v:"arbeiten",aux:"wird",auxD:"werden",pz:"arbeiten",d:["gearbeitet","arbeitet"],s:"Sie __ nächste Woche im Büro __.",r:"er/sie → <i>wird</i>. El infinitivo cierra la frase."},
 {f:1,v:"lernen",aux:"werden",auxD:"werdet",pz:"lernen",d:["gelernt","lernt"],s:"Wir __ dieses Jahr Deutsch __.",r:"wir → <i>werden</i> + infinitivo al final."},
 {f:1,v:"kaufen",aux:"wirst",auxD:"wird",pz:"kaufen",d:["gekauft","kaufst"],s:"Du __ dir ein neues Auto __.",r:"du → <i>wirst</i>. Infinitivo (no Partizip) al final."},
 {f:1,v:"besuchen",aux:"werde",auxD:"werden",pz:"besuchen",d:["besucht","besuche"],s:"Ich __ meine Familie in Cali __.",r:"ich → <i>werde</i>. besuchen queda en infinitivo."},
 {f:1,v:"anrufen",aux:"wird",auxD:"wirst",pz:"anrufen",d:["angerufen","ruft an"],s:"Er __ dich heute Abend __.",r:"er → <i>wird</i>. Separables van JUNTOS en infinitivo: anrufen."},
 {f:1,v:"kochen",aux:"werdet",auxD:"werden",pz:"kochen",d:["gekocht","kocht"],s:"Ihr __ am Samstag für alle __.",r:"ihr → <i>werdet</i> + infinitivo al final."},
 {f:1,v:"reisen",aux:"werden",auxD:"wird",pz:"reisen",d:["gereist","reist"],s:"Sie __ im Sommer durch Europa __. (ellos)",r:"sie (plural) → <i>werden</i> + infinitivo."},
 {f:1,v:"schreiben",aux:"werde",auxD:"wird",pz:"schreiben",d:["geschrieben","schreibt"],s:"Ich __ dir eine E-Mail __.",r:"ich → <i>werde</i>. Infinitivo al final, no geschrieben."},
 {f:1,v:"spielen",aux:"wird",auxD:"werdet",pz:"spielen",d:["gespielt","spielt"],s:"Das Kind __ morgen im Park __.",r:"das Kind (es) → <i>wird</i> + infinitivo."},
 {f:1,v:"machen",aux:"wirst",auxD:"werde",pz:"machen",d:["gemacht","machst"],s:"Du __ das nächste Mal besser __.",r:"du → <i>wirst</i>. machen en infinitivo al final."},
 {f:1,v:"sehen",aux:"werden",auxD:"werdet",pz:"sehen",d:["gesehen","sieht"],s:"Wir __ uns nächste Woche __.",r:"wir → <i>werden</i>. sehen queda en infinitivo."},
 {f:1,v:"bleiben",aux:"wird",auxD:"werden",pz:"bleiben",d:["geblieben","bleibt"],s:"Sie __ dieses Wochenende zu Hause __. (ella)",r:"sie (ella) → <i>wird</i>. Futur no usa sein: werden + bleiben."},
 {f:1,v:"beginnen",aux:"wird",auxD:"wirst",pz:"beginnen",d:["begonnen","beginnt"],s:"Der Kurs __ im August __.",r:"der Kurs (er) → <i>wird</i> + infinitivo beginnen."},
 {f:1,v:"helfen",aux:"werde",auxD:"wirst",pz:"helfen",d:["geholfen","hilft"],s:"Ich __ dir mit dem Umzug __.",r:"ich → <i>werde</i>. helfen en infinitivo (no geholfen)."}
];

// ── Konjunktiv II pool (würde + infinitive; k:1 marks konj2 items) ────────────
var KONJ2_POOL=[
 {k:1,v:"fahren",aux:"würde",auxD:"würdest",pz:"fahren",d:["gefahren","fährt"],s:"Ich __ gern nach Berlin __.",r:"würde + INFINITIVO al final: ich <i>würde</i>... fahren. Deseos y situaciones irreales."},
 {k:1,v:"haben",aux:"würde",auxD:"würden",pz:"haben",d:["gehabt","hätte"],s:"Ich __ gern mehr Zeit __.",r:"Alternativa corta: <b>ich hätte</b> gern. Konjunktiv II propio de haben."},
 {k:1,v:"sein",aux:"würde",auxD:"würdest",pz:"sein",d:["gewesen","wäre"],s:"Ich __ gern öfter am Meer __.",r:"Alternativa corta: <b>ich wäre</b> gern. Konjunktiv II propio de sein."},
 {k:1,v:"können",aux:"würde",auxD:"würdet",pz:"können",d:["gekonnt","könnte"],s:"Ich __ das nicht ohne dich machen __.",r:"Alternativa corta: <b>ich könnte</b>. Útil para pedidos corteses."},
 {k:1,v:"machen",aux:"würde",auxD:"würdest",pz:"machen",d:["gemacht","macht"],s:"Ich __ das anders __.",r:"Regla: <b>würde</b> + infinitivo al final. El 90% del Konjunktiv II se forma así."},
 {k:1,v:"gehen",aux:"würden",auxD:"würde",pz:"gehen",d:["gegangen","ginge"],s:"Wir __ heute Abend gern essen __.",r:"wir → <i>würden</i>. Solo verbos muy comunes tienen forma propia (ginge, hätte, wäre)."},
 {k:1,v:"kaufen",aux:"würde",auxD:"würden",pz:"kaufen",d:["gekauft","kaufe"],s:"Ich __ mir gern ein Auto __.",r:"würde + infinitivo al final."},
 {k:1,v:"arbeiten",aux:"würde",auxD:"würdest",pz:"arbeiten",d:["gearbeitet","arbeitete"],s:"Ich __ nicht so viel __.",r:"würde + infinitivo. Deseo: 'trabajaría menos'."},
 {k:1,v:"reisen",aux:"würde",auxD:"würdet",pz:"reisen",d:["gereist","reiste"],s:"Ich __ gern um die Welt __.",r:"Situación irreal (no tengo el dinero) → würde + infinitivo."},
 {k:1,v:"lernen",aux:"würde",auxD:"würden",pz:"lernen",d:["gelernt","lernte"],s:"Ich __ jeden Tag Deutsch __.",r:"würde + infinitivo."},
 {k:1,v:"trinken",aux:"würde",auxD:"würdest",pz:"trinken",d:["getrunken","trank"],s:"Ich __ gern einen Kaffee mit dir __.",r:"Cortesía: 'me tomaría un café contigo'. würde + trinken."},
 {k:1,v:"schreiben",aux:"würde",auxD:"würden",pz:"schreiben",d:["geschrieben","schriebe"],s:"Ich __ dir eine E-Mail __.",r:"würde + schreiben al final."},
 {k:1,v:"essen",aux:"würde",auxD:"würdet",pz:"essen",d:["gegessen","äße"],s:"Ich __ gern etwas Deutsches __.",r:"würde + essen. La forma propia (äße) casi no se usa."},
 {k:1,v:"schlafen",aux:"würde",auxD:"würdest",pz:"schlafen",d:["geschlafen","schliefe"],s:"Ich __ am Wochenende länger __.",r:"würde + schlafen."},
 {k:1,v:"kommen",aux:"würde",auxD:"würden",pz:"kommen",d:["gekommen","käme"],s:"Ich __ gern zu deiner Party __.",r:"würde + kommen."},
 {k:1,v:"geben",aux:"würde",auxD:"würden",pz:"geben",d:["gegeben","gäbe"],s:"Es __ so etwas nicht __.",r:"Expresión útil: <b>es gäbe</b> = es würde geben."}
];

// ── Plusquamperfekt pool (hatte/war + Partizip II; same shape as POOL) ────────
var PLUSQ_POOL=[
 {v:"fahren",aux:"sein",pz:"gefahren",d:["gefahrt","fahren"],s:"Bevor du ankamst, __ ich nach Berlin __.",r:"Plusquamperfekt = <b>war/hatte</b> + Partizip II. Movimiento → sein: ich war gefahren."},
 {v:"gehen",aux:"sein",pz:"gegangen",d:["gegeht","gangen"],s:"Ich __ schon __, als du anriefst.",r:"war + gegangen. Acción anterior a otra acción pasada: 'ya me había ido'."},
 {v:"machen",aux:"haben",pz:"gemacht",d:["gemachen","macht"],s:"Ich __ die Hausaufgaben __, bevor der Film begann.",r:"haben-verbo: <b>hatte</b> + gemacht."},
 {v:"sehen",aux:"haben",pz:"gesehen",d:["geseht","gesieht"],s:"Ich __ den Film schon __, als du mich einludst.",r:"hatte + gesehen: 'ya lo había visto cuando...'."},
 {v:"essen",aux:"haben",pz:"gegessen",d:["geesst","gegesst"],s:"Ich __ schon __, als du kamst.",r:"hatte + gegessen. Acción completada antes de otra."},
 {v:"lernen",aux:"haben",pz:"gelernt",d:["gelernen","lernt"],s:"Er __ Deutsch __, bevor er nach Berlin zog.",r:"hatte + gelernt."},
 {v:"kommen",aux:"sein",pz:"gekommen",d:["gekommt","kommen"],s:"Sie __ schon __, als wir aufwachten.",r:"Movimiento → war + gekommen."},
 {v:"schreiben",aux:"haben",pz:"geschrieben",d:["geschreibt","schrieben"],s:"Ich __ die E-Mail __, bevor das Meeting begann.",r:"hatte + geschrieben."},
 {v:"bleiben",aux:"sein",pz:"geblieben",d:["gebleibt","bleiben"],s:"Er __ den ganzen Tag zu Hause __.",r:"Excepción: bleiben no es movimiento pero va con sein → war geblieben."},
 {v:"kaufen",aux:"haben",pz:"gekauft",d:["gekaufen","kauft"],s:"Sie __ das Auto __, bevor sie den Führerschein machte.",r:"hatte + gekauft."},
 {v:"anrufen",aux:"haben",pz:"angerufen",d:["angeruft","geanruft"],s:"Ich __ dich __, aber du gingst nicht ran.",r:"Separable: an<b>ge</b>rufen. hatte + angerufen."},
 {v:"aufstehen",aux:"sein",pz:"aufgestanden",d:["aufgesteht","geaufstanden"],s:"Ich __ schon __, als du mich wecktest.",r:"Cambio de estado → war + aufgestanden. Separable: auf<b>ge</b>standen."},
 {v:"denken",aux:"haben",pz:"gedacht",d:["gedenkt","gedunken"],s:"Das __ ich nicht __.",r:"Mixto: hatte + gedacht."},
 {v:"finden",aux:"haben",pz:"gefunden",d:["gefindet","funden"],s:"Ich __ den Schlüssel __, nachdem du gegangen warst.",r:"hatte + gefunden."},
 {v:"treffen",aux:"haben",pz:"getroffen",d:["getrefft","treffen"],s:"Ich __ ihn schon __, bevor die Konferenz begann.",r:"hatte + getroffen."}
];

// ── Perfekt/Futur rules overlay (curated, static) ─────────────────────────────
function perfektRulesOverlay(){
  var overlay=mk("div","","position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0.62);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto;opacity:0;transition:opacity .18s ease;");
  var card=mk("div","","background:var(--surface);border:1px solid rgba(var(--gold-rgb),0.35);border-radius:20px;padding:20px;width:100%;max-width:560px;margin:16px 0;box-shadow:0 16px 48px rgba(0,0,0,0.55);transform:scale(.97);transition:transform .18s cubic-bezier(.16,1,.3,1);");
  card.setAttribute("role","dialog"); card.setAttribute("aria-modal","true"); card.setAttribute("aria-label","Trucos de los tiempos verbales");
  var top=mk("div","","display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;");
  top.appendChild(mk("p","⏪ Trucos de los tiempos","font-size:16px;font-weight:900;color:var(--text);letter-spacing:-0.01em;"));
  var closeBtn=mk("button","✕","width:32px;height:32px;border-radius:10px;border:none;background:rgba(255,255,255,0.06);color:var(--muted);font-size:15px;cursor:pointer;font-family:inherit;");
  closeBtn.setAttribute("aria-label","Cerrar");
  top.appendChild(closeBtn); card.appendChild(top);
  function sec(color,rgb,title,items){
    var s=mk("div","","border-radius:13px;padding:12px 14px;margin-bottom:9px;background:rgba("+rgb+",0.06);border:1px solid rgba("+rgb+",0.22);");
    s.appendChild(mk("p",title,"font-size:12.5px;font-weight:900;color:"+color+";margin-bottom:6px;"));
    items.forEach(function(it){var p=mk("p","","font-size:12px;color:var(--text2);font-weight:500;line-height:1.55;");p.innerHTML="• "+it;s.appendChild(p);});
    return s;
  }
  card.appendChild(sec("var(--teal)","var(--teal-rgb)","SEIN (movimiento / cambio):",
   ["Movimiento A→B: fahren, gehen, laufen, fliegen, kommen","Cambio de estado: aufstehen, einschlafen, werden, sterben, wachsen","Excepciones: sein (ich bin gewesen), bleiben (ich bin geblieben)","<b>Mnemotecnia: «si te mueves o cambias, usa SEIN»</b>"]));
  card.appendChild(sec("var(--gold)","var(--gold-rgb)","HABEN (el resto — ~90%):",
   ["Con objeto directo: machen, sehen, lesen, essen, nehmen","Modales: können, müssen, wollen, dürfen, sollen, mögen","Reflexivos: sich waschen, sich freuen","Impersonales: regnen, schneien"]));
  card.appendChild(sec("var(--purple)","var(--purple-rgb)","PARTIZIP II:",
   ["Regulares: ge + raíz + t → gemacht, gespielt, gearbeitet","Irregulares: ge + raíz cambiada + en → gegangen, genommen","Separables: prefijo + ge + raíz → aufgestanden, eingekauft","NO separables (be-, emp-, ent-, er-, ge-, miss-, ver-, zer-): SIN ge → besucht, verstanden","-ieren: SIN ge, terminan en -t → studiert, telefoniert"]));
  card.appendChild(sec("var(--green)","var(--green-rgb)","⏩ FUTUR I (bonus):",
   ["werden conjugado + INFINITIVO al final","ich werde, du wirst, er wird, wir werden, ihr werdet, sie werden","Ej: Ich <b>werde</b> morgen nach Berlin <b>fahren</b>."]));
  card.appendChild(sec("var(--red)","var(--red-rgb)","⏮ PLUSQUAMPERFEKT (pasado del pasado):",
   ["hatte/war + Partizip II — 'había hecho'","Mismo reparto haben/sein que el Perfekt, pero en Präteritum","Con bevor, nachdem, als: la acción ANTERIOR va en Plusquamperfekt","Ej: Ich <b>war</b> schon <b>gegangen</b>, als du anriefst."]));
  card.appendChild(sec("var(--teal)","var(--teal-rgb)","💭 KONJUNKTIV II (deseos / irreal / cortesía):",
   ["würde conjugado + INFINITIVO al final (el 90% de los casos)","Formas propias solo en verbos clave: hätte, wäre, könnte, gäbe","ich würde, du würdest, er würde, wir würden, ihr würdet, sie würden","Ej: Ich <b>würde</b> gern nach Berlin <b>fahren</b>. / Ich <b>hätte</b> gern mehr Zeit."]));
  card.appendChild(sec("var(--gold)","var(--gold-rgb)","📗 COMPARACIÓN RÁPIDA:",
   ["<b>Perfekt</b> → habe/bin + Partizip II → Ich <b>bin gefahren</b> / Ich <b>habe gegessen</b>","<b>Plusquamperfekt</b> → hatte/war + Partizip II → Ich <b>war gefahren</b> / Ich <b>hatte gegessen</b>","<b>Konjunktiv II</b> → würde + Infinitiv (o hätte/wäre) → Ich <b>würde fahren</b> / Ich <b>wäre</b>","<b>Futur I</b> → werde + Infinitiv → Ich <b>werde fahren</b>"]));
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
