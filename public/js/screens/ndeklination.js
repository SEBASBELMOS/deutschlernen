// ── N-Deklination (weak masculine nouns drill) ────────────────────────────────
(function(){
// Each item: pick article+noun with the right weak ending; single gap.
// correct = right combo · d = distractors · r = rule (Spanish, HTML ok — static, not AI)
var NDECK_POOL=[
 {s:"Ich sehe ___ im Park.", correct:"den Jungen", d:["der Junge","dem Jungen"], full:"Ich sehe den Jungen im Park.", r:"Mask. Akk: <b>den Jungen</b>. N-Deklination: der Junge → den/dem/des Jungen. Se reconoce porque termina en -e."},
 {s:"Ich helfe ___ bei der Arbeit.", correct:"dem Kollegen", d:["den Kollegen","der Kollege"], full:"Ich helfe dem Kollegen bei der Arbeit.", r:"helfen + Dativ: <b>dem Kollegen</b>. Ayudo ¿a quién? → Dativ."},
 {s:"Das ist die Tasche ___.", correct:"des Studenten", d:["der Student","dem Studenten"], full:"Das ist die Tasche des Studenten.", r:"Genitiv: <b>des Studenten</b>. Posesión + N-Deklination = -en."},
 {s:"Wie schreibt man ___ deines Bruders?", correct:"den Namen", d:["der Name","dem Namen"], full:"Wie schreibt man den Namen deines Bruders?", r:"Akk: <b>den Namen</b>. Excepción: en Genitiv añade -s → des Namen<b>s</b>."},
 {s:"Der Verkäufer berät ___.", correct:"den Kunden", d:["der Kunde","dem Kunden"], full:"Der Verkäufer berät den Kunden.", r:"beraten + Akkusativ: <b>den Kunden</b>."},
 {s:"Ich habe noch nie so ___ getroffen.", correct:"einen Menschen", d:["ein Mensch","einem Menschen"], full:"Ich habe noch nie so einen Menschen getroffen.", r:"treffen + Akkusativ: <b>einen Menschen</b>. der Mensch es N-Deklination aunque no termina en -e."},
 {s:"Kennst du ___ dort drüben?", correct:"den Herrn", d:["den Herren","der Herr"], full:"Kennst du den Herrn dort drüben?", r:"Excepción: der Herr → den Herr<b>n</b> (solo -n en singular; plural: die Herren)."},
 {s:"Ich spreche oft mit ___.", correct:"meinem Nachbarn", d:["meinen Nachbarn","mein Nachbar"], full:"Ich spreche oft mit meinem Nachbarn.", r:"mit + Dativ: <b>meinem Nachbarn</b>."},
 {s:"Gestern habe ich ___ kennengelernt.", correct:"einen Franzosen", d:["ein Franzose","einem Franzosen"], full:"Gestern habe ich einen Franzosen kennengelernt.", r:"Nacionalidades en -e son N-Deklination: der Franzose → den Franzosen (también der Chinese, der Russe...)."},
 {s:"Der Guide zeigt ___ die Stadt.", correct:"dem Touristen", d:["den Touristen","der Tourist"], full:"Der Guide zeigt dem Touristen die Stadt.", r:"zeigen + Dativ (¿a quién se la muestra?): <b>dem Touristen</b>."},
 {s:"Wir fragen ___.", correct:"einen Experten", d:["ein Experte","einem Experten"], full:"Wir fragen einen Experten.", r:"fragen + Akkusativ: <b>einen Experten</b>."},
 {s:"Die Politikerin antwortet ___.", correct:"dem Journalisten", d:["den Journalisten","des Journalisten"], full:"Die Politikerin antwortet dem Journalisten.", r:"antworten + Dativ: <b>dem Journalisten</b>."},
 {s:"Das Haus ___ ist berühmt.", correct:"des Architekten", d:["der Architekt","dem Architekten"], full:"Das Haus des Architekten ist berühmt.", r:"Genitiv: <b>des Architekten</b>. Profesiones en -ekt/-ist/-ent suelen ser N-Deklination."},
 {s:"Das Volk wählt ___.", correct:"den Präsidenten", d:["der Präsident","dem Präsidenten"], full:"Das Volk wählt den Präsidenten.", r:"wählen + Akkusativ: <b>den Präsidenten</b>."},
 {s:"Ich frage ___ nach dem Weg.", correct:"den Polizisten", d:["dem Polizisten","der Polizist"], full:"Ich frage den Polizisten nach dem Weg.", r:"fragen + Akkusativ: <b>den Polizisten</b>."},
 {s:"Im Zoo füttern wir ___.", correct:"den Löwen", d:["der Löwe","dem Löwen"], full:"Im Zoo füttern wir den Löwen.", r:"Animales en -e: der Löwe → den Löwen."},
 {s:"Das Kind lacht über ___.", correct:"den Affen", d:["der Affe","dem Affen"], full:"Das Kind lacht über den Affen.", r:"lachen über + Akkusativ: <b>den Affen</b>."},
 {s:"Der Hund jagt ___.", correct:"den Hasen", d:["der Hase","dem Hasen"], full:"Der Hund jagt den Hasen.", r:"jagen + Akkusativ: <b>den Hasen</b>."}
];
var ROUND=10, deck=[], idx=0, right=0, missed=[], locked=false;

if(!state.ndeklination) state.ndeklination={};
if(!state.ndeklination._deck) state.ndeklination._deck=[];
if(typeof state.ndeklination._idx!=="number") state.ndeklination._idx=0;
if(typeof state.ndeklination._right!=="number") state.ndeklination._right=0;

function shuffle(a){a=a.slice();for(var k=a.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1));var t=a[k];a[k]=a[j];a[j]=t;}return a;}

function ndekStart(){
  deck=shuffle(NDECK_POOL).slice(0,ROUND); idx=0; right=0; missed=[]; locked=false;
  state.ndeklination._deck=deck; state.ndeklination._idx=0; state.ndeklination._right=0; state.ndeklination._logged=false;
  ndekRender();
}
function ndekRender(){
 var el=document.getElementById("s-ndeklination"); if(!el) return; el.innerHTML="";
 if(!deck.length){ndekStart();return;}
 if(idx>=deck.length){ndekSummary(el);return;}
 var q=deck[idx]; locked=false;
 // ── Header ──
 var hdr=mk("div","","margin-bottom:14px;");
 hdr.appendChild(mk("p","Gramática · Sustantivos débiles","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
 var h2row=mk("div","","display:flex;align-items:center;gap:8px;margin:3px 0 4px;");
 h2row.appendChild(mk("h2","N-Deklination","font-size:24px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin:0;color:var(--text);"));
 var refBtn=mk("button","📗","background:none;border:none;font-size:20px;cursor:pointer;opacity:0.6;transition:opacity .15s;padding:2px;");
 refBtn.title="Tabla de la N-Deklination"; refBtn.setAttribute("aria-label","Tabla de declinación de sustantivos débiles");
 refBtn.onmouseenter=function(){this.style.opacity="1";}; refBtn.onmouseleave=function(){this.style.opacity="0.6";};
 refBtn.onclick=ndekRefModal;
 h2row.appendChild(refBtn);
 hdr.appendChild(h2row);
 hdr.appendChild(mk("p","Elige el artículo + sustantivo con la terminación correcta.","font-size:13px;color:var(--muted);font-weight:500;margin-bottom:0;"));
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
 var parts=q.s.split("___");
 sent.appendChild(document.createTextNode(parts[0]));
 var gap=mk("span","______","display:inline-block;min-width:90px;border-bottom:2px dashed rgba(var(--gold-rgb),.5);text-align:center;color:var(--gold);font-weight:900;padding:0 6px;");
 gap.id="ndek-gap"; sent.appendChild(gap);
 if(parts[1]) sent.appendChild(document.createTextNode(parts[1]));
 card.appendChild(sent);
 // ── Options ──
 var opts=mk("div","","display:flex;flex-direction:column;gap:8px;");
 shuffle([q.correct].concat(q.d)).forEach(function(o){
   var b=mk("button",o,"text-align:center;padding:13px;border-radius:13px;font-size:15px;font-weight:800;cursor:pointer;border:1.5px solid var(--border);background:rgba(255,255,255,0.05);color:var(--text);font-family:inherit;transition:border-color .15s,background .15s;");
   b.className="lift"; b.style.setProperty("--lift-rgb","var(--gold-rgb)");
   b.dataset.v=o;
   b.onclick=function(){ndekPick(b,q,opts,gap);};
   opts.appendChild(b);
 });
 card.appendChild(opts);
 // ── Feedback + next ──
 var fb=mk("div","","display:none;border-radius:13px;padding:12px 14px;margin-top:14px;font-size:13px;line-height:1.55;font-weight:500;"); fb.id="ndek-fb";
 card.appendChild(fb);
 var nx=mk("button","Siguiente →","width:100%;margin-top:12px;padding:13px;border-radius:14px;border:1px solid var(--border);background:rgba(255,255,255,0.05);color:var(--text);font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;display:none;"); nx.id="ndek-nx";
 nx.onclick=function(){ idx++; state.ndeklination._idx=idx; ndekRender(); };
 card.appendChild(nx);
 el.appendChild(card);
 el.appendChild(mk("p",(idx+1)+" de "+deck.length,"font-size:11px;color:var(--dim);font-weight:600;text-align:center;font-variant-numeric:tabular-nums;"));
}
function ndekPick(btn,q,opts,gap){
 if(locked) return; locked=true;
 var ok=btn.dataset.v===q.correct;
 opts.querySelectorAll("button").forEach(function(b){
   b.disabled=true; b.classList.remove("lift");
   if(b.dataset.v===q.correct){ b.style.background="rgba(var(--green-rgb),0.14)"; b.style.borderColor="var(--green)"; b.style.color="var(--green)"; }
   else if(b===btn){ b.style.background="rgba(var(--red-rgb),0.12)"; b.style.borderColor="var(--red)"; b.style.color="var(--red)"; }
   else b.style.opacity="0.45";
 });
 if(gap){ gap.textContent=q.correct; gap.style.borderBottomColor="transparent"; gap.style.color=ok?"var(--green)":"var(--red)"; }
 var fb=document.getElementById("ndek-fb"); fb.style.display="block"; fb.className="anim-in";
 fb.style.background=ok?"rgba(var(--green-rgb),0.09)":"rgba(var(--red-rgb),0.08)";
 fb.style.border=ok?"1px solid rgba(var(--green-rgb),0.3)":"1px solid rgba(var(--red-rgb),0.3)";
 fb.innerHTML='<b style="display:block;font-size:14px;font-weight:800;margin-bottom:4px;color:'+(ok?"var(--green)":"var(--red)")+';">'+(ok?"✓ ":"✗ ")+q.full+'</b><span style="color:var(--muted);">'+q.r+'</span>';
 if(ok) right++; else missed.push({q:q});
 state.ndeklination._right=right;
 document.getElementById("ndek-nx").style.display="block";
 var dots=document.querySelectorAll("#s-ndeklination .dots span"); if(dots[idx]) dots[idx].style.background=ok?"var(--green)":"var(--red)";
 var scEl=document.querySelector("#s-ndeklination .score"); if(scEl) scEl.innerHTML="<b style=color:var(--green);font-size:15px>"+right+"</b> / "+(idx+1);
}
function ndekSummary(el){
 var pct=Math.round(right/deck.length*100);
 var em=pct>=90?"🏆":pct>=70?"💪":pct>=50?"📈":"🌱";
 var ti=pct>=90?"¡Sehr gut!":pct>=70?"¡Buen ritmo!":"Sigue puliendo";
 var hdr=mk("div","","margin-bottom:14px;");
 hdr.appendChild(mk("p","Gramática · Sustantivos débiles","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
 hdr.appendChild(mk("h2","N-Deklination","font-size:24px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin:3px 0 4px;color:var(--text);"));
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
 again.onclick=ndekStart; card.appendChild(again);
 el.appendChild(card);
 if(!state.ndeklination._logged){
   state.ndeklination._logged=true;
   if(typeof logActivity==="function") logActivity("drillsDone",1);
   if(missed.length && state.session && Array.isArray(state.session.errorJournal)){
     missed.forEach(function(m){
       state.session.errorJournal.push({date:todayKey(), type:"grammar", source:"ndeklination", original:m.q.s, correction:m.q.full, tip:(m.q.r||"").replace(/<[^>]*>/g,"")});
     });
     if(state.session.errorJournal.length>50) state.session.errorJournal=state.session.errorJournal.slice(-50);
   }
   if(typeof syncUp==="function") syncUp();
 }
}

// ── 📗 Reference: weak-noun declension table + how to spot them ───────────────
function ndekRefModal(){
  var o=document.createElement("div");
  o.style.cssText="position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0.6);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto;opacity:0;transition:opacity .18s ease;";
  function closeRef(){o.style.opacity="0";setTimeout(function(){if(o.parentNode)o.parentNode.removeChild(o);},180);}
  o.onclick=function(e){if(e.target===o)closeRef();};
  var c=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:22px;padding:22px;max-width:580px;width:100%;margin:16px 0;box-shadow:0 20px 60px rgba(0,0,0,0.5);");
  c.setAttribute("role","dialog"); c.setAttribute("aria-modal","true"); c.setAttribute("aria-label","N-Deklination");
  c.onclick=function(e){e.stopPropagation();};
  c.appendChild(mk("p","N-Deklination — sustantivos débiles","font-size:15px;font-weight:900;color:var(--text);margin-bottom:2px;letter-spacing:-0.02em;"));
  c.appendChild(mk("p","Masculinos que añaden -(e)n en todos los casos menos el Nominativ singular.","font-size:11px;color:var(--muted);font-weight:500;margin-bottom:14px;line-height:1.5;"));
  var scroll=mk("div","","overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:12px;border:1px solid var(--border);margin-bottom:6px;");
  var cc={Nominativ:"var(--teal-text)",Akkusativ:"var(--green-text)",Dativ:"var(--gold-text)",Genitiv:"var(--purple-text)"};
  var rows=[
    ["Nominativ","der Junge","der Student","der Name"],
    ["Akkusativ","den Jungen","den Studenten","den Namen"],
    ["Dativ","dem Jungen","dem Studenten","dem Namen"],
    ["Genitiv","des Jungen","des Studenten","des Namens"]
  ];
  var h='<table style="border-collapse:collapse;width:100%;min-width:380px;font-size:12px;">'
    +'<thead><tr><th style="text-align:left;padding:7px 10px;color:var(--muted);font-weight:800;font-size:10px;letter-spacing:1px;">CASO</th>'
    +'<th style="padding:7px;color:var(--text);font-weight:800;">-e</th><th style="padding:7px;color:var(--text);font-weight:800;">-ent/-ist</th>'
    +'<th style="padding:7px;color:var(--text);font-weight:800;">Excepción</th></tr></thead><tbody>';
  rows.forEach(function(r){
    h+='<tr style="border-top:1px solid var(--border);"><td style="padding:8px 10px;font-weight:800;color:'+cc[r[0]]+';white-space:nowrap;">'+r[0]+'</td>';
    for(var i=1;i<r.length;i++) h+='<td style="padding:8px;text-align:center;font-weight:700;color:var(--text);">'+r[i]+'</td>';
    h+='</tr>';
  });
  h+='</tbody></table>';
  scroll.innerHTML=h; c.appendChild(scroll);
  c.appendChild(mk("p","Plural: siempre -en (die Jungen, die Studenten, die Namen).","font-size:11.5px;color:var(--muted);font-weight:600;margin:6px 0 10px;"));
  var rule=mk("div","","margin-top:4px;font-size:12px;color:var(--text2);line-height:1.7;font-weight:500;");
  rule.innerHTML='<b style="color:var(--gold-text);">¿Cómo reconocerlos?</b><br>'
    +'• Son SIEMPRE masculinos, y casi todos terminan en <b>-e</b>: der Junge, der Kunde, der Kollege, der Löwe, der Affe, der Hase.<br>'
    +'• Nacionalidades en -e: der Franzose, der Chinese, der Russe.<br>'
    +'• Personas en -ent / -ist / -at / -ekt: der Student, der Polizist, der Journalist, der Architekt, der Präsident.<br>'
    +'• Sueltos importantes: der Mensch, der Herr, der Nachbar, der Name.<br>'
    +'<b style="color:var(--red-text);">Excepciones:</b> der Herr → den Herr<b>n</b> (solo -n); der Name → Gen. des Name<b>ns</b>.';
  c.appendChild(rule);
  var close=mk("button","Cerrar","width:100%;padding:13px;border-radius:13px;border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-size:13px;font-weight:700;cursor:pointer;margin-top:14px;font-family:inherit;");
  close.onclick=closeRef; c.appendChild(close); o.appendChild(c);
  document.body.appendChild(o);
  requestAnimationFrame(function(){o.style.opacity="1";});
}

function renderNdeklination(){
  if(!state.ndeklination._deck||!state.ndeklination._deck.length){ ndekStart(); return; }
  deck=state.ndeklination._deck; idx=state.ndeklination._idx; right=state.ndeklination._right; missed=[]; locked=false;
  ndekRender();
}
window.renderNdeklination=renderNdeklination;
})();
