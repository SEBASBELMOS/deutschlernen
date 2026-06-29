// ── Grammar ───────────────────────────────────────────────────────────────────
state.grammar._gramDrills=[], state.grammar._gramIdx=0, state.grammar._gramCorrect=0, state.grammar._gramMissed=[];

function renderGrammar() {
  const el=document.getElementById("s-gramatica"); el.innerHTML="";

  // ── Back button ──
  var backBtn=mk("button","\u2190 Volver","background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:var(--text2);border-radius:var(--r-pill,999px);padding:7px 16px;font-size:12px;font-weight:600;cursor:pointer;transition:background 0.15s,border-color 0.15s;margin-bottom:18px;display:inline-block;");
  backBtn.onmouseenter=function(){this.style.background="rgba(255,255,255,0.08)";};
  backBtn.onmouseleave=function(){this.style.background="rgba(255,255,255,0.04)";};
  backBtn.onclick=function(){
    if(state.app._reviewPlan&&!state.app._reviewPlan.done){nextReviewStep();return;}
    state.app.currentTab="hoy";renderTabs();showScreen("hoy");renderToday();
  };
  el.appendChild(backBtn);

  // ── Header ──
  const hdr=mk("div","","margin-bottom:18px;");
  hdr.appendChild(mk("h2","Gram\u00e1tica","font-size:22px;font-weight:800;color:var(--text);letter-spacing:-0.02em;margin-bottom:4px;"));
  hdr.appendChild(mk("p","Drills cortos con feedback inmediato para dominar los pilares del alem\u00e1n.","font-size:13px;color:var(--text2);font-weight:500;line-height:1.5;"));
  el.appendChild(hdr);

  // ── Topic descriptions ──
  var grammarDescs={
    "articles":"Domina der, die, das con reglas claras y pr\u00e1ctica sistem\u00e1tica.",
    "perfekt":"Aprend\u00e9 cu\u00e1ndo usar haben o sein en el pasado perfecto.",
    "wortstellung":"El orden de las palabras: verbo en segunda posici\u00f3n.",
    "adjendings":"Terminaciones de adjetivo seg\u00fan caso, g\u00e9nero y n\u00famero.",
    "separable":"Verbos con prefijos separables: anfangen, aufmachen, einkaufen.",
    "praeteritum":"El pasado simple narrativo para contar historias.",
    "conectores":"Conectores y subordinadas: weil, dass, obwohl, wenn.",
    "conjugacion":"Conjugaci\u00f3n de verbos regulares e irregulares en presente.",
    "konjunktiv2":"El subjuntivo para deseos, cortes\u00eda e hip\u00f3tesis.",
    "plurales":"Formaci\u00f3n de plurales irregulares en alem\u00e1n."
  };

  // ── Glass-card grid ──
  const grid=document.createElement("div");
  grid.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:12px;";
  GRAMMAR_TOPICS.forEach(function(t){
    var gs=state.grammar.grammarStats[t.key];
    var pct=gs ? Math.round(gs.right/(gs.right+gs.wrong)*100) : 0;
    var ringColor=!gs?"var(--muted)":pct>=80?"var(--green)":pct>=40?"var(--gold)":"var(--red)";
    var statusLabel=!gs?"Nuevo":pct>=80?"Meister":pct>=40?"Aprendiendo":"Nuevo";
    var statusBg=!gs?"rgba(255,255,255,0.06)":pct>=80?"rgba(var(--green-rgb),0.12)":pct>=40?"rgba(var(--gold-rgb),0.12)":"rgba(255,255,255,0.06)";
    var statusColor=!gs?"var(--muted)":pct>=80?"var(--green-text)":pct>=40?"var(--gold-text)":"var(--muted)";
    var desc=grammarDescs[t.key]||"Drill de IA con 5 ejercicios y feedback inmediato.";

    const card=document.createElement("button");
    card.style.cssText="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:var(--r-lg,16px);padding:16px;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:8px;transition:transform 0.15s,box-shadow 0.2s,border-color 0.2s;width:100%;min-height:240px;";
    card.onmouseenter=function(_ev){this.style.borderColor="rgba(var(--purple-rgb),0.35)";this.style.transform="translateY(-2px)";this.style.boxShadow="0 8px 28px rgba(0,0,0,0.3)";};
    card.onmouseleave=function(_ev){this.style.borderColor="rgba(255,255,255,0.08)";this.style.transform="none";this.style.boxShadow="none";};

    // Row: icon + progress ring
    var topRow=mk("div","","display:flex;justify-content:space-between;align-items:flex-start;gap:8px;");
    // Status badge
    var badge=mk("span",statusLabel,"display:inline-block;font-size:10px;font-weight:700;padding:3px 10px;border-radius:var(--r-pill,999px);background:"+statusBg+";color:"+statusColor+";letter-spacing:0.02em;margin-bottom:2px;");
    card.appendChild(badge);
    // Icon
    var iconEl=mk("span",t.icon,"width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;background:rgba(var(--purple-rgb),0.14);color:var(--purple-text);flex-shrink:0;");
    topRow.appendChild(iconEl);
    // Progress ring (SVG)
    var circ=2*Math.PI*14; // r=14
    var dashoffset=circ*(1-pct/100);
    var ring=document.createElement("div");
    ring.innerHTML='<svg viewBox="0 0 36 36" style="width:44px;height:44px;flex-shrink:0;"><circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2.5"/><circle cx="18" cy="18" r="14" fill="none" stroke="'+ringColor+'" stroke-width="2.5" stroke-dasharray="'+circ.toFixed(1)+'" stroke-dashoffset="'+dashoffset.toFixed(1)+'" stroke-linecap="round" transform="rotate(-90 18 18)" style="transition:stroke-dashoffset 0.45s;"/><text x="18" y="19" text-anchor="middle" fill="var(--text)" font-size="9" font-weight="700">'+pct+'%</text></svg>';
    topRow.appendChild(ring);
    card.appendChild(topRow);

    // Title
    card.appendChild(mk("span",t.label,"font-size:15px;font-weight:800;color:var(--text);letter-spacing:-0.01em;line-height:1.25;"));
    // Description
    card.appendChild(mk("span",desc,"font-size:12px;font-weight:500;color:var(--text2);line-height:1.45;"));
    // Spacer
    card.appendChild(mk("span","","flex:1;"));
    // Drill button
    var drillBtn=mk("span","\u2192 Empezar drill","display:block;width:100%;text-align:center;background:rgba(var(--purple-rgb),0.12);border:1px solid rgba(var(--purple-rgb),0.2);color:var(--purple-text);border-radius:var(--r-md,12px);padding:10px;font-size:12px;font-weight:700;margin-top:4px;transition:background 0.15s;");
    card.appendChild(drillBtn);

    card.onclick=function(){loadGrammarDrills(t);};
    grid.appendChild(card);
  });
  el.appendChild(grid);
}

async function loadGrammarDrills(topic){
  const el=document.getElementById("s-gramatica"); el.innerHTML="";
  const top=mk("div","","display:flex;align-items:center;gap:10px;margin-bottom:16px;");
  const back=document.createElement("button"); back.className="btn-back"; back.textContent="← Volver";
  back.onclick=renderGrammar;
  top.appendChild(back);
  top.appendChild(mk("span",topic.label,"font-size:13px;color:var(--text);font-weight:700;"));
  el.appendChild(top);

  const loading=document.createElement("div"); loading.style.cssText="display:flex;flex-direction:column;gap:12px;";
  for(var gi=0;gi<3;gi++){loading.appendChild(skelCard(5));}
  el.appendChild(loading);

  try {
    const sys='Generate 5 German grammar multiple-choice drills for topic: '+topic.label+'. Reply ONLY with a valid JSON array, no markdown: [{"prompt":"German sentence with ___ blank","options":["a","b","c","d"],"answer":"correct option exactly","explain":"<15 words Spanish"}]. Level '+lvlRange()+'. Options must be plausible distractors.';
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
    const done=document.createElement("div");
    done.style.cssText="background:rgba(var(--purple-rgb),0.06);border:1px solid rgba(var(--purple-rgb),0.2);border-radius:16px;padding:24px;text-align:center;";
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
        });
      }
    }
    const again=mk("button","Otra ronda","width:100%;background:var(--purple);color:#000;border:none;border-radius:14px;padding:13px;font-size:14px;font-weight:800;margin-top:12px;");
    again.onclick=function(){loadGrammarDrills(topic);};
    el.appendChild(again);
    if(state.app._reviewPlan&&!state.app._reviewPlan.done){
      var cont=mk("button","✅  Siguiente →","width:100%;padding:13px;border-radius:14px;border:none;background:rgba(var(--teal-rgb),0.12);color:var(--teal-text);font-size:14px;font-weight:700;cursor:pointer;margin-top:8px;transition:background 0.2s,transform 0.12s;");
      cont.onclick=function(){nextReviewStep();};
      el.appendChild(cont);
    }
    logActivity("drillsDone", state.grammar._gramDrills.length); syncUp();
    return;
  }

  const d=state.grammar._gramDrills[state.grammar._gramIdx];
  const counter=mk("p","Ejercicio "+(state.grammar._gramIdx+1)+" / "+state.grammar._gramDrills.length,"color:var(--muted);font-size:12px;font-weight:600;margin-bottom:10px;letter-spacing:0.5px;");
  el.appendChild(counter);

  const card=document.createElement("div"); card.className="card"; card.style.padding="18px"; card.style.borderColor="rgba(var(--purple-rgb),0.2)";
  card.appendChild(mk("p",d.prompt,"font-size:18px;font-weight:800;color:var(--text);line-height:1.4;margin-bottom:14px;letter-spacing:-0.01em;"));
  const opts=mk("div","","display:flex;flex-direction:column;gap:8px;");
  let answered=false;
  d.options.forEach(function(opt){
    const b=document.createElement("button");
    b.style.cssText="text-align:left;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:var(--text);border-radius:12px;padding:12px 14px;font-size:14px;font-weight:600;transition:background 0.15s,border-color 0.15s;cursor:pointer;";
    b.textContent=opt;
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
      const next=mk("button",(state.grammar._gramIdx+1<state.grammar._gramDrills.length?"Siguiente →":"Ver resultado"),"width:100%;background:var(--purple);color:#000;border:none;border-radius:12px;padding:11px;font-size:13px;font-weight:800;margin-top:10px;");
      next.onclick=function(){ state.grammar._gramIdx++; renderDrillStep(el, topic); };
      card.appendChild(next);
    };
    opts.appendChild(b);
  });
  card.appendChild(opts);
  el.appendChild(card);
}
