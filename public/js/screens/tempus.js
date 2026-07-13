// ── TEMPUS (Drag-and-Drop Timeline) ─────────────────────────────────────────
// Fable port: drag phrases into vor | waehrend | nach zones relative to an event.
// Uses mk() helper, state.tempus.* namespace, called via renderTempus().

var TEMPUS_PHRASES = [
  {de:"Vor dem Meeting trinke ich einen Kaffee.",es:"Antes de la reunión tomo un café.",z:"vor"},
  {de:"Nach dem Meeting schreibe ich das Protokoll.",es:"Después de la reunión escribo el acta.",z:"nach"},
  {de:"Während des Meetings mache ich Notizen.",es:"Durante la reunión tomo notas.",z:"waehrend"},
  {de:"Bevor das Meeting beginnt, teste ich mein Mikro.",es:"Antes de que empiece, pruebo mi micrófono.",z:"vor"},
  {de:"Nachdem alle gegangen sind, räume ich auf.",es:"Después de que todos se van, ordeno.",z:"nach"},
  {de:"Ich bereite die Folien vor dem Termin vor.",es:"Preparo las diapositivas antes de la cita.",z:"vor"},
  {de:"Währenddessen läuft die Aufnahme.",es:"Mientras tanto, corre la grabación.",z:"waehrend"},
  {de:"Danach besprechen wir die nächsten Schritte.",es:"Después discutimos los próximos pasos.",z:"nach"},
  {de:"Davor checke ich noch meine E-Mails.",es:"Antes de eso reviso mis correos.",z:"vor"},
  {de:"Bevor ich präsentiere, atme ich tief durch.",es:"Antes de presentar, respiro hondo.",z:"vor"},
  {de:"Nachdem das Meeting endete, ging ich joggen.",es:"Después de que terminó, salí a correr.",z:"nach"},
  {de:"Während der Präsentation bleibt das Handy aus.",es:"Durante la presentación, el celular apagado.",z:"waehrend"},
  {de:"Nach der Besprechung esse ich zu Mittag.",es:"Después de la reunión almuerzo.",z:"nach"},
  {de:"Vor Beginn stelle ich das Dashboard bereit.",es:"Antes del inicio dejo listo el dashboard.",z:"vor"},
  {de:"Währenddessen notiert Anna die Fragen.",es:"Mientras tanto, Anna anota las preguntas.",z:"waehrend"},
  {de:"Danach exportiere ich die Daten.",es:"Después exporto los datos.",z:"nach"},
  {de:"Bevor wir starten, klären wir die Agenda.",es:"Antes de empezar, aclaramos la agenda.",z:"vor"},
  {de:"Nachdem ich gefragt hatte, bekam ich die Antwort.",es:"Después de preguntar, recibí la respuesta.",z:"nach"},
  {de:"Während wir sprechen, teilt er den Bildschirm.",es:"Mientras hablamos, él comparte pantalla.",z:"waehrend"},
  {de:"Nach Feierabend lerne ich Deutsch.",es:"Después del trabajo estudio alemán.",z:"nach"},
  {de:"Vor der Demo mache ich ein Backup.",es:"Antes de la demo hago un backup.",z:"vor"}
];

var TEMPUS_ROUND = 8;
var TEMPUS_EVENTS = [
  "das Team-Meeting",
  "die Präsentation",
  "der Unterricht",
  "das Abendessen",
  "die Reise",
  "das Vorstellungsgespräch",
  "die Prüfung",
  "der Workshop"
];

function tempusShuffle(a) {
  a = a.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function tempusText(s) {
  var d = document.createElement("div");
  d.textContent = String(s == null ? "" : s);
  return d.innerHTML;
}

function tempusInit() {
  state.tempus.selectedEl = null;
  state.tempus.pointerDrag = null;
  state.tempus.suppressClick = false;
  state.tempus.firstTryOK = 0;
  state.tempus.attempted = {};
  state.tempus.roundDone = false;
  state.tempus.logged = false;
  state.tempus.currentEvent = TEMPUS_EVENTS[Math.floor(Math.random() * TEMPUS_EVENTS.length)];
  state.tempus.currentRound = tempusShuffle(TEMPUS_PHRASES).slice(0, TEMPUS_ROUND);
}

function tempusSelect(el) {
  if (el.classList.contains("tempus-ok")) return;
  if (state.tempus.selectedEl === el) {
    el.classList.remove("tempus-selected");
    state.tempus.selectedEl = null;
    tempusArm(false);
    return;
  }
  var sel = document.querySelector(".tempus-phrase.tempus-selected");
  if (sel) sel.classList.remove("tempus-selected");
  state.tempus.selectedEl = el;
  el.classList.add("tempus-selected");
  tempusArm(true);
}

function tempusArm(on) {
  var zones = document.querySelectorAll(".tempus-zone");
  for (var i = 0; i < zones.length; i++) {
    zones[i].classList.toggle("tempus-armed", on);
  }
}

function tempusClearTouchOver() {
  var zones = document.querySelectorAll(".tempus-zone.tempus-touch-over");
  for (var i = 0; i < zones.length; i++) zones[i].classList.remove("tempus-touch-over");
}

function tempusZoneFromPoint(x, y, dragEl) {
  var oldPointer = dragEl ? dragEl.style.pointerEvents : "";
  if (dragEl) dragEl.style.pointerEvents = "none";
  var target = document.elementFromPoint(x, y);
  if (dragEl) dragEl.style.pointerEvents = oldPointer;
  return target && target.closest ? target.closest(".tempus-zone") : null;
}

function tempusFinishPointer(btn) {
  btn.classList.remove("tempus-dragging");
  btn.style.transform = "";
  tempusClearTouchOver();
  state.tempus.pointerDrag = null;
}

function tempusBindPointerDrag(btn) {
  btn.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" || btn.classList.contains("tempus-ok")) return;
    state.tempus.pointerDrag = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      active: false,
      selected: false
    };
  });
  btn.addEventListener("pointermove", function (e) {
    var drag = state.tempus.pointerDrag;
    if (!drag || drag.id !== e.pointerId || btn.classList.contains("tempus-ok")) return;
    var dx = e.clientX - drag.startX;
    var dy = e.clientY - drag.startY;
    if (!drag.active && Math.abs(dx) + Math.abs(dy) < 10) return;
    drag.active = true;
    if (!drag.selected) {
      tempusSelect(btn);
      drag.selected = true;
    }
    e.preventDefault();
    if (btn.setPointerCapture && !drag.captured) {
      try { btn.setPointerCapture(e.pointerId); drag.captured = true; } catch (_err) {}
    }
    btn.classList.add("tempus-dragging");
    btn.style.transform = "translate(" + dx + "px," + dy + "px)";
    tempusClearTouchOver();
    var zone = tempusZoneFromPoint(e.clientX, e.clientY, btn);
    if (zone) zone.classList.add("tempus-touch-over");
  }, { passive: false });
  btn.addEventListener("pointerup", function (e) {
    var drag = state.tempus.pointerDrag;
    if (!drag || drag.id !== e.pointerId) return;
    var wasDragging = drag.active;
    var zone = wasDragging ? tempusZoneFromPoint(e.clientX, e.clientY, btn) : null;
    if (wasDragging) {
      e.preventDefault();
      state.tempus.suppressClick = true;
      setTimeout(function () { state.tempus.suppressClick = false; }, 350);
    }
    tempusFinishPointer(btn);
    if (wasDragging && zone) tempusDrop(zone);
  });
  btn.addEventListener("pointercancel", function () {
    if (state.tempus.pointerDrag) tempusFinishPointer(btn);
  });

  if (window.PointerEvent) return;
  btn.addEventListener("touchstart", function (e) {
    if (btn.classList.contains("tempus-ok") || !e.touches.length) return;
    var t = e.touches[0];
    state.tempus.pointerDrag = {
      id: "touch",
      startX: t.clientX,
      startY: t.clientY,
      active: false,
      selected: false
    };
  }, { passive: true });
  btn.addEventListener("touchmove", function (e) {
    var drag = state.tempus.pointerDrag;
    if (!drag || drag.id !== "touch" || btn.classList.contains("tempus-ok") || !e.touches.length) return;
    var t = e.touches[0];
    var dx = t.clientX - drag.startX;
    var dy = t.clientY - drag.startY;
    if (!drag.active && Math.abs(dx) + Math.abs(dy) < 10) return;
    drag.active = true;
    if (!drag.selected) {
      tempusSelect(btn);
      drag.selected = true;
    }
    e.preventDefault();
    btn.classList.add("tempus-dragging");
    btn.style.transform = "translate(" + dx + "px," + dy + "px)";
    tempusClearTouchOver();
    var zone = tempusZoneFromPoint(t.clientX, t.clientY, btn);
    if (zone) zone.classList.add("tempus-touch-over");
  }, { passive: false });
  btn.addEventListener("touchend", function (e) {
    var drag = state.tempus.pointerDrag;
    if (!drag || drag.id !== "touch") return;
    var t = e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : null;
    var zone = drag.active && t ? tempusZoneFromPoint(t.clientX, t.clientY, btn) : null;
    if (drag.active) {
      e.preventDefault();
      state.tempus.suppressClick = true;
      setTimeout(function () { state.tempus.suppressClick = false; }, 350);
    }
    tempusFinishPointer(btn);
    if (drag.active && zone) tempusDrop(zone);
  }, { passive: false });
}

function tempusDrop(zone) {
  if (!state.tempus.selectedEl) return;
  var el = state.tempus.selectedEl;
  var ok = el.dataset.z === zone.dataset.z;
  var id = el.dataset.id;
  var first = !state.tempus.attempted[id];
  state.tempus.attempted[id] = true;

  if (ok) {
    if (first) state.tempus.firstTryOK++;
    el.classList.remove("tempus-selected", "tempus-bad");
    el.classList.add("tempus-ok");
    el.draggable = false;
    el.onclick = null;
    zone.appendChild(el);
    state.tempus.selectedEl = null;
    tempusArm(false);
  } else {
    el.classList.add("tempus-bad");
    setTimeout(function () { el.classList.remove("tempus-bad"); }, 400);
  }
  tempusPaintScore();
}

function tempusPaintScore() {
  var ft = document.getElementById("tempusFirstTry");
  if (ft) ft.textContent = state.tempus.firstTryOK;
}

function renderTempus() {
  var el = document.getElementById("s-tempus");
  el.innerHTML = "";

  // Init if needed
  if (!state.tempus.currentRound || !state.tempus.currentRound.length) {
    tempusInit();
  }

  var ev = state.tempus.currentEvent || TEMPUS_EVENTS[0];
  var round = state.tempus.currentRound;

  // ── Header ──
  var hdr = mk("div", "", "margin-bottom:18px;position:relative;");
  var accent = mk("div", "", "width:48px;height:3px;border-radius:3px;background:var(--gold);margin-bottom:14px;");
  hdr.appendChild(accent);
  hdr.appendChild(mk("p", "Drill · Tiempo", "font-size:10px;color:var(--dim);letter-spacing:2.5px;font-weight:700;font-family:var(--font-label);text-transform:uppercase;margin-bottom:4px;"));
  hdr.appendChild(mk("h2", "Tempus", "font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.03em;line-height:1.1;margin-bottom:2px;"));
  var sub = mk("p", "", "font-size:13px;color:var(--muted);font-weight:500;line-height:1.5;");
  sub.innerHTML = 'Colocá cada frase en la línea de tiempo: ¿pasa <b style="color:var(--gold-text);">antes</b>, <b style="color:var(--gold-text);">durante</b> o <b style="color:var(--gold-text);">después</b> del evento? Toca una frase y luego una zona (o arrastrala).';
  hdr.appendChild(sub);
  el.appendChild(hdr);

  // ── Grammar Note ──
  var gn = mk("div", "", "display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px;");
  var gn1 = mk("div", "", "border-radius:14px;padding:11px 13px;border:1px solid var(--border);background:var(--surface);");
  gn1.appendChild(mk("p", "vor / nach + Dativ", "font-size:10px;letter-spacing:1.5px;font-weight:800;text-transform:uppercase;margin-bottom:4px;color:var(--teal-text);"));
  gn1.appendChild(mk("p", "Preposiciones — van con un sustantivo: vor dem Meeting, nach der Arbeit.", "font-size:11.5px;font-weight:500;color:var(--muted);line-height:1.45;"));
  gn.appendChild(gn1);
  var gn2 = mk("div", "", "border-radius:14px;padding:11px 13px;border:1px solid var(--border);background:var(--surface);");
  gn2.appendChild(mk("p", "bevor / nachdem", "font-size:10px;letter-spacing:1.5px;font-weight:800;text-transform:uppercase;margin-bottom:4px;color:var(--purple-text);"));
  gn2.appendChild(mk("p", "Conjunciones — abren cláusula con verbo al final: bevor ich esse, nachdem er kam.", "font-size:11.5px;font-weight:500;color:var(--muted);line-height:1.45;"));
  gn.appendChild(gn2);
  el.appendChild(gn);

  // ── Timeline Wrap ──
  var tl = mk("div", "", "background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:18px 14px 14px;margin-bottom:16px;");

  var evLbl = mk("div", "", "text-align:center;margin-bottom:14px;");
  var evEyebrow = mk("p", "EL EVENTO DE REFERENCIA", "font-size:10px;font-weight:800;letter-spacing:1.5px;color:var(--gold-text);text-transform:uppercase;margin-bottom:3px;");
  evLbl.appendChild(evEyebrow);
  var evName = mk("p", ev, "font-size:15px;font-weight:900;color:var(--text);letter-spacing:-0.01em;");
  evLbl.appendChild(evName);
  tl.appendChild(evLbl);

  // Track
  var track = mk("div", "", "position:relative;height:5px;border-radius:4px;margin:0 8px 14px;background:linear-gradient(90deg,rgba(var(--red-rgb),0.8) 0% 32%,rgba(var(--green-rgb),0.8) 34% 66%,rgba(var(--teal-rgb),0.8) 68% 100%);opacity:0.85;");
  var nowDot = mk("span", "", "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:15px;height:15px;border-radius:50%;background:var(--gold);box-shadow:0 0 0 5px rgba(var(--gold-rgb),0.22),0 0 18px rgba(var(--gold-rgb),0.7);animation:tempusPulse 1.8s infinite;");
  track.appendChild(nowDot);
  tl.appendChild(track);

  // Arrows
  var arrows = mk("div", "", "display:flex;justify-content:space-between;font-size:9.5px;font-weight:800;letter-spacing:1px;color:var(--dim);padding:0 6px;margin-bottom:12px;");
  arrows.appendChild(mk("span", "← VERGANGENHEIT", ""));
  arrows.appendChild(mk("span", "DAS EREIGNIS", "color:var(--gold-text);"));
  arrows.appendChild(mk("span", "ZUKUNFT →", ""));
  tl.appendChild(arrows);

  // Zones
  var zones = mk("div", "", "display:grid;grid-template-columns:repeat(3,1fr);gap:9px;");
  var zoneData = [
    { z: "vor", lbl: "Davor · vor", cls: "tempus-vor" },
    { z: "waehrend", lbl: "Dabei · während", cls: "tempus-waehrend" },
    { z: "nach", lbl: "Danach · nach", cls: "tempus-nach" }
  ];
  zoneData.forEach(function (zd) {
    var zone = mk("div", "", "min-height:120px;border-radius:16px;border:1.5px dashed;padding:9px 8px;display:flex;flex-direction:column;gap:7px;transition:background 0.2s,box-shadow 0.2s;");
    zone.className = "tempus-zone " + zd.cls;
    zone.dataset.z = zd.z;
    zone.appendChild(mk("p", zd.lbl, "font-size:10px;font-weight:900;letter-spacing:1.5px;text-align:center;text-transform:uppercase;margin-bottom:2px;"));

    zone.addEventListener("click", function () { tempusDrop(zone); });
    zone.addEventListener("dragover", function (e) { e.preventDefault(); zone.classList.add("tempus-over"); });
    zone.addEventListener("dragleave", function () { zone.classList.remove("tempus-over"); });
    zone.addEventListener("drop", function (e) { e.preventDefault(); zone.classList.remove("tempus-over"); tempusDrop(zone); });

    zones.appendChild(zone);
  });
  tl.appendChild(zones);
  el.appendChild(tl);

  // ── HAND ──
  var handLbl = mk("p", "Frases por colocar", "font-size:10px;letter-spacing:2px;font-weight:800;color:var(--muted);text-transform:uppercase;margin:16px 0 8px;");
  el.appendChild(handLbl);
  var hand = mk("div", "", "display:flex;flex-direction:column;gap:8px;min-height:52px;");
  hand.id = "tempusHand";

  round.forEach(function (ph, k) {
    var btn = document.createElement("button");
    btn.className = "tempus-phrase";
    btn.draggable = true;
    btn.dataset.z = ph.z;
    btn.dataset.id = k;
    btn.innerHTML = tempusText(ph.de) + '<span class="tempus-es">' + tempusText(ph.es) + '</span>';
    btn.onclick = function () {
      if (state.tempus.suppressClick) {
        state.tempus.suppressClick = false;
        return;
      }
      tempusSelect(btn);
    };
    btn.addEventListener("dragstart", function (e) {
      tempusSelect(btn);
      e.dataTransfer.setData("text/plain", "x");
    });
    tempusBindPointerDrag(btn);
    hand.appendChild(btn);
  });
  el.appendChild(hand);

  // ── Scoreline ──
  var scoreRow = mk("div", "", "margin-top:14px;display:flex;justify-content:space-between;align-items:center;");
  var scoreP = document.createElement("p");
  scoreP.style.cssText = "font-size:12px;font-weight:700;color:var(--muted);";
  var ftSpan = mk("b", "0", "color:var(--green-text);font-weight:900;");
  scoreP.appendChild(document.createTextNode("Colocadas al primer intento: "));
  scoreP.appendChild(ftSpan);
  var totN = mk("span", "", "color:var(--muted);font-weight:500;");
  totN.textContent = " / " + TEMPUS_ROUND;
  scoreP.appendChild(totN);
  ftSpan.id = "tempusFirstTry";
  scoreRow.appendChild(scoreP);

  var resetBtn = mk("button", "↻ Nueva ronda", "background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:12px;padding:9px 14px;font-size:12.5px;font-weight:800;cursor:pointer;transition:background 0.15s,color 0.15s;");
  resetBtn.onmouseenter = function () { this.style.background = "rgba(255,255,255,0.04)"; this.style.color = "var(--text2)"; };
  resetBtn.onmouseleave = function () { this.style.background = "transparent"; this.style.color = "var(--muted)"; };
  resetBtn.onclick = function () {
    tempusInit();
    renderTempus();
  };
  scoreRow.appendChild(resetBtn);
  el.appendChild(scoreRow);

  // Log activity when all placed (checked via hand emptiness via CSS ::after)
  // We use a MutationObserver-like polling approach: check every 2s
  if (!state.tempus._watchInterval) {
    state.tempus._watchInterval = setInterval(function () {
      var handEl = document.getElementById("tempusHand");
      if (!handEl || !state.tempus.currentRound) return;
      var remaining = handEl.querySelectorAll(".tempus-phrase:not(.tempus-ok)");
      if (remaining.length === 0 && state.tempus.currentRound.length > 0 && !state.tempus.logged) {
        state.tempus.logged = true;
        if (typeof logActivity === "function") logActivity("drillsDone", 1);
        if (typeof syncUp === "function") syncUp();
      }
    }, 2000);
  }

  tempusPaintScore();
}

window.renderTempus = renderTempus;
