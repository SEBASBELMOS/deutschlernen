// ── Shadowing (pronunciation with German transcription) ───────────────────────
function renderShadowing(){
  const el=document.getElementById("s-shadowing"); el.innerHTML="";
  const hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","SOMBRA — PRONUNCIACIÓN","font-size:11px;color:var(--muted);letter-spacing:2px;font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","Shadowing","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  hdr.appendChild(mk("p","Escucha en alemán, graba tu voz y compará la pronunciación. La transcripción usa alemán (de-DE).","font-size:13px;color:var(--muted);margin-top:4px;font-weight:500;"));
  el.appendChild(hdr);

  // Init pool
  if(!state.shadowing||!state.shadowing.pool||!state.shadowing.pool.length){
    state.shadowing={pool:[],idx:0};
    state.shadowing.pool=SHADOWING_POOL.slice().sort(function(){return Math.random()-0.5;});
    state.shadowing.idx=0;
  }
  if(state.shadowing.idx>=state.shadowing.pool.length){state.shadowing.idx=0;state.shadowing.pool=SHADOWING_POOL.slice().sort(function(){return Math.random()-0.5;});}

  var sentence=state.shadowing.pool[state.shadowing.idx];

  // Counter
  el.appendChild(mk("p",(state.shadowing.idx+1)+" / "+state.shadowing.pool.length+"  ·  "+sentence.es,"color:var(--muted);font-size:12px;font-weight:600;margin-bottom:10px;"));

  // Sentence card
  var card=mk("div","","background:rgba(78,205,196,0.04);border:1px solid rgba(78,205,196,0.15);border-radius:16px;padding:22px;margin-bottom:14px;text-align:center;");
  card.appendChild(mk("p",sentence.de,"font-size:19px;font-weight:800;color:var(--text);line-height:1.55;margin-bottom:6px;letter-spacing:-0.01em;"));
  card.appendChild(mk("p",sentence.es,"font-size:13px;color:var(--muted);font-weight:500;"));
  el.appendChild(card);

  // Listen button
  var playRow=mk("div","","display:flex;gap:8px;margin-bottom:14px;");
  var playBtn=mk("button","▶  Escuchar","flex:1;padding:14px;border-radius:14px;border:none;background:rgba(78,205,196,0.12);color:var(--teal-text);font-size:15px;font-weight:800;cursor:pointer;transition:opacity 0.2s;");
  playBtn.onclick=function(){speak(sentence.de);};
  playRow.appendChild(playBtn);
  el.appendChild(playRow);

  // Score host
  var scoreHost=mk("div","","margin-bottom:10px;");
  el.appendChild(scoreHost);

  // Mic row
  var micRow=mk("div","","display:flex;align-items:center;gap:10px;margin-bottom:16px;");
  micRow.appendChild(mk("span","🎤  Repetir — graba tu voz","font-size:14px;color:var(--teal-text);font-weight:700;flex:1;"));
  var micBtn=makeMicBtn("#4ECDC4",function(transcript){
    renderPronScore(scoreHost, sentence.de, transcript, "#4ECDC4"); logActivity("drillsDone",1); syncUp();
    nextBtn.style.display="block";
  });
  micBtn.setAttribute("aria-label","Grabar tu voz para puntuar la pronunciación"); micRow.appendChild(micBtn);
  el.appendChild(micRow);

  // Next / AI buttons
  var bottomRow=mk("div","","display:flex;gap:8px;");
  var nextBtn=mk("button","Siguiente frase →","flex:1;padding:12px;border-radius:12px;border:none;background:rgba(245,166,35,0.1);color:var(--gold-text);font-size:13px;font-weight:800;cursor:pointer;display:none;");
  nextBtn.onclick=function(){state.shadowing.idx++;renderShadowing();};
  bottomRow.appendChild(nextBtn);
  var aiBtn=mk("button","🤖 Generar con IA","padding:12px 14px;border-radius:12px;border:1px solid rgba(167,139,250,0.25);background:rgba(167,139,250,0.08);color:var(--purple-text);font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;");
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
  var resetBtn=mk("button","↻ Reiniciar frases","width:100%;background:transparent;border:1px dashed rgba(255,255,255,0.1);color:var(--muted);border-radius:12px;padding:10px;font-size:12px;font-weight:600;margin-top:12px;cursor:pointer;");
  resetBtn.onclick=function(){state.shadowing.pool=SHADOWING_POOL.slice().sort(function(){return Math.random()-0.5;});state.shadowing.idx=0;renderShadowing();};
  el.appendChild(resetBtn);
}
