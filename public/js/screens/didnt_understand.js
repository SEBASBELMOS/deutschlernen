// ── Didn’t understand ─────────────────────────────────────────────────────────
function renderDidntUnderstand() {
  const el=document.getElementById("s-noentendi"); el.innerHTML="";
  const hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","TRADUCTOR CONTEXTUAL","font-size:11px;color:var(--muted);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","No entendi","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  hdr.appendChild(mk("p","Escuchaste algo en aleman? Escribe o graba aqui.","font-size:13px;color:var(--muted);margin-top:4px;font-weight:500;"));
  el.appendChild(hdr);

  const row=mk("div","","display:flex;gap:8px;align-items:flex-start;margin-bottom:12px;");
  const ta=document.createElement("textarea"); ta.rows=3; ta.placeholder="Escribe lo que escuchaste..."; ta.setAttribute("aria-label","Frase que escuchaste");
  ta.style.cssText="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(var(--teal-rgb),0.2);border-radius:14px;padding:13px 15px;font-size:14px;color:var(--text);outline:none;resize:none;font-family:inherit;font-weight:500;transition:border-color 0.2s;";
  ta.onfocus=function(){this.style.borderColor="rgba(var(--teal-rgb),0.5)";};
  ta.onblur=function(){this.style.borderColor="rgba(var(--teal-rgb),0.2)";};
  const mic=makeMicBtn("#5dd9d0",function(t){ta.value=t;doExplain(ta,explainBtn,el);});
  row.appendChild(ta); row.appendChild(mic); el.appendChild(row);
  const explainBtn=document.createElement("button");
  explainBtn.className="fix-btn-lg teal";
  explainBtn.textContent="Explicame esto 🔍";
  explainBtn.onclick=function(){doExplain(ta,explainBtn,el);};
  el.appendChild(explainBtn);
}

async function doExplain(ta, btn, el) {
  const text=ta.value.trim(); if(!text){ showToast("Escribe algo primero","error"); return; }
  ta.disabled=true; btn.disabled=true; btn.textContent=""; btn.appendChild(makeDots("#5dd9d0"));
  const old=el.querySelector("#ni-result"); if(old) el.removeChild(old);
  try {
    const sys="You are a German language expert helping a Spanish speaker understand German. Reply ONLY with valid JSON, no markdown: {\"original\":\"the German text cleaned\",\"significado\":\"what it means in Spanish\",\"contexto\":\"when and why this is used\",\"palabras\":[{\"de\":\"key word\",\"es\":\"meaning\"}],\"respuesta\":\"how Sebastian could respond in German\",\"pronunciacion\":\"simplified pronunciation\"}";
    const reply=await ai(sys,[{role:"user",content:text}]);
    const r=JSON.parse(reply.replace(/```json|```/g,"").trim());
    const result=document.createElement("div"); result.id="ni-result"; result.style.marginTop="16px";

    const box1=document.createElement("div");
    box1.className="result-box teal";
    const rowO=mk("div","","display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px;");
    rowO.appendChild(mk("p",r.original,"font-size:20px;font-weight:800;color:var(--text);flex:1;letter-spacing:-0.01em;"));
    const po=document.createElement("button"); po.className="icon-btn"; po.setAttribute("aria-label","Escuchar");po.innerHTML="&#9654;"; po.style.color="var(--teal-text)"; po.style.fontSize="20px";
    po.onclick=function(){speakGerman(r.original);}; rowO.appendChild(po); box1.appendChild(rowO);
    box1.appendChild(mk("p","/"+r.pronunciacion+"/","font-size:12px;color:var(--muted);margin-bottom:12px;font-weight:500;"));
    box1.appendChild(mk("p","SIGNIFICA","font-size:10px;color:var(--teal-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:5px;font-weight:700;"));
    box1.appendChild(mk("p",r.significado,"font-size:15px;color:var(--text);font-weight:600;line-height:1.5;"));

    const saveRow=mk("div","","display:flex;justify-content:flex-end;margin-top:12px;");
    const saveBtn=document.createElement("button");
    saveBtn.className="chip";
    saveBtn.style.cssText="background:rgba(var(--gold-rgb),0.1);border:1px solid rgba(var(--gold-rgb),0.3);color:var(--gold-text);font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:5px;";
    setSaveIcon(saveBtn,false,"Guardar en flashcards");
    saveBtn.onclick=function(){
      const phrase=ensureSrsFields({de:r.original,es:r.significado,tip:r.contexto||"",source:"noentendi"});
      if(!state.session.saved.some(function(x){return x.de===phrase.de;})){
        state.session.saved.push(phrase); updateBadge(); syncUp();
        saveBtn.innerHTML="✓ Guardada"; saveBtn.style.color="var(--green-text)"; saveBtn.style.borderColor="rgba(var(--green-rgb),0.3)"; saveBtn.disabled=true;
      } else {saveBtn.innerHTML="Ya guardada"; saveBtn.disabled=true;}
    };
    saveRow.appendChild(saveBtn); box1.appendChild(saveRow);
    result.appendChild(box1);

    if(r.contexto){
      const box2=document.createElement("div");
      box2.className="result-box dark";
      box2.style.padding="16px";
      box2.appendChild(mk("p","📌  CUANDO SE USA","font-size:10px;color:var(--text2);letter-spacing:2px;font-family:var(--font-label);margin-bottom:6px;font-weight:700;"));
      box2.appendChild(mk("p",r.contexto,"font-size:14px;color:var(--text2);font-weight:500;line-height:1.6;"));
      result.appendChild(box2);
    }
    if(r.palabras&&r.palabras.length){
      const box3=document.createElement("div");
      box3.className="result-box dark";
      box3.style.padding="16px";
      box3.appendChild(mk("p","🔑  PALABRAS CLAVE","font-size:10px;color:var(--text2);letter-spacing:2px;font-family:var(--font-label);margin-bottom:10px;font-weight:700;"));
      r.palabras.forEach(function(w){
        const wr=mk("div","","display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);");
        wr.appendChild(mk("span",w.de,"font-size:14px;font-weight:700;color:var(--text);"));
        wr.appendChild(mk("span",w.es,"font-size:13px;color:var(--text2);font-weight:500;"));
        box3.appendChild(wr);
      });
      result.appendChild(box3);
    }
    if(r.respuesta){
      const box4=document.createElement("div");
      box4.className="result-box purple";
      box4.style.padding="16px";
      box4.appendChild(mk("p","💬  COMO PUEDES RESPONDER","font-size:10px;color:var(--purple-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:6px;font-weight:700;"));
      const rowR=mk("div","","display:flex;justify-content:space-between;align-items:center;gap:8px;");
      rowR.appendChild(mk("p",r.respuesta,"font-size:15px;color:var(--text);flex:1;font-weight:600;"));
      const pr=document.createElement("button"); pr.className="icon-btn"; pr.setAttribute("aria-label","Escuchar");pr.innerHTML="&#9654;"; pr.style.color="var(--purple-text)"; pr.style.fontSize="20px";
      pr.onclick=function(){speakGerman(r.respuesta);}; rowR.appendChild(pr); box4.appendChild(rowR);
      const pronRow=mk("div","","display:flex;align-items:center;gap:8px;margin-top:10px;");
      pronRow.appendChild(mk("span","🎤 Practicar pronunciación","font-size:12px;color:var(--purple-text);font-weight:700;flex:1;"));
      pronRow.appendChild(makePronMicBtn("#c4a7e7", r.respuesta, box4));
      box4.appendChild(pronRow);
      result.appendChild(box4);
    }
    const reset=document.createElement("button");
    reset.className="reset-btn";
    reset.textContent="Preguntar otra cosa";
    reset.onclick=renderDidntUnderstand; result.appendChild(reset);
    el.appendChild(result);
  } catch(e){
    el.appendChild(mk("p","Error al procesar. Intenta de nuevo.","color:var(--red-text);font-size:13px;text-align:center;margin-top:10px;font-weight:500;"));
  }
  ta.disabled=false; btn.disabled=false; btn.textContent="Explicame esto 🔍";
}
