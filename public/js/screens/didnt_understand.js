// ── Didn't understand ─────────────────────────────────────────────────────────
function renderDidntUnderstand() {
  const el=document.getElementById("s-noentendi"); el.innerHTML="";

  // ── Header ──
  const hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","TRADUCTOR CONTEXTUAL","font-size:11px;color:var(--muted);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","No entendí","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  hdr.appendChild(mk("p","¿Escuchaste algo en alemán? Escribilo o grabalo acá.","font-size:13px;color:var(--muted);margin-top:4px;font-weight:500;"));
  el.appendChild(hdr);

  // ── Input Card ──
  const inputCard=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:var(--s-4);margin-bottom:var(--s-3);box-shadow:0 4px 20px rgba(0,0,0,0.15);");

  // Badge row
  const badgeRow=mk("div","","display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;");
  const langBadge=mk("span","Deutsch → Español","display:inline-block;background:rgba(var(--teal-rgb),0.10);border:1px solid rgba(var(--teal-rgb),0.25);color:var(--teal-text);border-radius:var(--r-pill);padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;");
  badgeRow.appendChild(langBadge);
  const clearBtn=mk("button","Borrar","background:none;border:none;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;padding:4px 8px;border-radius:6px;transition:color 0.2s;");
  clearBtn.onclick=function(){ta.value="";ta.focus();};
  badgeRow.appendChild(clearBtn);
  inputCard.appendChild(badgeRow);

  // Textarea + mic row
  const row=mk("div","","display:flex;gap:8px;align-items:flex-start;");
  const ta=document.createElement("textarea"); ta.rows=4; ta.placeholder="Escribí lo que escuchaste..."; ta.setAttribute("aria-label","Frase que escuchaste");
  ta.style.cssText="flex:1;background:transparent;border:none;outline:none;font-size:18px;color:var(--text);resize:none;font-family:inherit;font-weight:500;line-height:1.6;min-height:96px;";
  ta.onfocus=function(){inputCard.style.borderColor="var(--teal-text)";inputCard.style.boxShadow="0 4px 20px rgba(var(--teal-rgb),0.12)";};
  ta.onblur=function(){inputCard.style.borderColor="var(--border)";inputCard.style.boxShadow="0 4px 20px rgba(0,0,0,0.15)";};
  const mic=makeMicBtn("#5dd9d0",function(t){ta.value=t;doExplain(ta,explainBtn,el);});
  row.appendChild(ta); row.appendChild(mic); inputCard.appendChild(row);

  // Explain button
  const btnRow=mk("div","","display:flex;justify-content:flex-end;margin-top:16px;");
  const explainBtn=document.createElement("button");
  explainBtn.className="fix-btn-lg teal";
  explainBtn.innerHTML='<span style="display:inline-flex;align-items:center;gap:6px;"><span>🔍</span> Explicame esto →</span>';
  explainBtn.onclick=function(){doExplain(ta,explainBtn,el);};
  btnRow.appendChild(explainBtn);
  inputCard.appendChild(btnRow);

  el.appendChild(inputCard);

  // ── Saved phrases section ──
  const savedPhrases=(state.session.saved||[]).filter(function(x){return x.source==="noentendi";});
  if(savedPhrases.length>0){
    const savedDiv=mk("div","","margin-top:24px;");
    savedDiv.appendChild(mk("p","📌  FRASES GUARDADAS","font-size:11px;color:var(--muted);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:12px;"));
    savedPhrases.forEach(function(phrase){
      const card=document.createElement("div");
      card.className="phrase-card";
      card.style.cssText="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:var(--s-4);margin-bottom:10px;cursor:pointer;transition:box-shadow 0.2s,border-color 0.2s;";
      card.onmouseenter=function(){this.style.borderColor="rgba(var(--teal-rgb),0.3)";this.style.boxShadow="0 4px 16px rgba(0,0,0,0.2)";};
      card.onmouseleave=function(){if(!this.classList.contains("expanded")){this.style.borderColor="var(--border)";this.style.boxShadow="none";}};

      // Top row: phrase + chevron
      const topRow=mk("div","","display:flex;justify-content:space-between;align-items:flex-start;gap:8px;");
      const leftCol=mk("div","","flex:1;");
      // Source badge
      const srcBadge=mk("span","no entendí","display:inline-block;background:rgba(var(--teal-rgb),0.08);border:1px solid rgba(var(--teal-rgb),0.2);color:var(--teal-text);border-radius:var(--r-pill);padding:2px 10px;font-size:10px;font-weight:700;margin-bottom:6px;letter-spacing:0.5px;");
      leftCol.appendChild(srcBadge);
      leftCol.appendChild(mk("p",phrase.de,"font-size:18px;font-weight:800;color:var(--text);letter-spacing:-0.01em;line-height:1.3;margin-bottom:2px;"));
      if(phrase.es) leftCol.appendChild(mk("p",phrase.es,"font-size:13px;color:var(--muted);font-style:italic;font-weight:500;"));
      topRow.appendChild(leftCol);

      const chevron=mk("span","▾","font-size:16px;color:var(--muted);transition:transform 0.3s ease;flex-shrink:0;margin-top:4px;");
      topRow.appendChild(chevron);
      card.appendChild(topRow);

      // Expanded content
      const expandDiv=mk("div","","max-height:0;overflow:hidden;opacity:0;transition:max-height 0.35s ease-out,opacity 0.25s ease-in,margin-top 0.3s ease;");
      expandDiv.style.marginTop="0";
      if(phrase.tip){
        const tipBox=mk("div","","background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:var(--r-md);padding:12px;margin-top:12px;");
        tipBox.appendChild(mk("p","📝  CONTEXTO","font-size:10px;color:var(--teal-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:6px;font-weight:700;"));
        tipBox.appendChild(mk("p",phrase.tip,"font-size:13px;color:var(--text2);font-weight:500;line-height:1.6;"));
        expandDiv.appendChild(tipBox);
      }

      // Pronunciation & listen
      const actRow=mk("div","","display:flex;align-items:center;gap:8px;margin-top:10px;");
      const listenBtn=document.createElement("button");
      listenBtn.className="icon-btn"; listenBtn.style.color="var(--teal-text)";
      listenBtn.innerHTML="&#9654; Escuchar";
      listenBtn.style.fontSize="13px";
      listenBtn.onclick=function(e){e.stopPropagation();speakGerman(phrase.de);};
      actRow.appendChild(listenBtn);
      expandDiv.appendChild(actRow);

      card.appendChild(expandDiv);

      // Toggle expand
      card.onclick=function(){
        var wasExpanded=card.classList.contains("expanded");
        // Close all other cards
        var allCards=el.querySelectorAll(".phrase-card.expanded");
        allCards.forEach(function(c){
          if(c!==card){
            c.classList.remove("expanded");
            c.style.borderColor="var(--border)";c.style.boxShadow="none";
            var cExpand=c.querySelector("div");
            if(cExpand){cExpand.style.maxHeight="0";cExpand.style.opacity="0";cExpand.style.marginTop="0";}
            var cChev=c.querySelector("span:last-child");
            if(cChev&&cChev.textContent==="▾")cChev.style.transform="rotate(0deg)";
          }
        });
        if(wasExpanded){
          card.classList.remove("expanded");
          card.style.borderColor="var(--border)";card.style.boxShadow="none";
          expandDiv.style.maxHeight="0";expandDiv.style.opacity="0";expandDiv.style.marginTop="0";
          chevron.style.transform="rotate(0deg)";
        } else {
          card.classList.add("expanded");
          card.style.borderColor="rgba(var(--teal-rgb),0.3)";card.style.boxShadow="0 4px 16px rgba(0,0,0,0.2)";
          expandDiv.style.maxHeight="500px";expandDiv.style.opacity="1";expandDiv.style.marginTop="8px";
          chevron.style.transform="rotate(180deg)";
        }
      };

      savedDiv.appendChild(card);
    });
    el.appendChild(savedDiv);
  }

  // ── Empty state ──
  if(savedPhrases.length===0){
    const emptyDiv=mk("div","","display:flex;flex-direction:column;align-items:center;text-align:center;opacity:0.35;margin-top:32px;padding:24px;");
    emptyDiv.appendChild(mk("p","💡","font-size:48px;margin-bottom:12px;"));
    emptyDiv.appendChild(mk("p","¿Descubriste algo nuevo hoy?","font-size:14px;color:var(--muted);font-weight:500;max-width:200px;"));
    emptyDiv.appendChild(mk("p","Guardalo tocando \"Guardar en flashcards\" después de cada consulta.","font-size:12px;color:var(--muted);margin-top:6px;text-align:center;max-width:240px;"));
    el.appendChild(emptyDiv);
  }
}

async function doExplain(ta, btn, el) {
  const text=ta.value.trim(); if(!text){ showToast("Escribí algo primero","error"); return; }
  ta.disabled=true; btn.disabled=true; btn.textContent=""; btn.appendChild(makeDots("#5dd9d0"));
  const old=el.querySelector("#ni-result"); if(old) el.removeChild(old);
  try {
    const sys="You are a German language expert helping a Spanish speaker understand German. Reply ONLY with valid JSON, no markdown: {\"original\":\"the German text cleaned\",\"significado\":\"what it means in Spanish\",\"contexto\":\"when and why this is used\",\"palabras\":[{\"de\":\"key word\",\"es\":\"meaning\"}],\"respuesta\":\"how Sebastian could respond in German\",\"pronunciacion\":\"simplified pronunciation\"}";
    const reply=await ai(sys,[{role:"user",content:text}]);
    const r=JSON.parse(reply.replace(/```json|```/g,"").trim());
    const result=document.createElement("div"); result.id="ni-result"; result.style.marginTop="16px";

    // ── Section label ──
    result.appendChild(mk("p","RESULTADO","font-size:11px;color:var(--muted);letter-spacing:2px;font-family:var(--font-label);font-weight:700;margin-bottom:12px;"));

    // ── Original phrase card ──
    const box1=document.createElement("div");
    box1.className="result-box teal";
    box1.style.padding="16px"; box1.style.marginBottom="12px";

    // Original + listen
    const rowO=mk("div","","display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px;");
    rowO.appendChild(mk("p",r.original,"font-size:20px;font-weight:800;color:var(--text);flex:1;letter-spacing:-0.01em;line-height:1.3;"));
    const po=document.createElement("button"); po.className="icon-btn"; po.setAttribute("aria-label","Escuchar");po.innerHTML="&#9654;"; po.style.color="var(--teal-text)"; po.style.fontSize="20px";
    po.onclick=function(){speakGerman(r.original);}; rowO.appendChild(po); box1.appendChild(rowO);
    box1.appendChild(mk("p","/"+r.pronunciacion+"/","font-size:12px;color:var(--muted);margin-bottom:12px;font-weight:500;"));

    // Meaning
    box1.appendChild(mk("p","SIGNIFICA","font-size:10px;color:var(--teal-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:5px;font-weight:700;"));
    box1.appendChild(mk("p",r.significado,"font-size:15px;color:var(--text);font-weight:600;line-height:1.5;margin-bottom:12px;"));

    // Save button
    const saveRow=mk("div","","display:flex;justify-content:flex-end;");
    const saveBtn=document.createElement("button");
    saveBtn.className="chip";
    saveBtn.style.cssText="background:rgba(var(--gold-rgb),0.1);border:1px solid rgba(var(--gold-rgb),0.3);color:var(--gold-text);font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:var(--r-pill);cursor:pointer;transition:all 0.2s;";
    setSaveIcon(saveBtn,false,"Guardar en flashcards");
    saveBtn.onclick=function(){
      const phrase=ensureSrsFields({de:r.original,es:r.significado,tip:r.contexto||"",source:"noentendi"});
      if(!state.session.saved.some(function(x){return x.de===phrase.de;})){
        state.session.saved.push(phrase); updateBadge(); syncUp();
        saveBtn.innerHTML="✓"; saveBtn.style.color="var(--green-text)"; saveBtn.style.borderColor="rgba(var(--green-rgb),0.3)"; saveBtn.disabled=true;
        showToast("Guardada ✓");
      } else {saveBtn.innerHTML="Ya guardada"; saveBtn.disabled=true;}
    };
    saveRow.appendChild(saveBtn); box1.appendChild(saveRow);
    result.appendChild(box1);

    // ── Context ──
    if(r.contexto){
      const box2=document.createElement("div");
      box2.className="result-box dark";
      box2.style.padding="16px"; box2.style.marginBottom="12px";
      box2.appendChild(mk("p","📌  CUÁNDO SE USA","font-size:10px;color:var(--text2);letter-spacing:2px;font-family:var(--font-label);margin-bottom:6px;font-weight:700;"));
      box2.appendChild(mk("p",r.contexto,"font-size:14px;color:var(--text2);font-weight:500;line-height:1.7;"));
      result.appendChild(box2);
    }

    // ── Key words ──
    if(r.palabras&&r.palabras.length){
      const box3=document.createElement("div");
      box3.className="result-box dark";
      box3.style.padding="16px"; box3.style.marginBottom="12px";
      box3.appendChild(mk("p","🔑  PALABRAS CLAVE","font-size:10px;color:var(--text2);letter-spacing:2px;font-family:var(--font-label);margin-bottom:10px;font-weight:700;"));
      r.palabras.forEach(function(w){
        const wr=mk("div","","display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);");
        wr.appendChild(mk("span",w.de,"font-size:14px;font-weight:700;color:var(--text);"));
        wr.appendChild(mk("span",w.es,"font-size:13px;color:var(--text2);font-weight:500;"));
        box3.appendChild(wr);
      });
      result.appendChild(box3);
    }

    // ── How to respond ──
    if(r.respuesta){
      const box4=document.createElement("div");
      box4.className="result-box purple";
      box4.style.padding="16px"; box4.style.marginBottom="12px";
      box4.appendChild(mk("p","💬  CÓMO PODÉS RESPONDER","font-size:10px;color:var(--purple-text);letter-spacing:2px;font-family:var(--font-label);margin-bottom:8px;font-weight:700;"));
      const rowR=mk("div","","display:flex;justify-content:space-between;align-items:center;gap:8px;");
      rowR.appendChild(mk("p",r.respuesta,"font-size:16px;color:var(--text);flex:1;font-weight:700;line-height:1.4;"));
      const pr=document.createElement("button"); pr.className="icon-btn"; pr.setAttribute("aria-label","Escuchar");pr.innerHTML="&#9654;"; pr.style.color="var(--purple-text)"; pr.style.fontSize="20px";
      pr.onclick=function(){speakGerman(r.respuesta);}; rowR.appendChild(pr); box4.appendChild(rowR);

      // Pronunciation practice
      const pronRow=mk("div","","display:flex;align-items:center;gap:8px;margin-top:10px;");
      pronRow.appendChild(mk("span","🎤 Practicar pronunciación","font-size:12px;color:var(--purple-text);font-weight:700;flex:1;"));
      pronRow.appendChild(makePronMicBtn("#c4a7e7", r.respuesta, box4));
      box4.appendChild(pronRow);
      result.appendChild(box4);
    }

    // ── Reset ──
    const reset=document.createElement("button");
    reset.className="reset-btn";
    reset.textContent="Preguntar otra cosa";
    reset.onclick=renderDidntUnderstand; result.appendChild(reset);
    el.appendChild(result);
  } catch(e){
    el.appendChild(mk("p","Error al procesar. Intentá de nuevo.","color:var(--red-text);font-size:13px;text-align:center;margin-top:10px;font-weight:500;"));
  }
  ta.disabled=false; btn.disabled=false;
  btn.innerHTML='<span style="display:inline-flex;align-items:center;gap:6px;"><span>🔍</span> Explicame esto →</span>';
}
