// ── Shadowing (pronunciation with German transcription) ───────────────────────
// Stitch "Shadowing Speaking" redesign — audio waves, score circle, recording states

function renderShadowing(){
  const el=document.getElementById("s-shadowing"); el.innerHTML="";

  // Header
  const hdr=document.createElement("section"); hdr.className="stitch-page-head";
  var headCopy=mk("div","","");
  headCopy.appendChild(mk("p","PRÁCTICA DE HABLA","display:inline-flex;padding:6px 14px;border-radius:var(--r-pill);background:var(--primary-container);color:var(--on-primary-container);font-size:12px;letter-spacing:.14em;font-family:var(--font-label);font-weight:900;margin-bottom:12px;"));
  headCopy.appendChild(mk("h2","Shadowing",""));
  headCopy.appendChild(mk("p","Escuchá el audio nativo, repetí la frase y compará tu pronunciación en tiempo real.",""));
  hdr.appendChild(headCopy);
  var headStats=mk("div","","display:flex;gap:22px;align-items:center;");
  headStats.appendChild(mk("div","🔥 "+computeStreak()+" días","font-size:16px;color:var(--primary);font-weight:900;white-space:nowrap;"));
  headStats.appendChild(mk("div","★ "+state.app.level+" level","font-size:16px;color:var(--secondary);font-weight:900;white-space:nowrap;"));
  hdr.appendChild(headStats);
  el.appendChild(hdr);

  // Init pool
  if(!state.shadowing||!state.shadowing.pool||!state.shadowing.pool.length){
    state.shadowing={pool:[],idx:0};
    state.shadowing.pool=SHADOWING_POOL.slice().sort(function(){return Math.random()-0.5;});
    state.shadowing.idx=0;
  }
  if(state.shadowing.idx>=state.shadowing.pool.length){state.shadowing.idx=0;state.shadowing.pool=SHADOWING_POOL.slice().sort(function(){return Math.random()-0.5;});}

  var sentence=state.shadowing.pool[state.shadowing.idx];

  var practiceGrid=document.createElement("div"); practiceGrid.className="shadow-practice-grid";

  // ── Native Audio Card ──
  var card=mk("div","","background:var(--surface);border:1px solid rgba(69,70,82,0.72);border-radius:var(--r-xl,20px);padding:28px;box-shadow:0 8px 28px rgba(0,0,0,0.18);");

  // Top row: label + level badge
  var topRow=mk("div","","display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;");
  topRow.appendChild(mk("span","Audio nativo","font-size:24px;color:var(--primary);font-weight:900;letter-spacing:-0.03em;"));
  var levelBadge=mk("span","Nivel B1","font-size:10px;color:var(--text2);background:rgba(var(--teal-rgb),0.08);border:1px solid rgba(var(--teal-rgb),0.18);border-radius:var(--r-pill,999px);padding:3px 10px;font-weight:700;");
  topRow.appendChild(levelBadge);
  card.appendChild(topRow);

  card.appendChild(mk("p","Listen and mimic the pronunciation","font-size:15px;color:var(--text2);font-weight:500;margin-bottom:12px;"));
  var waveLarge=mk("div","",""); waveLarge.className="shadow-wave-large";
  for(var wli=0;wli<48;wli++){
    var wb=mk("span","","height:"+(26+Math.round(Math.abs(Math.sin(wli*0.73))*86))+"px;animation-delay:"+(wli*0.025)+"s;");
    waveLarge.appendChild(wb);
  }
  card.appendChild(waveLarge);

  // Play button row
  var playRow=mk("div","","display:flex;align-items:center;gap:12px;");
  var playBtn=mk("button","","width:48px;height:48px;border-radius:50%;border:none;background:var(--teal);color:var(--on-primary);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 16px rgba(var(--teal-rgb),0.35);transition:filter 0.2s,transform 0.12s;flex-shrink:0;");
  playBtn.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>';
  playBtn.onclick=function(){speakGerman(sentence.de);};
  playRow.appendChild(playBtn);

  var durWrap=mk("div","","flex:1;");
  durWrap.appendChild(mk("p","Escuchar pronunciación","font-size:13px;color:var(--text);font-weight:600;"));
  durWrap.appendChild(mk("p","~4 segundos","font-size:11px;color:var(--muted);font-weight:500;"));
  playRow.appendChild(durWrap);
  card.appendChild(playRow);
  practiceGrid.appendChild(card);

  var tips=mk("aside","",""); tips.className="shadow-tip-panel";
  tips.appendChild(mk("h3","Tips for Shadowing","font-size:22px;color:var(--text);font-weight:800;letter-spacing:-0.02em;margin-bottom:18px;"));
  ["Escuchá la frase completa dos veces antes de grabar.","Enfocate en el ritmo, no solo palabra por palabra.","Hablá claro y cerca del micrófono."].forEach(function(tip,i){
    var row=mk("div","","display:flex;gap:12px;margin-bottom:16px;align-items:flex-start;");
    row.appendChild(mk("span",String(i+1),"width:24px;height:24px;border-radius:50%;background:var(--primary-container);color:var(--on-primary-container);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;flex-shrink:0;"));
    row.appendChild(mk("p",tip,"font-size:14px;color:var(--text2);line-height:1.45;font-weight:500;"));
    tips.appendChild(row);
  });
  tips.appendChild(mk("div","","height:1px;background:var(--border);margin:18px 0;"));
  tips.appendChild(mk("p","Microphone Quality","font-size:16px;color:var(--text);font-weight:700;margin-bottom:8px;"));
  var micQ=mk("div","",""); micQ.className="stitch-progress"; micQ.appendChild(mk("span","","width:92%;background:var(--green);"));
  tips.appendChild(micQ);
  practiceGrid.appendChild(tips);
  el.appendChild(practiceGrid);

  var targetCard=mk("section","",""); targetCard.className="shadow-target-card";
  targetCard.appendChild(mk("p","TARGET SENTENCE","font-size:13px;color:var(--text2);letter-spacing:.08em;font-weight:800;margin-bottom:14px;"));
  targetCard.appendChild(mk("p","„"+sentence.de+"”","font-size:clamp(30px,4.5vw,50px);font-weight:900;color:var(--primary);line-height:1.12;letter-spacing:-0.04em;margin-bottom:14px;"));
  targetCard.appendChild(mk("p","("+sentence.es+")","font-size:16px;color:var(--text2);font-style:italic;line-height:1.5;margin-bottom:24px;"));
  el.appendChild(targetCard);

  // ── Recording Visualization Area ──
  var visBox=mk("div","","min-height:150px;background:rgba(255,255,255,0.02);border:2px dashed rgba(255,255,255,0.08);border-radius:var(--r-xl,20px);padding:20px;margin:18px 0 16px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;transition:border-color 0.3s;");

  // Idle state
  var idleState=mk("div","","display:flex;flex-direction:column;align-items:center;gap:8px;");
  idleState.appendChild(mk("p","🎤","font-size:32px;margin-bottom:4px;"));
  idleState.appendChild(mk("p","Tocá para grabar","font-size:13px;color:var(--muted);font-weight:600;"));
  idleState.appendChild(mk("p","Mantené presionado para grabar","font-size:11px;color:var(--dim);font-weight:500;"));
  visBox.appendChild(idleState);

  // Recording state (hidden)
  var recState=mk("div","","display:none;flex-direction:column;align-items:center;gap:12px;width:100%;");
  var wave=mk("div","","display:flex;align-items:flex-end;gap:3px;height:28px;justify-content:center;margin-bottom:4px;");
  for(var wi=0;wi<5;wi++){
    var bar=mk("div","","width:4px;background:var(--teal);border-radius:2px;animation:waveBar 1s ease-in-out infinite;");
    bar.style.animationDelay=(wi*0.1)+"s";
    bar.style.animationDuration=(0.7+wi*0.15)+"s";
    wave.appendChild(bar);
  }
  recState.appendChild(wave);
  recState.appendChild(mk("p","Grabando...","font-size:14px;color:var(--text);font-weight:700;letter-spacing:0.02em;"));
  recState.appendChild(mk("p","Escuchando tu pronunciación","font-size:11px;color:var(--muted);font-weight:500;"));
  visBox.appendChild(recState);

  // Result state (hidden)
  var resultState=mk("div","","display:none;flex-direction:column;align-items:center;gap:14px;width:100%;");

  var scoreWrap=mk("div","","position:relative;width:96px;height:96px;display:flex;align-items:center;justify-content:center;");
  scoreWrap.innerHTML='<svg width="96" height="96" style="transform:rotate(-90deg);"><circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/><circle id="shadow-score-arc" cx="48" cy="48" r="40" fill="none" stroke="var(--green-text)" stroke-width="8" stroke-linecap="round" stroke-dasharray="251.2" stroke-dashoffset="251.2"/></svg>';
  var scoreText=mk("span","","position:absolute;font-size:22px;font-weight:900;color:var(--green-text);");
  scoreText.id="shadow-score-text";
  scoreWrap.appendChild(scoreText);
  resultState.appendChild(scoreWrap);

  var scoreLabel=mk("p","","font-size:16px;font-weight:700;color:var(--text);");
  scoreLabel.id="shadow-score-label";
  resultState.appendChild(scoreLabel);

  var transcriptionWrap=mk("div","","width:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:var(--r-md,12px);padding:12px;text-align:left;");
  transcriptionWrap.appendChild(mk("p","Transcripción:","font-size:10px;color:var(--muted);letter-spacing:1.5px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
  var transcriptionText=mk("p","","font-size:13px;color:var(--text);font-weight:600;line-height:1.5;");
  transcriptionText.id="shadow-transcript";
  transcriptionWrap.appendChild(transcriptionText);
  resultState.appendChild(transcriptionWrap);

  var feedbackWrap=mk("div","","width:100%;background:rgba(var(--teal-rgb),0.04);border:1px solid rgba(var(--teal-rgb),0.12);border-radius:var(--r-md,12px);padding:12px;text-align:left;");
  feedbackWrap.appendChild(mk("p","Feedback:","font-size:10px;color:var(--teal-text);letter-spacing:1.5px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
  var feedbackText=mk("p","","font-size:13px;color:var(--text);font-weight:500;line-height:1.5;");
  feedbackText.id="shadow-feedback";
  feedbackWrap.appendChild(feedbackText);
  resultState.appendChild(feedbackWrap);
  visBox.appendChild(resultState);
  el.appendChild(visBox);

  // ── Score display (hidden, used by renderPronScore) ──
  var scoreHost=mk("div","","margin-bottom:0;");
  el.appendChild(scoreHost);

  // ── Mic Button + Visual States ──
  var micWrap=mk("div","","display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:16px;");

  var pulseWrap=mk("div","","position:relative;");
  var pulseRing=mk("div","","display:none;position:absolute;inset:-10px;border-radius:50%;background:rgba(var(--red-rgb),0.12);animation:pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite;");
  pulseWrap.appendChild(pulseRing);

  var micBtn=makeMicBtn("var(--teal)",function(transcript){
    // Restore visual state
    idleState.style.display="none";
    recState.style.display="none";
    resultState.style.display="flex";
    visBox.style.borderColor="rgba(255,255,255,0.08)";
    pulseRing.style.display="none";
    micBtn.style.borderColor="var(--teal)";
    micBtn.style.color="var(--teal-text)";
    micBtn.style.background="rgba(var(--teal-rgb),0.08)";

    // Compute and render score
    renderPronScore(scoreHost, sentence.de, transcript, "var(--teal)");
    // Update visual elements from score
    updateVisualScore(sentence.de, transcript);

    logActivity("drillsDone",1); syncUp();
    nextBtn.style.display="block";
  });

  // Hook into click to show recording state before makeMicBtn's handler
  var origMicClick=micBtn.onclick;
  micBtn.onclick=function(e){
    idleState.style.display="none";
    resultState.style.display="none";
    recState.style.display="flex";
    visBox.style.borderColor="rgba(var(--teal-rgb),0.5)";
    pulseRing.style.display="block";
    micBtn.style.borderColor="var(--red)";
    micBtn.style.color="var(--red-text)";
    micBtn.style.background="rgba(var(--red-rgb),0.1)";
    // makeMicBtn toggles: first click starts recording, second stops
    // The onstop callback will restore visual state
    origMicClick.call(micBtn, e);
  };
  micBtn.style.cssText="width:64px;height:64px;border-radius:50%;font-size:10px;font-weight:800;letter-spacing:0.05em;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:2px solid var(--teal);background:rgba(var(--teal-rgb),0.08);color:var(--teal-text);cursor:pointer;transition:background 0.2s,border-color 0.2s,color 0.2s,transform 0.12s;box-shadow:0 4px 20px rgba(var(--teal-rgb),0.2);";
  micBtn.setAttribute("aria-label","Grabar tu voz para puntuar la pronunciación");

  pulseWrap.appendChild(micBtn);
  micWrap.appendChild(pulseWrap);
  micWrap.appendChild(mk("p","Tocá para grabar","font-size:12px;color:var(--muted);font-weight:600;margin-top:2px;"));
  el.appendChild(micWrap);

  // ── updateVisualScore helper ──
  function updateVisualScore(target, transcript){
    function normStr(s){return (s||"").toLowerCase().replace(/[.,!?¿¡;:"'()]/g,"").replace(/\s+/g," ").trim();}
    var tw=normStr(target).split(" "); var uw=normStr(transcript).split(" ");
    var total=tw.length||1; var correct=0;
    tw.forEach(function(w,i){if(uw[i]===w) correct++;});
    var score=Math.round((correct/total)*100);

    var arc=document.getElementById("shadow-score-arc");
    var scoreTxt=document.getElementById("shadow-score-text");
    var scoreLbl=document.getElementById("shadow-score-label");
    var transEl=document.getElementById("shadow-transcript");
    var fbEl=document.getElementById("shadow-feedback");

    if(arc&&scoreTxt){
      var circumference=251.2;
      var offset=circumference-(score/100)*circumference;
      arc.setAttribute("stroke-dashoffset",offset);
      arc.setAttribute("stroke",score>=80?"var(--green-text)":score>=50?"var(--gold-text)":"var(--red-text)");
      scoreTxt.textContent=score+"%";
      scoreTxt.style.color=score>=80?"var(--green-text)":score>=50?"var(--gold-text)":"var(--red-text)";
    }
    if(scoreLbl){
      if(score>=90) scoreLbl.textContent="¡Excelente!";
      else if(score>=70) scoreLbl.textContent="Muy bien";
      else if(score>=50) scoreLbl.textContent="Buen intento";
      else scoreLbl.textContent="Seguí practicando";
    }
    if(transEl) transEl.textContent=transcript||"(no se detectó voz)";
    if(fbEl){
      var missedWords=tw.filter(function(w,i){return uw[i]!==w;});
      if(missedWords.length&&score<90) fbEl.textContent="Practicá estas palabras: "+missedWords.join(", ");
      else if(score>=90) fbEl.textContent="¡Pronunciación casi perfecta!";
      else fbEl.textContent="Intentá de nuevo, cada vez sale mejor.";
    }
  }

  // ── Bottom Actions ──
  var bottomRow=mk("div","","display:flex;gap:8px;");

  var nextBtn=mk("button","Siguiente →","flex:1;padding:12px;border-radius:var(--r-md,12px);border:1px solid rgba(var(--gold-rgb),0.25);background:rgba(var(--gold-rgb),0.08);color:var(--gold-text);font-size:13px;font-weight:700;cursor:pointer;transition:background 0.2s,transform 0.12s;");
  nextBtn.onclick=function(){state.shadowing.idx++;renderShadowing();};
  bottomRow.appendChild(nextBtn);

  var aiBtn=mk("button","🤖 Generar con IA","padding:12px 14px;border-radius:var(--r-md,12px);border:1px solid rgba(var(--purple-rgb),0.25);background:rgba(var(--purple-rgb),0.08);color:var(--purple-text);font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;");
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
  bottomRow.appendChild(aiBtn);
  el.appendChild(bottomRow);

  // Reset button
  var resetBtn=mk("button","↻ Reiniciar frases","width:100%;background:transparent;border:1px dashed rgba(255,255,255,0.1);color:var(--muted);border-radius:var(--r-md,12px);padding:10px;font-size:12px;font-weight:600;margin-top:12px;cursor:pointer;");
  resetBtn.onclick=function(){state.shadowing.pool=SHADOWING_POOL.slice().sort(function(){return Math.random()-0.5;});state.shadowing.idx=0;renderShadowing();};
  el.appendChild(resetBtn);
}
