// ── TTS ───────────────────────────────────────────────────────────────────────
state.app._deVoice = null;
function loadDeVoice() {
  const voices = window.speechSynthesis.getVoices();
  // Prioritise a real German voice: exact de-DE → any de* → null
  state.app._deVoice = voices.find(function(v){return /^de[-_]DE/i.test(v.lang);})
          || voices.find(function(v){return v.lang && v.lang.toLowerCase().indexOf("de")===0;})
          || null;
}
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = loadDeVoice;
  loadDeVoice();
}
state.app._noDeVoiceWarned = false;
state.app._reviewPlan = null; // {steps:[{type,topic?}], currentStep, done} — daily review session plan
function makeGermanUtterance(text) {
  if (!window.speechSynthesis) return;
  if (!state.app._deVoice) loadDeVoice();  // retry in case the voices loaded late
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE"; u.rate = parseFloat(localStorage.getItem("ttsRate")||"0.82");
  if (state.app._deVoice) u.voice = state.app._deVoice;
  else if (!state.app._noDeVoiceWarned) {
    state.app._noDeVoiceWarned = true;
    showToast("Sin voz alemana en tu dispositivo — instala una en Ajustes del sistema (Voz/Spoken Content) para mejor pronunciación", "info", 6000);
  }
  return u;
}
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = makeGermanUtterance(text);
  window.speechSynthesis.speak(u);
}
// TTS solo del alemán: quita traducciones y bloques de corrección antes de leer.
function speakGerman(text) {
  var t=String(text||"");
  t=t
    .replace(/\([^)]*\)/g," ")
    .replace(/Spanish translation\s*:.*$/gim," ")
    .replace(/Traducci[oó]n\s*:.*$/gim," ")
    .replace(/Better:\s*[\s\S]*$/i," ")
    .replace(/\s{2,}/g," ")
    .trim();
  if(t) speak(t);
}
function splitSpeechChunks(text) {
  var clean=(text||"").replace(/\s+/g," ").trim();
  if(!clean) return [];
  var parts=clean.match(/[^.!?;:]+[.!?;:]?/g)||[clean];
  var chunks=[], current="";
  parts.forEach(function(part){
    part=part.trim(); if(!part) return;
    if((current+" "+part).trim().length>170 && current){ chunks.push(current.trim()); current=part; }
    else current=(current+" "+part).trim();
  });
  if(current) chunks.push(current.trim());
  return chunks;
}
function speakFull(text, onDone) {
  if (!window.speechSynthesis) { if(onDone) onDone(); return; }
  var chunks=splitSpeechChunks(text);
  var seq=(state.app._ttsSeq||0)+1; state.app._ttsSeq=seq;
  window.speechSynthesis.cancel();
  function next(i){
    if(seq!==state.app._ttsSeq) return;
    if(i>=chunks.length){ if(onDone) onDone(); return; }
    var u=makeGermanUtterance(chunks[i]);
    u.onend=function(){ next(i+1); };
    u.onerror=function(){ next(i+1); };
    window.speechSynthesis.speak(u);
  }
  next(0);
}
// ── AssemblyAI ────────────────────────────────────────────────────────────────
async function transcribe(blob, mimeType) {
  if (!blob || blob.size < 1000) throw new Error("Audio muy corto, habla un poco mas.");
  const headers = {"content-type": mimeType || "audio/webm", "x-token": state.app.authToken||""};

  const upRes = await fetch("/api/upload", {method:"POST", headers:headers, body:blob});
  const up = await upRes.json();
  if (!up.upload_url) throw new Error("Error al subir el audio: "+(up.error||JSON.stringify(up)));

  const txRes = await fetch("/api/transcript", {
    method:"POST",
    headers:{"content-type":"application/json","x-token":state.app.authToken||""},
    body:JSON.stringify({audio_url:up.upload_url, language_code:"de"})
  });
  const tx = await txRes.json();
  if (!tx.id) throw new Error("Error al iniciar transcripcion: "+(tx.error||JSON.stringify(tx)));

  for (let i=0; i<25; i++) {
    await new Promise(function(r){setTimeout(r,2500);});
    const p = await (await fetch("/api/transcript/"+tx.id, {headers:{"x-token":state.app.authToken||""}})).json();
    if (p.status==="completed") return p.text || "";
    if (p.status==="error") throw new Error("AssemblyAI error: "+(p.error||"desconocido"));
  }
  throw new Error("Timeout: la transcripcion tardo demasiado.");
}

// ── Mic ───────────────────────────────────────────────────────────────────────
state.app.mr=null, state.app.chunks=[];

function accentTextForColor(color) {
  switch((color||"").toLowerCase()){
    case "#ffb955": return "var(--gold-text)";
    case "#5dd9d0": return "var(--teal-text)";
    case "#c4a7e7": return "var(--purple-text)";
    case "#4ade80":
    case "#7bd89b": return "var(--green-text)";
    case "#ffb4ab":
    case "#ef4444": return "var(--red-text)";
    default: return color||"var(--teal-text)";
  }
}

function setMicAccent(btn, color) {
  const c=color||"#5dd9d0";
  btn.style.borderColor=c;
  btn.style.color=accentTextForColor(c);
  btn.style.background="rgba("+hexToRgb(c)+",0.08)";
}

// Pick the best audio format supported by this browser/device
function getBestMimeType() {
  const types = ["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/mp4","audio/aac",""];
  for (let i=0; i<types.length; i++) {
    if (!types[i] || MediaRecorder.isTypeSupported(types[i])) return types[i];
  }
  return "";
}

// Audio visualizer: draws frequency bars on canvas. Returns {stop()} control.
// Never throws — returns silent no-op if setup fails.
function startAudioViz(stream, canvasEl){
  try{var audioCtx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){return{stop:function(){}};}
  var analyser, source, bufLen, dataArr, ctx, raf;
  try{
    analyser=audioCtx.createAnalyser();
    analyser.fftSize=64;
    source=audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    bufLen=analyser.frequencyBinCount;
    dataArr=new Uint8Array(bufLen);
    ctx=canvasEl.getContext("2d");
    canvasEl.style.display="block";
  }catch(e){
    try{audioCtx.close();}catch(ee){}
    return{stop:function(){canvasEl.style.display="none";}};
  }
  function frame(){
    raf=requestAnimationFrame(frame);
    analyser.getByteFrequencyData(dataArr);
    var w=canvasEl.width, h=canvasEl.height, barGap=2, barW=(w-(bufLen-1)*barGap)/bufLen;
    ctx.clearRect(0,0,w,h);
    for(var i=0;i<bufLen;i++){
      var bh=dataArr[i]/255*h;
      var grad=ctx.createLinearGradient(0,h,0,h-bh);
      grad.addColorStop(0,"#5dd9d0"); // --teal
      grad.addColorStop(1,"#ffb955"); // --gold
      ctx.fillStyle=grad;
      ctx.fillRect(i*(barW+barGap),h-bh,barW,bh);
    }
  }
  frame();
  return {stop:function(){
    if(raf){cancelAnimationFrame(raf);raf=null;}
    try{if(audioCtx&&audioCtx.state!=="closed")audioCtx.close();}catch(e){}
    canvasEl.style.display="none";
  }};
}

function makeMicBtn(color, cb, vizCanvas) {
  const btn = document.createElement("button");
  btn.className="mic-btn";
  setMicAccent(btn, color);
  btn.textContent="MIC";
  var viz=null;
  btn.onclick=async function(){
    if (state.app.mr&&state.app.mr.state==="recording") { state.app.mr.stop(); if(viz)viz.stop(); viz=null; return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      if(vizCanvas) viz=startAudioViz(stream, vizCanvas);
      state.app.chunks=[];
      const mimeType = getBestMimeType();
      state.app.mr = mimeType ? new MediaRecorder(stream, {mimeType:mimeType}) : new MediaRecorder(stream);
      state.app.mr.ondataavailable=function(e){ if(e.data&&e.data.size>0) state.app.chunks.push(e.data); };
      state.app.mr.onstop=async function(){
        stream.getTracks().forEach(function(t){t.stop();});
        if(viz){viz.stop();viz=null;}
        btn.textContent="..."; btn.style.borderColor="var(--border)"; btn.style.color="var(--muted)"; btn.style.animation="none";
        const usedType = state.app.mr.mimeType || mimeType || "audio/webm";
        try {
          const blob = new Blob(state.app.chunks, {type:usedType});
          const text = await transcribe(blob, usedType);
          btn.textContent="MIC"; setMicAccent(btn, color);
          if (text && text.trim() && cb) cb(text.trim());
          else if (!text || !text.trim()) showMicError(btn, color, "No se detecto voz. Intenta de nuevo.");
        } catch(err) {
          showMicError(btn, color, err.message);
        }
      };
      state.app.mr.start(250); // 250ms timeslice to capture chunks continuously
      btn.textContent="STOP"; btn.style.borderColor="var(--red)"; btn.style.color="var(--red-text)"; btn.style.animation="ring 1.2s infinite";
    } catch(e){
      if(viz){viz.stop();viz=null;}
      alert("Permite el acceso al microfono en tu browser.");
    }
  };
  return btn;
}

// Mic button that records, transcribes, then scores against a target phrase.
// Renders the score inline inside `host`.
function makePronMicBtn(color, targetPhrase, host, vizCanvas){
  const btn=document.createElement("button");
  btn.className="mic-btn";
  setMicAccent(btn, color);
  btn.style.minWidth="60px";
  btn.textContent="MIC";
  var viz=null;
  btn.onclick=async function(){
    if(state.app.mr&&state.app.mr.state==="recording"){ state.app.mr.stop(); if(viz)viz.stop(); viz=null; return; }
    try {
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      if(vizCanvas) viz=startAudioViz(stream, vizCanvas);
      state.app.chunks=[];
      const mimeType=getBestMimeType();
      state.app.mr = mimeType ? new MediaRecorder(stream,{mimeType:mimeType}) : new MediaRecorder(stream);
      state.app.mr.ondataavailable=function(e){ if(e.data&&e.data.size>0) state.app.chunks.push(e.data); };
      state.app.mr.onstop=async function(){
        stream.getTracks().forEach(function(t){t.stop();});
        if(viz){viz.stop();viz=null;}
        btn.textContent="..."; btn.style.borderColor="var(--border)"; btn.style.color="var(--muted)"; btn.style.animation="none";
        const usedType=state.app.mr.mimeType||mimeType||"audio/webm";
        try {
          const blob=new Blob(state.app.chunks,{type:usedType});
          const transcript=await transcribe(blob, usedType);
          btn.textContent="MIC"; setMicAccent(btn, color);
          renderPronScore(host, targetPhrase, transcript||"", color);
        } catch(err){ showMicError(btn, color, err.message); }
      };
      state.app.mr.start(250);
      btn.textContent="STOP"; btn.style.borderColor="var(--red)"; btn.style.color="var(--red-text)"; btn.style.animation="ring 1.2s infinite";
    } catch(e){ if(viz){viz.stop();viz=null;} alert("Permite el acceso al microfono."); }
  };
  return btn;
}

function renderPronScore(host, target, transcript, color){
  // Remove previous score block if any
  const old=host.querySelector(".pron-score"); if(old) old.remove();
  function norm(s){ return (s||"").toLowerCase().replace(/[.,!?¿¡;:"'()]/g,"").replace(/\s+/g," ").trim(); }
  const tw=norm(target).split(" "); const uw=norm(transcript).split(" ");
  const total=tw.length||1; let correct=0;
  const wordSpans=[];
  tw.forEach(function(w,i){
    const got=uw[i]||"";
    const ok=got===w;
    if(ok) correct++;
    wordSpans.push({w:w, got:got, ok:ok});
  });
  const score=Math.round((correct/total)*100);
  const box=document.createElement("div");
  box.className="pron-score";
  box.style.cssText="margin-top:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;";
  const top=mk("div","","display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;");
  top.appendChild(mk("span","Pronunciacion","font-size:11px;color:var(--muted);letter-spacing:1.5px;font-family:var(--font-label);font-weight:700;"));
  top.appendChild(mk("span",score+"%","font-size:20px;font-weight:900;color:"+(score>=80?"var(--green-text)":score>=50?"var(--gold-text)":"var(--red-text)")+";"));
  box.appendChild(top);
  const p=mk("p","","font-size:14px;line-height:1.6;font-weight:600;");
  wordSpans.forEach(function(s){
    const sp=document.createElement("span");
    sp.textContent=(s.got||"_")+" ";
    sp.style.color=s.ok?"var(--green-text)":"var(--red-text)";
    sp.style.textDecoration=s.ok?"none":"underline";
    p.appendChild(sp);
  });
  box.appendChild(p);
  if(transcript) box.appendChild(mk("p","Detectado: "+transcript,"font-size:11px;color:var(--muted);margin-top:6px;font-weight:500;"));
  host.appendChild(box);
}

function showMicError(btn, color, msg) {
  btn.textContent="MIC"; setMicAccent(btn, color);
  // Show the error visibly without interrupting the flow
  const errEl = document.createElement("div");
  errEl.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--modal-bg);border:1px solid rgba(var(--red-rgb),0.4);color:var(--red-text);border-radius:12px;padding:10px 18px;font-size:13px;font-weight:600;z-index:9999;max-width:300px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.5);";
  errEl.textContent="🎤 "+msg;
  document.body.appendChild(errEl);
  setTimeout(function(){if(errEl.parentNode) errEl.parentNode.removeChild(errEl);}, 4000);
}
