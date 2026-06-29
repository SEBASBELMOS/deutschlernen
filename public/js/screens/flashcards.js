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
    empty.appendChild(mk("p","Sin tarjetas aun","font-weight:700;font-size:15px;margin-bottom:8px;color:#94a3b8;"));
    empty.appendChild(mk("p","Ve a Frases o No entendi y guarda algunas.","font-size:13px;font-weight:500;"));
    el.appendChild(empty);
    return;
  }

  const modeRow=mk("div","","display:flex;gap:8px;margin-bottom:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:4px;");
  const dueN=reviewDueCount();
  [{k:true,lbl:"🎯 Pendientes ("+dueN+")"},{k:false,lbl:"📚 Todas ("+state.session.saved.length+")"}].forEach(function(o){
    const b=document.createElement("button");
    b.style.cssText="flex:1;padding:9px;border-radius:10px;border:none;font-size:13px;font-weight:700;cursor:pointer;transition:background 0.2s,color 0.2s,box-shadow 0.2s;";
    b.textContent=o.lbl;
    if(state.flashcards.flashReviewMode===o.k){ b.style.background="#ffb955"; b.style.color="#000"; b.style.boxShadow="0 2px 10px rgba(255,185,85,0.3)"; }
    else { b.style.background="transparent"; b.style.color="#64748b"; }
    b.onclick=function(){ state.flashcards.flashReviewMode=o.k; state.flashcards.flashIdx=0; state.flashcards.reviewQueue=[]; state.flashcards._shuffledIdx=false; renderFlashcards(); };
    modeRow.appendChild(b);
  });
  el.appendChild(modeRow);

  let workingSet;
  if(state.flashcards.flashReviewMode){
    if(!state.flashcards.reviewQueue.length) state.flashcards.reviewQueue=buildReviewQueue();
    workingSet=state.flashcards.reviewQueue;
    if(!workingSet.length){
      const winBox=document.createElement("div");
      winBox.style.cssText="text-align:center;padding:60px 0;color:var(--muted);animation:winPop 0.45s var(--ease-spring) both;";
      winBox.appendChild(mk("div","🎉","font-size:48px;margin-bottom:16px;"));
      winBox.appendChild(mk("p","Por hoy terminaste","font-weight:700;font-size:15px;color:#94a3b8;margin-bottom:6px;"));
      winBox.appendChild(mk("p","Vuelve mañana o cambia a Todas.","font-size:13px;font-weight:500;"));
      el.appendChild(winBox);
      if(state.app._reviewPlan&&!state.app._reviewPlan.done){
        var cont=mk("button","✅  Siguiente →","width:calc(100% - 40px);margin:0 20px;padding:14px;border-radius:12px;border:none;background:rgba(93,217,208,0.12);color:#5dd9d0;font-size:14px;font-weight:700;cursor:pointer;margin-top:10px;");
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

  const counter=mk("p",(state.flashcards.flashIdx+1)+" de "+workingSet.length+(state.flashcards.flashReviewMode?" pendientes":"")+"  ·  Caja "+ph.box+"/5","color:var(--muted);font-size:12px;text-align:center;margin-bottom:14px;font-weight:600;letter-spacing:0.02em;");
  el.appendChild(counter);

  const card=document.createElement("div"); card.className="flashcard";
  state.flashcards._flashcardEl=card;
  const inner=document.createElement("div"); inner.className="flashcard-inner";
  card.appendChild(inner);

  const front=mk("div","",""); front.className="flashcard-face flashcard-front";
  var deMark=mk("div","","display:flex;justify-content:center;margin-bottom:20px;color:rgba(255,185,85,0.75);");
  deMark.appendChild(langBadge("DE","rgba(255,185,85,0.75)"));
  front.appendChild(deMark);
  front.appendChild(mk("p",ph.de,"font-size:22px;font-weight:900;color:var(--text);line-height:1.4;margin-bottom:16px;letter-spacing:-0.02em;"));
  const playF=document.createElement("button");
  playF.style.cssText="background:rgba(255,185,85,0.12);border:1px solid rgba(255,185,85,0.3);color:#ffb955;border-radius:20px;padding:7px 18px;font-size:13px;font-weight:700;transition:background 0.2s;";
  playF.textContent="▶ Escuchar";
  playF.onclick=function(e){e.stopPropagation();speak(ph.de);};
  front.appendChild(playF); inner.appendChild(front);

  const back=mk("div","",""); back.className="flashcard-face flashcard-back";
  var esMark=mk("div","","display:flex;justify-content:center;margin-bottom:20px;color:rgba(93,217,208,0.75);");
  esMark.appendChild(langBadge("ES","rgba(93,217,208,0.75)"));
  back.appendChild(esMark);
  back.appendChild(mk("p",ph.es,"font-size:20px;color:var(--text);line-height:1.45;margin-bottom:10px;font-weight:600;"));
  if(ph.tip) back.appendChild(mk("p","💡 "+ph.tip,"font-size:13px;color:var(--muted);font-style:italic;font-weight:500;"));
  inner.appendChild(back);

  card.onclick=function(){
    flipped=!flipped;
    card.classList.toggle("flipped",flipped);
    card.style.borderColor=flipped?"rgba(93,217,208,0.35)":"rgba(255,185,85,0.2)";
    card.style.background=flipped?"linear-gradient(135deg,rgba(93,217,208,0.07),rgba(93,217,208,0.02))":"linear-gradient(135deg,rgba(255,185,85,0.09),rgba(255,185,85,0.03))";
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
  el.appendChild(mk("p","Toca para ver la traducción y calificar","color:var(--dim);font-size:12px;text-align:center;margin-bottom:14px;font-weight:500;"));

  const gradeRow=document.createElement("div");
  gradeRow.style.cssText="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;opacity:0.3;pointer-events:none;filter:blur(2px);transition:opacity 0.25s cubic-bezier(.16,1,.3,1),filter 0.25s";
  const grades=[
    {k:"fail",  lbl:"Fallé",   col:"#ffb4ab", days:"hoy"},
    {k:"hard",  lbl:"Dificil", col:"#fbbf24", days:BOX_INTERVALS[ph.box]+"d"},
    {k:"good",  lbl:"Bien",    col:"#4ade80", days:BOX_INTERVALS[Math.min(5,ph.box+1)]+"d"},
    {k:"easy",  lbl:"Fácil",   col:"#5dd9d0", days:BOX_INTERVALS[Math.min(5,ph.box+2)]+"d"}
  ];
  state.flashcards._gradeBtns=[];
  grades.forEach(function(g){
    const b=document.createElement("button");
    b.className="grade-btn";
    b.style.cssText="border-radius:12px;padding:10px 6px;font-size:12px;font-weight:800;display:flex;flex-direction:column;gap:2px;transition:background 0.15s,transform 0.1s;";
    b.style.setProperty("--grade-color",g.col);
    b.style.background="rgba("+hexToRgb(g.col)+",0.1)";
    b.style.borderColor=g.col+"55";
    b.style.color=g.col;
    b.innerHTML=g.lbl+"<span style='font-size:10px;font-weight:600;opacity:0.7;'>"+g.days+"</span>";
    b.onclick=function(){
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
  el.appendChild(gradeRow);

  const nav=mk("div","","display:flex;gap:10px;margin-top:6px;");
  const skip=mk("button","Saltar →","flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#94a3b8;border-radius:12px;padding:10px;font-size:13px;font-weight:700;");
  skip.onclick=function(){
    if(state.flashcards.flashReviewMode){ state.flashcards.reviewQueue.push(state.flashcards.reviewQueue.shift()); }
    else { state.flashcards.flashIdx=(state.flashcards.flashIdx+1)%state.session.saved.length; }
    renderFlashcards();
  };
  const remove=mk("button","Borrar / Ya no practicar","flex:1;background:rgba(255,180,171,0.08);border:1px solid rgba(255,180,171,0.22);color:#ffb4ab;border-radius:12px;padding:10px;font-size:13px;font-weight:800;");
  remove.title="Borrar esta tarjeta de guardadas";
  remove.setAttribute("aria-label","Borrar esta tarjeta y dejar de practicarla");
  remove.onclick=stopPracticingCurrent;
  nav.appendChild(skip); nav.appendChild(remove); el.appendChild(nav);

  const shuffle=mk("button","🔀  Mezclar","width:100%;background:transparent;border:1px dashed rgba(255,255,255,0.1);color:var(--muted);border-radius:14px;padding:10px;font-size:13px;font-weight:600;margin-top:10px;");
  shuffle.onclick=function(){
    if(state.flashcards.flashReviewMode) state.flashcards.reviewQueue=[...state.flashcards.reviewQueue].sort(function(){return Math.random()-0.5;});
    else state.flashcards._shuffledIdx=true;
    state.flashcards.flashIdx=0; renderFlashcards();
  };
  el.appendChild(shuffle);
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

  const deLbl=mk("p","Aleman","font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;letter-spacing:1px;");
  const deInp=document.createElement("input");
  deInp.placeholder="z.B. Danke schön";
  deInp.className="input-field";
  deInp.style.marginBottom="12px";
  deInp.style.fontWeight="600";
  box.appendChild(deLbl); box.appendChild(deInp);

  const esLbl=mk("p","Espanol","font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;letter-spacing:1px;");
  const esInp=document.createElement("textarea");
  esInp.placeholder="Gracias / Muchas gracias";
  esInp.rows=2;
  esInp.className="input-field";
  esInp.style.marginBottom="12px";
  esInp.style.fontWeight="500";
  esInp.style.resize="vertical";
  box.appendChild(esLbl); box.appendChild(esInp);

  const tipLbl=mk("p","Tip (opcional)","font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;letter-spacing:1px;");
  const tipInp=document.createElement("input");
  tipInp.placeholder="z.B. informal";
  tipInp.className="input-field";
  tipInp.style.marginBottom="16px";
  tipInp.style.fontWeight="500";
  box.appendChild(tipLbl); box.appendChild(tipInp);

  const catLbl=mk("p","Categoria","font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;letter-spacing:1px;");
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
    if(!de||!es){ showToast("Completa aleman y espanol","error"); return; }
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
