// ── Grammar ───────────────────────────────────────────────────────────────────
state.grammar._gramDrills=[], state.grammar._gramIdx=0, state.grammar._gramCorrect=0, state.grammar._gramMissed=[];

function renderGrammar() {
  const el=document.getElementById("s-gramatica"); el.innerHTML="";
  const hdr=mk("div","","margin-bottom:16px;");
  hdr.appendChild(mk("p","DRILLS DE GRAMATICA","font-size:11px;color:var(--muted);letter-spacing:2px;font-weight:700;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","Gramatica","font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;"));
  hdr.appendChild(mk("p","Elige un tema y resuelve 5 ejercicios.","font-size:13px;color:var(--muted);margin-top:4px;font-weight:500;"));
  el.appendChild(hdr);
  const grid=document.createElement("div"); grid.className="grid2";
  GRAMMAR_TOPICS.forEach(function(t){
    const btn=document.createElement("button"); btn.className="sit-btn";
    btn.appendChild(mk("span",t.icon,"font-size:22px;line-height:1;"));
    btn.appendChild(mk("span",t.label,"font-size:12px;font-weight:600;color:var(--text);"));
    var gs=state.grammar.grammarStats[t.key];
    var pct=gs ? Math.round(gs.right/(gs.right+gs.wrong)*100) : 0;
    var barColor=!gs ? "var(--muted)" : pct>=80 ? "#4ade80" : pct>=40 ? "#F5A623" : "#F87171";
    var barOuter=document.createElement("div");
    barOuter.style.cssText="width:100%;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:6px;overflow:hidden;";
    var barInner=document.createElement("div");
    barInner.style.cssText="height:100%;width:"+pct+"%;background:"+barColor+";border-radius:2px;transition:width 0.3s;";
    barOuter.appendChild(barInner);
    btn.appendChild(barOuter);
    btn.onclick=function(){loadGrammarDrills(t);};
    grid.appendChild(btn);
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
    el.appendChild(mk("p","Error: "+e.message,"color:#ef4444;font-size:13px;text-align:center;font-weight:500;"));
  }
}

function renderDrillStep(el, topic){
  while(el.children.length>1) el.removeChild(el.lastChild);

  if(state.grammar._gramIdx>=state.grammar._gramDrills.length){
    const done=document.createElement("div");
    done.style.cssText="background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.2);border-radius:16px;padding:24px;text-align:center;";
    done.appendChild(mk("div","🎉","font-size:48px;margin-bottom:8px;"));
    done.appendChild(mk("p","Terminaste!","font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px;"));
    done.appendChild(mk("p",state.grammar._gramCorrect+" / "+state.grammar._gramDrills.length+" correctas","font-size:14px;color:#A78BFA;font-weight:700;"));
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
    const again=mk("button","Otra ronda","width:100%;background:#A78BFA;color:#000;border:none;border-radius:14px;padding:13px;font-size:14px;font-weight:800;margin-top:12px;");
    again.onclick=function(){loadGrammarDrills(topic);};
    el.appendChild(again);
    if(state.app._reviewPlan&&!state.app._reviewPlan.done){
      var cont=mk("button","✅  Siguiente →","width:100%;padding:13px;border-radius:14px;border:none;background:rgba(78,205,196,0.12);color:#4ECDC4;font-size:14px;font-weight:700;cursor:pointer;margin-top:8px;");
      cont.onclick=function(){nextReviewStep();};
      el.appendChild(cont);
    }
    logActivity("drillsDone", state.grammar._gramDrills.length); syncUp();
    return;
  }

  const d=state.grammar._gramDrills[state.grammar._gramIdx];
  const counter=mk("p","Ejercicio "+(state.grammar._gramIdx+1)+" / "+state.grammar._gramDrills.length,"color:var(--muted);font-size:12px;font-weight:600;margin-bottom:10px;letter-spacing:0.5px;");
  el.appendChild(counter);

  const card=document.createElement("div"); card.className="card"; card.style.padding="18px"; card.style.borderColor="rgba(167,139,250,0.2)";
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
      if(ok){ state.grammar._gramCorrect++; b.textContent="✓ Correcta: "+opt; b.style.background="rgba(74,222,128,0.12)"; b.style.borderColor="#4ade80"; b.style.color="#4ade80"; }
      else { state.grammar._gramMissed.push(d); b.textContent="✗ Tu respuesta: "+opt; b.style.background="rgba(248,113,113,0.12)"; b.style.borderColor="#F87171"; b.style.color="#F87171"; }
      Array.prototype.slice.call(opts.children).forEach(function(other){
        if(other.dataset.option===d.answer && other!==b){ other.textContent="✓ Correcta: "+d.answer; other.style.background="rgba(74,222,128,0.12)"; other.style.borderColor="#4ade80"; other.style.color="#4ade80"; }
      });
      const ex=mk("p","💡 "+(d.explain||""),"font-size:12px;color:var(--muted);margin-top:10px;font-style:italic;line-height:1.5;font-weight:500;");
      card.appendChild(ex);
      const next=mk("button",(state.grammar._gramIdx+1<state.grammar._gramDrills.length?"Siguiente →":"Ver resultado"),"width:100%;background:#A78BFA;color:#000;border:none;border-radius:12px;padding:11px;font-size:13px;font-weight:800;margin-top:10px;");
      next.onclick=function(){ state.grammar._gramIdx++; renderDrillStep(el, topic); };
      card.appendChild(next);
    };
    opts.appendChild(b);
  });
  card.appendChild(opts);
  el.appendChild(card);
}
