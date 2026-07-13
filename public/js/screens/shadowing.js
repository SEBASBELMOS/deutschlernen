// ── Shadowing (pronunciation with German transcription) ───────────────────────
function renderShadowing(){
  const el=document.getElementById("s-shadowing"); el.innerHTML="";

  // ── Eyebrow + heading ──
  el.appendChild(mk("p","Pronunciación · Shadowing","font-size:10px;letter-spacing:2.5px;font-weight:700;color:var(--muted);text-transform:uppercase;"));
  el.appendChild(mk("h1","🎙️ Shadowing","font-size:22px;font-weight:900;letter-spacing:-.03em;margin:2px 0 14px;"));

  // ── Mode toggle (3 modes) ──
  if(!state.shadowing) state.shadowing={};
  if(!state.shadowing._mode) state.shadowing._mode="pool";
  var mode=state.shadowing._mode;

  var toggleRow=mk("div","","display:flex;gap:4px;margin-bottom:18px;flex-wrap:wrap;");
  var modes=[{id:"pool",icon:"🎲",label:"Pool aleatorio"},{id:"phrase",icon:"📝",label:"Frase propia"},{id:"word",icon:"🔤",label:"Palabra propia"}];
  modes.forEach(function(m){
    var active=mode===m.id;
    var pill=mk("button",m.icon+" "+m.label,"padding:10px 12px;border-radius:14px;font-size:12px;font-weight:800;cursor:pointer;font-family:Inter,sans-serif;transition:all .15s;flex:1;"+(active?"border:1.5px solid var(--teal);background:rgba(93,217,208,.13);color:var(--teal-text);":"border:1px solid var(--border);background:transparent;color:var(--muted);"));
    pill.onclick=function(){state.shadowing._mode=m.id;if(m.id!=="phrase")state.shadowing._customPhrase=null;renderShadowing();};
    toggleRow.appendChild(pill);
  });
  el.appendChild(toggleRow);

  // ── Determine sentence by mode ──
  var sentence;

  if(mode==="pool"){
    // Init pool
    if(!state.shadowing.pool||!state.shadowing.pool.length){
      state.shadowing.pool=SHADOWING_POOL.slice().sort(function(){return Math.random()-0.5;});
      state.shadowing.idx=0;
    }
    if(state.shadowing.idx>=state.shadowing.pool.length){state.shadowing.idx=0;state.shadowing.pool=SHADOWING_POOL.slice().sort(function(){return Math.random()-0.5;});}

    sentence=state.shadowing.pool[state.shadowing.idx];

    // ── Level dots (pool only) ──
    var lvlDots=mk("div","","display:flex;gap:6px;justify-content:center;margin-bottom:14px;");
    for(var di=0;di<5;di++){
      var dot=mk("span","","width:32px;height:5px;border-radius:4px;background:rgba(255,255,255,.07);transition:background .3s;");
      if(di<=state.shadowing.idx%5 && state.shadowing.idx>0)dot.style.background="var(--green)";
      else if(di===state.shadowing.idx%5)dot.style.background="var(--gold)";
      lvlDots.appendChild(dot);
    }
    el.appendChild(lvlDots);
  } else if(mode==="phrase"){
    // Frase propia: type word → AI generates phrase
    sentence=state.shadowing._customPhrase;
    if(!sentence){
      // ── Word input card ──
      var inputCard=mk("div","","padding:20px;border-radius:18px;background:var(--surface);border:1px solid var(--border);margin-bottom:16px;");
      inputCard.appendChild(mk("p","Escribe una palabra en alemán y el AI genera una frase para practicar","font-size:13px;font-weight:700;color:var(--muted);margin-bottom:12px;"));
      var wordInput=mk("input","","width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:rgba(255,255,255,.06);color:var(--text);font-size:15px;font-family:Inter,sans-serif;outline:none;margin-bottom:10px;box-sizing:border-box;");
      wordInput.placeholder="z.B. Kühlschrank, verabreden, gemütlich...";
      wordInput.setAttribute("aria-label","Palabra en alemán para generar frase de práctica");
      inputCard.appendChild(wordInput);
      var genBtn=mk("button","Generar frase","width:100%;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--teal),#79e3db);color:#04302c;font-size:14px;font-weight:900;cursor:pointer;font-family:Inter,sans-serif;transition:filter .15s;");
      genBtn.onclick=async function(){
        var word=wordInput.value.trim();
        if(!word){showToast("Escribe una palabra","warn");return;}
        genBtn.disabled=true;genBtn.textContent="Generando...";
        try{
          var sys='You are a German teacher. Reply ONLY with valid JSON, no markdown. Create a short A2-B1 German practice phrase (4-8 words) that includes the word the user gives you. Format: {"de":"German phrase","es":"Spanish translation"}';
          var txt=await ai(sys,[{role:"user",content:"Create a shadowing phrase that includes the word: "+word}],300);
          var cl=txt.replace(/```json|```/g,"").trim().match(/\{[\s\S]*\}/);
          if(cl){var obj=JSON.parse(cl[0]);if(obj.de&&obj.es){state.shadowing._customPhrase=obj;state.shadowing._customWord=word;renderShadowing();return;}}
          showToast("Error al generar","error");
        }catch(e){showToast("Error: "+e.message,"error");}
        genBtn.disabled=false;genBtn.textContent="Generar frase";
      };
      wordInput.onkeydown=function(e){if(e.key==="Enter")genBtn.click();};
      inputCard.appendChild(genBtn);
      el.appendChild(inputCard);
      return; // No recording UI until phrase generated
    }
  } else if(mode==="word"){
    // Palabra propia: single word pronunciation check (like Google Translate)
    var word=state.shadowing._customWord;
    if(!word){
      var wCard=mk("div","","padding:20px;border-radius:18px;background:var(--surface);border:1px solid var(--border);margin-bottom:16px;");
      wCard.appendChild(mk("p","Escribe una palabra para practicar su pronunciación","font-size:13px;font-weight:700;color:var(--muted);margin-bottom:12px;"));
      var wInp=mk("input","","width:100%;padding:14px;border-radius:14px;border:1px solid var(--border);background:rgba(255,255,255,.06);color:var(--text);font-size:22px;font-weight:700;text-align:center;font-family:Inter,sans-serif;outline:none;margin-bottom:14px;box-sizing:border-box;");
      wInp.placeholder="z.B. Kühlschrank";
      wInp.setAttribute("aria-label","Palabra alemana");
      wCard.appendChild(wInp);
      var goBtn=mk("button","▶ Escuchar y practicar","width:100%;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,var(--teal),#79e3db);color:#04302c;font-size:15px;font-weight:900;cursor:pointer;font-family:Inter,sans-serif;transition:filter .15s;box-shadow:0 6px 20px rgba(var(--teal-rgb),.25);");
      goBtn.onclick=function(){
        var w=wInp.value.trim();
        if(!w){showToast("Escribe una palabra","warn");return;}
        state.shadowing._customWord=w;
        renderShadowing();
      };
      wInp.onkeydown=function(e){if(e.key==="Enter")goBtn.click();};
      wCard.appendChild(goBtn);
      el.appendChild(wCard);
      return;
    }
    // Build a sentence object for the shared UI
    sentence={de:word,es:""};
  }

  // ── Phrase card (shared) ──
  var badgeText=mode==="word"?"Tu palabra":mode==="phrase"?"Tu frase":"Shadowing";
  var phraseCard=mk("div","","position:relative;padding:34px 22px 28px;border-radius:24px;text-align:center;margin-bottom:16px;border:1px solid rgba(78,205,196,.28);background:linear-gradient(150deg,rgba(78,205,196,.09),rgba(78,205,196,.02));box-shadow:0 8px 28px rgba(0,0,0,.35);");
  phraseCard.appendChild(mk("span",badgeText,"position:absolute;top:13px;left:16px;font-size:9px;font-weight:900;letter-spacing:1.5px;color:var(--dim);text-transform:uppercase;"));
  var dePhrase=mk("p",sentence.de,"font-size:24px;font-weight:900;letter-spacing:-.02em;line-height:1.35;color:var(--text);margin-bottom:10px;");
  dePhrase.id="shadow-p-de";
  phraseCard.appendChild(dePhrase);
  if(mode!=="word") phraseCard.appendChild(mk("p",sentence.es,"font-size:13px;color:var(--muted);font-weight:600;"));
  var playBtn=mk("button","▶ Escuchar modelo","margin-top:18px;background:rgba(78,205,196,.13);border:1.5px solid rgba(78,205,196,.5);color:var(--teal-text);border-radius:14px;padding:11px 22px;font-size:13px;font-weight:900;cursor:pointer;transition:background .15s,transform .1s;");
  playBtn.onmouseenter=function(){playBtn.style.background="rgba(78,205,196,.2)";};
  playBtn.onmouseleave=function(){playBtn.style.background="rgba(78,205,196,.13)";};
  playBtn.onmousedown=function(){playBtn.style.transform="scale(.96)";};
  playBtn.onmouseup=function(){playBtn.style.transform="";};
  playBtn.onclick=function(){speakGerman(sentence.de);};
  phraseCard.appendChild(playBtn);
  el.appendChild(phraseCard);

  // ── Recording zone (shared) ──
  var recZone=mk("div","","text-align:center;margin-bottom:16px;");
  var pulseWrap=mk("div","","position:relative;display:inline-block;");
  var vizCanvas=document.createElement("canvas");
  vizCanvas.width=200;vizCanvas.height=40;
  vizCanvas.style.cssText="display:none;width:200px;height:40px;margin:0 auto 10px;border-radius:10px;background:rgba(0,0,0,.3);";
  recZone.appendChild(vizCanvas);
  var micBtn=document.createElement("button");
  micBtn.setAttribute("aria-label","Grabar tu voz para puntuar la pronunciación");
  micBtn.style.cssText="width:88px;height:88px;border-radius:50%;background:linear-gradient(150deg,rgba(248,113,113,.2),rgba(248,113,113,.08));border:2px solid rgba(248,113,113,.6);color:var(--red-text,#ffb4ab);font-size:30px;cursor:pointer;transition:transform .12s;display:flex;align-items:center;justify-content:center;";
  micBtn.textContent="🎙️";
  micBtn.onmousedown=function(){micBtn.style.transform="scale(.93)";};
  micBtn.onmouseup=function(){micBtn.style.transform="";};

  var recLbl=mk("p",mode==="word"?"Escucha y repite la palabra exactamente":"Escucha el modelo y graba imitando ritmo y sonidos","font-size:11.5px;font-weight:800;color:var(--muted);margin-top:10px;letter-spacing:.5px;");
  recZone.appendChild(pulseWrap);
  pulseWrap.appendChild(micBtn);
  recZone.appendChild(recLbl);

  // Progress bar
  var prog=mk("div","","height:7px;border-radius:5px;background:rgba(255,255,255,.06);overflow:hidden;margin:14px auto 0;max-width:300px;opacity:0;transition:opacity .2s;");
  prog.id="shadow-prog";
  var progFill=mk("div","","height:100%;width:0;background:linear-gradient(90deg,var(--red),#ff9a9a);border-radius:5px;transition:width .1s linear;");
  prog.appendChild(progFill);
  recZone.appendChild(prog);
  el.appendChild(recZone);

  // ── Result state (hidden) ──
  var resultState=mk("div","","display:none;animation:slideUpFade .5s var(--ease-spring) both;");
  resultState.id="shadow-result";

  var scoreCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:22px;backdrop-filter:blur(12px);box-shadow:0 8px 28px rgba(0,0,0,.35);padding:20px;text-align:center;margin-bottom:12px;");

  var ringWrap=mk("div","","position:relative;width:110px;height:110px;margin:0 auto 10px;");
  ringWrap.innerHTML='<svg width="110" height="110" style="transform:rotate(-90deg);"><circle cx="55" cy="55" r="48" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="8"/><circle id="shadow-score-arc" cx="55" cy="55" r="48" fill="none" stroke-width="8" stroke-linecap="round" stroke-dasharray="301.6" stroke-dashoffset="301.6" style="transition:stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)"/></svg>';
  var rwN=mk("div","","position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;");
  var scoreN=mk("span","","font-size:26px;font-weight:900;letter-spacing:-.03em;");
  scoreN.id="shadow-score-text";
  rwN.appendChild(scoreN);
  rwN.appendChild(mk("span","PRONUNCIACIÓN","font-size:9px;font-weight:800;letter-spacing:1.5px;color:var(--muted);"));
  ringWrap.appendChild(rwN);
  scoreCard.appendChild(ringWrap);

  var verdict=mk("p","","font-size:14.5px;font-weight:800;");
  verdict.id="shadow-verdict";
  scoreCard.appendChild(verdict);

  var transcr=mk("div","","margin-top:14px;padding-top:14px;border-top:1px dashed rgba(255,255,255,.08);text-align:left;");
  transcr.appendChild(mk("p","TRANSCRIPCIÓN","font-size:9.5px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:7px;"));
  var transTxt=mk("p","","font-size:15px;font-weight:700;line-height:1.6;");
  transTxt.id="shadow-transcript";
  transcr.appendChild(transTxt);
  var missNote=mk("p","","font-size:12px;color:var(--muted);font-weight:600;margin-top:9px;line-height:1.5;");
  missNote.id="shadow-miss-note";
  transcr.appendChild(missNote);
  scoreCard.appendChild(transcr);
  resultState.appendChild(scoreCard);

  var phoneticTips=mk("div","","display:none;background:rgba(245,158,11,.06);border:1.5px solid rgba(245,158,11,.3);border-radius:16px;padding:14px 18px;margin-bottom:14px;text-align:left;font-size:12.5px;font-weight:600;color:var(--gold-text);line-height:1.7;");
  phoneticTips.id="shadow-phonetic";
  resultState.appendChild(phoneticTips);

  var acts=mk("div","","display:flex;gap:9px;");
  var retryBtn=mk("button","↻ Repetir","flex:1;padding:14px;border-radius:15px;font-size:14px;font-weight:900;cursor:pointer;background:rgba(255,255,255,.05);border:1px solid var(--border);color:var(--muted);transition:transform .1s;");
  retryBtn.onclick=function(){
    if(mode==="pool") state.shadowing.idx--;
    renderShadowing();
  };
  acts.appendChild(retryBtn);

  if(mode==="pool"){
    var nextBtn=mk("button","Siguiente frase →","flex:1;padding:14px;border-radius:15px;font-size:14px;font-weight:900;cursor:pointer;background:linear-gradient(135deg,var(--teal),#79e3db);color:#04302c;box-shadow:0 6px 20px rgba(78,205,196,.25);border:none;transition:transform .1s;");
    nextBtn.onclick=function(){state.shadowing.idx++;renderShadowing();};
    acts.appendChild(nextBtn);
  } else if(mode==="phrase"){
    var newWordBtn=mk("button","Nueva frase →","flex:1;padding:14px;border-radius:15px;font-size:14px;font-weight:900;cursor:pointer;background:linear-gradient(135deg,var(--teal),#79e3db);color:#04302c;box-shadow:0 6px 20px rgba(78,205,196,.25);border:none;transition:transform .1s;");
    newWordBtn.onclick=function(){state.shadowing._customPhrase=null;renderShadowing();};
    acts.appendChild(newWordBtn);
  } else {
    var nwBtn=mk("button","Nueva palabra →","flex:1;padding:14px;border-radius:15px;font-size:14px;font-weight:900;cursor:pointer;background:linear-gradient(135deg,var(--teal),#79e3db);color:#04302c;box-shadow:0 6px 20px rgba(78,205,196,.25);border:none;transition:transform .1s;");
    nwBtn.onclick=function(){state.shadowing._customWord=null;renderShadowing();};
    acts.appendChild(nwBtn);
  }
  resultState.appendChild(acts);
  el.appendChild(resultState);

  // ── Mode-specific extras ──
  if(mode==="pool"){
    // AI generate button
    var aiBtn=mk("button","🤖 Generar con IA","width:100%;padding:12px;border-radius:12px;border:1px solid rgba(var(--purple-rgb),0.25);background:rgba(var(--purple-rgb),0.08);color:var(--purple-text);font-size:13px;font-weight:700;cursor:pointer;margin-top:12px;transition:background .15s;");
    aiBtn.onclick=async function(){
      aiBtn.disabled=true;aiBtn.textContent="Generando...";
      try{
        var sys='You are a German teacher. Reply ONLY with valid JSON, no markdown. Generate ONE useful A2-B1 German sentence for shadowing practice (5-10 words). Format: {"de":"German sentence","es":"Spanish translation"}';
        var txt=await ai(sys,[{role:"user",content:"Generate a new shadowing sentence, different from the current ones."}],300);
        var cl=txt.replace(/```json|```/g,"").trim().match(/\{[\s\S]*\}/);
        if(cl){var obj=JSON.parse(cl[0]);if(obj.de&&obj.es){state.shadowing.pool.splice(state.shadowing.idx+1,0,obj);showToast("Frase generada","success");renderShadowing();return;}}
        showToast("Error al generar","error");
      }catch(e){showToast("Error: "+e.message,"error");}
      aiBtn.disabled=false;aiBtn.textContent="🤖 Generar con IA";
    };
    el.appendChild(aiBtn);

    // Reset button
    var resetBtn=mk("button","↻ Reiniciar frases","width:100%;background:transparent;border:1px dashed rgba(255,255,255,.1);color:var(--muted);border-radius:12px;padding:10px;font-size:12px;font-weight:600;cursor:pointer;margin-top:8px;");
    resetBtn.onclick=function(){state.shadowing.pool=SHADOWING_POOL.slice().sort(function(){return Math.random()-0.5;});state.shadowing.idx=0;renderShadowing();};
    el.appendChild(resetBtn);
  } else if(mode==="phrase"){
    // Frase mode: show current word info
    var wordLabel=mk("p","Palabra: "+state.shadowing._customWord+"","font-size:11px;color:var(--muted);text-align:center;margin-top:10px;font-weight:600;");
    el.appendChild(wordLabel);
  } else {
    // Word mode: show word + "Escuchar otra vez" button
    var wl=mk("p","Palabra: "+state.shadowing._customWord+"","font-size:11px;color:var(--muted);text-align:center;margin-top:10px;font-weight:600;");
    el.appendChild(wl);
  }

  // ── Mic handler: record → score → show result ──
  var isRecording=false;
  var origMicClick=null;
  var loadTimer=null; // safety timeout for loading state

  function clearLoadState(){
    if(loadTimer){clearTimeout(loadTimer);loadTimer=null;}
    recLbl.style.animation="";
  }

  micBtn.onclick=function(e){
    if(isRecording){
      // Stop recording — handled by makeMicBtn toggle
      isRecording=false;
      micBtn.style.background="linear-gradient(150deg,rgba(248,113,113,.2),rgba(248,113,113,.08))";
      micBtn.style.color="var(--red-text,#ffb4ab)";
      micBtn.textContent="⏳";
      prog.style.opacity="0";
      recLbl.innerHTML="<b>Analizando tu pronunciación…</b>";
      recLbl.style.animation="pulse 1.5s infinite";
      // Safety: reset after 12s if something goes wrong
      loadTimer=setTimeout(function(){
        recLbl.style.animation="";
        recLbl.innerHTML="Escucha el modelo y <b>graba</b> imitando ritmo y sonidos";
        micBtn.textContent="🎙️";
      },12000);
      origMicClick.call(micBtn,e);
    } else {
      isRecording=true;
      micBtn.style.background="var(--red)";
      micBtn.style.color="#fff";
      micBtn.textContent="■";
      recLbl.innerHTML="<b>Grabando…</b> habla claro y a ritmo natural";
      prog.style.opacity="1";
      var t=0;
      var recTimer=setInterval(function(){
        t+=100;
        progFill.style.width=Math.min(100,t/3000*100)+"%";
        if(t>=3000){clearInterval(recTimer);if(isRecording)micBtn.click();}
      },100);
      var mp=makeMicBtn("#5dd9d0",function(transcript){
        clearLoadState();
        isRecording=false;
        micBtn.style.background="linear-gradient(150deg,rgba(248,113,113,.2),rgba(248,113,113,.08))";
        micBtn.style.color="var(--red-text,#ffb4ab)";
        micBtn.textContent="🎙️";
        recLbl.innerHTML="Escucha el modelo y <b>graba</b> imitando ritmo y sonidos";
        prog.style.opacity="0";
        progFill.style.width="0";
        resultState.style.display="block";
        recZone.style.display="none";
        var score=updateVisualScore(sentence.de, transcript, mode==="word");
        if(score<70&&sentence.de&&transcript&&state.session&&Array.isArray(state.session.errorJournal)){
          state.session.errorJournal.unshift({
            date: todayKey(),
            type: "pronunciacion",
            source: "shadowing:"+(mode||"word"),
            original: transcript,
            correction: sentence.de,
            tip: "Practica escuchando el modelo y repitiendo. Fijate en los tips de pronunciación."
          });
          if(state.session.errorJournal.length>100) state.session.errorJournal=state.session.errorJournal.slice(0,100);
          syncUp();
        }
        showPhoneticTips(score, sentence.de, el);
        logActivity("drillsDone",1);syncUp();
        if(mode==="phrase" && score>=80 && sentence.de && sentence.es){
          var phrase=ensureSrsFields({de:sentence.de,es:sentence.es,tip:"",source:"shadowing-custom"});
          if(isDuplicate(phrase.de)){
            showToast("Ya tienes esta frase guardada","info");
          } else {
            state.session.saved.push(phrase);invalidateFlashcardQueues();updateBadge();syncUp();
            showToast("Guardada en flashcards!","success");
          }
        }
      }, vizCanvas);
      origMicClick=mp.onclick;
      mp.click();
    }
  };

  // ── updateVisualScore helper ──
  function updateVisualScore(target, transcript, isWord){
    function normStr(s){return(s||"").toLowerCase().replace(/[.,!?¿¡;:"'()]/g,"").replace(/\s+/g," ").trim();}
    var tw=normStr(target).split(" "); var uw=normStr(transcript).split(" ");
    var total=tw.length||1; var correct=0;
    tw.forEach(function(w,i){if(uw[i]===w)correct++;});
    var score=Math.round((correct/total)*100);

    var arc=document.getElementById("shadow-score-arc");
    var st=document.getElementById("shadow-score-text");
    var sv=document.getElementById("shadow-verdict");
    var tr=document.getElementById("shadow-transcript");
    var mn=document.getElementById("shadow-miss-note");

    if(arc){
      arc.setAttribute("stroke-dashoffset",String(301.6*(1-score/100)));
      arc.setAttribute("stroke",score>=80?"var(--green-text)":score>=50?"var(--gold-text)":"var(--red-text)");
    }
    if(st){st.textContent=score+"%";st.style.color=score>=80?"var(--green-text)":score>=50?"var(--gold-text)":"var(--red-text)";}
    if(sv){
      if(isWord){
        sv.textContent=score>=90?"✓ Pronunciación correcta":score>=50?"⚠️ Casi — intenta de nuevo":"❌ No se entendió — repite la palabra";
      }else{
        sv.textContent=score>=90?"🏆 Casi nativo":score>=75?"💪 Muy sólido":score>=60?"📈 Se entiende — puliendo detalles":"🌱 Sigue imitando el modelo";
      }
      sv.style.color=score>=80?"var(--green-text)":score>=50?"var(--gold-text)":"var(--red-text)";
    }
    if(tr)tr.textContent=transcript||"(no se detectó voz)";
    if(mn){
      if(isWord){
        if(score>=90)mn.textContent="✓ Pronunciación clara — ¡bien hecho!";
        else mn.innerHTML="💡 Dijiste <b style=color:var(--red)>"+transcript+"</b>, la palabra correcta es <b style=color:var(--green)>"+target+"</b>. Escucha el modelo y repite.";
      }else{
        var missed=tw.filter(function(w,i){return uw[i]!==w;});
        if(missed.length&&score<90)mn.innerHTML="💡 <b>"+missed.join(", ")+"</b> — practica estas palabras";
        else if(score>=90)mn.textContent="✓ Todas las palabras se entendieron perfecto. Aussprache stark!";
        else mn.textContent="Intenta de nuevo, cada vez sale mejor.";
      }
    }

    // Highlight missed words in the phrase card
    var pDe=document.getElementById("shadow-p-de");
    if(pDe){
      var origWords=sentence.de.split(" ");
      pDe.innerHTML=origWords.map(function(w,i){
        return uw[i]===normStr(w)?w:'<span style="color:var(--red);border-bottom:2.5px solid var(--red);border-radius:2px">'+w+'</span>';
      }).join(" ");
    }

    return score;
  }

  function getPhoneticTips(phrase){
    var tips=[];
    var low=phrase.toLowerCase();
    // SCH = "sh" (like English "shoe")
    if(/sch/.test(low))
      tips.push("sch: suena 'sh' (inglés 'shoe'). 'Schule' es 'Shule', NO 'Chule'");
    // CH: soft (Ich-Laut) after light vowels vs hard (Ach-Laut) after dark vowels
    if(/[eiäöü]ch|ch(?!$)(?=[eiäöü])/.test(low) && !/ach|och|uch|auch/.test(low))
      tips.push("ch suave (Ich-Laut): aire fino entre lengua y paladar, como la 'h' en inglés 'huge'. 'ich' no es 'ich' español");
    if(/ach|och|uch|auch/.test(low))
      tips.push("ch fuerte (Ach-Laut): como la 'j' española pero más atrás en la garganta. 'Bach', 'noch', 'auch'");
    // Umlauts
    if(/ü/.test(phrase))
      tips.push("ü: di 'i' pero con labios en posición de 'u'. Truco: silba una 'u' y sin mover los labios di 'iii'");
    if(/ö/.test(phrase))
      tips.push("ö: di 'e' pero con labios en posición de 'o'. Truco: formá una 'o' con los labios y di 'eee'");
    if(/ä/.test(phrase))
      tips.push("ä: 'e' bien abierta como en inglés 'bed'. 'Mädchen' rima con 'medchen', no con 'madchen'");
    // Consonants
    if(/^z|(?<=\s)z/.test(low)||/(?<=[^a-zäöüß])z/i.test(" "+phrase))
      tips.push("z: siempre 'ts' como en 'pizza'. 'Zug' es 'Tsug', NUNCA 'Sug' ni 'Zug' española");
    if(/w/.test(low))
      tips.push("w: 'v' inglesa (labio-dental, vibrante). 'Wasser' es 'Vassa', 'Schwester' es 'Shvesta'");
    if(/^v|(?<=\s)v/.test(low)||/(?<=[^a-zäöüß])v/i.test(" "+phrase))
      tips.push("v: suena 'f' en palabras alemanas. 'Vater' es 'Fater', 'von' es 'fon'");
    if(/^(s[tp])|(?<=\s)(s[tp])/.test(low))
      tips.push("st/sp al inicio: 'sht/shp'. 'Stein' es 'Shtain', 'Sport' es 'Shport'");
    if(/[^s]s(?=[^chp\s])|^s(?=[^chp\s])/.test(low) && !/sch|(?<!\w)s[st]/.test(low))
      tips.push("s sola: como 'z' latinoamericana (sonora). 'Sie' es 'Zii', 'Hose' es 'Hoze'. NO como 's' española");
    // Diphthongs
    if(/eu|äu/.test(low))
      tips.push("eu/äu: 'oi'. 'Deutsch' es 'Doich', 'Häuser' es 'Hoisa'. Fácil: e-u = o-i");
    if(/ei/.test(low))
      tips.push("ei: 'ai'. 'eins' es 'ains'. Regla: e+i = ai, la segunda letra manda");
    if(/ie/.test(low))
      tips.push("ie: 'i' larga. 'Liebe' es 'Liibe'. Regla inversa: i+e = i larga, la primera manda");
    // Special
    if(/[rl](?=\s|$)/.test(low)||/er(?=\s|$)/.test(low))
      tips.push("r/l al final: vocalizan, apenas se oyen. 'aber' suena 'aba', 'Bruder' casi 'Bruda'");
    if(/ng(?=\s|$|[^a-zäöüß])/.test(low))
      tips.push("ng: sonido nasal único — como en inglés 'sing'. La lengua toca el paladar blando, no los dientes");
    // Generic fallback
    if(tips.length===0)
      tips.push("Pronuncia cada letra claramente. El alemán no come letras como el español — cada sílaba se articula. Escucha el modelo y repite imitando el ritmo");
    // Bonus: always remind to listen
    tips.push("💡 ¿No estás seguro? Dale ▶ al modelo y repite imitando el sonido exacto, no cómo lo leerías en español");
    return tips;
  }

  function showPhoneticTips(score, phrase, targetHost){
    var tipEl=targetHost.querySelector("#shadow-phonetic");
    if(!tipEl)return;
    if(score>=80){
      tipEl.style.display="none";
      return;
    }
    var tips=getPhoneticTips(phrase);
    tipEl.innerHTML="<b>🔊 Tips de pronunciación:</b><br>"+tips.map(function(t){return "&bull; "+t;}).join("<br>");
    tipEl.style.display="block";
  }
}
