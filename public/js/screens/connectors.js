// ── Connectors (Fable port — 2 modes: choose + build) ───────────────────────
// Data: 10 connectors, 20 CHOOSE exercises, 10 BUILD exercises
// Mode 1: "Elegir conector" — pick the right connector for a fill-in-the-blank
// Mode 2: "Construir oración" — tap words in order to build the sentence

var CONN = {
  weil:    { cat:"causal", v:"final", rule:"weil es subordinante: empuja el verbo conjugado al FINAL de su cláusula." },
  da:      { cat:"causal", v:"final", rule:"da (como weil) es subordinante: verbo al FINAL." },
  deshalb:{ cat:"consec", v:"v2",    rule:"deshalb es adverbio: ocupa la posición 1 y el verbo va en POSICIÓN 2 (inversión)." },
  sodass:  { cat:"consec", v:"final", rule:"sodass es subordinante: verbo al FINAL de la cláusula de consecuencia." },
  obwohl:  { cat:"conces", v:"final", rule:"obwohl es subordinante: verbo al FINAL." },
  trotzdem:{ cat:"conces", v:"v2",    rule:"trotzdem es adverbio: posición 1, verbo en POSICIÓN 2." },
  wenn:    { cat:"temp",   v:"final", rule:"wenn (condicional/temporal) es subordinante: verbo al FINAL." },
  dass:    { cat:"temp",   v:"final", rule:"dass es subordinante: verbo al FINAL." },
  denn:    { cat:"causal", v:"v2",    rule:"denn es coordinante: NO cambia el orden — sujeto + verbo en posición 2 normal." },
  bevor:   { cat:"temp",   v:"final", rule:"bevor es subordinante: verbo al FINAL." }
};

var CHOOSE = [
  { pre:"Ich lerne Deutsch,", post:"ich nach Europa ziehen will.", ans:"weil",    dis:["trotzdem","denn"],    es:"Aprendo alemán porque quiero mudarme a Europa." },
  { pre:"Er sagt,",           post:"das Deployment fertig ist.", ans:"dass",    dis:["weil","deshalb"],     es:"Él dice que el despliegue está listo." },
  { pre:"Ich bin müde,",      post:"arbeite ich weiter.",        ans:"trotzdem",dis:["obwohl","weil"],      es:"Estoy cansado; sin embargo, sigo trabajando." },
  { pre:"",                   post:"es regnet, gehe ich joggen.",ans:"obwohl",  dis:["deshalb","dass"],     es:"Aunque llueve, salgo a correr." },
  { pre:"Der Server ist down,",post:"kann ich nicht arbeiten.",  ans:"deshalb", dis:["weil","obwohl"],      es:"El servidor está caído; por eso no puedo trabajar." },
  { pre:"Ruf mich an,",       post:"du Zeit hast.",              ans:"wenn",    dis:["dass","denn"],        es:"Llámame cuando/si tienes tiempo." },
  { pre:"Ich habe viel geübt,",post:"ich die Prüfung bestanden habe.",ans:"sodass",dis:["obwohl","denn"],  es:"Practiqué mucho, de modo que aprobé el examen." },
  { pre:"Sie bleibt zu Hause,",post:"sie ist krank.",            ans:"denn",    dis:["weil","wenn"],        es:"Se queda en casa, pues está enferma." },
  { pre:"Ich teste den Code,",post:"ich ihn deploye.",           ans:"bevor",   dis:["trotzdem","sodass"],  es:"Pruebo el código antes de desplegarlo." },
  { pre:"",                   post:"ich wenig Zeit habe, mache ich täglich Flashcards.",ans:"da",dis:["trotzdem","dass"],es:"Como tengo poco tiempo, hago flashcards a diario." },
  { pre:"Das WLAN ist langsam,",post:"lade ich das Video später hoch.",ans:"deshalb",dis:["obwohl","dass"],es:"El wifi está lento; por eso subo el video después." },
  { pre:"Ich glaube,",        post:"Übung wichtiger als Talent ist.",ans:"dass",dis:["weil","denn"],      es:"Creo que la práctica importa más que el talento." },
  { pre:"Er nimmt den Job,",  post:"das Gehalt niedrig ist.",     ans:"obwohl",  dis:["weil","deshalb"],    es:"Acepta el trabajo aunque el sueldo es bajo." },
  { pre:"Die API antwortet nicht,",post:"nutze ich den Cache.",   ans:"deshalb", dis:["denn","obwohl"],     es:"La API no responde; por eso uso la caché." },
  { pre:"Ich freue mich,",    post:"du kommst.",                  ans:"wenn",    dis:["weil","sodass"],     es:"Me alegro si/cuando vienes." },
  { pre:"Das Meeting war lang,",post:"habe ich es aufgezeichnet.",ans:"deshalb",dis:["obwohl","dass"],     es:"La reunión fue larga; por eso la grabé." },
  { pre:"Ich spare Geld,",    post:"ich in die Schweiz reisen kann.",ans:"sodass",dis:["denn","trotzdem"],es:"Ahorro dinero de modo que pueda viajar a Suiza." },
  { pre:"Sie lernt schnell,", post:"sie jeden Tag übt.",          ans:"weil",    dis:["trotzdem","deshalb"],es:"Aprende rápido porque practica cada día." },
  { pre:"Der Test schlägt fehl,",post:"prüfe ich die Logs.",      ans:"deshalb", dis:["dass","obwohl"],     es:"El test falla; por eso reviso los logs." },
  { pre:"Ich verstehe den Satz nicht,",post:"ich ihn dreimal gelesen habe.",ans:"obwohl",dis:["weil","wenn"],es:"No entiendo la frase aunque la leí tres veces." }
];

var BUILD = [
  { start:"Ich lerne Deutsch,", words:["weil","ich","nach","Europa","ziehen","will"], es:"…porque quiero mudarme a Europa.", conn:"weil" },
  { start:"Ich bin müde,",      words:["trotzdem","arbeite","ich","weiter"],          es:"…sin embargo, sigo trabajando.",     conn:"trotzdem" },
  { start:"Er sagt,",           words:["dass","der","Code","fertig","ist"],           es:"…que el código está listo.",        conn:"dass" },
  { start:"Der Server ist down,",words:["deshalb","arbeite","ich","offline"],         es:"…por eso trabajo offline.",         conn:"deshalb" },
  { start:"Sie kommt mit,",     words:["obwohl","sie","müde","ist"],                  es:"…aunque está cansada.",             conn:"obwohl" },
  { start:"Ruf mich an,",       words:["wenn","du","Zeit","hast"],                    es:"…cuando tengas tiempo.",            conn:"wenn" },
  { start:"Ich übe täglich,",   words:["sodass","ich","schnell","lerne"],             es:"…de modo que aprendo rápido.",      conn:"sodass" },
  { start:"Ich bleibe zu Hause,",words:["denn","es","regnet","stark"],                es:"…pues llueve fuerte.",              conn:"denn" },
  { start:"Ich teste alles,",   words:["bevor","ich","es","deploye"],                 es:"…antes de desplegarlo.",            conn:"bevor" },
  { start:"Das Video ist lang,",words:["trotzdem","schaue","ich","es"],               es:"…sin embargo, lo veo.",             conn:"trotzdem" }
];

function connShuffle(a) {
  a = a.slice();
  for (var k = a.length - 1; k > 0; k--) {
    var j = Math.floor(Math.random() * (k + 1));
    var t = a[k]; a[k] = a[j]; a[j] = t;
  }
  return a;
}

function connText(s) {
  var d = document.createElement("div");
  d.textContent = String(s == null ? "" : s);
  return d.innerHTML;
}

// Init namespaced state
if (!state.connectors) state.connectors = {};
var cn = state.connectors;
if (cn.mode === undefined) cn.mode = "elegir";
if (typeof cn.idx !== "number") cn.idx = 0;
if (typeof cn.score !== "number") cn.score = 0;
if (typeof cn.total !== "number") cn.total = 0;
cn.locked = false;
cn.built = [];
cn.chooseDeck = connShuffle(CHOOSE);
cn.buildDeck = connShuffle(BUILD);

// ── Skeleton diagram ─────────────────────────────────────────────────────────
function connSkeletonFor(key) {
  var c = CONN[key];
  var parts;
  if (c.v === "final") {
    parts = [["conn",key],["sk","sujeto"],["sk","…"],["verb","VERBO"]];
  } else if (key === "denn") {
    parts = [["conn",key],["sk","sujeto"],["verb","VERBO"],["sk","…"]];
  } else {
    parts = [["conn",key],["verb","VERBO"],["sk","sujeto"],["sk","…"]];
  }
  var wrap = mk("div","","display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:8px 0 6px;");
  parts.forEach(function(p) {
    var cls = p[0], txt = p[1];
    var isV = cls === "verb", isC = cls === "conn";
    var el = mk("span", txt,
      "font-size:11px;font-weight:800;padding:6px 9px;border-radius:8px;" +
      (isV ? "background:rgba(var(--red-rgb),0.15);color:var(--red-text);border:1.5px solid rgba(var(--red-rgb),0.55);" :
       isC ? "background:rgba(var(--gold-rgb),0.15);color:var(--gold-text);border:1.5px solid rgba(var(--gold-rgb),0.55);" :
             "background:rgba(255,255,255,0.06);color:var(--muted);border:1px dashed var(--dim);")
    );
    wrap.appendChild(el);
  });
  return wrap;
}

// ── Show rule card ───────────────────────────────────────────────────────────
function connShowRuleInternal(key) {
  var ruleEl = document.getElementById("conn-rule");
  var skelEl = document.getElementById("conn-skel");
  var txtEl  = document.getElementById("conn-rule-txt");
  if (!ruleEl || !skelEl || !txtEl) return;
  skelEl.innerHTML = "";
  skelEl.appendChild(connSkeletonFor(key));
  txtEl.textContent = CONN[key].rule;
  ruleEl.style.display = "block";
}

// ── Score update ─────────────────────────────────────────────────────────────
function connPaintScore() {
  var scEl  = document.getElementById("conn-score");
  var totEl = document.getElementById("conn-total");
  if (scEl)  scEl.textContent  = cn.score;
  if (totEl) totEl.textContent = cn.total;
}

// ── Next question ────────────────────────────────────────────────────────────
function connNextQ() {
  cn.idx++;
  cn.locked = false;
  cn.built  = [];
  // Reshuffle if we've looped
  if (cn.idx % cn.chooseDeck.length === 0) cn.chooseDeck = connShuffle(CHOOSE);
  if (cn.idx % cn.buildDeck.length === 0)  cn.buildDeck  = connShuffle(BUILD);
  renderConnectors();
}

// ── Add "Siguiente →" button ─────────────────────────────────────────────────
function connAddNextBtn() {
  var act = document.getElementById("conn-actions");
  if (!act) return;
  act.innerHTML = "";
  var btn = mk("button", "Siguiente →",
    "flex:1;padding:13px;border-radius:14px;font-size:14px;font-weight:900;" +
    "background:var(--teal);color:#042623;border:none;cursor:pointer;" +
    "animation:connRise .25s;"
  );
  btn.onclick = connNextQ;
  act.appendChild(btn);
}

// ── Choose-mode pick handler ─────────────────────────────────────────────────
function connPick(btn, key, q, card) {
  if (cn.locked) return;
  cn.locked = true;
  cn.total++;

  // Disable ALL chip buttons in the card
  var chips = card.querySelectorAll(".conn-chips > button");
  for (var i = 0; i < chips.length; i++) chips[i].disabled = true;

  var gap = document.getElementById("conn-gap");
  var correct = key === q.ans;

  if (correct) {
    cn.score++;
    btn.style.background = "var(--green)";
    btn.style.color = "#052e12";
    btn.style.borderColor = "var(--green)";
    if (gap) gap.textContent = key;
    card.style.borderColor = "rgba(var(--green-rgb),0.5)";
    setTimeout(function() { connNextQ(); }, 700);
  } else {
    btn.style.background = "var(--red)";
    btn.style.color = "#3d0a0a";
    btn.style.borderColor = "var(--red)";
    // Highlight correct answer
    for (var j = 0; j < chips.length; j++) {
      if (chips[j].textContent === q.ans) {
        chips[j].style.background = "var(--green)";
        chips[j].style.color = "#052e12";
        chips[j].style.borderColor = "var(--green)";
      }
    }
    if (gap) gap.textContent = q.ans;
    card.style.borderColor = "rgba(var(--red-rgb),0.5)";
    card.style.animation = "connShake .35s";
    setTimeout(function() { card.style.animation = ""; }, 350);
    connShowRuleInternal(q.ans);
    connAddNextBtn();
    // Save missed connector to SRS so it resurfaces in flashcards
    if(state.session && Array.isArray(state.session.saved)){
      var full=(q.pre?q.pre+" ":"")+q.ans+" "+q.post;
      var key="conectores:"+q.ans+":"+q.post;
      if(!state.session.saved.some(function(x){return x.drillKey===key;})){
        var plainRule=((CONN[q.ans]&&CONN[q.ans].rule)||"").replace(/<[^>]*>/g,"");
        state.session.saved.push(ensureSrsFields({
          de:full, es:(q.es||plainRule), tip:plainRule, drillKey:key,
          source:"conectores-drill", category:"Conectores", box:0
        }));
        if(typeof invalidateFlashcardQueues==="function") invalidateFlashcardQueues();
        if(typeof updateBadge==="function") updateBadge();
        syncUp();
      }
    }
  }
  connPaintScore();
}

// ── Build-mode place handler ─────────────────────────────────────────────────
function connPlace(btn, w, slots) {
  if (cn.locked || btn.dataset.used === "1") return;
  btn.dataset.used = "1";  // Using string "1" as boolean flag (dataset returns strings)
  btn.style.opacity = "0.25";
  btn.style.pointerEvents = "none";
  var token = { id: "w" + Date.now() + Math.random().toString(16).slice(2), word: w };
  cn.built.push(token);
  var placed = mk("button", w,
    "padding:9px 13px;border-radius:11px;font-size:14px;font-weight:700;" +
    "background:rgba(var(--teal-rgb),0.12);border:1px solid rgba(var(--teal-rgb),0.45);" +
    "color:var(--teal-text);cursor:pointer;transition:transform .1s;"
  );
  placed.onclick = function() {
    if (cn.locked) return;
    var idx = cn.built.findIndex(function(item) { return item.id === token.id; });
    if (idx !== -1) cn.built.splice(idx, 1);
    placed.remove();
    btn.dataset.used = "0";
    btn.style.opacity = "";
    btn.style.pointerEvents = "";
  };
  slots.appendChild(placed);
}

// ── Build-mode check handler ─────────────────────────────────────────────────
function connCheckBuild(q, slots, card) {
  if (cn.locked) return;
  if (cn.built.length !== q.words.length) {
    slots.style.borderColor = "var(--red)";
    setTimeout(function() { slots.style.borderColor = ""; }, 500);
    return;
  }
  cn.locked = true;
  cn.total++;
  var builtWords = cn.built.map(function(item) { return item.word || item; });
  var ok = builtWords.join(" ") === q.words.join(" ");

  if (ok) {
    cn.score++;
    slots.style.borderColor = "var(--green)";
    card.style.borderColor = "rgba(var(--green-rgb),0.5)";
    setTimeout(function() { connNextQ(); }, 750);
  } else {
    slots.style.borderColor = "var(--red)";
    card.style.borderColor = "rgba(var(--red-rgb),0.5)";
    card.style.animation = "connShake .35s";
    setTimeout(function() { card.style.animation = ""; }, 350);
    // Show correct answer
    slots.innerHTML = "";
    for (var i = 0; i < q.words.length; i++) {
      slots.appendChild(mk("span", q.words[i],
        "padding:9px 13px;border-radius:11px;font-size:14px;font-weight:700;" +
        "background:rgba(var(--teal-rgb),0.12);border:1px solid rgba(var(--teal-rgb),0.45);" +
        "color:var(--teal-text);"
      ));
    }
    connShowRuleInternal(q.conn);
    connAddNextBtn();
  }
  connPaintScore();
}

// ── MAIN RENDER ──────────────────────────────────────────────────────────────
function renderConnectors() {
  var el = document.getElementById("s-conectores");
  el.innerHTML = "";

  // Reset per-render state
  cn.locked = false;
  cn.built  = [];

  // ── Header ──
  var hdr = mk("div","","margin-bottom:18px;position:relative;");
  var accent = mk("div","","width:48px;height:3px;border-radius:3px;background:var(--purple);margin-bottom:10px;");
  hdr.appendChild(accent);
  hdr.appendChild(mk("p","Drill · Nebensätze & Adverbien",
    "font-size:10px;color:var(--dim);letter-spacing:2.5px;font-family:var(--font-label);font-weight:700;margin-bottom:4px;"));
  var h2row=mk("div","","display:flex;align-items:center;gap:8px;margin:2px 0 8px;");
  h2row.appendChild(mk("h2","Conectores",
    "font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.03em;line-height:1.15;margin:0;"));
  var hintBtn=mk("button","💡","width:32px;height:32px;border-radius:10px;border:1px dashed rgba(var(--gold-rgb),.4);background:rgba(var(--gold-rgb),.06);font-size:15px;cursor:pointer;padding:0;line-height:1;transition:background .15s;");
  hintBtn.setAttribute("aria-label","Ver reglas de los conectores"); hintBtn.setAttribute("aria-expanded","false");
  h2row.appendChild(hintBtn);
  hdr.appendChild(h2row);
  el.appendChild(hdr);
  // Connector rules reminder (toggled by the bulb — generic, no answer leak)
  var hintCard=mk("div","","display:none;border-radius:12px;padding:12px 14px;margin-bottom:14px;background:rgba(var(--gold-rgb),.07);border:1px solid rgba(var(--gold-rgb),.25);font-size:12.5px;line-height:1.7;font-weight:500;color:var(--text);animation:fadeUp .2s ease;");
  hintCard.innerHTML=
    '<b>VERBO EN 2ª POSICIÓN (V2)</b><br>'
   +'Después de: <b style="color:var(--teal)">deshalb, dann, trotzdem, also, außerdem</b> → el verbo conjugado va SIEMPRE en segunda posición.<br>'
   +'• Ich bin müde, <b style="color:var(--teal)">deshalb</b> <u>gehe</u> ich schlafen.<br><br>'
   +'<b>VERBO AL FINAL (subordinada)</b><br>'
   +'Después de: <b style="color:var(--gold)">weil, dass, obwohl, wenn, nachdem, bevor, während, ob, da, damit, als</b> → el verbo conjugado va al FINAL.<br>'
   +'• Ich lerne Deutsch, <b style="color:var(--gold)">weil</b> ich in Berlin arbeiten <u>will</u>.<br><br>'
   +'<b style="color:var(--purple)">denn · und · aber · oder</b> → coordinantes: <b>no cambian</b> el orden.<br><br>'
   +'<b style="color:var(--red)">TRUCO:</b> si el conector empuja el verbo al final, piensa: "lo de antes del conector va normal (V2), y lo que viene después acumula los verbos al final como una pila."';
  hintBtn.onclick=function(){
    var open=hintCard.style.display==="block";
    hintCard.style.display=open?"none":"block";
    hintBtn.setAttribute("aria-expanded",open?"false":"true");
  };
  el.appendChild(hintCard);

  // ── Mode row ──
  var modeRow = mk("div","",
    "display:flex;gap:6px;background:var(--surface);border:1px solid var(--border);" +
    "border-radius:14px;padding:4px;margin-bottom:14px;");
  var elegirBtn = mk("button","🎯 Elegir conector",
    "flex:1;padding:9px;border-radius:10px;border:none;font-size:13px;font-weight:700;" +
    "cursor:pointer;transition:background .2s,color .2s;");
  var construirBtn = mk("button","🧩 Construir oración",
    "flex:1;padding:9px;border-radius:10px;border:none;font-size:13px;font-weight:700;" +
    "cursor:pointer;transition:background .2s,color .2s;");
  function updateModeBtns() {
    elegirBtn.style.background = cn.mode === "elegir" ? "var(--gold)" : "transparent";
    elegirBtn.style.color = cn.mode === "elegir" ? "#000" : "var(--muted)";
    construirBtn.style.background = cn.mode === "elegir" ? "transparent" : "var(--gold)";
    construirBtn.style.color = cn.mode === "elegir" ? "var(--muted)" : "#000";
  }
  elegirBtn.onclick = function() {
    cn.mode = "elegir"; cn.idx = 0; cn.locked = false;
    updateModeBtns(); renderConnectors();
  };
  construirBtn.onclick = function() {
    cn.mode = "construir"; cn.idx = 0; cn.locked = false;
    updateModeBtns(); renderConnectors();
  };
  updateModeBtns();
  modeRow.appendChild(elegirBtn);
  modeRow.appendChild(construirBtn);
  el.appendChild(modeRow);

  // ── Category legend ──
  var legend = mk("div","","display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;");
  var legData = [
    { label:"causal · weil, deshalb",        color:"var(--green-text)", rgb:"var(--green-rgb)"  },
    { label:"concesivo · obwohl, trotzdem",  color:"#fb923c",           rgb:"251,146,60"        },
    { label:"consecutivo · sodass, deshalb", color:"#60a5fa",           rgb:"96,165,250"        },
    { label:"temporal/cond. · wenn, dass",   color:"var(--purple-text)",rgb:"var(--purple-rgb)" }
  ];
  legData.forEach(function(l) {
    legend.appendChild(mk("span", l.label,
      "font-size:10px;font-weight:800;letter-spacing:.4px;padding:4px 10px;border-radius:20px;" +
      "color:" + l.color + ";" +
      "border:1px solid rgba(" + l.rgb + ",0.4);" +
      "background:rgba(" + l.rgb + ",0.08);"
    ));
  });
  el.appendChild(legend);

  // ── Card ──
  var card = mk("div","",
    "background:var(--surface);border:1px solid var(--border);border-radius:20px;" +
    "padding:20px;margin-bottom:14px;transition:border-color .25s;");
  card.id = "conn-card";

  var deck = cn.mode === "elegir" ? cn.chooseDeck : cn.buildDeck;
  var deckLen = deck.length;
  var curNum  = (cn.idx % deckLen) + 1;
  var modeLabel = cn.mode === "elegir" ? "Elegir" : "Construir";
  card.appendChild(mk("p", modeLabel + " · " + curNum + " / " + deckLen,
    "font-size:11px;font-weight:800;color:var(--dim);margin-bottom:10px;"));

  // ── Play area ──
  var playArea = mk("div","","");

  if (cn.mode === "elegir") {
    var q = cn.chooseDeck[cn.idx % cn.chooseDeck.length];
    var sent = mk("p","","font-size:19px;font-weight:700;line-height:1.65;color:var(--text);");
    sent.innerHTML = connText(q.pre) +
      ' <span style="display:inline-block;min-width:86px;border-bottom:2.5px dashed var(--gold);text-align:center;color:var(--gold);font-weight:900;padding:0 6px;" id="conn-gap">___</span> ' +
      connText(q.post);
    playArea.appendChild(sent);
    playArea.appendChild(mk("p", q.es, "font-size:12.5px;color:var(--muted);font-weight:600;margin-top:10px;"));

    // Chips
    var chips = mk("div","","display:flex;flex-wrap:wrap;gap:9px;margin:16px 0 4px;");
    chips.className = "conn-chips";
    var catColors = {
      causal: { c:"var(--green-text)",  b:"rgba(var(--green-rgb),0.5)",  bg:"rgba(var(--green-rgb),0.07)"  },
      conces: { c:"#fb923c",            b:"rgba(251,146,60,0.5)",        bg:"rgba(251,146,60,0.07)"        },
      consec: { c:"#60a5fa",            b:"rgba(96,165,250,0.5)",        bg:"rgba(96,165,250,0.07)"        },
      temp:   { c:"var(--purple-text)", b:"rgba(var(--purple-rgb),0.5)", bg:"rgba(var(--purple-rgb),0.07)" }
    };
    connShuffle([q.ans].concat(q.dis)).forEach(function(k) {
      var cc = catColors[CONN[k].cat];
      var btn = mk("button", k,
        "padding:11px 16px;border-radius:14px;font-size:14.5px;font-weight:800;" +
        "border:1.5px solid " + cc.b + ";" +
        "background:" + cc.bg + ";" +
        "color:" + cc.c + ";" +
        "cursor:pointer;transition:transform .1s,opacity .2s;"
      );
      btn.onclick = function() { connPick(btn, k, q, card); };
      chips.appendChild(btn);
    });
    playArea.appendChild(chips);
  } else {
    // ── Build mode ──
    var q = cn.buildDeck[cn.idx % cn.buildDeck.length];
    var sent = mk("p","","font-size:19px;font-weight:700;line-height:1.65;color:var(--text);");
    sent.textContent = q.start;
    playArea.appendChild(sent);
    playArea.appendChild(mk("p", q.es, "font-size:12.5px;color:var(--muted);font-weight:600;margin-top:10px;"));

    // Slots
    var slots = mk("div","",
      "min-height:56px;border:1.5px dashed var(--dim);border-radius:14px;" +
      "padding:9px;display:flex;flex-wrap:wrap;gap:7px;align-items:center;" +
      "margin:14px 0 10px;transition:border-color .2s;");
    slots.id = "conn-slots";
    // The :empty::before CSS rule handles the placeholder text
    playArea.appendChild(slots);

    // Word bank
    var bank = mk("div","","display:flex;flex-wrap:wrap;gap:7px;");
    connShuffle(q.words).forEach(function(w) {
      var btn = mk("button", w,
        "padding:9px 13px;border-radius:11px;font-size:14px;font-weight:700;" +
        "background:rgba(255,255,255,0.07);border:1px solid var(--border);" +
        "color:var(--text);cursor:pointer;transition:transform .1s,opacity .15s;"
      );
      btn.dataset.used = "0";
      btn.onclick = function() { connPlace(btn, w, slots); };
      bank.appendChild(btn);
    });
    playArea.appendChild(bank);
  }

  card.appendChild(playArea);

  // ── Rule card (hidden initially) ──
  var ruleCard = mk("div","",
    "border-radius:16px;padding:14px 16px;margin-top:14px;display:none;" +
    "background:linear-gradient(135deg,rgba(var(--gold-rgb),0.09),transparent);" +
    "border:1px solid rgba(var(--gold-rgb),0.3);");
  ruleCard.id = "conn-rule";
  ruleCard.appendChild(mk("p","Posición del verbo",
    "font-size:9px;letter-spacing:2.5px;font-weight:800;color:var(--gold-text);" +
    "text-transform:uppercase;margin-bottom:8px;"));
  var skelWrap = mk("div","","");
  skelWrap.id = "conn-skel";
  ruleCard.appendChild(skelWrap);
  var ruleTxt = mk("p","","font-size:13px;font-weight:600;line-height:1.55;color:var(--text);");
  ruleTxt.id = "conn-rule-txt";
  ruleCard.appendChild(ruleTxt);
  card.appendChild(ruleCard);

  // ── Actions ──
  var actions = mk("div","","display:flex;gap:9px;margin-top:14px;");
  actions.id = "conn-actions";
  if (cn.mode === "construir") {
    var resetBtn = mk("button","Borrar",
      "background:transparent;border:1px solid var(--border);color:var(--muted);" +
      "flex:1;padding:13px;border-radius:14px;font-size:14px;font-weight:900;cursor:pointer;");
    resetBtn.onclick = function() { renderConnectors(); };
    actions.appendChild(resetBtn);
    var checkBtn = mk("button","Comprobar",
      "background:var(--gold);color:#000;" +
      "flex:1;padding:13px;border-radius:14px;font-size:14px;font-weight:900;cursor:pointer;");
    checkBtn.onclick = function() { connCheckBuild(q, slots, card); };
    actions.appendChild(checkBtn);
  }
  card.appendChild(actions);
  el.appendChild(card);

  // ── Score ──
  var scoreRow = mk("p","","font-size:11px;color:var(--dim);font-weight:600;text-align:center;");
  scoreRow.innerHTML = 'Aciertos: <span style="color:var(--green-text);font-weight:900;" id="conn-score">' +
    cn.score + '</span> / <span id="conn-total">' + cn.total + '</span>';
  el.appendChild(scoreRow);
}

window.renderConnectors = renderConnectors;
