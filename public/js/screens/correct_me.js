// ── Correct me ────────────────────────────────────────────────────────────────
function renderCorrectMe() {
  const el=document.getElementById("s-corrigeme"); el.innerHTML="";

  // ── Header ──
  const hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","CORRECTOR DE ALEMÁN","font-size:11px;color:var(--muted);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","Corrígeme","font-size:24px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  hdr.appendChild(mk("p","Escribí o grabá lo que intentaste decir.","font-size:13px;color:var(--muted);margin-top:4px;font-weight:500;"));
  el.appendChild(hdr);

  // ── Input Card ──
  const inputCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:var(--s-4);margin-bottom:var(--s-3);box-shadow:0 4px 20px rgba(0,0,0,0.15);");

  // Language badge + clear row
  const badgeRow=mk("div","","display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;");
  const langBadge=mk("span","Deutsch","display:inline-block;background:rgba(var(--teal-rgb),0.10);border:1px solid rgba(var(--teal-rgb),0.25);color:var(--teal-text);border-radius:var(--r-pill);padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;");
  badgeRow.appendChild(langBadge);
  // clear button
  const clearBtn=mk("button","Borrar","background:none;border:none;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;padding:4px 8px;border-radius:6px;transition:color 0.2s;");
  clearBtn.onclick=function(){ta.value="";ta.focus();};
  badgeRow.appendChild(clearBtn);
  inputCard.appendChild(badgeRow);

  // Textarea + mic row
  const row=mk("div","","display:flex;gap:8px;align-items:flex-start;");
  const ta=document.createElement("textarea"); ta.rows=5; ta.placeholder="Schreibe hier auf Deutsch..."; ta.setAttribute("aria-label","Tu frase en alemán");
  ta.style.cssText="flex:1;background:transparent;border:none;outline:none;font-size:18px;color:var(--text);resize:none;font-family:inherit;font-weight:500;line-height:1.6;min-height:120px;";
  ta.onfocus=function(){inputCard.style.borderColor="var(--teal-text)";inputCard.style.boxShadow="0 4px 20px rgba(var(--teal-rgb),0.12)";};
  ta.onblur=function(){inputCard.style.borderColor="var(--border)";inputCard.style.boxShadow="0 4px 20px rgba(0,0,0,0.15)";};
  const mic=makeMicBtn("#5dd9d0",function(t){ta.value=t;doFix(ta,fixBtn,el);});
  row.appendChild(ta); row.appendChild(mic); inputCard.appendChild(row);

  // Fix button inside card
  const fixRow=mk("div","","display:flex;justify-content:flex-end;margin-top:16px;");
  const fixBtn=document.createElement("button");
  fixBtn.className="fix-btn-lg teal";
  fixBtn.innerHTML='<span style="display:inline-flex;align-items:center;gap:6px;"><span>✨</span> Corregir →</span>';
  fixBtn.onclick=function(){doFix(ta,fixBtn,el);};
  fixRow.appendChild(fixBtn);
  inputCard.appendChild(fixRow);

  el.appendChild(inputCard);
}

async function doFix(ta, fixBtn, el) {
  const text=ta.value.trim(); if(!text){ showToast("Escribí algo primero","error"); return; }
  ta.disabled=true; fixBtn.disabled=true; fixBtn.innerHTML=""; fixBtn.appendChild(makeDots("#5dd9d0"));
  const old=el.querySelector("#fix-result"); if(old) el.removeChild(old);
  try {
    const sys="You are a friendly German corrector. Reply ONLY with valid JSON, no markdown: {\"correcto\":\"correct German phrase\",\"errores\":\"what was wrong in Spanish max 2 lines\",\"alternativa\":\"more natural version\",\"pronunciacion\":\"simplified pronunciation\"}";
    const reply=await ai(sys,[{role:"user",content:text}]);
    const r=JSON.parse(reply.replace(/```json|```/g,"").trim());
    if(r.correcto&&r.correcto.trim()!==text.trim()) logError("corrigeme", text, r.correcto, r.errores||"");
    const result=document.createElement("div"); result.id="fix-result"; result.style.marginTop="16px";

    // ── Section label ──
    result.appendChild(mk("p","RESULTADOS","font-size:11px;color:var(--muted);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:12px;"));

    // ── Side-by-side: Original vs Corrected ──
    const grid=mk("div","","display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;");

    // Original box
    const errBox=document.createElement("div");
    errBox.className="result-box red";
    errBox.style.padding="16px";
    errBox.appendChild(mk("p","⚠️  ORIGINAL","font-size:10px;color:var(--red-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:8px;font-weight:700;"));
    errBox.appendChild(mk("p",text,"font-size:16px;color:var(--text2);font-weight:600;line-height:1.5;text-decoration:line-through;text-decoration-color:rgba(var(--red-rgb),0.4);"));
    grid.appendChild(errBox);

    // Corrected box
    const okBox=document.createElement("div");
    okBox.className="result-box green";
    okBox.style.padding="16px";
    okBox.appendChild(mk("p","✅  CORRECCIÓN","font-size:10px;color:var(--green-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:8px;font-weight:700;"));
    const rowC=mk("div","","display:flex;justify-content:space-between;align-items:center;gap:8px;");
    rowC.appendChild(mk("p",r.correcto,"font-size:18px;font-weight:800;color:var(--text);flex:1;letter-spacing:-0.01em;line-height:1.4;"));
    const pc=document.createElement("button"); pc.className="icon-btn"; pc.setAttribute("aria-label","Escuchar");pc.innerHTML="&#9654;"; pc.style.color="var(--green-text)"; pc.style.fontSize="20px";
    pc.onclick=function(){speakGerman(r.correcto);}; rowC.appendChild(pc); okBox.appendChild(rowC);
    okBox.appendChild(mk("p","/"+r.pronunciacion+"/","font-size:12px;color:var(--muted);margin-top:6px;font-weight:500;"));
    grid.appendChild(okBox);
    result.appendChild(grid);

    // ── Pronunciation practice in a card ──
    const pronCard=document.createElement("div");
    pronCard.className="result-box surface";
    pronCard.style.cssText="padding:14px;margin-bottom:12px;";
    const pronRow=mk("div","","display:flex;align-items:center;justify-content:space-between;gap:8px;");
    const pronLbl=mk("span","🎤 Practicar pronunciación","font-size:13px;color:var(--green-text);font-weight:700;");
    const pronMic=makePronMicBtn("#7bd89b", r.correcto, pronCard);
    pronRow.appendChild(pronLbl); pronRow.appendChild(pronMic);
    pronCard.appendChild(pronRow);
    result.appendChild(pronCard);

    // ── What to improve card (if errors) ──
    if(r.errores){
      const box2=document.createElement("div");
      box2.className="result-box red";
      box2.style.padding="16px"; box2.style.marginBottom="12px";
      box2.appendChild(mk("p","🔍  QUÉ MEJORAR","font-size:10px;color:var(--red-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:8px;font-weight:700;"));
      box2.appendChild(mk("p",r.errores,"font-size:14px;color:var(--text2);font-weight:500;line-height:1.7;"));
      result.appendChild(box2);
    }

    // ── More natural alternative ──
    if(r.alternativa){
      const box3=document.createElement("div");
      box3.className="result-box purple";
      box3.style.padding="16px"; box3.style.marginBottom="12px";
      box3.appendChild(mk("p","💬  MÁS NATURAL","font-size:10px;color:var(--purple-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:8px;font-weight:700;"));
      const rowA=mk("div","","display:flex;justify-content:space-between;align-items:center;gap:8px;");
      rowA.appendChild(mk("p",r.alternativa,"font-size:16px;color:var(--text);flex:1;font-weight:700;line-height:1.4;"));
      const pa=document.createElement("button"); pa.className="icon-btn"; pa.setAttribute("aria-label","Escuchar");pa.innerHTML="&#9654;"; pa.style.color="var(--purple-text)"; pa.style.fontSize="20px";
      pa.onclick=function(){speakGerman(r.alternativa);}; rowA.appendChild(pa); box3.appendChild(rowA);
      result.appendChild(box3);
    }

    // ── Reset button ──
    const reset=document.createElement("button");
    reset.className="reset-btn";
    reset.style.cssText="margin-top:4px;";
    reset.textContent="Corregir otra frase";
    reset.onclick=renderCorrectMe;
    result.appendChild(reset);

    el.appendChild(result);
  } catch(e){
    el.appendChild(mk("p","Error al corregir. Intentá de nuevo.","color:var(--red-text);font-size:13px;text-align:center;margin-top:10px;font-weight:500;"));
  }
  ta.disabled=false; fixBtn.disabled=false;
  fixBtn.innerHTML='<span style="display:inline-flex;align-items:center;gap:6px;"><span>✨</span> Corregir →</span>';
}
