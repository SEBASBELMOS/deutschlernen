// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(text, type, duration) {
  type=type||"info";
  var undoFn=null;
  if(typeof duration==="function"){ undoFn=duration; duration=5000; }
  else duration=duration||4000;
  var container=document.getElementById("toast-container");
  if(!container){
    container=document.createElement("div"); container.id="toast-container"; container.className="toast-container"; container.setAttribute("role","status"); container.setAttribute("aria-live","polite");
    document.body.appendChild(container);
  }
  var el=document.createElement("div"); el.className="toast "+type; el.textContent=text;
  if(undoFn){
    var undoBtn=document.createElement("button");
    undoBtn.textContent="↩ Deshacer";
    undoBtn.style.cssText="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);color:#fff;border-radius:8px;padding:4px 10px;font-size:12px;font-weight:700;margin-left:10px;cursor:pointer;white-space:nowrap;";
    undoBtn.onclick=function(){undoFn();clearTimeout(timer);if(el.parentNode)el.parentNode.removeChild(el);};
    el.appendChild(undoBtn);
  }
  container.appendChild(el);
  var timer=setTimeout(function(){
    el.classList.add("out");
    setTimeout(function(){if(el.parentNode) el.parentNode.removeChild(el);},250);
  },duration);
}

function fireConfetti(){
  var overlay=document.createElement("div");
  overlay.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:9999;";
  var colors=["#F5A623","#4ECDC4","#A78BFA","#4ade80","#F87171"];
  var particles=[];
  for(var i=0;i<50;i++){
    var p=document.createElement("div");
    p.style.cssText="position:absolute;width:8px;height:8px;border-radius:2px;background:"+colors[i%colors.length]+";left:50%;top:50%;";
    overlay.appendChild(p);
    particles.push({
      el:p,
      x:0,y:0,
      vx:(Math.random()-0.5)*20,
      vy:-Math.random()*18-8,
      r:Math.random()*720,
      vr:(Math.random()-0.5)*15
    });
  }
  document.body.appendChild(overlay);
  var start=performance.now();
  function frame(now){
    var t=Math.min((now-start)/1500,1);
    particles.forEach(function(p){
      p.vy+=0.6;
      p.x+=p.vx*0.03;
      p.y+=p.vy*0.03;
      p.r+=p.vr;
      p.el.style.transform="translate(calc(-50% + "+p.x+"px),calc(-50% + "+p.y+"px)) rotate("+p.r+"deg)";
      p.el.style.opacity=1-t;
    });
    if(t<1) requestAnimationFrame(frame);
    else overlay.remove();
  }
  requestAnimationFrame(frame);
}

// ── Onboarding (3-step tour) ────────────────────────────────────────────────
function showOnboarding(){
  if(localStorage.getItem("dl_onboarding_done_"+state.app.authUser)) return;

  const steps=[
    {
      emoji:"🇩🇪",
      title:"Bienvenido a DeutschLernen",
      body:"Practica alemán todos los días, aunque sean solo 5 minutos. La consistencia es lo que te va a llevar de A2 a B1.",
      btn:"Siguiente →"
    },
    {
      emoji:"🎯",
      title:"Tu primera sesión",
      body:"Empieza por Hoy → Flashcards para repasar las tarjetas pendientes. Después explora Frases para descubrir vocabulario nuevo.",
      btn:"Siguiente →"
    },
    {
      emoji:"📈",
      title:"Sigue tu progreso",
      body:"Construye tu racha diaria, revisa tus stats en Resumen, y cuando menos te des cuenta ya estarás en B1. ¡Confianza!",
      btn:"¡Empezar!"
    }
  ];

  var stepIdx=0;
  var releaseFocus=null;

  // Overlay
  var overlay=document.createElement("div");
  overlay.style.cssText="position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;";
  if(state.app._motionOK) overlay.style.animation="fadeIn 0.25s var(--ease-out)";

  // Card
  var card=document.createElement("div");
  card.style.cssText="background:var(--modal-bg);border:1px solid rgba(245,166,35,0.22);border-radius:20px;padding:32px 28px 24px;max-width:380px;width:90%;text-align:center;box-shadow:0 16px 48px rgba(0,0,0,0.5);";
  card.setAttribute("role","dialog"); card.setAttribute("aria-modal","true"); card.setAttribute("aria-label","Tour de bienvenida");
  if(state.app._motionOK) card.style.animation="scaleIn 0.3s var(--ease-spring)";

  // Content area
  var emojiEl=mk("div",steps[0].emoji,"font-size:48px;margin-bottom:14px;");
  card.appendChild(emojiEl);
  var titleEl=mk("h2",steps[0].title,"font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em;margin-bottom:10px;");
  card.appendChild(titleEl);
  var bodyEl=mk("p",steps[0].body,"font-size:14px;color:var(--text2);line-height:1.6;font-weight:500;margin-bottom:22px;");
  card.appendChild(bodyEl);

  // Dots
  var dots=mk("div","","display:flex;justify-content:center;gap:8px;margin-bottom:18px;");
  for(var i=0;i<3;i++){
    var dot=mk("div","","width:8px;height:8px;border-radius:50%;transition:all 0.25s var(--ease-out);background:"+(i===0?"var(--gold)":"var(--dim)")+";");
    dot._idx=i;
    dots.appendChild(dot);
  }
  card.appendChild(dots);

  // Button
  var nextBtn=document.createElement("button");
  nextBtn.textContent=steps[0].btn;
  nextBtn.style.cssText="width:100%;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,#F5A623,#e8950a);color:#0c0a00;font-size:15px;font-weight:800;cursor:pointer;transition:all 0.2s;letter-spacing:-0.01em;";
  card.appendChild(nextBtn);

  // Skip
  var skipLink=mk("button","Saltar","background:none;border:none;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;margin-top:14px;text-decoration:underline;");
  card.appendChild(skipLink);

  overlay.appendChild(card);
  document.body.appendChild(overlay);
  releaseFocus=trapFocus(card, finishOnboarding);

  function finishOnboarding(){
    if(releaseFocus){ releaseFocus(); releaseFocus=null; }
    localStorage.setItem("dl_onboarding_done_"+state.app.authUser,"1");
    if(state.app._motionOK){overlay.style.opacity="0";overlay.style.transition="opacity 0.2s var(--ease-out)";setTimeout(function(){overlay.remove();},200);}
    else overlay.remove();
  }

  function goToStep(idx){
    if(idx>=steps.length){ finishOnboarding(); return; }
    stepIdx=idx;
    var s=steps[idx];
    if(state.app._motionOK){
      emojiEl.style.opacity="0";emojiEl.style.transform="translateY(10px)";
      titleEl.style.opacity="0";titleEl.style.transform="translateY(10px)";
      bodyEl.style.opacity="0";bodyEl.style.transform="translateY(10px)";
    }
    setTimeout(function(){
      emojiEl.textContent=s.emoji;
      titleEl.textContent=s.title;
      bodyEl.textContent=s.body;
      nextBtn.textContent=s.btn;
      if(state.app._motionOK){
        emojiEl.style.transition="all 0.25s var(--ease-out)";emojiEl.style.opacity="1";emojiEl.style.transform="translateY(0)";
        titleEl.style.transition="all 0.25s var(--ease-out) 0.05s";titleEl.style.opacity="1";titleEl.style.transform="translateY(0)";
        bodyEl.style.transition="all 0.25s var(--ease-out) 0.1s";bodyEl.style.opacity="1";bodyEl.style.transform="translateY(0)";
      }
    },state.app._motionOK?100:0);
    // Update dots
    for(var i=0;i<dots.children.length;i++){
      dots.children[i].style.background=i===idx?"var(--gold)":"var(--dim)";
    }
  }

  nextBtn.onclick=function(){ goToStep(stepIdx+1); };
  skipLink.onclick=finishOnboarding;
  skipLink.setAttribute("aria-label","Saltar el tour de bienvenida");
  // Focus, Escape and focus-trap are handled by trapFocus(); the button's visible text is its accessible name (it updates on its own).
}

function updateBadge() {
  document.getElementById("badge").style.display=state.session.saved.length?"block":"none";
  document.getElementById("badge-n").textContent=state.session.saved.length;
}
