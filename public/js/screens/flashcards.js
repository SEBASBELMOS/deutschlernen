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
    var empty=mk("div","","text-align:center;padding:70px 0;color:var(--muted);");
    var emptyIcon=mk("div","","font-size:48px;margin-bottom:16px;color:var(--gold-text);display:flex;justify-content:center;");
    emptyIcon.appendChild(ico("cards",48));
    empty.appendChild(emptyIcon);
    empty.appendChild(mk("p","Sin tarjetas aún","font-weight:700;font-size:15px;margin-bottom:8px;color:var(--text2);"));
    empty.appendChild(mk("p","Ve a Frases o No entendí y guardá algunas.","font-size:13px;font-weight:500;"));
    el.appendChild(empty);
    return;
  }

  const dueN=reviewDueCount();

  // ── HEADER: compact ──
  var hdr=mk("div","","padding:16px 18px 8px;");
  hdr.appendChild(mk("h2","Flashcards","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;margin-bottom:2px;"));
  var subLabel=state.flashcards.flashReviewMode?dueN+" pendientes":state.session.saved.length+" tarjetas";
  hdr.appendChild(mk("p",subLabel+" · SRS v4.2","font-size:13px;color:var(--muted);font-weight:500;"));
  el.appendChild(hdr);

  // ── MODE TOGGLE ──
  var modeRow=mk("div","","display:flex;gap:8px;margin:0 18px 16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:4px;");
  [{k:true,lbl:"🎯 Pendientes ("+dueN+")"},{k:false,lbl:"📚 Todas ("+state.session.saved.length+")"}].forEach(function(o){
    var b=document.createElement("button");
    b.style.cssText="flex:1;padding:10px;border-radius:10px;border:none;font-size:13px;font-weight:700;cursor:pointer;transition:background 0.2s,color 0.2s,box-shadow 0.2s;";
    b.textContent=o.lbl;
    if(state.flashcards.flashReviewMode===o.k){ b.style.background="var(--gold)"; b.style.color="#000"; b.style.boxShadow="0 2px 10px rgba(var(--gold-rgb),0.3)"; }
    else { b.style.background="transparent"; b.style.color="var(--muted)"; }
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
      winBox.appendChild(mk("p","Por hoy terminaste","font-weight:700;font-size:15px;color:var(--text2);margin-bottom:6px;"));
      winBox.appendChild(mk("p","Volvé mañana o cambiá a Todas.","font-size:13px;font-weight:500;"));
      el.appendChild(winBox);
      if(state.app._reviewPlan&&!state.app._reviewPlan.done){
        var cont=mk("button","✅  Siguiente →","width:calc(100% - 40px);margin:0 20px;padding:14px;border-radius:var(--r-md);border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-size:14px;font-weight:700;cursor:pointer;margin-top:10px;transition:background 0.2s,transform 0.12s;");
        cont.onclick=function(){nextReviewStep();};
        el.appendChild(cont);
      }
      return;
    }
  } else {
    workingSet=state.session.saved.map(function(_,i){return i;});
    if(state.flashcards._shuffledIdx) workingSet=workingSet.sort(function(){return Math.random()-0.5;});
  }

  state.flashcards.flashIdx=state.flashcards.flashIdx%workingSet.length;
  const phIdx=workingSet[state.flashcards.flashIdx];
  const ph=state.session.saved[phIdx];
  ensureSrsFields(ph);
  let flipped=false;

  function stopPracticingCurrent(){
    if(!ph) return;
    if(!confirm('¿Borrar esta tarjeta de tus guardadas? Ya no aparecerá para practicar.')) return;
    var removed=state.session.saved.splice(phIdx,1)[0];
    if(state.flashcards.flashReviewMode){
      state.flashcards.reviewQueue=state.flashcards.reviewQueue.filter(function(i){return i!==phIdx;}).map(function(i){return i>phIdx?i-1:i;});
      state.flashcards.flashIdx=0;
    } else {
      state.flashcards.flashIdx=Math.min(state.flashcards.flashIdx, Math.max(0,state.session.saved.length-1));
      state.flashcards._shuffledIdx=false;
    }
    updateBadge(); syncUp(); showToast('Tarjeta borrada: '+(removed&&removed.de?removed.de:''),'success');
    renderFlashcards();
  }

  // ── PROGRESS BAR ──
  var pct=workingSet.length?Math.round(((state.flashcards.flashIdx)/workingSet.length)*100):0;
  var progSection=mk("div","","padding:0 18px;margin-bottom:16px;");
  var progTop=mk("div","","display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;");
  progTop.appendChild(mk("span",(state.flashcards.flashIdx+1)+" de "+workingSet.length+" repasadas","font-size:13px;color:var(--text2);font-weight:600;"));
  progTop.appendChild(mk("span","Caja "+ph.box+"/5","font-size:12px;color:var(--muted);font-weight:700;letter-spacing:1px;font-family:var(--font-label);"));
  progSection.appendChild(progTop);
  var pbar=mk("div","",""); pbar.className="stitch-progress";
  pbar.style.cssText="height:6px;";
  pbar.appendChild(mk("span","","width:"+pct+"%;"));
  progSection.appendChild(pbar);
  el.appendChild(progSection);

  // ── FLASHCARD ──
  var card=document.createElement("div"); card.className="flashcard";
  card.style.cssText="padding:40px 28px;min-height:280px;margin:0 18px 16px;border-radius:20px;display:flex;align-items:center;justify-content:center;";
  state.flashcards._flashcardEl=card;
  var inner=document.createElement("div"); inner.className="flashcard-inner";
  inner.style.cssText="width:100%;";
  card.appendChild(inner);

  // Front
  var front=mk("div","","width:100%;text-align:center;"); front.className="flashcard-face flashcard-front";
  front.appendChild(mk("p",ph.de,"font-size:28px;font-weight:900;color:var(--text);line-height:1.15;margin-bottom:14px;letter-spacing:-0.03em;"));
  if(ph.category) front.appendChild(mk("span",ph.category,"display:inline-block;font-size:10px;padding:3px 10px;border-radius:var(--r-pill);background:rgba(var(--gold-rgb),0.12);color:var(--gold-text);font-weight:700;letter-spacing:1px;font-family:var(--font-label);margin-bottom:12px;"));
  var playF=document.createElement("button");
  playF.style.cssText="background:rgba(var(--gold-rgb),0.1);border:1px solid rgba(var(--gold-rgb),0.25);color:var(--gold-text);border-radius:var(--r-pill);padding:7px 20px;font-size:13px;font-weight:700;margin-bottom:16px;transition:background 0.2s,transform 0.12s;";
  playF.textContent="▶ Escuchar";
  playF.onclick=function(e){e.stopPropagation();speak(ph.de);};
  front.appendChild(playF);
  front.appendChild(mk("p","Tocá para ver","font-size:12px;color:var(--dim);font-weight:500;opacity:0.6;"));
  inner.appendChild(front);

  // Back
  var back=mk("div","","width:100%;text-align:center;"); back.className="flashcard-face flashcard-back";
  back.appendChild(mk("p",ph.es,"font-size:24px;color:var(--text);line-height:1.2;margin-bottom:10px;font-weight:800;letter-spacing:-0.02em;"));
  if(ph.tip) back.appendChild(mk("p","💡 "+ph.tip,"font-size:13px;color:var(--muted);font-style:italic;font-weight:500;margin-bottom:6px;"));
  if(ph.example) back.appendChild(mk("p",'"'+ph.example+'"',"font-size:13px;color:var(--teal-text);font-weight:500;line-height:1.45;margin-top:8px;font-style:italic;"));
  inner.appendChild(back);

  card.onclick=function(){
    flipped=!flipped;
    card.classList.toggle("flipped",flipped);
    card.style.borderColor=flipped?"rgba(var(--teal-rgb),0.35)":"rgba(var(--gold-rgb),0.2)";
    card.style.background=flipped?"linear-gradient(135deg,rgba(var(--teal-rgb),0.07),rgba(var(--teal-rgb),0.02))":"linear-gradient(135deg,rgba(var(--gold-rgb),0.09),rgba(var(--gold-rgb),0.03))";
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
  var gradeSection=mk("div","","padding:0 18px;");

  // Grading hint
  var gradeHint=mk("p","¿Qué tan bien la sabías?","font-size:12px;color:var(--muted);text-align:center;font-weight:600;margin-bottom:10px;");
  gradeSection.appendChild(gradeHint);

  // Grade buttons row
  var gradeRow=document.createElement("div");
  gradeRow.className="srm-grade-row";
  gradeRow.style.cssText="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;opacity:0.3;pointer-events:none;filter:blur(2px);transition:opacity 0.25s cubic-bezier(.16,1,.3,1),filter 0.25s";
  var grades=[
    {k:"fail", label:"✗", sub:"Fallé", col:hexToRgb("#ffb4ab"), bgClr:"rgba(255,180,171,0.12)", borderClr:"rgba(255,180,171,0.35)", txtClr:"var(--red-text)", days:"Hoy"},
    {k:"hard", label:"🔶", sub:"Difícil", col:hexToRgb("#ffb955"), bgClr:"rgba(255,185,85,0.12)", borderClr:"rgba(255,185,85,0.35)", txtClr:"var(--gold-text)", days:"+"+BOX_INTERVALS[ph.box]+"d"},
    {k:"good", label:"✓", sub:"Bien", col:hexToRgb("#7bd89b"), bgClr:"rgba(123,216,155,0.12)", borderClr:"rgba(123,216,155,0.35)", txtClr:"var(--green-text)", days:"+"+BOX_INTERVALS[Math.min(5,ph.box+1)]+"d"},
    {k:"easy", label:"⚡", sub:"Fácil", col:hexToRgb("#5dd9d0"), bgClr:"rgba(93,217,208,0.12)", borderClr:"rgba(93,217,208,0.35)", txtClr:"var(--teal-text)", days:"+"+BOX_INTERVALS[Math.min(5,ph.box+2)]+"d"}
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
  var secRow=mk("div","","display:flex;gap:10px;padding:0 18px 10px;");
  var skip=mk("button","Saltar →","flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:var(--text2);border-radius:var(--r-md);padding:10px;font-size:12px;font-weight:700;transition:background 0.2s,transform 0.12s;");
  skip.onclick=function(){
    if(state.flashcards.flashReviewMode){ state.flashcards.reviewQueue.push(state.flashcards.reviewQueue.shift()); }
    else { state.flashcards.flashIdx=(state.flashcards.flashIdx+1)%state.session.saved.length; }
    renderFlashcards();
  };
  secRow.appendChild(skip);

  var shuffle=mk("button","🔀 Mezclar","flex:1;background:transparent;border:1px dashed rgba(255,255,255,0.1);color:var(--muted);border-radius:var(--r-md);padding:10px;font-size:12px;font-weight:600;");
  shuffle.onclick=function(){
    if(state.flashcards.flashReviewMode) state.flashcards.reviewQueue=[].concat(state.flashcards.reviewQueue).sort(function(){return Math.random()-0.5;});
    else state.flashcards._shuffledIdx=true;
    state.flashcards.flashIdx=0; renderFlashcards();
  };
  secRow.appendChild(shuffle);

  var remove=mk("button","🗑 Borrar","flex:1;background:rgba(var(--red-rgb),0.06);border:1px solid rgba(var(--red-rgb),0.18);color:var(--red-text);border-radius:var(--r-md);padding:10px;font-size:12px;font-weight:700;");
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

  const esLbl=mk("p","Español","font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;letter-spacing:1px;font-family:var(--font-label);");
  const esInp=document.createElement("textarea");
  esInp.placeholder="Gracias / Muchas gracias";
  esInp.rows=2;
  esInp.className="input-field";
  esInp.style.marginBottom="12px";
  esInp.style.fontWeight="500";
  esInp.style.resize="vertical";
  box.appendChild(esLbl); box.appendChild(esInp);

  const tipLbl=mk("p","Tip (opcional)","font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;letter-spacing:1px;font-family:var(--font-label);");
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
    if(!de||!es){ showToast("Completá alemán y español","error"); return; }
    const ph=ensureSrsFields({de:de, es:es, tip:tipInp.value.trim(), category:catSel.value});
    if(state.session.saved.some(function(x){return x.de===ph.de;})){ showToast("Ya existe esa frase","error"); return; }
    state.session.saved.push(ph); updateBadge(); syncUp();
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
