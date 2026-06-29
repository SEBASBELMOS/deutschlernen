// ── Reading (Hörverstehen — listening comprehension) ──────────────────────────
var _hvState=null; // {dialog, questions, answers, score, step, container}

function startHörverstehen(container){
  _hvState={step:"generating",dialog:[],questions:[],answers:[],score:0,container:container};
  container.innerHTML="";
  var skelDiv=mk("div","","padding:20px;");
  for(var si=0;si<4;si++) skelDiv.appendChild(skelCard(4));
  container.appendChild(skelDiv);
  var lvl=state.app.level||"B1";
  var lvlRng=lvl==="A2"?"A2":lvl==="B1"?"A2-B1":"B1-B2";
  ai("You are a German teacher. Reply ONLY with valid JSON, no markdown.",
    [{role:"user",content:'Generate a short natural German dialog ('+lvlRng+' level) between two people (3-4 exchanges). Then 2 multiple-choice comprehension questions in German. Format: {"dialog":[{"speaker":"PersonA","text":"..."},...],"questions":[{"q":"...","options":["...","...","..."],"correct":0},...]}. Each question has 3 options, correct is 0-indexed.'}],2000)
    .then(function(raw){
      var m=raw.match(/\{[\s\S]*\}/);
      if(!m){showToast("Error: respuesta inválida","error");renderHörverstehenFallback(container);return;}
      try{
        var data=JSON.parse(m[0]);
        if(!data.dialog||!data.questions||!data.questions.length){showToast("Error: datos inválidos","error");renderHörverstehenFallback(container);return;}
        _hvState.dialog=data.dialog;
        _hvState.questions=data.questions;
        _hvState.answers=[];
        renderHörverstehenPlay(container);
      }catch(e){showToast("Error parseando respuesta","error");renderHörverstehenFallback(container);}
    })
    .catch(function(e){showToast("Error generando","error");renderHörverstehenFallback(container);});
}
function renderHörverstehenFallback(container){
  container.innerHTML="";
  var fb=mk("div","","text-align:center;padding:30px 20px;");
  fb.appendChild(mk("p","No se pudo generar el ejercicio.","font-size:14px;color:var(--muted);font-weight:600;margin-bottom:10px;"));
  var retry=mk("button","🔄 Intentar de nuevo","padding:12px 24px;border-radius:12px;border:none;background:rgba(93,217,208,0.12);color:#5dd9d0;font-size:13px;font-weight:700;cursor:pointer;");
  retry.onclick=function(){startHörverstehen(container);};
  fb.appendChild(retry);
  container.appendChild(fb);
}
function renderHörverstehenPlay(container){
  container.innerHTML="";
  _hvState.step="listen";
  var c=mk("div","","padding:4px 0;");
  c.appendChild(mk("p","🎧 HÖRVERSTEHEN","font-size:10px;color:var(--teal-text);letter-spacing:2.5px;font-weight:700;margin-bottom:2px;"));
  c.appendChild(mk("p","Escucha el diálogo y después responde.","font-size:12px;color:var(--muted);font-weight:500;margin-bottom:14px;"));
  var dialogDiv=document.createElement("div");
  dialogDiv.style.cssText="background:rgba(93,217,208,0.04);border:1px solid rgba(93,217,208,0.12);border-radius:12px;padding:14px;margin-bottom:14px;display:none;";
  _hvState.dialog.forEach(function(ex){
    var sp=mk("p","","font-size:13px;color:var(--text);font-weight:500;line-height:1.65;margin-bottom:4px;");
    sp.innerHTML="<b>"+ex.speaker+":</b> "+ex.text;
    dialogDiv.appendChild(sp);
  });
  c.appendChild(dialogDiv);
  var playBtn=mk("button","▶ Reproducir diálogo","width:100%;padding:16px;border-radius:14px;border:none;background:rgba(93,217,208,0.12);color:var(--teal-text);font-size:15px;font-weight:700;cursor:pointer;margin-bottom:8px;transition:opacity 0.2s;");
  playBtn.onclick=function(){
    playBtn.disabled=true;playBtn.style.opacity="0.5";playBtn.textContent="🔊 Reproduciendo...";
    var fullDialog=_hvState.dialog.map(function(ex){return ex.speaker+": "+ex.text;}).join(" ");
    speakFull(fullDialog,function(){
      dialogDiv.style.display="block";
      playBtn.textContent="✅ Escuchado — Responder →";
      playBtn.disabled=false;playBtn.style.opacity="1";
      playBtn.onclick=function(){renderHörverstehenQuestions(container);};
    });
  };
  c.appendChild(playBtn);
  var skipBtn=mk("button","Saltar y responder →","background:none;border:none;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;width:100%;padding:8px;text-decoration:underline;");
  skipBtn.onclick=function(){renderHörverstehenQuestions(container);};
  c.appendChild(skipBtn);
  container.appendChild(c);
}
function renderHörverstehenQuestions(container){
  container.innerHTML="";
  _hvState.step="questions";
  var qCount=_hvState.questions.length;
  var c=mk("div","","padding:2px 0;");
  c.appendChild(mk("p","🎧 HÖRVERSTEHEN","font-size:10px;color:var(--teal-text);letter-spacing:2.5px;font-weight:700;margin-bottom:2px;"));
  c.appendChild(mk("p","Responde las preguntas","font-size:14px;color:var(--text);font-weight:700;margin-bottom:14px;"));
  _hvState.questions.forEach(function(q,qi){
    var qDiv=document.createElement("div");
    qDiv.style.cssText="margin-bottom:14px;padding:14px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);";
    qDiv.appendChild(mk("p","Pregunta "+(qi+1)+"/"+qCount,"font-size:10px;color:var(--teal-text);font-weight:700;margin-bottom:4px;"));
    qDiv.appendChild(mk("p",q.q,"font-size:14px;color:var(--text);font-weight:600;margin-bottom:10px;"));
    q.options.forEach(function(opt,oi){
      var optBtn=document.createElement("button");
      optBtn.textContent=opt;
      optBtn.style.cssText="display:block;width:100%;text-align:left;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);color:var(--text);font-size:13px;font-weight:500;cursor:pointer;margin-bottom:6px;transition:all 0.15s;";
      optBtn.onclick=function(){
        var btns=qDiv.querySelectorAll("button");
        btns.forEach(function(b){b.style.borderColor="rgba(255,255,255,0.06)";b.style.background="rgba(255,255,255,0.03)";});
        optBtn.style.borderColor="#5dd9d0";optBtn.style.background="rgba(93,217,208,0.1)";
        _hvState.answers[qi]=oi;
        var allDone=_hvState.questions.every(function(_q,qj){return _hvState.answers[qj]!==undefined&&_hvState.answers[qj]!==null;});
        if(allDone) renderHörverstehenResults(container);
      };
      qDiv.appendChild(optBtn);
    });
    c.appendChild(qDiv);
  });
  container.appendChild(c);
}
function renderHörverstehenResults(container){
  container.innerHTML="";
  _hvState.step="done";
  _hvState.score=_hvState.questions.reduce(function(acc,q,qi){return acc+((_hvState.answers[qi]===q.correct)?1:0);},0);
  var total=_hvState.questions.length,pct=Math.round(_hvState.score/total*100);
  var color=pct>=100?"#4ade80":pct>=50?"#ffb955":"#ffb4ab";
  var c=mk("div","","text-align:center;padding:16px 0;");
  c.appendChild(mk("p",_hvState.score+"/"+total,"font-size:44px;font-weight:900;color:"+color+";line-height:1;font-variant-numeric:tabular-nums;margin-bottom:4px;"));
  c.appendChild(mk("p",pct>=100?"🎉 ¡Perfecto!":pct>=50?"👍 Bien, sigue practicando":"💪 Sigue intentando","font-size:14px;color:var(--text);font-weight:700;margin-bottom:14px;"));
  var pBar=mk("div","","background:rgba(255,255,255,0.06);border-radius:6px;height:6px;overflow:hidden;margin:0 20px 14px;");
  var pFill=mk("div","","background:"+color+";height:100%;width:"+pct+"%;transition:width 0.3s;border-radius:6px;");
  pBar.appendChild(pFill);c.appendChild(pBar);
  _hvState.questions.forEach(function(q,qi){
    var ans=_hvState.answers[qi];
    var correct=ans===q.correct;
    var box=mk("div","","margin-bottom:10px;padding:12px;border-radius:10px;background:"+(correct?"rgba(74,222,128,0.06)":"rgba(255,180,171,0.06)")+";border:1px solid "+(correct?"rgba(74,222,128,0.15)":"rgba(255,180,171,0.15)")+";text-align:left;");
    box.appendChild(mk("p",q.q,"font-size:12px;color:var(--text);font-weight:600;margin-bottom:4px;"));
    if(correct) box.appendChild(mk("p","✅ "+q.options[q.correct],"font-size:12px;color:var(--green-text);font-weight:600;"));
    else {
      box.appendChild(mk("p","❌ Elegiste: "+q.options[ans],"font-size:12px;color:var(--red-text);font-weight:500;margin-bottom:2px;"));
      box.appendChild(mk("p","✅ Correcta: "+q.options[q.correct],"font-size:12px;color:var(--green-text);font-weight:600;"));
    }
    c.appendChild(box);
  });
  var retry=mk("button","🔄 Otro diálogo","width:100%;padding:14px;border-radius:12px;border:none;background:rgba(93,217,208,0.12);color:#5dd9d0;font-size:14px;font-weight:700;cursor:pointer;margin-top:6px;");
  retry.onclick=function(){startHörverstehen(container);};
  c.appendChild(retry);
  container.appendChild(c);
  logActivity("drillsDone",1); syncUp();
}

// ── READING ───────────────────────────────────────────────────────────────────
state.reading._readingWords=[]; state.reading._readingTarget=-1; state.reading._wordCache={};
function renderReading(){
  const el=document.getElementById("s-lectura"); el.innerHTML="";
  const hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","LECTURA INTERACTIVA","font-size:11px;color:var(--muted);letter-spacing:2px;font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","Leer y aprender","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  hdr.appendChild(mk("p","Genera un texto en aleman. Toca una palabra para ver su traduccion y guardarla.","font-size:13px;color:var(--muted);margin-top:4px;font-weight:500;"));
  el.appendChild(hdr);

  const topics=[
    {id:"daily",label:"Vida diaria",icon:"🏠"},
    {id:"travel",label:"Viajes",icon:"✈️"},
    {id:"work",label:"Trabajo",icon:"💼"},
    {id:"tech",label:"Tecnología",icon:"💻"},
    {id:"food",label:"Comida",icon:"🍕"},
    {id:"nature",label:"Naturaleza",icon:"🌿"},
    {id:"feelings",label:"Emociones",icon:"😊"}
  ];
  const topicRow=mk("div","","display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;");
  topics.forEach(function(t){
    const b=document.createElement("button");
    b.className="lectura-topic-btn";
    b.textContent=t.icon+" "+t.label;
    b.onclick=function(){generateReading(t.id,el);};
    topicRow.appendChild(b);
  });
  el.appendChild(topicRow);

  const textArea=mk("div","Toca un tema para generar un texto.","padding:40px 20px;text-align:center;color:var(--muted);font-size:14px;font-weight:500;");
  textArea.id="lectura-text";
  el.appendChild(textArea);
}
function generateReading(topicId,host){
  const ta=host.querySelector("#lectura-text");
  ta.innerHTML=""; ta.style.cssText="padding:20px;";
  ta.appendChild(skelCard(6));
  const topicLabels={daily:"daily life",travel:"traveling in Germany",work:"at the workplace",tech:"technology and IT",food:"ordering food at a restaurant",nature:"a walk in nature",feelings:"expressing emotions"};
  var topicLabel=topicLabels[topicId]||"daily life";
  var sys='You are a German language teacher. Generate a short German text about '+topicLabel+' at '+state.app.level+' level. Reply ONLY with valid JSON, no markdown: {"text":"the German text (3-5 sentences, natural, no translations in the text)","words":[{"de":"German word","es":"Spanish meaning"}]}. Include 8-12 key words in the words array. Level '+state.app.level+'.';
  ai(sys,[{role:"user",content:"Generate a reading passage."}],1200).then(function(reply){
    var clean=reply.replace(/```json|```/g,"").trim();
    var m=clean.match(/\{[\s\S]*\}/); if(!m) throw new Error("no JSON");
    var obj=JSON.parse(m[0]);
    ta.innerHTML="";
    var wordMap={};
    (obj.words||[]).forEach(function(w){wordMap[w.de.toLowerCase()]=w.es;});
    var textEl=mk("div","","font-size:17px;line-height:1.8;color:var(--text);font-weight:500;margin-bottom:16px;");
    var words=obj.text.split(/(\s+)/);
    state.reading._readingWords=[];
    state.reading._readingTarget=-1;
    words.forEach(function(w,i){
      if(/^\s+$/.test(w)){textEl.appendChild(document.createTextNode(w));return;}
      var cleanW=w.replace(/[.,!?;:"'()]/g,"");
      var btn=document.createElement("button");
      btn.type="button";
      btn.className="lectura-word";
      btn.textContent=w;
      btn.onclick=function(e){
        e.stopPropagation();
        var wasActive=btn.classList.contains("active");
        var prevActive=textEl.querySelector(".lectura-word.active");
        if(prevActive) prevActive.classList.remove("active");
        if(wasActive){ state.reading._readingTarget=-1; hideReadingTranslation(); return; }
        btn.classList.add("active");
        state.reading._readingTarget=i;
        var trans=wordMap[cleanW.toLowerCase()]||state.reading._wordCache[cleanW.toLowerCase()]||null;
        var contextSentence="";
        var sentences=obj.text.split(/[.!?]+/);
        for(var si=0;si<sentences.length;si++){
          if(sentences[si].toLowerCase().indexOf(cleanW.toLowerCase())>=0){
            contextSentence=sentences[si].trim()+".";
            break;
          }
        }
        showReadingTranslation(w,cleanW,trans,host,contextSentence,this);
      };
      state.reading._readingWords.push(cleanW);
      textEl.appendChild(btn);
    });
    ta.appendChild(textEl);
    var playBtn=document.createElement("button");
    playBtn.className="gen-btn gen-btn-teal";
    playBtn.textContent="🔊 Escuchar texto";
    playBtn.onclick=function(){speak(obj.text);};
    ta.appendChild(playBtn);
    var copyBtn=document.createElement("button");
    copyBtn.className="gen-btn gen-btn-muted";
    copyBtn.textContent="📋 Copiar texto";
    copyBtn.onclick=function(){navigator.clipboard.writeText(obj.text).then(function(){showToast("Texto copiado","success");}).catch(function(){showToast("No se pudo copiar","error");});};
    ta.appendChild(copyBtn);
    var newBtn=document.createElement("button");
    newBtn.className="gen-btn gen-btn-muted";
    newBtn.textContent="🔄 Otro texto";
    newBtn.onclick=function(){generateReading(topicId,host);};
    ta.appendChild(newBtn);
  }).catch(function(e){
    ta.innerHTML="";
    ta.appendChild(mk("p","Error al generar texto. Intenta de nuevo.","color:#ef4444;font-size:13px;text-align:center;margin-top:20px;font-weight:500;"));
    var retry=mk("button","Reintentar","margin-top:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);color:#94a3b8;border-radius:12px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;");
    retry.onclick=function(){generateReading(topicId,host);};
    ta.appendChild(retry);
  });
}
function showReadingTranslationManual(rawWord,host,contextSentence){
  var popup=mk("div","","background:rgba(196,167,231,0.08);border:1px solid rgba(196,167,231,0.2);border-radius:var(--r-lg,16px);padding:16px;margin-bottom:14px;");
  popup.id="lectura-popup";
  popup.appendChild(mk("p","📖 "+rawWord,"font-size:20px;font-weight:800;color:var(--text);margin-bottom:4px;"));
  var askWrap=mk("div","","margin-bottom:10px;");
  askWrap.appendChild(mk("p","Escribe la traduccion:","font-size:12px;color:var(--muted);margin-bottom:6px;font-weight:500;"));
  const inp=document.createElement("input"); inp.placeholder="Traduccion en español..."; inp.setAttribute("aria-label","Traducción al español");
  inp.style.cssText="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(196,167,231,0.3);border-radius:10px;padding:9px 12px;font-size:13px;color:var(--text);outline:none;font-family:inherit;font-weight:500;";
  inp.onfocus=function(){this.style.borderColor="rgba(196,167,231,0.6)";};
  inp.onblur=function(){this.style.borderColor="rgba(196,167,231,0.3)";};
  askWrap.appendChild(inp); popup.appendChild(askWrap);
  if(contextSentence) popup.appendChild(mk("p","📝 "+contextSentence,"font-size:12px;color:var(--muted);font-style:italic;margin-bottom:10px;font-weight:500;"));
  var btnRow=mk("div","","display:flex;gap:8px;");
  var saveBtn=document.createElement("button");
  saveBtn.style.cssText="flex:1;background:rgba(196,167,231,0.15);border:1px solid rgba(196,167,231,0.3);color:#c4a7e7;border-radius:10px;padding:9px;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;";
  setSaveIcon(saveBtn,false,"Guardar");
  var doSaveManual=function(){
    var es=inp.value.trim();
    if(!es){showToast("Escribi la traduccion","error");return;}
    var tip=contextSentence||"lectura";
    var phrase=ensureSrsFields({de:rawWord,es:es,tip:tip,source:"lectura"});
    if(!state.session.saved.some(function(x){return x.de===phrase.de;})){
      state.session.saved.push(phrase);updateBadge();syncUp();
      saveBtn.textContent="✓ Guardada";saveBtn.style.color="#4ade80";saveBtn.style.borderColor="rgba(74,222,128,0.3)";saveBtn.disabled=true;
      showToast("Palabra guardada en flashcards");
    } else {saveBtn.textContent="Ya guardada";saveBtn.disabled=true;}
  };
  saveBtn.onclick=doSaveManual;
  inp.onkeydown=function(e){if(e.key==="Enter"){e.preventDefault();doSaveManual();}};
  btnRow.appendChild(saveBtn);
  var dismissBtn=document.createElement("button");
  dismissBtn.textContent="✕ Cerrar";
  dismissBtn.style.cssText="background:transparent;border:1px solid rgba(255,255,255,0.1);color:var(--muted);border-radius:999px;padding:9px 12px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;";
  dismissBtn.onclick=function(){hideReadingTranslation();if(state.reading._readingTarget>=0){state.reading._readingTarget=-1;}};
  btnRow.appendChild(dismissBtn);
  popup.appendChild(btnRow);
  var textArea=document.getElementById("lectura-text");
  if(textArea) textArea.appendChild(popup);
  setTimeout(function(){inp.focus();},100);
}
function showReadingTranslation(rawWord,cleanWord,knownTranslation,host,contextSentence,spanEl){
  hideReadingTranslation();
  if(!knownTranslation){
    var tt=document.createElement("div"); tt.id="lectura-tt";
    var rect=spanEl.getBoundingClientRect();
    var top=rect.top-52, left=rect.left;
    if(top<8){top=rect.bottom+10;}
    if(left+180>window.innerWidth) left=window.innerWidth-190;
    if(left<8) left=8;
    tt.style.cssText="position:fixed;left:"+left+"px;top:"+top+"px;background:var(--tooltip-bg);border:1px solid rgba(196,167,231,0.35);border-radius:12px;padding:8px 12px;z-index:100;max-width:220px;box-shadow:0 8px 24px rgba(0,0,0,0.4);animation:fadeUp 0.15s ease;";
    var wordRow=mk("div","","display:flex;align-items:center;justify-content:space-between;gap:10px;");
    wordRow.appendChild(mk("p",rawWord,"font-size:15px;font-weight:800;color:var(--text);"));
    var spinner=mk("span","⏳","font-size:14px;color:var(--muted);animation:pulse 0.8s infinite;");
    wordRow.appendChild(spinner);
    tt.appendChild(wordRow);
    var statusLine=mk("p","Traduciendo...","font-size:11px;color:var(--muted);font-weight:500;margin-top:2px;");
    tt.appendChild(statusLine);
    document.body.appendChild(tt);
    setTimeout(function(){window.addEventListener("scroll",function doh(){hideReadingTranslation();window.removeEventListener("scroll",doh);});},50);
    tt.onclick=function(){hideReadingTranslation();};
    var ctx=contextSentence||rawWord;
    var cacheKey=cleanWord.toLowerCase();
    ai("You are a German-Spanish dictionary. Translate the German word to Spanish in the context of the given sentence. Reply ONLY with valid JSON, no markdown.",
      [{role:"user",content:'Translate the German word "'+rawWord+'" in the context of this sentence: "'+ctx+'". Format: {"es":"Spanish translation","base":"dictionary/base form of the word (e.g. infinitive for verbs, nominative for nouns)"}'}],150)
      .then(function(reply){
        var m=reply.replace(/```json|```/g,"").match(/\{[\s\S]*\}/);
        if(!m) throw new Error("no JSON");
        var obj=JSON.parse(m[0]);
        if(!obj.es) throw new Error("empty translation");
        var es=obj.es, base=obj.base||rawWord;
        state.reading._wordCache[cacheKey]=es;
        tt.innerHTML="";
        var row2=mk("div","","display:flex;align-items:center;justify-content:space-between;gap:10px;");
        row2.appendChild(mk("p",rawWord,"font-size:15px;font-weight:800;color:var(--text);"));
        var starBtn=document.createElement("button");
        starBtn.setAttribute("aria-label","Guardar");
        starBtn.style.cssText="background:rgba(196,167,231,0.2);border:none;color:#c4a7e7;border-radius:8px;padding:4px 8px;font-size:16px;cursor:pointer;transition:all 0.15s;line-height:1;display:inline-flex;align-items:center;justify-content:center;";
        setSaveIcon(starBtn,false);
        starBtn.title="Guardar en flashcards";
        var doSave=function(){
          var phrase=ensureSrsFields({de:base,es:es,tip:ctx||"lectura",source:"lectura"});
          if(!state.session.saved.some(function(x){return x.de===phrase.de;})){
            state.session.saved.push(phrase);updateBadge();syncUp();
            starBtn.textContent="✓";starBtn.style.color="#4ade80";starBtn.disabled=true;
            showToast("Guardada: "+es,"success");
          } else {showToast("Ya estaba guardada","success");}
        };
        starBtn.onclick=function(e){e.stopPropagation();doSave();};
        row2.appendChild(starBtn);
        tt.appendChild(row2);
        tt.appendChild(mk("p",es,"font-size:12px;color:var(--tooltip-accent);font-weight:600;margin-top:2px;"));
      })
      .catch(function(){
        tt.remove();
        showReadingTranslationManual(rawWord,host,contextSentence);
      });
    return;
  }
  var tt=document.createElement("div"); tt.id="lectura-tt";
  var rect=spanEl.getBoundingClientRect();
  var top=rect.top-52, left=rect.left;
  if(top<8){top=rect.bottom+10;}
  if(left+180>window.innerWidth) left=window.innerWidth-190;
  if(left<8) left=8;
  tt.style.cssText="position:fixed;left:"+left+"px;top:"+top+"px;background:var(--tooltip-bg);border:1px solid rgba(196,167,231,0.35);border-radius:12px;padding:8px 12px;z-index:100;max-width:220px;box-shadow:0 8px 24px rgba(0,0,0,0.4);animation:fadeUp 0.15s ease;";
  var wordRow=mk("div","","display:flex;align-items:center;justify-content:space-between;gap:10px;");
  wordRow.appendChild(mk("p",rawWord,"font-size:15px;font-weight:800;color:var(--text);"));
  var actions=mk("div","","display:flex;align-items:center;gap:6px;");
  var saveMini=document.createElement("button");
  saveMini.setAttribute("aria-label","Guardar");
  saveMini.style.cssText="background:rgba(196,167,231,0.2);border:none;color:#c4a7e7;border-radius:8px;padding:4px 8px;font-size:16px;cursor:pointer;transition:all 0.15s;line-height:1;display:inline-flex;align-items:center;justify-content:center;";
  setSaveIcon(saveMini,false);
  saveMini.title="Guardar en flashcards";
  var doSaveMini=function(){
    var phrase=ensureSrsFields({de:rawWord,es:knownTranslation,tip:contextSentence||"lectura",source:"lectura"});
    if(!state.session.saved.some(function(x){return x.de===phrase.de;})){
      state.session.saved.push(phrase);updateBadge();syncUp();
      saveMini.textContent="✓";saveMini.style.color="#4ade80";saveMini.disabled=true;
      showToast("Guardada: "+knownTranslation,"success");
    } else {showToast("Ya estaba guardada","success");}
  };
  saveMini.onclick=function(e){e.stopPropagation();doSaveMini();};
  actions.appendChild(saveMini);
  var closeMini=document.createElement("button");
  closeMini.setAttribute("aria-label","Cerrar traducción");
  closeMini.textContent="×";
  closeMini.title="Cerrar";
  closeMini.style.cssText="background:rgba(255,255,255,0.06);border:none;color:var(--muted);border-radius:8px;padding:4px 8px;font-size:16px;font-weight:800;cursor:pointer;line-height:1;";
  closeMini.onclick=function(e){e.stopPropagation();hideReadingTranslation();};
  actions.appendChild(closeMini);
  wordRow.appendChild(actions);
  tt.appendChild(wordRow);
  tt.appendChild(mk("p",knownTranslation,"font-size:12px;color:var(--tooltip-accent);font-weight:600;margin-top:2px;"));
  document.body.appendChild(tt);
  setTimeout(function(){window.addEventListener("scroll",function doh(){hideReadingTranslation();window.removeEventListener("scroll",doh);});},50);
  tt.onclick=function(){hideReadingTranslation();};
}
function hideReadingTranslation(){
  var tt=document.getElementById("lectura-tt"); if(tt) tt.remove();
  var popup=document.getElementById("lectura-popup"); if(popup) popup.remove();
}
