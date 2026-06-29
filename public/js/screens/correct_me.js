// ── Correct me ────────────────────────────────────────────────────────────────
function renderCorrectMe() {
  const el=document.getElementById("s-corrigeme"); el.innerHTML="";
  const hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","CORRECTOR DE ALEMAN","font-size:11px;color:var(--muted);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","Corrigeme","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  hdr.appendChild(mk("p","Escribe o graba lo que intentaste decir.","font-size:13px;color:var(--muted);margin-top:4px;font-weight:500;"));
  el.appendChild(hdr);

  const row=mk("div","","display:flex;gap:8px;align-items:flex-start;margin-bottom:12px;");
  const ta=document.createElement("textarea"); ta.rows=3; ta.placeholder="ej: Ich bin haben sehr mude heute..."; ta.setAttribute("aria-label","Tu frase en alemán");
  ta.style.cssText="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(var(--red-rgb),0.2);border-radius:14px;padding:13px 15px;font-size:14px;color:var(--text);outline:none;resize:none;font-family:inherit;font-weight:500;transition:border-color 0.2s;";
  ta.onfocus=function(){this.style.borderColor="rgba(var(--red-rgb),0.45)";};
  ta.onblur=function(){this.style.borderColor="rgba(var(--red-rgb),0.2)";};
  const mic=makeMicBtn("#ffb4ab",function(t){ta.value=t;doFix(ta,fixBtn,el);});
  row.appendChild(ta); row.appendChild(mic); el.appendChild(row);
  const fixBtn=document.createElement("button");
  fixBtn.className="fix-btn-lg red";
  fixBtn.textContent="Corregir mi alemán ✏️";
  fixBtn.onclick=function(){doFix(ta,fixBtn,el);};
  el.appendChild(fixBtn);
}

async function doFix(ta, fixBtn, el) {
  const text=ta.value.trim(); if(!text){ showToast("Escribe algo primero","error"); return; }
  ta.disabled=true; fixBtn.disabled=true; fixBtn.textContent=""; fixBtn.appendChild(makeDots("#ffb4ab"));
  const old=el.querySelector("#fix-result"); if(old) el.removeChild(old);
  try {
    const sys="You are a friendly German corrector. Reply ONLY with valid JSON, no markdown: {\"correcto\":\"correct German phrase\",\"errores\":\"what was wrong in Spanish max 2 lines\",\"alternativa\":\"more natural version\",\"pronunciacion\":\"simplified pronunciation\"}";
    const reply=await ai(sys,[{role:"user",content:text}]);
    const r=JSON.parse(reply.replace(/```json|```/g,"").trim());
    if(r.correcto&&r.correcto.trim()!==text.trim()) logError("corrigeme", text, r.correcto, r.errores||"");
    const result=document.createElement("div"); result.id="fix-result"; result.style.marginTop="16px";

    const box1=document.createElement("div");
    box1.className="result-box green";
    box1.appendChild(mk("p","✅  CORRECTO","font-size:10px;color:var(--green-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:8px;font-weight:700;"));
    const rowC=mk("div","","display:flex;justify-content:space-between;align-items:center;gap:8px;");
    rowC.appendChild(mk("p",r.correcto,"font-size:20px;font-weight:800;color:var(--text);flex:1;letter-spacing:-0.01em;"));
    const pc=document.createElement("button"); pc.className="icon-btn"; pc.setAttribute("aria-label","Escuchar");pc.innerHTML="&#9654;"; pc.style.color="var(--green-text)"; pc.style.fontSize="20px";
    pc.onclick=function(){speakGerman(r.correcto);}; rowC.appendChild(pc); box1.appendChild(rowC);
    box1.appendChild(mk("p","/"+r.pronunciacion+"/","font-size:12px;color:var(--muted);margin-top:6px;font-weight:500;"));

    // Pronunciation practice
    const pronRow=mk("div","","display:flex;align-items:center;gap:8px;margin-top:12px;");
    const pronLbl=mk("span","🎤 Practicar pronunciación","font-size:12px;color:var(--green-text);font-weight:700;flex:1;");
    const pronMic=makePronMicBtn("#4ade80", r.correcto, box1);
    pronRow.appendChild(pronLbl); pronRow.appendChild(pronMic);
    box1.appendChild(pronRow);

    result.appendChild(box1);

    if(r.errores){
      const box2=document.createElement("div");
      box2.className="result-box red";
      box2.style.padding="16px";
      box2.appendChild(mk("p","⚠️  QUE MEJORAR","font-size:10px;color:var(--red-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:6px;font-weight:700;"));
      box2.appendChild(mk("p",r.errores,"font-size:14px;color:var(--text2);font-weight:500;line-height:1.6;"));
      result.appendChild(box2);
    }
    if(r.alternativa){
      const box3=document.createElement("div");
      box3.className="result-box purple";
      box3.style.padding="16px";
      box3.appendChild(mk("p","💬  MAS NATURAL","font-size:10px;color:var(--purple-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:6px;font-weight:700;"));
      const rowA=mk("div","","display:flex;justify-content:space-between;align-items:center;gap:8px;");
      rowA.appendChild(mk("p",r.alternativa,"font-size:15px;color:var(--text);flex:1;font-weight:600;"));
      const pa=document.createElement("button"); pa.className="icon-btn"; pa.setAttribute("aria-label","Escuchar");pa.innerHTML="&#9654;"; pa.style.color="var(--purple-text)"; pa.style.fontSize="20px";
      pa.onclick=function(){speakGerman(r.alternativa);}; rowA.appendChild(pa); box3.appendChild(rowA);
      result.appendChild(box3);
    }
    const reset=document.createElement("button");
    reset.className="reset-btn";
    reset.textContent="Corregir otra frase";
    reset.onclick=renderCorrectMe; result.appendChild(reset);
    el.appendChild(result);
  } catch(e){
    el.appendChild(mk("p","Error al corregir. Intenta de nuevo.","color:var(--red-text);font-size:13px;text-align:center;margin-top:10px;font-weight:500;"));
  }
  ta.disabled=false; fixBtn.disabled=false; fixBtn.textContent="Corregir mi alemán ✏️";
}
