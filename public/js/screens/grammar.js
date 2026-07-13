// ── Grammar (Stitch-ported visual) ─────────────────────────────────────────────
state.grammar._gramDrills=[], state.grammar._gramIdx=0, state.grammar._gramCorrect=0, state.grammar._gramMissed=[], state.grammar._gramTopic=null;

// Helper: SVG progress ring (Stitch port — grammar topics)
function mkProgressRing(pct, accentColor) {
  var wrap = document.createElement("div");
  wrap.style.cssText = "position:relative;width:42px;height:42px;flex-shrink:0;";
  var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 36 36");
  svg.style.cssText = "width:100%;height:100%;transform:rotate(-90deg);";
  var track = document.createElementNS("http://www.w3.org/2000/svg","circle");
  track.setAttribute("cx","18"); track.setAttribute("cy","18"); track.setAttribute("r","15");
  track.setAttribute("fill","none"); track.setAttribute("stroke","rgba(255,255,255,0.08)");
  track.setAttribute("stroke-width","2.5");
  svg.appendChild(track);
  var fill = document.createElementNS("http://www.w3.org/2000/svg","circle");
  fill.setAttribute("cx","18"); fill.setAttribute("cy","18"); fill.setAttribute("r","15");
  fill.setAttribute("fill","none"); fill.setAttribute("stroke",accentColor);
  fill.setAttribute("stroke-width","2.5"); fill.setAttribute("stroke-linecap","round");
  fill.setAttribute("stroke-dasharray","94.2");
  fill.setAttribute("stroke-dashoffset", String(94.2 * (1 - pct/100)));
  fill.style.transition = "stroke-dashoffset 0.5s cubic-bezier(.16,1,.3,1)";
  svg.appendChild(fill);
  wrap.appendChild(svg);
  var label = document.createElement("span");
  label.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:var(--text2);font-variant-numeric:tabular-nums;";
  label.textContent = pct + "%";
  wrap.appendChild(label);
  return wrap;
}

function renderGrammar() {
  const el=document.getElementById("s-gramatica"); el.innerHTML="";

  // Drill session in progress — render step
  if(state.grammar._gramDrills&&state.grammar._gramDrills.length>0&&state.grammar._gramIdx<state.grammar._gramDrills.length){
    if(state.grammar._gramTopic){
      renderGrammarDrillShell(state.grammar._gramTopic);
    }
    return;
  }

  // ── Fable header ──
  var hdr=mk("div","","margin-bottom:14px;");
  hdr.appendChild(mk("p","Alemán · Práctica dirigida","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","Gramática","font-size:24px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin:3px 0 4px;color:var(--text);"));
  hdr.appendChild(mk("p","Tu dominio por tema — el drill ataca lo más flojo primero.","font-size:13px;color:var(--muted);font-weight:500;margin-bottom:0;"));
  el.appendChild(hdr);

  // ── CTA: Repaso personalizado (Fable purple card) ──
  var gs=state.grammar.grammarStats||{};
  // Find weakest topics
  var scoredTopics=GRAMMAR_TOPICS.map(function(t){
    var stat=gs[t.key];
    var pct=stat&&((stat.right||0)+(stat.wrong||0))?Math.round((stat.right||0)/((stat.right||0)+(stat.wrong||0))*100):0;
    var hasData=stat&&((stat.right||0)+(stat.wrong||0))>0;
    return {topic:t, pct:pct, hasData:hasData};
  });
  scoredTopics.sort(function(a,b){return a.pct-b.pct;});
  var weakCount=scoredTopics.filter(function(s){return s.hasData&&s.pct<50;}).length;

  // ── Stitch CTA: primary-container hero card ──
  var cta=mk("div","","position:relative;overflow:hidden;border:1px solid rgba(var(--primary-rgb),0.32);border-radius:22px;background:linear-gradient(140deg,var(--primary-container),rgba(var(--primary-rgb),0.12) 60%);padding:22px 18px;margin-bottom:14px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:transform .12s,box-shadow .2s;color:var(--on-primary-container);");
  // Decorative glow
  var ctaGlow=mk("span","","position:absolute;top:-30px;right:-30px;width:120px;height:120px;background:rgba(var(--primary-rgb),0.18);border-radius:50%;filter:blur(30px);pointer-events:none;");
  cta.appendChild(ctaGlow);
  cta.onmouseenter=function(){this.style.transform="translateY(-2px)";this.style.boxShadow="0 14px 36px rgba(var(--primary-rgb),0.2)";};
  cta.onmouseleave=function(){this.style.transform="";this.style.boxShadow="";};
  var ctaIcon=mk("span","🎯","width:50px;height:50px;border-radius:17px;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.14);display:flex;align-items:center;justify-content:center;font-size:27px;flex-shrink:0;position:relative;z-index:1;");
  cta.appendChild(ctaIcon);
  var ctaInner=mk("div","","flex:1;min-width:0;position:relative;z-index:1;");
  ctaInner.appendChild(mk("b","Repaso personalizado","display:block;font-size:15.5px;font-weight:800;letter-spacing:-0.01em;color:var(--on-primary-container);"));
  ctaInner.appendChild(mk("p",weakCount+" temas flojos detectados · ~5 min","font-size:12px;color:rgba(222,224,255,0.72);font-weight:500;margin-top:2px;line-height:1.45;"));
  var goBtn=mk("button","Empezar →","margin-left:auto;flex-shrink:0;background:var(--primary);color:var(--on-primary);border:none;border-radius:12px;padding:11px 18px;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(var(--primary-rgb),0.35);white-space:nowrap;font-family:inherit;position:relative;z-index:1;");
  goBtn.onclick=function(e){e.stopPropagation();
    if(scoredTopics.length>0) loadGrammarDrills(scoredTopics[0].topic);
  };
  cta.appendChild(ctaInner);
  cta.appendChild(goBtn);
  cta.onclick=function(){if(scoredTopics.length>0) loadGrammarDrills(scoredTopics[0].topic);};
  el.appendChild(cta);

  // ── Overall mastery (Stitch surface-2 card) ──
  var activeCount=scoredTopics.filter(function(s){return s.hasData;}).length;
  var overallPct=activeCount>0?Math.round(scoredTopics.reduce(function(sum,s){return sum+s.pct;},0)/scoredTopics.length):0;
  var overallCard=mk("div","","background:var(--surface-2);border:1px solid rgba(69,70,82,0.6);border-radius:18px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);padding:18px;margin-bottom:14px;box-shadow:0 4px 20px rgba(0,0,0,0.18);");
  var overallTop=mk("div","","display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px;");
  overallTop.appendChild(mk("span","Dominio general","font-size:10.5px;letter-spacing:2px;font-weight:800;color:var(--muted);text-transform:uppercase;"));
  var overallVal=mk("div","","");
  overallVal.appendChild(mk("b",overallPct+"%","font-size:28px;font-weight:900;letter-spacing:-0.03em;font-variant-numeric:tabular-nums;color:var(--text);"));
  overallVal.appendChild(mk("span"," · "+activeCount+"/"+GRAMMAR_TOPICS.length+" activos","font-size:11px;color:var(--muted);font-weight:600;"));
  overallTop.appendChild(overallVal);
  overallCard.appendChild(overallTop);
  var obar=mk("div","","height:8px;border-radius:6px;background:rgba(255,255,255,0.08);overflow:hidden;");
  var ofill=mk("div","","display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,var(--primary),rgba(var(--primary-rgb),0.7));width:"+overallPct+"%;transition:width 0.5s cubic-bezier(.16,1,.3,1);");
  obar.appendChild(ofill);
  overallCard.appendChild(obar);
  el.appendChild(overallCard);

  // ── Topic cards (Stitch glass-cards with progress rings & mastery badges) ──
  var topicCard=mk("div","","border-radius:20px;padding:16px;margin-bottom:14px;");
  topicCard.className="stitch-glass stagger";
  topicCard.appendChild(mk("p","Temas · "+GRAMMAR_TOPICS.length,"font-size:10.5px;letter-spacing:2px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:14px;"));
  var weakestIdx=scoredTopics.length>0&&scoredTopics[0].hasData?0:-1;
  scoredTopics.forEach(function(st,i){
    var t=st.topic;
    var isWeak=st.hasData&&st.pct<50;
    var isNew=!st.hasData;
    var isWeakest=i===weakestIdx&&isWeak;

    // Mastery level badge (Stitch: Lernend/Neu/Meisterhaft)
    var badgeLabel="Neu"; var badgeClass="new";
    if(isNew){badgeLabel="Neu";badgeClass="new";}
    else if(st.pct>=80){badgeLabel="Meisterhaft";badgeClass="master";}
    else {badgeLabel="Lernend";badgeClass="learning";}

    var ringColor = isNew ? "var(--dim)" : (isWeak ? "var(--red)" : (st.pct>=80 ? "var(--secondary)" : "var(--primary)"));

    var row=mk("div","");
    row.className="grammar-topic-row";

    var icon=mk("span",t.icon,"width:42px;height:42px;border-radius:14px;background:rgba(var(--primary-rgb),0.10);display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0;border:1px solid rgba(var(--primary-rgb),0.12);");
    row.appendChild(icon);

    var mid=mk("div","","flex:1;min-width:0;");
    var nameRow=mk("div","","display:flex;align-items:center;gap:8px;margin-bottom:5px;min-width:0;");
    var nameSpan=mk("span",t.label,"font-size:14.5px;font-weight:850;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text);letter-spacing:-0.01em;");
    nameRow.appendChild(nameSpan);
    // Mastery badge chip
    var badge=mk("span",badgeLabel);
    badge.className="grammar-mastery-badge "+badgeClass;
    nameRow.appendChild(badge);
    if(isWeakest){
      var flag=mk("span","Más débil","font-size:8px;font-weight:900;letter-spacing:1px;color:var(--red);background:rgba(var(--red-rgb),0.14);border-radius:99px;padding:2px 7px;text-transform:uppercase;flex-shrink:0;");
      nameRow.appendChild(flag);
    }
    mid.appendChild(nameRow);
    // Compact progress bar (under name)
    var tbar=mk("div","","height:5px;border-radius:999px;background:rgba(255,255,255,0.07);overflow:hidden;margin-top:4px;");
    var tfill=mk("div","","display:block;height:100%;border-radius:3px;background:"+ringColor+";width:"+st.pct+"%;transition:width 0.4s cubic-bezier(.16,1,.3,1);");
    tbar.appendChild(tfill);
    mid.appendChild(tbar);
    row.appendChild(mid);

    // SVG progress ring (right side)
    var ringWrap = mkProgressRing(isNew?0:st.pct, ringColor);
    row.appendChild(ringWrap);

    row.onclick=function(){loadGrammarDrills(t);};
    topicCard.appendChild(row);
  });
  el.appendChild(topicCard);

  // ── Últimos errores (Stitch surface card) ──
  var errors=(state.session.errorJournal||[]).filter(function(e){return e.type==="grammar";}).slice(-5).reverse();
  var errCard=mk("div","","background:var(--surface);border:1px solid rgba(69,70,82,0.6);border-radius:18px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);padding:18px;margin-bottom:14px;box-shadow:0 4px 20px rgba(0,0,0,0.18);");
  errCard.appendChild(mk("p","Últimos errores","font-size:10.5px;letter-spacing:2px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:14px;"));
  if(errors.length){
    errors.forEach(function(e,i){
      // Journal entries come in two shapes: AI corrections {bad,good,explain} and drills {original,correction,tip}
      var errDiv=mk("div","","padding:11px 0;border-bottom:1px dashed rgba(255,255,255,0.07);");
      if(i===errors.length-1) errDiv.style.borderBottom="none";
      errDiv.appendChild(mk("p",e.bad||e.prompt||e.original||"","font-size:13.5px;font-weight:600;color:var(--muted);text-decoration:line-through;text-decoration-color:rgba(var(--red-rgb),0.6);text-decoration-thickness:1.5px;"));
      errDiv.appendChild(mk("p",(e.good||e.correction||"")+(e.topic?" · "+e.topic:""),"font-size:14px;font-weight:700;color:var(--green);margin-top:3px;"));
      errDiv.appendChild(mk("p",e.explain||e.why||e.tip||"","font-size:11.5px;color:var(--muted);font-weight:500;margin-top:4px;line-height:1.5;"));
      errCard.appendChild(errDiv);
    });
    var totalErr=(state.session.errorJournal||[]).length;
    var retryBtn=mk("button","🔁 Repasar mis errores ("+Math.min(totalErr,10)+")","width:100%;margin-top:12px;background:rgba(var(--red-rgb),0.09);border:1px solid rgba(var(--red-rgb),0.28);color:var(--red);border-radius:12px;padding:12px;font-size:13px;font-weight:800;cursor:pointer;transition:background .15s;font-family:inherit;");
    retryBtn.onmouseenter=function(){this.style.background="rgba(var(--red-rgb),0.16)";};
    retryBtn.onmouseleave=function(){this.style.background="rgba(var(--red-rgb),0.09)";};
    retryBtn.onclick=function(){ startErrorReview(); };
    errCard.appendChild(retryBtn);
  } else {
    var emptyDiv=mk("div","","text-align:center;padding:24px 16px;border:1px dashed rgba(255,255,255,0.1);border-radius:12px;margin-top:4px;");
    emptyDiv.appendChild(mk("p","Sin errores todavía. ¡Sigue practicando!","font-size:13px;color:var(--muted);font-weight:600;"));
    errCard.appendChild(emptyDiv);
  }
  el.appendChild(errCard);
}

function resetGrammarDrills(){
  state.grammar._gramDrills=[];
  state.grammar._gramIdx=0;
  state.grammar._gramCorrect=0;
  state.grammar._gramMissed=[];
  state.grammar._gramTopic=null;
}

function renderGrammarDrillShell(topic){
  const el=document.getElementById("s-gramatica"); el.innerHTML="";
  const top=mk("div","","display:flex;align-items:center;gap:10px;margin-bottom:16px;");
  const back=document.createElement("button"); back.className="btn-back"; back.textContent="← Volver";
  back.onclick=function(){resetGrammarDrills();renderGrammar();};
  top.appendChild(back);
  top.appendChild(mk("span",topic.label,"font-size:13px;color:var(--text);font-weight:700;"));
  el.appendChild(top);
  renderDrillStep(el, topic);
}

async function loadGrammarDrills(topic){
  state.grammar._gramTopic=topic;
  const el=document.getElementById("s-gramatica"); el.innerHTML="";
  const top=mk("div","","display:flex;align-items:center;gap:10px;margin-bottom:16px;");
  const back=document.createElement("button"); back.className="btn-back"; back.textContent="← Volver";
  back.onclick=function(){resetGrammarDrills();renderGrammar();};
  top.appendChild(back);
  top.appendChild(mk("span",topic.label,"font-size:13px;color:var(--text);font-weight:700;"));
  el.appendChild(top);

  const loading=mk("div","","display:flex;flex-direction:column;gap:12px;");
  for(var gi=0;gi<3;gi++){loading.appendChild(skelCard(5));}
  el.appendChild(loading);

  try {
    const sys='Generate 5 German grammar multiple-choice drills for topic: '+topic.label+'. Reply ONLY with a valid JSON array, no markdown: [{"prompt":"German sentence with ___ blank","options":["a","b","c","d"],"answer":"correct option exactly","explain":"<15 words Spanish"}]. '+levelPrompt()+' Options must be plausible distractors.';
    const text=await ai(sys,[{role:"user",content:"topic: "+topic.label}], 1400);
    state.grammar._gramDrills=parseJSONArray(text);
    state.grammar._gramIdx=0; state.grammar._gramCorrect=0; state.grammar._gramMissed=[];
    el.removeChild(loading);
    renderDrillStep(el, topic);
  } catch(e){
    if(loading.parentNode) el.removeChild(loading);
    el.appendChild(mk("p","Error: "+e.message,"color:var(--red-text);font-size:13px;text-align:center;font-weight:500;"));
  }
}

function renderDrillStep(el, topic){
  while(el.children.length>1) el.removeChild(el.lastChild);

  if(state.grammar._gramIdx>=state.grammar._gramDrills.length){
    const done=mk("div","","background:rgba(var(--purple-rgb),0.06);border:1px solid rgba(var(--purple-rgb),0.2);border-radius:16px;padding:24px;text-align:center;");
    done.appendChild(mk("div","🎉","font-size:48px;margin-bottom:8px;"));
    done.appendChild(mk("p","Terminaste!","font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px;"));
    done.appendChild(mk("p",state.grammar._gramCorrect+" / "+state.grammar._gramDrills.length+" correctas","font-size:14px;color:var(--purple-text);font-weight:700;"));
    el.appendChild(done);
    var prev=state.grammar.grammarStats[topic.key]||{right:0,wrong:0,lastPracticed:"",streak:0};
    var wrong=state.grammar._gramDrills.length-state.grammar._gramCorrect;
    state.grammar.grammarStats[topic.key]={
      right: prev.right+state.grammar._gramCorrect,
      wrong: prev.wrong+wrong,
      lastPracticed: todayKey(),
      streak: (state.grammar._gramCorrect/state.grammar._gramDrills.length)>=0.6 ? prev.streak+1 : 0
    };
    if(state.grammar._gramMissed.length){
      state.grammar._gramMissed.forEach(function(d){
        logError("grammar", d.prompt, d.answer, d.explain);
      });
    }
    if(state.grammar.grammarStats[topic.key].wrong>state.grammar.grammarStats[topic.key].right){
      var hasToday=state.session.saved.some(function(p){return p.source==="grammar"&&p.tip==="grammar:"+topic.key&&p.nextReview===todayKey();});
      if(!hasToday){
        state.grammar._gramMissed.forEach(function(drill){
          state.session.saved.push(ensureSrsFields({de:drill.prompt,es:drill.answer+" — "+drill.explain,tip:"grammar:"+topic.key,source:"grammar",box:0,nextReview:todayKey()}));
          invalidateFlashcardQueues();
        });
      }
    }
    const again=mk("button","Otra ronda","width:100%;background:var(--primary);color:var(--on-primary);border:none;border-radius:14px;padding:13px;font-size:14px;font-weight:800;margin-top:12px;cursor:pointer;font-family:inherit;box-shadow:0 6px 20px rgba(var(--primary-rgb),0.3);");
    again.onclick=function(){loadGrammarDrills(topic);};
    el.appendChild(again);
    if(state.app._reviewPlan&&!state.app._reviewPlan.done){
      var cont=mk("button","✅  Siguiente →","width:100%;padding:13px;border-radius:14px;border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-size:14px;font-weight:700;cursor:pointer;margin-top:8px;transition:background 0.2s,transform 0.12s;font-family:inherit;");
      cont.onclick=function(){nextReviewStep();};
      el.appendChild(cont);
    }
    logActivity("drillsDone", state.grammar._gramDrills.length); syncUp();
    return;
  }

  const d=state.grammar._gramDrills[state.grammar._gramIdx];
  const counter=mk("p","Ejercicio "+(state.grammar._gramIdx+1)+" / "+state.grammar._gramDrills.length,"color:var(--muted);font-size:12px;font-weight:600;margin-bottom:10px;letter-spacing:0.5px;");
  el.appendChild(counter);

  const card=mk("div","","background:var(--surface-2);border:1px solid rgba(69,70,82,0.6);border-radius:18px;padding:20px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 4px 20px rgba(0,0,0,0.18);");
  card.appendChild(mk("p",d.prompt,"font-size:18px;font-weight:800;color:var(--text);line-height:1.4;margin-bottom:14px;letter-spacing:-0.01em;"));
  const opts=mk("div","","display:flex;flex-direction:column;gap:8px;");
  let answered=false;
  d.options.forEach(function(opt){
    const b=mk("button",opt,"text-align:left;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:var(--text);border-radius:12px;padding:12px 14px;font-size:14px;font-weight:600;transition:background 0.15s,border-color 0.15s;cursor:pointer;font-family:inherit;");
    b.dataset.option=opt;
    b.onclick=function(){
      if(answered) return; answered=true;
      const ok=opt===d.answer;
      if(ok){ state.grammar._gramCorrect++; b.textContent="✓ Correcta: "+opt; b.style.background="rgba(var(--green-rgb),0.12)"; b.style.borderColor="var(--green)"; b.style.color="var(--green-text)"; }
      else { state.grammar._gramMissed.push(d); b.textContent="✗ Tu respuesta: "+opt; b.style.background="rgba(var(--red-rgb),0.12)"; b.style.borderColor="var(--red)"; b.style.color="var(--red-text)"; }
      Array.prototype.slice.call(opts.children).forEach(function(other){
        if(other.dataset.option===d.answer && other!==b){ other.textContent="✓ Correcta: "+d.answer; other.style.background="rgba(var(--green-rgb),0.12)"; other.style.borderColor="var(--green)"; other.style.color="var(--green-text)"; }
      });
      const ex=mk("p","💡 "+(d.explain||""),"font-size:12px;color:var(--muted);margin-top:10px;font-style:italic;line-height:1.5;font-weight:500;");
      card.appendChild(ex);
      const next=mk("button",(state.grammar._gramIdx+1<state.grammar._gramDrills.length?"Siguiente →":"Ver resultado"),"width:100%;background:var(--primary);color:var(--on-primary);border:none;border-radius:12px;padding:11px;font-size:13px;font-weight:800;margin-top:10px;cursor:pointer;font-family:inherit;box-shadow:0 4px 14px rgba(var(--primary-rgb),0.25);");
      next.onclick=function(){ state.grammar._gramIdx++; renderDrillStep(el, topic); };
      card.appendChild(next);
    };
    opts.appendChild(b);
  });
  card.appendChild(opts);
  el.appendChild(card);
}

// ── Error review session (replay errorJournal entries with active recall) ─────
// "La sabía" removes the entry from the journal; "Todavía no" keeps it for next time.
function startErrorReview(){
  var all=(state.session.errorJournal||[]).slice().reverse(); // newest first
  var seen={}, items=[];
  all.forEach(function(e){
    var correct=e.correction||e.good||""; if(!correct) return;
    if(seen[correct]) return; seen[correct]=true;
    items.push({
      prompt: e.original||e.bad||e.prompt||"",
      correct: correct,
      tip: e.tip||e.explain||e.why||"",
      source: e.source||e.topic||"drill",
      raw: e
    });
  });
  items=items.slice(0,10);
  if(!items.length){ showToast("No hay errores para repasar 🎉","info"); return; }
  state.grammar._errRev={items:items, idx:0, known:0, revealed:false};
  renderErrorReview();
}

function renderErrorReview(){
  var s=state.grammar._errRev;
  if(!s){ renderGrammar(); return; }
  var el=document.getElementById("s-gramatica"); el.innerHTML="";

  // ── Header + back ──
  var hdr=mk("div","","margin-bottom:14px;");
  hdr.appendChild(mk("p","Gramática · Tus fallos, tu drill","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","🔁 Repaso de errores","font-size:24px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin:3px 0 4px;color:var(--text);"));
  el.appendChild(hdr);
  var back=mk("button","← Volver a Gramática","background:transparent;border:none;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;padding:4px 0;margin-bottom:10px;text-align:left;");
  back.onclick=function(){ state.grammar._errRev=null; renderGrammar(); };
  el.appendChild(back);

  // ── Summary ──
  if(s.idx>=s.items.length){
    var pct=Math.round(s.known/s.items.length*100);
    var em=pct>=80?"🏆":pct>=50?"💪":"🌱";
    var card=mk("div","","border-radius:20px;padding:24px 20px;text-align:center;");
    card.className="stitch-glass anim-in";
    card.appendChild(mk("p",em,"font-size:48px;margin-bottom:8px;"));
    card.appendChild(mk("h3",s.known+" de "+s.items.length+" recordados","font-size:22px;font-weight:900;letter-spacing:-0.02em;color:var(--text);margin-bottom:6px;"));
    card.appendChild(mk("p",s.known>0?"Los que sabías salieron del diario. Los demás vuelven a aparecer.":"Todos quedan en el diario — la próxima vuelta caen.","font-size:13px;color:var(--muted);font-weight:500;line-height:1.55;margin-bottom:16px;"));
    var remaining=(state.session.errorJournal||[]).length;
    if(remaining>0){
      var again=mk("button","🔁 Otra vuelta ("+Math.min(remaining,10)+" pendientes)","width:100%;padding:14px;border-radius:14px;border:none;background:var(--gold);color:#291800;font-size:14px;font-weight:900;cursor:pointer;font-family:inherit;box-shadow:0 6px 20px rgba(var(--gold-rgb),0.3);");
      again.onclick=function(){ startErrorReview(); };
      card.appendChild(again);
    } else {
      card.appendChild(mk("p","🎉 Diario de errores limpio.","font-size:14px;font-weight:800;color:var(--green);"));
    }
    el.appendChild(card);
    if(!s._logged){ s._logged=true; if(typeof logActivity==="function") logActivity("drillsDone",1); syncUp(); }
    return;
  }

  var it=s.items[s.idx];
  // ── Progress dots ──
  var dots=mk("div","","display:flex;gap:5px;margin-bottom:14px;");
  dots.className="stagger";
  s.items.forEach(function(_,k){
    var d=mk("span","","width:22px;height:5px;border-radius:4px;background:rgba(255,255,255,.08);");
    if(k<s.idx) d.style.background="var(--green)";
    else if(k===s.idx) d.style.background="var(--gold)";
    dots.appendChild(d);
  });
  el.appendChild(dots);

  // ── Card ──
  var card=mk("div","","border-radius:20px;padding:20px 18px;");
  card.className="stitch-glass anim-in";
  card.appendChild(mk("p",String(it.source).replace(":"," · "),"display:inline-block;font-size:9.5px;letter-spacing:1.5px;font-weight:900;color:var(--red);background:rgba(var(--red-rgb),0.1);padding:3px 10px;border-radius:99px;text-transform:uppercase;margin-bottom:12px;"));
  if(it.prompt) card.appendChild(mk("p","«"+it.prompt+"»","font-size:16px;font-weight:700;line-height:1.55;color:var(--text);margin-bottom:6px;"));
  card.appendChild(mk("p","¿Cómo era la forma correcta? Dila en voz alta antes de revelar.","font-size:12.5px;color:var(--muted);font-weight:500;margin-bottom:14px;"));

  var reveal=mk("button","👁 Mostrar respuesta","width:100%;padding:14px;border-radius:14px;border:1.5px dashed rgba(var(--gold-rgb),0.45);background:rgba(var(--gold-rgb),0.06);color:var(--gold-text);font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;");
  var answer=mk("div","","display:none;");
  var ansP=mk("p",it.correct,"font-size:17px;font-weight:800;line-height:1.5;color:var(--green);margin-bottom:8px;");
  answer.appendChild(ansP);
  if(it.tip){
    var tipP=mk("p","","font-size:12.5px;color:var(--muted);font-weight:500;line-height:1.55;margin-bottom:14px;");
    tipP.textContent="💡 "+String(it.tip).replace(/<[^>]*>/g,"");
    answer.appendChild(tipP);
  }
  var gradeRow=mk("div","","display:flex;gap:8px;");
  var noBtn=mk("button","✗ Todavía no","flex:1;padding:13px;border-radius:13px;border:1px solid rgba(var(--red-rgb),0.4);background:rgba(var(--red-rgb),0.1);color:var(--red);font-size:13.5px;font-weight:800;cursor:pointer;font-family:inherit;");
  var yesBtn=mk("button","✓ La sabía","flex:1;padding:13px;border-radius:13px;border:1px solid rgba(var(--green-rgb),0.4);background:rgba(var(--green-rgb),0.1);color:var(--green);font-size:13.5px;font-weight:800;cursor:pointer;font-family:inherit;");
  gradeRow.appendChild(noBtn); gradeRow.appendChild(yesBtn);
  answer.appendChild(gradeRow);

  reveal.onclick=function(){
    reveal.style.display="none"; answer.style.display="block"; answer.className="anim-in";
    if(typeof speak==="function"){ try{ speak(it.correct); }catch(e){} }
  };
  function grade(known){
    if(known){
      s.known++;
      var ix=state.session.errorJournal.indexOf(it.raw);
      if(ix>=0) state.session.errorJournal.splice(ix,1); // resolved — out of the journal
      syncUp();
    }
    s.idx++;
    renderErrorReview();
  }
  noBtn.onclick=function(){ grade(false); };
  yesBtn.onclick=function(){ grade(true); };

  card.appendChild(reveal);
  card.appendChild(answer);
  el.appendChild(card);
  el.appendChild(mk("p","Error "+(s.idx+1)+" de "+s.items.length,"font-size:11px;color:var(--dim);font-weight:600;text-align:center;margin-top:10px;font-variant-numeric:tabular-nums;"));
}
