// ── Practicar Hub (Stitch bento-grid port) ────────────────────────────────────
function renderPracticar() {
  var el = document.getElementById("s-practicar"); el.innerHTML = "";

  // ── Hero header ──
  var hero = mk("div","","position:relative;overflow:hidden;border-radius:28px;padding:32px 24px;margin-bottom:22px;background:linear-gradient(135deg,var(--primary-container),rgba(var(--primary-rgb),0.18) 70%);border:1px solid rgba(var(--primary-rgb),0.18);box-shadow:0 14px 40px rgba(0,0,0,0.32);");
  var heroGlow = mk("span","","position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:rgba(var(--primary-rgb),0.12);border-radius:50%;filter:blur(40px);pointer-events:none;");
  hero.appendChild(heroGlow);
  var heroZ = mk("div","","position:relative;z-index:1;");
  heroZ.appendChild(mk("h2","Dominio del Lenguaje","font-size:clamp(22px,3vw,32px);font-weight:900;letter-spacing:-0.03em;line-height:1.15;color:var(--on-primary-container);margin-bottom:6px;"));
  heroZ.appendChild(mk("p","Refiná tus habilidades con ejercicios interactivos diseñados para la fluidez profesional.","font-size:14px;color:rgba(222,224,255,0.78);font-weight:500;line-height:1.5;max-width:520px;margin-bottom:16px;"));
  // Metric chips
  var metrics = mk("div","","display:flex;gap:10px;flex-wrap:wrap;");
  var streak = computeStreak();
  var sc = mk("div","","min-width:100px;border-radius:16px;padding:14px 16px;background:rgba(15,20,62,0.28);border:1px solid rgba(255,255,255,0.10);text-align:center;");
  sc.appendChild(mk("strong", streak + " Días","display:block;font-size:26px;font-weight:900;color:var(--on-primary-container);line-height:1.1;"));
  sc.appendChild(mk("span","Racha","display:block;font-size:11px;color:rgba(222,224,255,0.66);font-weight:700;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;"));
  metrics.appendChild(sc);
  var lc = mk("div","","min-width:100px;border-radius:16px;padding:14px 16px;background:rgba(15,20,62,0.28);border:1px solid rgba(255,255,255,0.10);border-left:3px solid var(--secondary);text-align:center;");
  lc.appendChild(mk("strong", state.app.level || "B1","display:block;font-size:26px;font-weight:900;color:var(--secondary);line-height:1.1;"));
  lc.appendChild(mk("span","Nivel","display:block;font-size:11px;color:rgba(222,224,255,0.66);font-weight:700;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;"));
  metrics.appendChild(lc);
  heroZ.appendChild(metrics);
  hero.appendChild(heroZ);
  el.appendChild(hero);

  // ── Bento grid: practice modules ──
  var grid = mk("div","");
  grid.className = "practice-stitch-grid";

  // Card 1: Shadowing (span 8, hero card)
  var shadowCard = mkDrillCard({
    icon: "🎙️", title: "Shadowing", accent: "var(--primary)", accentBg: "rgba(var(--primary-rgb),0.14)",
    desc: "Perfeccioná tu pronunciación repitiendo frases grabadas por hablantes nativos en tiempo real.",
    badge: "Recomendado", badgeBg: "var(--primary)", badgeColor: "var(--on-primary)",
    tags: ["Pronunciación","Ritmo","Entonación"],
    btnLabel: "Empezar Sesión", btnStyle: "background:var(--primary);color:var(--on-primary);box-shadow:0 6px 20px rgba(var(--primary-rgb),0.3);",
    screenId: "shadowing",
    feature: true
  });
  grid.appendChild(shadowCard);

  // Card 2: Conversar (span 4, secondary accent, side border)
  var convCard = mkDrillCard({
    icon: "💬", title: "Conversar", accent: "var(--secondary)", accentBg: "rgba(var(--secondary-rgb),0.12)",
    desc: "Charla con IA sobre temas cotidianos o profesionales para ganar fluidez natural.",
    tags: ["Restaurante","Entrevista","Diario"],
    btnLabel: "Abrir Chat", btnStyle: "border:2px solid var(--secondary);color:var(--secondary);background:transparent;",
    screenId: "conversar",
    sideBorder: "var(--secondary)"
  });
  grid.appendChild(convCard);

  // Card 3: Corrígeme (span 6, tertiary accent)
  var corrCard = mkDrillCard({
    icon: "✏️", title: "Corrígeme", accent: "var(--red)", accentBg: "rgba(var(--red-rgb),0.10)",
    desc: "Escribe ensayos o correos y recibí feedback instantáneo sobre gramática y estilo académico.",
    tags: ["Escritura","Feedback IA"],
    btnLabel: "Escribir Nuevo", btnStyle: "background:rgba(255,255,255,0.92);color:#0b0f1a;",
    screenId: "corrigeme"
  });
  grid.appendChild(corrCard);

  // Card 4: Lectura (span 6, muted accent)
  var lectCard = mkDrillCard({
    icon: "📖", title: "Lectura", accent: "var(--text2)", accentBg: "rgba(143,144,158,0.08)",
    desc: "Mejorá tu comprensión lectora con artículos de prensa y literatura alemana adaptada a tu nivel.",
    tags: ["Comprensión","Vocabulario","Hörverstehen"],
    btnLabel: "Leer Ahora", btnStyle: "background:var(--surface-3);color:var(--text);border:1px solid var(--border);",
    screenId: "lectura"
  });
  grid.appendChild(lectCard);

  // Card 5: No Entendí (span 6)
  var noEntCard = mkDrillCard({
    icon: "🎯", title: "No Entendí", accent: "var(--teal)", accentBg: "rgba(var(--teal-rgb),0.10)",
    desc: "Pega frases que no entendiste y la IA te explica palabra por palabra con contexto.",
    tags: ["Desglose","Contexto","Gramática"],
    btnLabel: "Explicar Frase", btnStyle: "background:rgba(var(--teal-rgb),0.15);color:var(--teal-text);border:1px solid rgba(var(--teal-rgb),0.25);",
    screenId: "noentendi"
  });
  grid.appendChild(noEntCard);

  el.appendChild(grid);

  // ── Weekly progress section ──
  var weekly = mk("div","","background:var(--surface-2);border:1px solid rgba(69,70,82,0.6);border-radius:20px;padding:22px;position:relative;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.18);");
  // Dot pattern bg
  var dotsBg = mk("span","","position:absolute;inset:0;opacity:0.04;pointer-events:none;");
  dotsBg.style.cssText += "background-image:radial-gradient(circle at 2px 2px,var(--primary) 2px,transparent 0);background-size:24px 24px;";
  weekly.appendChild(dotsBg);
  var wz = mk("div","","position:relative;z-index:1;");
  var wTop = mk("div","","display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:14px;");
  wTop.appendChild(mk("h4","Resumen Semanal","font-size:18px;font-weight:900;letter-spacing:-0.02em;color:var(--primary);"));
  var weekMins = weeklyMinutes();
  var goal = state.session.weeklyGoal || 60;
  var goalPct = Math.min(100, Math.round(weekMins / goal * 100));
  var goalLabel = weekMins + " / " + goal + " min";
  wTop.appendChild(mk("span", goalLabel, "font-size:13px;font-weight:800;color:var(--text2);"));
  wz.appendChild(wTop);
  wz.appendChild(mk("p","Completaste el "+goalPct+"% de tu objetivo de práctica esta semana.","font-size:13px;color:var(--muted);font-weight:500;margin-bottom:12px;"));
  var wBar = mk("div","","height:8px;border-radius:6px;background:rgba(255,255,255,0.08);overflow:hidden;margin-bottom:10px;");
  var wFill = mk("div","","height:100%;border-radius:6px;background:linear-gradient(90deg,var(--primary),rgba(var(--primary-rgb),0.7));width:"+goalPct+"%;transition:width 0.5s cubic-bezier(.16,1,.3,1);");
  wBar.appendChild(wFill);
  wz.appendChild(wBar);
  var wMeta = mk("div","","display:flex;justify-content:space-between;font-size:10.5px;font-weight:700;color:var(--dim);");
  wMeta.appendChild(mk("span", goalLabel));
  wMeta.appendChild(mk("span", goalPct + "%", "color:var(--primary);"));
  wz.appendChild(wMeta);
  weekly.appendChild(wz);
  el.appendChild(weekly);
}

// ── Helper: Stitch drill card ──
function mkDrillCard(opts) {
  var accent = opts.accent || "var(--primary)";
  var card = mk("div","","position:relative;overflow:hidden;display:flex;flex-direction:column;gap:14px;cursor:pointer;transition:transform 0.15s,box-shadow 0.2s,border-color 0.2s;");
  card.className = "practice-stitch-card stitch-glass" + (opts.feature ? " is-feature" : "");
  // Decorative glow
  var glow = mk("span","","position:absolute;top:-30px;right:-30px;width:"+(opts.feature?"190px":"140px")+";height:"+(opts.feature?"190px":"140px")+";background:"+opts.accentBg+";border-radius:50%;filter:blur(35px);pointer-events:none;opacity:0.55;");
  card.appendChild(glow);
  if (opts.sideBorder) card.style.borderLeft = "3px solid " + opts.sideBorder;

  card.onmouseenter = function(){this.style.transform="translateY(-3px)";this.style.boxShadow="0 16px 40px rgba(0,0,0,0.32)";this.style.borderColor="rgba(var(--primary-rgb),0.3)";};
  card.onmouseleave = function(){this.style.transform="";this.style.boxShadow="";this.style.borderColor="";};

  // Top row: icon + badge
  var topRow = mk("div","","display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1;");
  var iconBox = mk("span", opts.icon, "width:"+(opts.feature?"56px":"48px")+";height:"+(opts.feature?"56px":"48px")+";border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:"+(opts.feature?"28px":"24px")+";flex-shrink:0;background:"+opts.accentBg+";color:"+opts.accent+";border:1px solid rgba(255,255,255,0.10);box-shadow:inset 0 -1px 0 rgba(255,255,255,0.08);");
  topRow.appendChild(iconBox);
  if (opts.badge) {
    var bdg = mk("span", opts.badge, "font-size:10px;font-weight:800;padding:4px 10px;border-radius:99px;background:"+opts.badgeBg+";color:"+opts.badgeColor+";letter-spacing:0.5px;");
    bdg.classList.add("badge-shimmer");
    topRow.appendChild(bdg);
  }
  card.appendChild(topRow);

  // Title + desc
  var z1 = mk("div","","position:relative;z-index:1;");
  z1.appendChild(mk("h4", opts.title, "font-size:"+(opts.feature?"22px":"18px")+";font-weight:900;letter-spacing:-0.02em;color:var(--text);margin-bottom:4px;line-height:1.15;"));
  z1.appendChild(mk("p", opts.desc, "font-size:"+(opts.feature?"13.5px":"12.5px")+";color:var(--text2);font-weight:500;line-height:1.5;"));
  card.appendChild(z1);

  // Tags
  if (opts.tags && opts.tags.length) {
    var tagsRow = mk("div","","display:flex;flex-wrap:wrap;gap:6px;position:relative;z-index:1;");
    opts.tags.forEach(function(tag) {
      tagsRow.appendChild(mk("span", tag, "font-size:10.5px;font-weight:700;padding:4px 10px;border-radius:99px;background:var(--surface-2);color:var(--text2);border:1px solid var(--border);"));
    });
    card.appendChild(tagsRow);
  }

  // CTA button
  var btn = mk("button", opts.btnLabel, "margin-top:auto;width:100%;padding:12px;border-radius:14px;font-size:13px;font-weight:800;cursor:pointer;transition:transform 0.12s,opacity 0.15s;display:flex;align-items:center;justify-content:center;gap:6px;position:relative;z-index:1;font-family:inherit;" + opts.btnStyle);
  btn.onclick = function(e) {
    e.stopPropagation();
    switchToScreen(opts.screenId);
  };
  card.appendChild(btn);

  // Whole card click
  card.onclick = function() { switchToScreen(opts.screenId); };

  return card;
}

// Navigate to screen within the same group
function switchToScreen(id) {
  if (state.app._reviewPlan && !state.app._reviewPlan.done) state.app._reviewPlan = null;
  state.app.currentTab = id;
  renderTabs();
  showScreen(id);
}
