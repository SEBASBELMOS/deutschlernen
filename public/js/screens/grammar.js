// ── Grammar ───────────────────────────────────────────────────────────────────
state.grammar._gramDrills=[], state.grammar._gramIdx=0, state.grammar._gramCorrect=0, state.grammar._gramMissed=[];

function renderGrammar() {
  const el=document.getElementById("s-gramatica"); el.innerHTML="";
  var backBtn=mk("button","\u2190 Volver a Hoy","background:none;border:none;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;padding:4px 0;margin-bottom:8px;display:block;");
  backBtn.onclick=function(){
    if(state.app._reviewPlan&&!state.app._reviewPlan.done){nextReviewStep();return;}
    state.app.currentTab="hoy";renderTabs();showScreen("hoy");renderToday();
  };
  el.appendChild(backBtn);
  var totalRight=0,totalWrong=0,seen=0;
  GRAMMAR_TOPICS.forEach(function(t){
    var gs=state.grammar.grammarStats[t.key];
    if(gs){ totalRight+=gs.right||0; totalWrong+=gs.wrong||0; seen++; }
  });
  var mastery=(totalRight+totalWrong)?Math.round(totalRight/(totalRight+totalWrong)*100):0;
  const hdr=document.createElement("section"); hdr.className="stitch-hero";
  var hrow=mk("div","","display:flex;justify-content:space-between;gap:24px;align-items:center;position:relative;z-index:1;flex-wrap:wrap;");
  var copy=mk("div","","max-width:720px;");
  copy.appendChild(mk("h2","Dominio de Gramática","margin-bottom:14px;"));
  copy.appendChild(mk("p","Explorá los pilares que más mueven tu alemán: artículos, orden de palabras, conectores y casos. Cada módulo abre un drill corto con feedback inmediato.",""));
  hrow.appendChild(copy);
  var big=mk("div","","text-align:right;min-width:130px;");
  big.appendChild(mk("strong",mastery+"%","display:block;font-size:48px;line-height:1;color:#eef0ff;font-weight:900;font-variant-numeric:tabular-nums;"));
  big.appendChild(mk("span","GLOBAL MASTERY","display:block;font-size:12px;color:rgba(255,255,255,0.72);font-weight:800;letter-spacing:.16em;"));
  hrow.appendChild(big);
  hdr.appendChild(hrow);
  el.appendChild(hdr);
  const grid=document.createElement("div"); grid.className="grid2";
  GRAMMAR_TOPICS.forEach(function(t){
    const btn=document.createElement("button"); btn.className="sit-btn grammar-tile";
    var gs=state.grammar.grammarStats[t.key];
    var pct=gs ? Math.round(gs.right/(gs.right+gs.wrong)*100) : 0;
    var barColor=!gs ? "var(--muted)" : pct>=80 ? "var(--green)" : pct>=40 ? "var(--gold)" : "var(--red)";
    var top=mk("div","","display:flex;justify-content:space-between;align-items:flex-start;width:100%;gap:12px;margin-bottom:16px;");
    top.appendChild(mk("span",t.icon,"width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;background:rgba(var(--primary-rgb),0.14);color:var(--primary);"));
    top.appendChild(mk("strong",pct+"%","font-size:15px;color:var(--primary);font-weight:900;font-variant-numeric:tabular-nums;"));
    btn.appendChild(top);
    btn.appendChild(mk("span",t.label,"font-size:22px;line-height:1.18;font-weight:900;color:var(--text);text-align:left;width:100%;letter-spacing:-0.02em;"));
    btn.appendChild(mk("span","AI Drill · 5 ejercicios","font-size:13px;font-weight:500;color:var(--text2);line-height:1.45;text-align:left;width:100%;margin-top:8px;"));
    var barOuter=document.createElement("div");
    barOuter.style.cssText="width:100%;height:6px;background:rgba(255,255,255,0.12);border-radius:999px;margin-top:auto;overflow:hidden;";
    var barInner=document.createElement("div");
    barInner.style.cssText="height:100%;width:"+pct+"%;background:"+barColor+";border-radius:999px;transition:width 0.3s;";
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
