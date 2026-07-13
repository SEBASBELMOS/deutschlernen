// ── Dictado ───────────────────────────────────────────────────────────────────
function dictadoDefaultPhrase(level){
  var defaults={
    A1:{de:"Ich trinke heute Kaffee.",es:"Hoy tomo café."},
    A2:{de:"Ich muss morgen früh arbeiten.",es:"Mañana temprano tengo que trabajar."},
    B1:{de:"Obwohl ich müde bin, lerne ich Deutsch.",es:"Aunque estoy cansado, estudio alemán."}
  };
  return defaults[level]||defaults.A2;
}

function dictadoNormalize(text){
  return (text||"").toLowerCase()
    .replace(/[.,!?¿¡;:"'()«»„“”]/g,"")
    .replace(/\s+/g," ")
    .trim();
}

function dictadoWords(text){
  var clean=dictadoNormalize(text);
  return clean?clean.split(" "):[];
}

function dictadoCompare(target, answer){
  var targetWords=dictadoWords(target);
  var answerWords=dictadoWords(answer);
  var used={};
  var hits=0;
  targetWords.forEach(function(w){
    for(var i=0;i<answerWords.length;i++){
      if(!used[i]&&answerWords[i]===w){used[i]=true;hits++;return;}
    }
  });
  var total=Math.max(1,targetWords.length);
  return {pct:Math.round(hits/total*100), hits:hits, total:total, targetWords:targetWords, answerWords:answerWords};
}

function dictadoDiffHtml(target, answer){
  var targetWords=dictadoWords(target);
  var answerWords=dictadoWords(answer);
  var max=Math.max(targetWords.length,answerWords.length);
  var parts=[];
  for(var i=0;i<max;i++){
    var tw=targetWords[i]||"";
    var aw=answerWords[i]||"";
    if(tw&&aw&&tw===aw){
      parts.push('<span style="color:var(--green-text);font-weight:800;">'+tw+'</span>');
    } else if(tw){
      parts.push('<span style="color:var(--red-text);font-weight:900;border-bottom:2px solid rgba(var(--red-rgb),.55);">'+tw+'</span>');
    }
  }
  return parts.join(" ");
}

async function dictadoGenerate(btn){
  if(state.dictado.loading) return;
  state.dictado.loading=true;
  state.dictado.checked=false;
  if(btn){btn.disabled=true;btn.textContent="Generando...";}
  try{
    var level=state.dictado.level||"A2";
    var sys='You are a German dictation teacher. Generate ONE clear German sentence at '+level+' level (4-8 words). Reply ONLY with valid JSON: {"de":"German sentence","es":"Spanish translation"}';
    var raw=await ai(sys,[{role:"user",content:"Generate one dictation sentence."}],200);
    var clean=raw.replace(/```json|```/g,"").trim();
    var match=clean.match(/\{[\s\S]*\}/);
    if(!match) throw new Error("Respuesta inválida");
    var obj=JSON.parse(match[0]);
    if(!obj.de||!obj.es) throw new Error("JSON incompleto");
    state.dictado.current={de:String(obj.de).trim(),es:String(obj.es).trim()};
    state.dictado.answer="";
    renderDictado();
  }catch(e){
    showToast("No pude generar la frase","error");
    state.dictado.current=dictadoDefaultPhrase(state.dictado.level||"A2");
    renderDictado();
  }finally{
    state.dictado.loading=false;
  }
}

function renderDictado(){
  var el=document.getElementById("s-dictado"); if(!el) return;
  el.innerHTML="";
  if(!state.dictado) state.dictado={};
  if(!state.dictado.level) state.dictado.level="A2";
  if(!state.dictado.current) state.dictado.current=dictadoDefaultPhrase(state.dictado.level);

  var phrase=state.dictado.current;
  var level=state.dictado.level;

  el.appendChild(mk("p","Escucha · Escribe · Verifica","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
  el.appendChild(mk("h1","Dictado","font-size:24px;font-weight:900;letter-spacing:-.03em;margin:0 0 12px;color:var(--text);"));

  // ── Mode toggle: Frases | Números ──
  if(!state.dictado.mode) state.dictado.mode="frases";
  var dModeRow=mk("div","","display:flex;gap:6px;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:4px;margin-bottom:14px;");
  [["frases","✏️ Frases"],["numeros","🔢 Números"]].forEach(function(m){
    var mb=mk("button",m[1],"flex:1;padding:9px;border-radius:10px;border:none;cursor:pointer;font-size:13px;font-weight:700;font-family:inherit;transition:background .2s,color .2s;");
    var act=state.dictado.mode===m[0];
    if(act){mb.style.background="var(--teal)";mb.style.color="#061111";mb.style.boxShadow="0 2px 12px rgba(var(--teal-rgb),.3)";}
    else{mb.style.background="transparent";mb.style.color="var(--muted)";}
    mb.onclick=function(){ state.dictado.mode=m[0]; renderDictado(); };
    dModeRow.appendChild(mb);
  });
  el.appendChild(dModeRow);

  var scoreRow=mk("div","","display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:14px;");
  [
    {v:String(state.dictado.score||0),l:"score",c:"var(--gold-text)"},
    {v:String(state.dictado.streak||0),l:"racha",c:"var(--green-text)"},
    {v:String(state.dictado.wrong||0),l:"fallos",c:"var(--red-text)"}
  ].forEach(function(s){
    var card=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:15px;padding:12px 10px;text-align:center;");
    card.appendChild(mk("b",s.v,"display:block;font-size:22px;font-weight:900;color:"+s.c+";line-height:1;"));
    card.appendChild(mk("span",s.l,"display:block;font-size:9px;font-weight:800;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-top:5px;"));
    scoreRow.appendChild(card);
  });
  el.appendChild(scoreRow);

  if(state.dictado.mode==="numeros"){ dictadoNumeros(el); return; }

  var levels=mk("div","","display:flex;gap:7px;overflow-x:auto;margin-bottom:14px;padding-bottom:2px;");
  ["A1","A2","B1"].forEach(function(lvl){
    var active=lvl===level;
    var pill=mk("button",lvl,"flex:1;min-width:74px;border-radius:999px;padding:10px 12px;font-size:13px;font-weight:900;cursor:pointer;font-family:inherit;transition:background .15s,border-color .15s;color:"+(active?"#061111":"var(--muted)")+";background:"+(active?"var(--teal)":"transparent")+";border:1px solid "+(active?"var(--teal)":"var(--border)")+";");
    pill.onclick=function(){
      state.dictado.level=lvl;
      state.dictado.current=dictadoDefaultPhrase(lvl);
      state.dictado.answer="";
      state.dictado.checked=false;
      renderDictado();
    };
    levels.appendChild(pill);
  });
  el.appendChild(levels);

  var card=mk("div","","position:relative;overflow:hidden;border-radius:24px;padding:22px 18px;margin-bottom:14px;background:linear-gradient(140deg,rgba(var(--teal-rgb),.12),rgba(var(--primary-rgb),.04));border:1px solid rgba(var(--teal-rgb),.28);box-shadow:0 10px 30px rgba(0,0,0,.22);");
  card.appendChild(mk("span","","position:absolute;right:-45px;top:-45px;width:150px;height:150px;border-radius:50%;background:rgba(var(--teal-rgb),.12);filter:blur(34px);pointer-events:none;"));
  card.appendChild(mk("p","Nivel "+level,"position:relative;z-index:1;font-size:10px;letter-spacing:2px;font-weight:900;color:var(--teal-text);text-transform:uppercase;margin-bottom:12px;"));
  var listen=mk("button","▶ Escuchar","position:relative;z-index:1;width:100%;padding:17px;border-radius:18px;border:none;background:var(--teal);color:#061111;font-size:17px;font-weight:900;cursor:pointer;font-family:inherit;box-shadow:0 8px 24px rgba(var(--teal-rgb),.26);");
  listen.onclick=function(){speakGerman(phrase.de);};
  card.appendChild(listen);
  card.appendChild(mk("p","Escribe exactamente lo que escuches. La traducción aparece después de verificar.","position:relative;z-index:1;font-size:12px;color:var(--muted);font-weight:600;line-height:1.5;text-align:center;margin-top:12px;"));
  el.appendChild(card);

  var input=document.createElement("input");
  input.type="text";
  input.value=state.dictado.answer||"";
  input.placeholder="Escribe la frase en alemán...";
  input.setAttribute("aria-label","Respuesta del dictado");
  input.style.cssText="width:100%;box-sizing:border-box;background:var(--surface);border:1px solid var(--border);border-radius:16px;color:var(--text);padding:14px 15px;font-family:inherit;font-size:15px;font-weight:700;outline:none;margin-bottom:10px;";
  input.oninput=function(){state.dictado.answer=input.value;};
  el.appendChild(input);

  var actions=mk("div","","display:flex;gap:9px;margin-bottom:14px;");
  var check=mk("button","Verificar","flex:1;padding:13px;border-radius:14px;border:none;background:var(--primary);color:var(--on-primary);font-size:14px;font-weight:900;cursor:pointer;font-family:inherit;");
  var next=mk("button","Nueva frase","flex:1;padding:13px;border-radius:14px;border:1px solid rgba(var(--gold-rgb),.34);background:rgba(var(--gold-rgb),.12);color:var(--gold-text);font-size:14px;font-weight:900;cursor:pointer;font-family:inherit;");
  check.onclick=function(){
    var answer=input.value.trim();
    if(!answer){showToast("Escribe tu respuesta","info");input.focus();return;}
    state.dictado.answer=answer;
    var cmp=dictadoCompare(phrase.de, answer);
    var ok=cmp.pct>=80;
    state.dictado.checked={ok:ok,pct:cmp.pct,answer:answer};
    if(ok){
      state.dictado.score=(state.dictado.score||0)+10;
      state.dictado.streak=(state.dictado.streak||0)+1;
      state.dictado.right=(state.dictado.right||0)+1;
      logActivity("drillsDone",1);
      syncUp();
    } else {
      state.dictado.streak=0;
      state.dictado.wrong=(state.dictado.wrong||0)+1;
    }
    renderDictado();
  };
  next.onclick=function(){dictadoGenerate(next);};
  actions.appendChild(check);
  actions.appendChild(next);
  el.appendChild(actions);

  if(state.dictado.checked){
    var checked=state.dictado.checked;
    var fb=mk("div","","border-radius:18px;padding:16px;margin-bottom:12px;background:"+(checked.ok?"rgba(var(--green-rgb),.10)":"rgba(var(--red-rgb),.09)")+";border:1px solid "+(checked.ok?"rgba(var(--green-rgb),.30)":"rgba(var(--red-rgb),.30)")+";");
    fb.appendChild(mk("p",checked.ok?"Correcto":"Revisa las diferencias","font-size:10px;letter-spacing:2px;font-weight:900;text-transform:uppercase;color:"+(checked.ok?"var(--green-text)":"var(--red-text)")+";margin-bottom:7px;"));
    fb.appendChild(mk("p",checked.pct+"% de coincidencia","font-size:17px;font-weight:900;color:var(--text);margin-bottom:8px;"));
    if(checked.ok){
      fb.appendChild(mk("p",phrase.de,"font-size:16px;font-weight:900;color:var(--green-text);line-height:1.45;"));
    } else {
      var diff=document.createElement("p");
      diff.style.cssText="font-size:16px;font-weight:800;line-height:1.6;color:var(--text);";
      diff.innerHTML=dictadoDiffHtml(phrase.de, checked.answer);
      fb.appendChild(diff);
      fb.appendChild(mk("p","Tu respuesta: "+checked.answer,"font-size:12px;color:var(--muted);font-weight:600;margin-top:8px;line-height:1.45;"));
    }
    fb.appendChild(mk("p",phrase.es,"font-size:13px;color:var(--muted);font-weight:650;margin-top:10px;line-height:1.45;"));
    el.appendChild(fb);
  }

  input.focus();
}

// ── Números mode: hear a German number/price, type the digits ─────────────────
// Spells 0-9999 in German words for TTS (no AI needed).
function numToDE(n){
  var ones=["null","eins","zwei","drei","vier","fünf","sechs","sieben","acht","neun","zehn","elf","zwölf","dreizehn","vierzehn","fünfzehn","sechzehn","siebzehn","achtzehn","neunzehn"];
  if(n<20) return ones[n];
  var tens=["","","zwanzig","dreißig","vierzig","fünfzig","sechzig","siebzig","achtzig","neunzig"];
  if(n<100){ var u=n%10, t=Math.floor(n/10); return u?(u===1?"ein":ones[u])+"und"+tens[t]:tens[t]; }
  if(n<1000){ var h=Math.floor(n/100), r=n%100; return (h===1?"ein":ones[h])+"hundert"+(r?numToDE(r):""); }
  var k=Math.floor(n/1000), r2=n%1000; return (k===1?"ein":numToDE(k))+"tausend"+(r2?numToDE(r2):"");
}
function dictadoNumGen(){
  if(Math.random()<0.6){
    // Plain number, weighted toward the tricky 13-99 range
    var n=Math.random()<0.6?13+Math.floor(Math.random()*87):100+Math.floor(Math.random()*9900);
    return { say:numToDE(n), answer:String(n), display:String(n), kind:"número" };
  }
  var eu=1+Math.floor(Math.random()*199), ct=(1+Math.floor(Math.random()*99));
  return { say:numToDE(eu)+" Euro "+numToDE(ct), answer:eu+","+(ct<10?"0"+ct:ct), display:eu+","+(ct<10?"0"+ct:ct)+" €", kind:"precio" };
}
function dictadoNumeros(el){
  if(!state.dictado.num) state.dictado.num=dictadoNumGen();
  var item=state.dictado.num;

  var card=mk("div","","border-radius:20px;padding:22px 18px;text-align:center;");
  card.className="stitch-glass anim-in";
  card.appendChild(mk("p",item.kind==="precio"?"💶 Precio":"🔢 Número","display:inline-block;font-size:9.5px;letter-spacing:1.5px;font-weight:900;color:var(--teal-text);background:rgba(var(--teal-rgb),0.1);padding:3px 10px;border-radius:99px;text-transform:uppercase;margin-bottom:14px;"));

  var play=document.createElement("button");
  play.style.cssText="width:84px;height:84px;border-radius:50%;font-size:34px;cursor:pointer;background:rgba(var(--teal-rgb),0.14);border:2px solid rgba(var(--teal-rgb),0.45);margin:0 auto 14px;display:block;transition:transform .1s;";
  play.textContent="🔊";
  play.setAttribute("aria-label","Escuchar el número");
  play.onclick=function(){ speak(item.say); };
  card.appendChild(play);
  card.appendChild(mk("p","Escucha y escribe el número en cifras"+(item.kind==="precio"?" (ej: 23,50)":""),"font-size:12.5px;color:var(--muted);font-weight:500;margin-bottom:14px;"));

  var inp=document.createElement("input");
  inp.type="text"; inp.inputMode="decimal"; inp.setAttribute("aria-label","Tu respuesta en cifras");
  inp.placeholder=item.kind==="precio"?"0,00":"0";
  inp.style.cssText="width:100%;max-width:220px;background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:13px;padding:13px;font-size:22px;font-weight:800;color:var(--text);outline:none;text-align:center;font-family:inherit;font-variant-numeric:tabular-nums;margin-bottom:12px;";
  card.appendChild(inp);

  var fb=mk("div","","display:none;border-radius:13px;padding:12px 14px;margin-bottom:12px;font-size:13.5px;line-height:1.5;font-weight:600;");
  card.appendChild(fb);

  var row=mk("div","","display:flex;gap:8px;");
  var chk=mk("button","Comprobar","flex:1;padding:13px;border-radius:13px;border:none;background:var(--teal);color:#061111;font-size:14px;font-weight:900;cursor:pointer;font-family:inherit;");
  var nxt=mk("button","Siguiente →","flex:1;padding:13px;border-radius:13px;border:1px solid var(--border);background:rgba(255,255,255,0.05);color:var(--text);font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;display:none;");
  row.appendChild(chk); row.appendChild(nxt);
  card.appendChild(row);

  function check(){
    var raw=(inp.value||"").trim().replace(/\s|€|eur/gi,"").replace(".",",");
    if(!raw) return;
    var ok=raw===item.answer || raw===item.answer.replace(",00","");
    fb.style.display="block";
    fb.style.background=ok?"rgba(var(--green-rgb),0.1)":"rgba(var(--red-rgb),0.09)";
    fb.style.border=ok?"1px solid rgba(var(--green-rgb),0.3)":"1px solid rgba(var(--red-rgb),0.3)";
    fb.style.color=ok?"var(--green)":"var(--red)";
    fb.innerHTML=(ok?"✓ ¡Richtig! ":"✗ Era ")+"<b>"+item.display+"</b><br><span style='color:var(--muted);font-weight:500;font-size:12px;'>„"+item.say+"”</span>";
    if(ok){ state.dictado.score=(state.dictado.score||0)+1; state.dictado.streak=(state.dictado.streak||0)+1; }
    else { state.dictado.wrong=(state.dictado.wrong||0)+1; state.dictado.streak=0; }
    if(typeof logActivity==="function") logActivity("drillsDone",1);
    if(typeof syncUp==="function") syncUp();
    inp.disabled=true; chk.style.display="none"; nxt.style.display="block"; nxt.focus();
  }
  chk.onclick=check;
  inp.onkeydown=function(e){ if(e.key==="Enter"){ e.preventDefault(); chk.style.display!=="none"?check():nxt.click(); } };
  nxt.onclick=function(){ state.dictado.num=dictadoNumGen(); renderDictado(); };

  el.appendChild(card);
  setTimeout(function(){ try{ speak(item.say); }catch(e){} inp.focus(); },300);
}
