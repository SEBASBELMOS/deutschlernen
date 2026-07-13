// ── Didn't understand (Stitch "No Entendí" visual port) ───────────────────────
function renderDidntUnderstand() {
  const el=document.getElementById("s-noentendi"); el.innerHTML="";

  // ── Eyebrow + heading ──
  var hdr=mk("div","","margin-bottom:14px;");
  hdr.appendChild(mk("p","Comprensión · Explicador","font-size:10px;letter-spacing:2.5px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
  hdr.appendChild(mk("h1","🤔 No entendí","font-size:22px;font-weight:900;letter-spacing:-.03em;margin:2px 0 0;"));
  el.appendChild(hdr);

  // ── Input row (Stitch search layout) ──
  var inRow=mk("div","","display:flex;gap:9px;margin-bottom:11px;");
  var inp=document.createElement("input"); inp.type="text"; inp.id="ni-input";
  inp.placeholder="Pega una frase que no entendiste…";
  inp.setAttribute("aria-label","Frase que escuchaste");
  inp.style.cssText="flex:1;background:var(--surface);border:1px solid rgba(143,144,158,0.32);border-radius:16px;color:var(--text);padding:14px 16px;font-family:inherit;font-size:14.5px;font-weight:600;outline:none;transition:border-color .2s, box-shadow .2s;box-shadow:0 2px 10px rgba(0,0,0,0.14);";
  inp.onfocus=function(){inp.style.borderColor="rgba(var(--primary-rgb),0.5)";inp.style.boxShadow="0 0 0 3px rgba(var(--primary-rgb),0.08),0 4px 16px rgba(0,0,0,0.2)";};
  inp.onblur=function(){inp.style.borderColor="rgba(143,144,158,0.32)";inp.style.boxShadow="0 2px 10px rgba(0,0,0,0.14)";};
  inRow.appendChild(inp);
  var goBtn=mk("button","Explicar","padding:0 22px;border-radius:16px;border:none;background:var(--primary);color:var(--on-primary);font-size:14px;font-weight:900;cursor:pointer;transition:transform .12s,box-shadow .2s;box-shadow:0 4px 16px rgba(var(--primary-rgb),0.25);");
  goBtn.onclick=function(){explain();};
  goBtn.onmousedown=function(){goBtn.style.transform="scale(.96)";};
  goBtn.onmouseup=function(){goBtn.style.transform="";};
  inRow.appendChild(goBtn);
  el.appendChild(inRow);

  // ── Example chips ──
  var exRow=mk("div","","display:flex;gap:7px;flex-wrap:wrap;margin-bottom:6px;");
  var savedPhrases=(state.session.saved||[]).filter(function(x){return x.source==="noentendi";}).slice(0,3);
  var demoPhrases=savedPhrases.length?savedPhrases:[
    {de:"Ich habe mich an das Wetter gewöhnt."},
    {de:"Es kommt darauf an, wie viel Zeit du hast."},
    {de:"Dabei hätte ich fast den Termin vergessen."}
  ];
  demoPhrases.forEach(function(p){
    var b=mk("button",p.de.length>34?p.de.slice(0,33)+"…":p.de,"font-size:11.5px;font-weight:700;color:var(--muted);background:var(--surface);border:1px dashed var(--dim);border-radius:11px;padding:7px 12px;transition:all .2s;");
    b.onmouseenter=function(){b.style.color="var(--text)";b.style.borderColor="var(--muted)";};
    b.onmouseleave=function(){b.style.color="var(--muted)";b.style.borderColor="var(--dim)";};
    b.onclick=function(){inp.value=p.de;explain();};
    exRow.appendChild(b);
  });
  el.appendChild(exRow);

  // ── Saved phrases section ──
  var allSaved=(state.session.saved||[]).filter(function(x){return x.source==="noentendi";});
  if(allSaved.length>0){
    var secLbl=mk("p","📌 Tus frases guardadas","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin:24px 0 10px;");
    el.appendChild(secLbl);
    var savedList=mk("div","","");
    allSaved.forEach(function(phrase){
      var card=document.createElement("div");
      card.style.cssText="background:var(--surface);border:1px solid rgba(143,144,158,0.28);border-radius:18px;padding:14px 16px;margin-bottom:9px;cursor:pointer;transition:border-color .2s;box-shadow:0 6px 22px rgba(0,0,0,0.3);";
      card.onmouseenter=function(){card.style.borderColor="rgba(255,255,255,.16)";};
      card.onmouseleave=function(){if(!card.classList.contains("open"))card.style.borderColor="rgba(143,144,158,0.28)";};

      var topRow=mk("div","","display:flex;justify-content:space-between;align-items:flex-start;gap:8px;");
      var leftCol=mk("div","","flex:1;");
      leftCol.appendChild(mk("p",phrase.de,"font-size:14.5px;font-weight:800;color:var(--text);"));
      if(phrase.es) leftCol.appendChild(mk("p",phrase.es,"font-size:12px;color:var(--muted);font-weight:600;margin-top:2px;"));
      topRow.appendChild(leftCol);
      var chevron=mk("span","▾","font-size:16px;color:var(--muted);transition:transform .3s ease;flex-shrink:0;margin-top:4px;");
      topRow.appendChild(chevron);
      card.appendChild(topRow);

      var expandDiv=mk("div","","max-height:0;overflow:hidden;opacity:0;transition:max-height .35s ease-out,opacity .25s ease-in;");
      if(phrase.tip){
        expandDiv.appendChild(mk("p","💡 "+phrase.tip,"font-size:12px;color:var(--muted);font-weight:600;line-height:1.55;margin-top:11px;padding-top:11px;border-top:1px solid rgba(255,255,255,.08);"));
      }
      card.appendChild(expandDiv);

      card.onclick=function(){
        var wasExpanded=card.classList.contains("open");
        var allCards=el.querySelectorAll(".open");
        allCards.forEach(function(c){
          if(c!==card){c.classList.remove("open");c.style.borderColor="rgba(143,144,158,0.28)";var ex=c.querySelector("div:last-child");if(ex){ex.style.maxHeight="0";ex.style.opacity="0";}}
        });
        if(wasExpanded){
          card.classList.remove("open");card.style.borderColor="rgba(143,144,158,0.28)";
          expandDiv.style.maxHeight="0";expandDiv.style.opacity="0";
          chevron.style.transform="rotate(0deg)";
        }else{
          card.classList.add("open");card.style.borderColor="rgba(255,255,255,.16)";
          expandDiv.style.maxHeight="200px";expandDiv.style.opacity="1";
          chevron.style.transform="rotate(180deg)";
        }
      };
      savedList.appendChild(card);
    });
    el.appendChild(savedList);
  }

  // ── Empty state ──
  if(allSaved.length===0){
    var emptyDiv=mk("div","","display:flex;flex-direction:column;align-items:center;text-align:center;opacity:0.35;margin-top:40px;padding:24px;");
    emptyDiv.appendChild(mk("p","💡","font-size:48px;margin-bottom:12px;"));
    emptyDiv.appendChild(mk("p","¿Descubriste algo nuevo hoy?","font-size:14px;color:var(--muted);font-weight:500;max-width:200px;"));
    emptyDiv.appendChild(mk("p","Guardalo después de cada consulta.","font-size:12px;color:var(--muted);margin-top:6px;text-align:center;max-width:240px;"));
    el.appendChild(emptyDiv);
  }

  inp.addEventListener("keydown",function(e){if(e.key==="Enter")explain();});

  function explain(){
    var t=inp.value.trim();
    if(!t){inp.focus();return;}
    doExplainFromInput(t,el);
  }

  async function doExplainFromInput(text,host){
    var old=host.querySelector("#ni-result");if(old)old.remove();
    // Show loading
    var loadDiv=mk("div","","margin-top:16px;padding:20px;text-align:center;");
    for(var si=0;si<3;si++)loadDiv.appendChild(skelCard(3));
    host.appendChild(loadDiv);
    try{
      var sys="You are a German language expert helping a Spanish speaker understand German. Reply ONLY with valid JSON, no markdown: {\"original\":\"the German text cleaned\",\"significado\":\"what it means in Spanish\",\"contexto\":\"when and why this is used\",\"palabras\":[{\"de\":\"key word\",\"es\":\"meaning\"}],\"respuesta\":\"how Sebastian could respond in German\",\"pronunciacion\":\"simplified pronunciation\"}";
      var reply=await ai(sys,[{role:"user",content:text}]);
      var r=JSON.parse(reply.replace(/```json|```/g,"").trim());
      loadDiv.remove();
      var result=document.createElement("div");result.id="ni-result";
      result.style.cssText="display:block;margin-top:16px;animation:fadeUp .35s cubic-bezier(.16,1,.3,1);";

      // ── Phrase card (Stitch phrase-card style) ──
      var phraseCard=document.createElement("div");
      phraseCard.style.cssText="background:linear-gradient(145deg,rgba(var(--primary-rgb),0.08),rgba(var(--primary-rgb),0.02));border:1px solid rgba(var(--primary-rgb),0.30);border-radius:22px;padding:18px;margin-bottom:12px;box-shadow:0 6px 24px rgba(0,0,0,0.3);";
      phraseCard.appendChild(mk("p","LA FRASE","font-size:9.5px;letter-spacing:2.5px;font-weight:800;text-transform:uppercase;margin-bottom:6px;color:var(--primary);"));
      phraseCard.appendChild(mk("p",r.original,"font-size:21px;font-weight:900;letter-spacing:-.02em;line-height:1.35;color:var(--text);margin-bottom:10px;"));
      if(r.pronunciacion) phraseCard.appendChild(mk("p","/"+r.pronunciacion+"/","font-size:12px;color:var(--muted);font-weight:500;margin-bottom:10px;"));

      // Literal + translation
      if(r.significado){
        var litRow=mk("div","","display:flex;gap:10px;align-items:baseline;font-size:13.5px;font-weight:600;line-height:1.5;margin-bottom:4px;");
        litRow.appendChild(mk("span","Significado","flex-shrink:0;font-size:9px;font-weight:900;letter-spacing:1px;padding:3px 8px;border-radius:7px;text-transform:uppercase;background:rgba(148,163,184,.12);color:#94a3b8;border:1px solid rgba(148,163,184,.3);"));
        litRow.appendChild(mk("span",r.significado,"color:var(--text2);font-style:italic;"));
        phraseCard.appendChild(litRow);
      }

      // Save button
      var saveRow=mk("div","","display:flex;justify-content:flex-end;margin-top:12px;");
      var saveBtn=document.createElement("button");
      saveBtn.style.cssText="background:rgba(var(--gold-rgb),0.13);border:1.5px solid rgba(var(--gold-rgb),0.45);color:var(--gold-text);border-radius:14px;padding:10px 16px;font-size:12px;font-weight:900;cursor:pointer;transition:background .15s,transform .1s;display:inline-flex;align-items:center;gap:5px;";
      setSaveIcon(saveBtn,false,"Guardar");
      saveBtn.onclick=function(){
        var phrase=ensureSrsFields({de:r.original,es:r.significado,tip:r.contexto||"",source:"noentendi"});
        if(!state.session.saved.some(function(x){return x.de===phrase.de;})){
          state.session.saved.push(phrase);invalidateFlashcardQueues();updateBadge();syncUp();
          saveBtn.innerHTML="✓ Guardada";saveBtn.style.background="rgba(74,222,128,.13)";saveBtn.style.borderColor="rgba(74,222,128,.45)";saveBtn.style.color="var(--green-text)";saveBtn.disabled=true;
          showToast("Guardada ✓");
        }else{saveBtn.innerHTML="Ya guardada";saveBtn.disabled=true;}
      };
      saveRow.appendChild(saveBtn);phraseCard.appendChild(saveRow);
      result.appendChild(phraseCard);

      // ── Context ──
      if(r.contexto){
        var ctxCard=mk("div","",""); ctxCard.className="stitch-ctx-card";
        ctxCard.style.cssText="background:var(--surface);border:1px solid rgba(143,144,158,0.35);border-radius:20px;padding:15px 17px;margin-bottom:12px;box-shadow:0 8px 28px rgba(0,0,0,0.35);";
        ctxCard.appendChild(mk("p","📌 CUÁNDO SE USA","font-size:9.5px;letter-spacing:2px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:6px;"));
        ctxCard.appendChild(mk("p",r.contexto,"font-size:14px;color:var(--text2);font-weight:500;line-height:1.7;"));
        result.appendChild(ctxCard);
      }

      // ── Key words ──
      if(r.palabras&&r.palabras.length){
        var kwCard=mk("div","",""); kwCard.className="stitch-diff-card";
        kwCard.style.cssText="background:var(--surface);border:1px solid rgba(143,144,158,0.35);border-radius:20px;padding:15px 17px;margin-bottom:12px;box-shadow:0 8px 28px rgba(0,0,0,0.35);";
        kwCard.appendChild(mk("p","🔑 PALABRAS CLAVE","font-size:9.5px;letter-spacing:2px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:10px;"));
        r.palabras.forEach(function(w){
          var wr=mk("div","","display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);");
          wr.appendChild(mk("span",w.de,"font-size:14px;font-weight:700;color:var(--text);"));
          wr.appendChild(mk("span",w.es,"font-size:13px;color:var(--text2);font-weight:500;"));
          kwCard.appendChild(wr);
        });
        result.appendChild(kwCard);
      }

      // ── How to respond ──
      if(r.respuesta){
        var respCard=document.createElement("div");
        respCard.style.cssText="background:linear-gradient(135deg,rgba(var(--purple-rgb),0.11),rgba(var(--purple-rgb),0.02));border:1px solid rgba(var(--purple-rgb),0.32);border-radius:20px;padding:16px 17px;margin-bottom:12px;box-shadow:0 4px 18px rgba(0,0,0,0.22);";
        respCard.appendChild(mk("p","💬 CÓMO PODÉS RESPONDER","font-size:9.5px;letter-spacing:2px;font-weight:800;color:var(--purple-text);text-transform:uppercase;margin-bottom:8px;"));
        var respRow=mk("div","","display:flex;justify-content:space-between;align-items:center;gap:8px;");
        respRow.appendChild(mk("p",r.respuesta,"font-size:16px;color:var(--text);flex:1;font-weight:700;line-height:1.4;"));
        var pr=document.createElement("button");
        pr.setAttribute("aria-label","Escuchar");pr.innerHTML="▶";
        pr.style.cssText="background:none;border:none;color:var(--purple-text);font-size:20px;cursor:pointer;min-width:44px;min-height:44px;display:inline-flex;align-items:center;justify-content:center;";
        pr.onclick=function(){speakGerman(r.respuesta);};
        respRow.appendChild(pr);respCard.appendChild(respRow);

        // Pronunciation practice
        var pronRow=mk("div","","display:flex;align-items:center;gap:8px;margin-top:10px;");
        pronRow.appendChild(mk("span","🎤 Practicar pronunciación","font-size:12px;color:var(--purple-text);font-weight:700;flex:1;"));
        pronRow.appendChild(makePronMicBtn("#c4a7e7", r.respuesta, respCard));
        respCard.appendChild(pronRow);
        result.appendChild(respCard);
      }

      // ── Anatomía gramatical section (Stitch anatomy style) ──
      var anatomyCard=document.createElement("div");
      anatomyCard.style.cssText="background:var(--surface);border:1px solid rgba(143,144,158,0.35);border-radius:20px;padding:16px 17px;margin-bottom:12px;box-shadow:0 8px 28px rgba(0,0,0,0.35);";
      anatomyCard.appendChild(mk("p","Anatomía gramatical","font-size:9.5px;letter-spacing:2.5px;font-weight:800;text-transform:uppercase;margin-bottom:9px;color:var(--purple-text);"));

      // Part-of-speech chips
      var partsRow=mk("div","","display:flex;flex-wrap:wrap;gap:7px;margin-bottom:9px;");
      var roleColors={nom:"var(--teal)",akk:"var(--green)",dat:"var(--gold)",verb:"var(--red)",other:"#94a3b8"};
      var roleBorders={nom:"rgba(78,205,196,.5)",akk:"rgba(74,222,128,.5)",dat:"rgba(245,166,35,.5)",verb:"rgba(248,113,113,.5)",other:"rgba(148,163,184,.4)"};
      var roleBgs={nom:"rgba(78,205,196,.07)",akk:"rgba(74,222,128,.07)",dat:"rgba(245,166,35,.07)",verb:"rgba(248,113,113,.07)",other:"rgba(148,163,184,.06)"};

      if(r.partes&&r.partes.length){
        r.partes.forEach(function(p){
          var c=p.c||"other";
          var chip=mk("span","","border-radius:13px;padding:8px 11px 7px;border:1.5px solid "+(roleBorders[c]||roleBorders.other)+";color:"+(roleColors[c]||roleColors.other)+";background:"+(roleBgs[c]||roleBgs.other)+";text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.12);");
          chip.innerHTML='<span style="display:block;font-size:14px;font-weight:800;">'+escHtml(p.w)+'</span><span style="display:block;font-size:8.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;opacity:.85;margin-top:2px;">'+escHtml(p.r)+'</span>';
          partsRow.appendChild(chip);
        });
      }else if(r.palabras&&r.palabras.length){
        r.palabras.forEach(function(p){
          var chip=mk("span","","border-radius:13px;padding:8px 11px 7px;border:1.5px solid rgba(var(--purple-rgb),0.35);color:var(--purple-text);background:rgba(var(--purple-rgb),0.07);text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.12);");
          chip.innerHTML='<span style="display:block;font-size:14px;font-weight:800;">'+escHtml(p.de)+'</span><span style="display:block;font-size:8.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;opacity:.85;margin-top:2px;">'+escHtml(p.es)+'</span>';
          partsRow.appendChild(chip);
        });
      }else{
        partsRow.appendChild(mk("span","(no disponible)","font-size:12px;color:var(--dim);font-weight:600;font-style:italic;"));
      }
      anatomyCard.appendChild(partsRow);

      // Grammatical note
      var noteText=r.nota||r.contexto||"";
      if(noteText){
        anatomyCard.appendChild(mk("p",noteText,"font-size:12px;color:var(--muted);font-weight:600;line-height:1.55;margin-bottom:11px;"));
      }

      // Generar similares button
      var simBtn=document.createElement("button");
      simBtn.style.cssText="width:100%;padding:12px;border-radius:14px;font-size:13px;font-weight:900;cursor:pointer;transition:background .15s,transform .1s;";
      if(r.similares&&r.similares.length){
        simBtn.style.cssText+="background:rgba(var(--purple-rgb),0.13);border:1.5px solid rgba(var(--purple-rgb),0.45);color:var(--purple-text);";
        simBtn.textContent="✨ Generar similares";
        simBtn.onmouseenter=function(){simBtn.style.background="rgba(var(--purple-rgb),0.2)";};
        simBtn.onmouseleave=function(){simBtn.style.background="rgba(var(--purple-rgb),0.13)";};
        simBtn.onclick=function(){
          var simsDiv=mk("div","","margin-top:11px;display:flex;flex-direction:column;gap:8px;");
          r.similares.forEach(function(s){
            var sim=mk("div","","padding:12px 14px;border-radius:14px;background:rgba(var(--purple-rgb),0.06);border:1px solid rgba(var(--purple-rgb),0.25);font-size:13.5px;font-weight:700;");
            sim.innerHTML=escHtml(s.de)+'<span style="display:block;font-size:11.5px;color:var(--muted);font-weight:600;margin-top:3px;">'+escHtml(s.es)+'</span>';
            simsDiv.appendChild(sim);
          });
          anatomyCard.appendChild(simsDiv);
          simBtn.disabled=true;simBtn.style.opacity=".5";
        };
      }else{
        simBtn.style.cssText+="background:rgba(var(--primary-rgb),0.06);border:1px solid rgba(var(--primary-rgb),0.2);color:var(--dim);opacity:.6;";
        simBtn.textContent="✨ Generar similares (IA no disponible)";
        simBtn.disabled=true;
      }
      simBtn.onmousedown=function(){if(!simBtn.disabled)simBtn.style.transform="scale(.97)";};
      simBtn.onmouseup=function(){if(!simBtn.disabled)simBtn.style.transform="";};
      anatomyCard.appendChild(simBtn);
      result.appendChild(anatomyCard);

      // ── Reset ──
      var reset=mk("button","Preguntar otra cosa","width:100%;background:transparent;border:1px dashed var(--border);color:var(--muted);border-radius:12px;padding:11px;font-size:13px;font-weight:600;cursor:pointer;margin-top:4px;");
      reset.onclick=renderDidntUnderstand;result.appendChild(reset);
      host.appendChild(result);
    }catch(e){
      loadDiv.remove();
      host.appendChild(mk("p","Error al procesar. Intenta de nuevo.","color:var(--red-text);font-size:13px;text-align:center;margin-top:10px;font-weight:500;"));
    }
  }
}
