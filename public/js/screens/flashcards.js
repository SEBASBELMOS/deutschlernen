// ── FLASHCARDS (SRS) ──────────────────────────────────────────────────────────
function buildReviewQueue(){
  const t=todayKey();
  const indices=[];
  state.session.saved.forEach(function(p,i){ ensureSrsFields(p); if(p.nextReview<=t) indices.push(i); });
  // Order: lowest box first, then oldest nextReview
  indices.sort(function(a,b){
    const A=state.session.saved[a], B=state.session.saved[b];
    if(A.box!==B.box) return A.box-B.box;
    return (A.nextReview||"").localeCompare(B.nextReview||"");
  });
  return indices;
}

function renderFlashcards() {
  const el=document.getElementById("s-flashcards"); el.innerHTML="";
  if(!state.session.saved.length){
    var empty=mk("div","","text-align:center;padding:70px 0;color:var(--muted);"); empty.className="anim-in";
    var emptyIcon=mk("div","","font-size:48px;margin-bottom:16px;color:var(--gold-text);display:flex;justify-content:center;");
    emptyIcon.appendChild(ico("cards",48));
    empty.appendChild(emptyIcon);
    empty.appendChild(mk("p","Sin tarjetas aún","font-weight:800;font-size:17px;margin-bottom:8px;color:var(--text);letter-spacing:-0.02em;"));
    empty.appendChild(mk("p","Ve a Frases o No entendí y guarda algunas para practicar.","font-size:13px;font-weight:500;color:var(--text2);"));
    el.appendChild(empty);
    return;
  }

  const dueN=reviewDueCount();

  // ── HEADER: Stitch SRM desktop hierarchy ──
  var hdr=document.createElement("section"); hdr.className="flash-srm-head";
  var headText=mk("div","","min-width:0;");
  headText.appendChild(mk("h2","Repaso diario","font-size:24px;line-height:1.15;font-weight:900;color:var(--text);letter-spacing:-0.03em;margin-bottom:4px;"));
  var subLabel=state.flashcards.flashReviewMode?dueN+" pendientes":state.session.saved.length+" tarjetas";
  headText.appendChild(mk("p",subLabel+" · repaso espaciado","font-size:15px;color:var(--text2);font-weight:500;"));
  hdr.appendChild(headText);
  var completedPct=state.session.saved.length?Math.round((state.session.saved.length-dueN)/state.session.saved.length*100):0;
  var headProg=mk("div","","min-width:240px;flex:1;max-width:520px;");
  headProg.appendChild(mk("p",completedPct+"% completado","text-align:left;font-size:14px;color:var(--primary);font-weight:800;margin-bottom:10px;font-variant-numeric:tabular-nums;"));
  var headBar=mk("div","",""); headBar.className="stitch-progress";
  headBar.appendChild(mk("span","","width:"+completedPct+"%;"));
  headProg.appendChild(headBar);
  hdr.appendChild(headProg);
  el.appendChild(hdr);

  // ── SRS BOX SHELF (visual distribution chart) ──
  if (state.session.saved.length > 0) {
    var shelf = mk("div", "", ""); shelf.className = "srs-shelf";
    var shelfTop = mk("div", "", ""); shelfTop.className = "srs-shelf-top";
    shelfTop.appendChild(mk("p", "🧠 Tus cajas de memoria", "")); shelfTop.firstChild.className = "srs-shelf-lbl";
    shelfTop.appendChild(mk("p", dueN + " pendientes hoy", "")); shelfTop.lastChild.className = "srs-shelf-due";
    shelf.appendChild(shelfTop);

    var boxes = mk("div", "", ""); boxes.className = "srs-boxes";
    // Busuu-style strength groups (weak B0-B1 · medium B2-B3 · strong B4-B5)
    var groups=[srsStrength(0),srsStrength(2),srsStrength(4)];
    var counts=groups.map(function(g){
      return state.session.saved.filter(function(p){ensureSrsFields(p);return g.boxes.indexOf(p.box||0)>=0;}).length;
    });
    var maxN = Math.max.apply(null, counts.concat([1]));
    groups.forEach(function (g, i) {
      var n=counts[i];
      var bx = mk("div", "", ""); bx.className = "srs-bx";
      bx.innerHTML = '<div class="srs-bar"><div class="srs-fill" style="height:' + Math.round(n / maxN * 100) + '%;background:' + g.color + '"></div></div>' +
        '<p class="srs-n" style="color:' + g.color + '">' + n + '</p>' +
        '<p class="srs-lbl">' + g.plural.toUpperCase() + '</p>';
      boxes.appendChild(bx);
    });
    shelf.appendChild(boxes);
    el.appendChild(shelf);
  }

  // ── MODE TOGGLE ──
  var modeRow=mk("div","","display:flex;gap:8px;margin:0 0 22px;background:var(--surface);border:1px solid rgba(143,144,158,0.35);border-radius:16px;padding:5px;box-shadow:0 2px 12px rgba(0,0,0,0.14);");
  [{k:true,lbl:"🎯 Pendientes ("+dueN+")"},{k:false,lbl:"📚 Todas ("+state.session.saved.length+")"}].forEach(function(o){
    var b=document.createElement("button");
    b.style.cssText="flex:1;padding:11px;border-radius:13px;border:none;font-size:13px;font-weight:700;cursor:pointer;transition:background 0.2s,color 0.2s,box-shadow 0.2s;font-family:inherit;";
    b.textContent=o.lbl;
    if(state.flashcards.flashReviewMode===o.k){ b.style.background="var(--primary)"; b.style.color="var(--on-primary)"; b.style.boxShadow="0 4px 16px rgba(var(--primary-rgb),0.3)"; }
    else { b.style.background="transparent"; b.style.color="var(--text2)"; }
    b.onclick=function(){ state.flashcards.flashReviewMode=o.k; state.flashcards.flashIdx=0; state.flashcards.reviewQueue=[]; state.flashcards._shuffledIdx=false; renderFlashcards(); };
    modeRow.appendChild(b);
  });
  el.appendChild(modeRow);

  let workingSet;
  if(state.flashcards.flashReviewMode){
    if(!state.flashcards.reviewQueue.length) state.flashcards.reviewQueue=buildReviewQueue();
    workingSet=state.flashcards.reviewQueue;
    if(!workingSet.length){
      var winBox=mk("div","","text-align:center;padding:60px 0;color:var(--muted);animation:winPop 0.45s var(--ease-spring) both;");
      winBox.appendChild(mk("div","🎉","font-size:48px;margin-bottom:16px;"));
      winBox.appendChild(mk("p","¡Por hoy terminaste!","font-weight:800;font-size:17px;color:var(--text);margin-bottom:6px;letter-spacing:-0.02em;"));
      winBox.appendChild(mk("p","Vuelve mañana o cambia a Todas para practicar más.","font-size:13px;font-weight:500;color:var(--text2);"));
      el.appendChild(winBox);
      if(state.app._reviewPlan&&!state.app._reviewPlan.done){
        var cont=mk("button","✅  Siguiente →","width:calc(100% - 40px);margin:0 20px;padding:14px;border-radius:var(--r-md);border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-size:14px;font-weight:700;cursor:pointer;margin-top:10px;transition:background 0.2s,transform 0.12s;");
        cont.onclick=function(){nextReviewStep();};
        el.appendChild(cont);
      }
      return;
    }
  } else {
    if(!state.flashcards.allOrder||state.flashcards.allOrder.length!==state.session.saved.length){
      state.flashcards.allOrder=state.session.saved.map(function(_,i){return i;});
    }
    workingSet=state.flashcards.allOrder;
  }

  state.flashcards.flashIdx=state.flashcards.flashIdx%workingSet.length;
  const phIdx=workingSet[state.flashcards.flashIdx];
  const ph=state.session.saved[phIdx];
  ensureSrsFields(ph);
  let flipped=false;

  function stopPracticingCurrent(){
    if(!ph) return;
    fcConfirmDelete(ph,function(){
      var removed=state.session.saved.splice(phIdx,1)[0];
      invalidateFlashcardQueues();
      updateBadge(); syncUp(); showToast('Tarjeta borrada: '+(removed&&removed.de?removed.de:''),'success');
      renderFlashcards();
    });
  }

  // ── PROGRESS BAR ──
  var pct=workingSet.length?Math.round(((state.flashcards.flashIdx)/workingSet.length)*100):0;
  var progSection=mk("div","","margin-bottom:16px;");
  var progTop=mk("div","","display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;");
  progTop.appendChild(mk("span",(state.flashcards.flashIdx+1)+" de "+workingSet.length+" repasadas","font-size:13px;color:var(--text2);font-weight:600;"));
  if(typeof state.flashcards.audioMode!=="boolean") state.flashcards.audioMode=false;
  var audioMode=state.flashcards.audioMode;
  var audioTgl=mk("button","🎧","width:30px;height:30px;border-radius:10px;font-size:14px;cursor:pointer;padding:0;line-height:1;margin-right:8px;border:1px solid "+(audioMode?"var(--teal)":"var(--border)")+";background:"+(audioMode?"rgba(var(--teal-rgb),0.15)":"rgba(255,255,255,0.04)")+";transition:background .15s;");
  audioTgl.title="Modo escucha: oís el alemán y recuerdas el significado";
  audioTgl.setAttribute("aria-label","Modo escucha");
  audioTgl.setAttribute("aria-pressed",audioMode?"true":"false");
  audioTgl.onclick=function(){ state.flashcards.audioMode=!state.flashcards.audioMode; renderFlashcards(); };
  progTop.appendChild(audioTgl);
  var fcStrength=srsStrength(ph.box||0);
  var strengthLbl=mk("span","Caja "+ph.box+"/5 · "+fcStrength.label,"font-size:12px;font-weight:700;letter-spacing:0.5px;font-family:var(--font-label);color:"+fcStrength.color+";");
  progTop.appendChild(strengthLbl);
  progSection.appendChild(progTop);
  var pbar=mk("div","",""); pbar.className="stitch-progress";
  pbar.style.cssText="height:6px;";
  pbar.appendChild(mk("span","","width:"+pct+"%;"));
  progSection.appendChild(pbar);
  el.appendChild(progSection);

  // ── FLASHCARD ──
  var card=document.createElement("div"); card.className="flashcard";
  card.style.cssText="padding:44px 30px;min-height:340px;margin:0 auto 28px;border-radius:22px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(var(--gold-rgb),0.09),rgba(var(--gold-rgb),0.03));border:1.5px solid rgba(var(--gold-rgb),0.22);transition:border-color 0.3s,background 0.3s,box-shadow 0.25s;";
  card.setAttribute("role","button");
  card.setAttribute("tabindex","0");
  card.setAttribute("aria-label","Flashcard. Presiona espacio para voltear.");
  state.flashcards._flashcardEl=card;
  state.flashcards._isFlipped=false;
  var inner=document.createElement("div"); inner.className="flashcard-inner";
  inner.style.cssText="width:100%;";
  card.appendChild(inner);

  // Front
  var front=mk("div","","width:100%;text-align:center;"); front.className="flashcard-face flashcard-front";
  if(audioMode){
    // Listening mode: the question is the SOUND — German text hidden until flip
    var bigPlay=document.createElement("button");
    bigPlay.style.cssText="width:88px;height:88px;border-radius:50%;font-size:36px;cursor:pointer;background:rgba(var(--teal-rgb),0.14);border:2px solid rgba(var(--teal-rgb),0.45);margin-bottom:16px;transition:transform .1s,background .15s;";
    bigPlay.textContent="🔊";
    bigPlay.setAttribute("aria-label","Escuchar la frase");
    bigPlay.onclick=function(e){e.stopPropagation();speak(ph.de);};
    front.appendChild(bigPlay);
    front.appendChild(mk("p","¿Qué significa? Escucha y piensa antes de voltear.","font-size:13px;color:var(--muted);font-weight:600;margin-bottom:14px;line-height:1.5;"));
    front.appendChild(mk("p","Toca la card para ver","font-size:12px;color:var(--dim);font-weight:500;opacity:0.6;"));
  } else {
  front.appendChild(mk("p",ph.de,"font-size:clamp(32px,5vw,58px);font-weight:900;color:var(--text);line-height:1.08;margin-bottom:18px;letter-spacing:-0.04em;"));
  if(ph.category) front.appendChild(mk("span",ph.category,"display:inline-block;font-size:10px;padding:3px 10px;border-radius:var(--r-pill);background:rgba(var(--gold-rgb),0.12);color:var(--gold-text);font-weight:700;letter-spacing:1px;font-family:var(--font-label);margin-bottom:12px;"));
  var playF=document.createElement("button");
  playF.style.cssText="background:rgba(var(--gold-rgb),0.1);border:1px solid rgba(var(--gold-rgb),0.25);color:var(--gold-text);border-radius:var(--r-pill);padding:7px 20px;font-size:13px;font-weight:700;margin-bottom:16px;transition:background 0.2s,transform 0.12s;";
  playF.textContent="▶ Escuchar";
  playF.onclick=function(e){e.stopPropagation();speak(ph.de);};
  front.appendChild(playF);
  front.appendChild(mk("p","Toca para ver","font-size:12px;color:var(--dim);font-weight:500;opacity:0.6;"));
  }
  inner.appendChild(front);

  // Back
  var back=mk("div","","width:100%;text-align:center;"); back.className="flashcard-face flashcard-back";
  if(audioMode) back.appendChild(mk("p",ph.de,"font-size:16px;font-weight:800;color:var(--teal-text);margin-bottom:10px;letter-spacing:-0.01em;line-height:1.4;"));
  back.appendChild(mk("p",ph.es,"font-size:clamp(26px,4vw,42px);color:var(--text);line-height:1.16;margin-bottom:12px;font-weight:900;letter-spacing:-0.03em;"));
  if(ph.tip) back.appendChild(mk("p","💡 "+ph.tip,"font-size:13px;color:var(--muted);font-style:italic;font-weight:500;margin-bottom:6px;"));
  if(ph.example) back.appendChild(mk("p",'"'+ph.example+'"',"font-size:13px;color:var(--teal-text);font-weight:500;line-height:1.45;margin-top:8px;font-style:italic;"));
  inner.appendChild(back);

  card.onclick=function(){
    flipped=!flipped;
    state.flashcards._isFlipped=flipped;
    card.classList.toggle("flipped",flipped);
    card.style.borderColor=flipped?"rgba(var(--primary-rgb),0.4)":"rgba(var(--gold-rgb),0.22)";
    card.style.background=flipped?"linear-gradient(135deg,rgba(var(--primary-rgb),0.09),rgba(var(--primary-rgb),0.03))":"linear-gradient(135deg,rgba(var(--gold-rgb),0.09),rgba(var(--gold-rgb),0.03))";
    card.style.boxShadow=flipped?"0 14px 42px rgba(0,0,0,0.38)":"0 8px 32px rgba(0,0,0,0.3)";
    if(flipped){
      gradeRow.style.opacity="1";
      gradeRow.style.pointerEvents="auto";
      gradeRow.style.filter="blur(0)";
    } else {
      gradeRow.style.opacity="0.3";
      gradeRow.style.pointerEvents="none";
      gradeRow.style.filter="blur(2px)";
    }
  };
  el.appendChild(card);

  // ── GRADING SECTION ──
  var gradeSection=mk("div","","");

  // Grading hint
  var gradeHint=mk("p","¿Qué tan bien la sabías?","font-size:13px;color:var(--text2);text-align:center;font-weight:700;margin-bottom:12px;");
  gradeSection.appendChild(gradeHint);

  // Grade buttons row
  var gradeRow=document.createElement("div");
  gradeRow.className="srm-grade-row";
  gradeRow.style.cssText="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:0 auto 14px;opacity:0.3;pointer-events:none;filter:blur(2px);transition:opacity 0.25s cubic-bezier(.16,1,.3,1),filter 0.25s";
  var grades=[
    {k:"fail", label:"✗", sub:"Fallé", col:"var(--red-rgb)", bgClr:"rgba(var(--red-rgb),0.10)", borderClr:"rgba(var(--red-rgb),0.35)", txtClr:"var(--red-text)", days:"Repetir hoy"},
    {k:"hard", label:"🔶", sub:"Difícil", col:"var(--gold-rgb)", bgClr:"rgba(var(--gold-rgb),0.10)", borderClr:"rgba(var(--gold-rgb),0.35)", txtClr:"var(--gold-text)", days:"+"+BOX_INTERVALS[ph.box]+"d"},
    {k:"good", label:"✓", sub:"Bien", col:"var(--green-rgb)", bgClr:"rgba(var(--green-rgb),0.10)", borderClr:"rgba(var(--green-rgb),0.35)", txtClr:"var(--green-text)", days:"+"+BOX_INTERVALS[Math.min(5,ph.box+1)]+"d"},
    {k:"easy", label:"⚡", sub:"Fácil", col:"var(--primary-rgb)", bgClr:"rgba(var(--primary-rgb),0.10)", borderClr:"rgba(var(--primary-rgb),0.35)", txtClr:"var(--primary)", days:"+"+BOX_INTERVALS[Math.min(5,ph.box+2)]+"d"}
  ];
  state.flashcards._gradeBtns=[];
  grades.forEach(function(g){
    var b=document.createElement("button");
    b.className="grade-btn";
    b.style.cssText="border-radius:14px;padding:12px 6px;font-size:12px;font-weight:800;display:flex;flex-direction:column;align-items:center;gap:4px;transition:background 0.15s,border-color 0.15s,transform 0.1s;background:"+g.bgClr+";border:1px solid "+g.borderClr+";color:"+g.txtClr+";";
    b.innerHTML="<span style='font-size:22px;line-height:1;'>"+g.label+"</span><span style='font-size:12px;font-weight:800;'>"+g.sub+"</span><span style='font-size:10px;font-weight:600;opacity:0.7;'>"+g.days+"</span>";
    b.onclick=function(e){
      e.stopPropagation();
      if(g.k==="easy"||g.k==="good") celebrate(card,"celebratePop","0.35s");
      celebrate(b,"celebrateFlash","0.4s");
      srsUpdate(ph, g.k);
      logActivity("phrasesReviewed",1);
      syncUp();
      if(state.flashcards.flashReviewMode){
        state.flashcards.reviewQueue=state.flashcards.reviewQueue.filter(function(i){return i!==phIdx;});
        state.flashcards.flashIdx=0;
      } else {
        state.flashcards.flashIdx=(state.flashcards.flashIdx+1)%state.session.saved.length;
      }
      renderFlashcards();
    };
    state.flashcards._gradeBtns.push(b);
    gradeRow.appendChild(b);
  });
  gradeSection.appendChild(gradeRow);
  el.appendChild(gradeSection);

  // ── SECONDARY ACTIONS (compact row) ──
  var secRow=mk("div","","display:flex;gap:10px;padding:0 0 10px;");
  var skip=mk("button","Saltar →","flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:var(--text2);border-radius:14px;padding:11px;font-size:12px;font-weight:700;transition:background 0.2s,transform 0.12s;");
  skip.onclick=function(){
    if(state.flashcards.flashReviewMode){ state.flashcards.reviewQueue.push(state.flashcards.reviewQueue.shift()); }
    else { state.flashcards.flashIdx=(state.flashcards.flashIdx+1)%state.session.saved.length; }
    renderFlashcards();
  };
  secRow.appendChild(skip);

  var shuffle=mk("button","🔀 Mezclar","flex:1;background:transparent;border:1px dashed rgba(255,255,255,0.12);color:var(--muted);border-radius:14px;padding:11px;font-size:12px;font-weight:600;transition:background 0.2s;");
  shuffle.onclick=function(){
    if(state.flashcards.flashReviewMode) state.flashcards.reviewQueue=shuffledIndices(state.flashcards.reviewQueue);
    else state.flashcards.allOrder=shuffledIndices(state.session.saved.map(function(_,i){return i;}));
    state.flashcards.flashIdx=0; renderFlashcards();
  };
  secRow.appendChild(shuffle);

  var remove=mk("button","🗑 Borrar","flex:1;background:rgba(var(--red-rgb),0.06);border:1px solid rgba(var(--red-rgb),0.18);color:var(--red-text);border-radius:14px;padding:11px;font-size:12px;font-weight:700;transition:background 0.15s;");
  remove.title="Borrar esta tarjeta de guardadas";
  remove.setAttribute("aria-label","Borrar esta tarjeta y dejar de practicarla");
  remove.onclick=stopPracticingCurrent;
  secRow.appendChild(remove);
  el.appendChild(secRow);
}

// ── CREATE FLASHCARD MODAL ────────────────────────────────────────────────────
function openCreateModal(){
  const overlay=document.createElement("div");
  overlay.className="surface-modal";
  let releaseFocus=null;
  function closeModal(){ if(releaseFocus) releaseFocus(); if(overlay.parentNode) overlay.remove(); }
  overlay._closeModal=closeModal;
  overlay.onclick=function(e){if(e.target===overlay) closeModal();};
  const box=document.createElement("div");
  box.className="modal-box";
  box.setAttribute("role","dialog");
  box.setAttribute("aria-modal","true");
  box.setAttribute("aria-label","Crear flashcard");
  box.appendChild(mk("p","➕  Crear flashcard","font-size:14px;font-weight:800;color:var(--gold-text);margin-bottom:16px;"));

  const deLbl=mk("p","Alemán","font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;letter-spacing:1px;font-family:var(--font-label);");
  const deInp=document.createElement("input");
  deInp.placeholder="z.B. Danke schön";
  deInp.className="input-field";
  deInp.style.marginBottom="12px";
  deInp.style.fontWeight="600";
  box.appendChild(deLbl); box.appendChild(deInp);

  // AI auto-complete: fills Spanish + example from the German word
  var aiFillBtn=mk("button","🤖 Completar con IA","margin-bottom:12px;padding:7px 12px;border-radius:9px;border:1px dashed rgba(var(--purple-rgb),0.4);background:rgba(var(--purple-rgb),0.07);color:var(--purple-text);font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;display:block;width:100%;text-align:center;transition:background .15s;");
  aiFillBtn.onmouseenter=function(){this.style.background="rgba(var(--purple-rgb),0.13)";};
  aiFillBtn.onmouseleave=function(){this.style.background="rgba(var(--purple-rgb),0.07)";};
  aiFillBtn.onclick=async function(){
    var deVal=deInp.value.trim();
    if(!deVal){showToast("Escribe la palabra en alemán primero","error");deInp.focus();return;}
    aiFillBtn.disabled=true;aiFillBtn.textContent="⏳ Generando…";
    try{
      var sys="You are a German teacher. Given a German word or phrase, reply ONLY with valid JSON, no markdown: {\"es\":\"natural Spanish translation\",\"example\":\"one short natural German sentence using this word in context\"}";
      var raw=await ai(sys,[{role:"user",content:deVal}],300);
      var m=raw.match(/\{[\s\S]*\}/);
      if(!m) throw new Error("Invalid response");
      var d=JSON.parse(m[0]);
      if(d.es) esInp.value=d.es;
      if(d.example) tipInp.value=d.example;
      showToast("Traducción y ejemplo generados","success");
    }catch(e){showToast("No pude generar — escríbelo manual","error");}
    aiFillBtn.disabled=false;aiFillBtn.textContent="🤖 Completar con IA";
  };
  box.appendChild(aiFillBtn);

  const esLbl=mk("p","Español (opcional con IA)","font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;letter-spacing:1px;font-family:var(--font-label);");
  const esInp=document.createElement("textarea");
  esInp.placeholder="Gracias / Muchas gracias";
  esInp.rows=2;
  esInp.className="input-field";
  esInp.style.marginBottom="12px";
  esInp.style.fontWeight="500";
  esInp.style.resize="vertical";
  box.appendChild(esLbl); box.appendChild(esInp);

  const tipLbl=mk("p","Ejemplo / contexto (opcional)","font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;letter-spacing:1px;font-family:var(--font-label);");
  const tipInp=document.createElement("input");
  tipInp.placeholder="z.B. informal";
  tipInp.className="input-field";
  tipInp.style.marginBottom="16px";
  tipInp.style.fontWeight="500";
  box.appendChild(tipLbl); box.appendChild(tipInp);

  const catLbl=mk("p","Categoría","font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;letter-spacing:1px;font-family:var(--font-label);");
  const catSel=document.createElement("select");
  catSel.className="input-field";
  catSel.style.fontSize="13px";
  catSel.style.color="var(--text)";
  catSel.style.marginBottom="16px";
  catSel.style.fontWeight="500";
  [""].concat(CATEGORIES).forEach(function(c){
    const o=document.createElement("option");o.value=c;o.textContent=c||"Sin categoría";
    catSel.appendChild(o);
  });
  box.appendChild(catLbl); box.appendChild(catSel);

  const row=mk("div","","display:flex;gap:8px;");
  const saveBtn=document.createElement("button");
  saveBtn.textContent="Guardar";
  saveBtn.className="btn-solid gold";
  saveBtn.style.flex="1";
  saveBtn.style.padding="11px";
  saveBtn.onclick=function(){
    const de=deInp.value.trim(), es=esInp.value.trim();
    if(!de||!es){ showToast("Completa alemán y español","error"); return; }
    const ph=ensureSrsFields({de:de, es:es, tip:tipInp.value.trim(), category:catSel.value, source:"manual", box:0, nextReview:todayKey()});
    if(state.session.saved.some(function(x){return x.de===ph.de;})){ showToast("Ya existe esa frase","error"); return; }
    state.session.saved.push(ph); invalidateFlashcardQueues(); updateBadge(); syncUp();
    closeModal();
    showToast("Flashcard creada");
    renderSaved();
  };
  const cancelBtn=document.createElement("button");
  cancelBtn.textContent="Cancelar";
  cancelBtn.className="btn-ghost";
  cancelBtn.style.flex="1";
  cancelBtn.style.padding="11px";
  cancelBtn.style.fontSize="14px";
  cancelBtn.style.fontWeight="600";
  cancelBtn.style.border="1px solid rgba(255,255,255,0.1)";
  cancelBtn.onclick=closeModal;
  row.appendChild(saveBtn); row.appendChild(cancelBtn);
  box.appendChild(row);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  releaseFocus=trapFocus(box,closeModal);
}

// ── In-app delete confirmation modal (replaces browser confirm()) ─────────────
function fcConfirmDelete(ph, onConfirm){
  var overlay=mk("div","","position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;transition:opacity .18s ease;");
  var card=mk("div","","background:var(--modal-bg,var(--surface));border:1px solid var(--border);border-radius:18px;padding:22px 20px;width:100%;max-width:340px;box-shadow:0 16px 48px rgba(0,0,0,0.6);transform:scale(.95);transition:transform .18s cubic-bezier(.16,1,.3,1);");
  card.setAttribute("role","dialog"); card.setAttribute("aria-modal","true"); card.setAttribute("aria-label","Confirmar borrado");
  card.appendChild(mk("p","¿Borrar esta tarjeta?","font-size:17px;font-weight:800;color:var(--text);letter-spacing:-0.01em;margin-bottom:6px;"));
  card.appendChild(mk("p",ph.de||"","font-size:14px;font-weight:700;color:var(--gold-text);line-height:1.4;margin-bottom:4px;"));
  card.appendChild(mk("p","Ya no aparecerá para practicar.","font-size:12px;color:var(--muted);font-weight:500;margin-bottom:18px;"));
  var row=mk("div","","display:flex;gap:8px;");
  var cancel=mk("button","Cancelar","flex:1;padding:12px;border-radius:12px;border:1px solid var(--border);background:rgba(255,255,255,0.05);color:var(--muted);font-size:13.5px;font-weight:800;cursor:pointer;font-family:inherit;");
  var del=mk("button","Borrar","flex:1;padding:12px;border-radius:12px;border:none;background:rgba(var(--red-rgb),0.16);color:var(--red-text,var(--red));font-size:13.5px;font-weight:900;cursor:pointer;font-family:inherit;border:1px solid rgba(var(--red-rgb),0.4);");
  row.appendChild(cancel); row.appendChild(del);
  card.appendChild(row);
  overlay.appendChild(card);
  function close(){
    overlay.style.opacity="0"; card.style.transform="scale(.95)";
    document.removeEventListener("keydown",onKey);
    setTimeout(function(){ if(overlay.parentNode) overlay.parentNode.removeChild(overlay); },180);
  }
  function onKey(e){ if(e.key==="Escape") close(); }
  overlay.onclick=function(e){ if(e.target===overlay) close(); };
  cancel.onclick=close;
  del.onclick=function(){ close(); onConfirm(); };
  document.addEventListener("keydown",onKey);
  document.body.appendChild(overlay);
  requestAnimationFrame(function(){ overlay.style.opacity="1"; card.style.transform="scale(1)"; });
  del.focus();
}
