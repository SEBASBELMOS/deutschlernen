// ── Utils (parse JSON, DOM mk()/ico, skeletons, focus-trap a11y) ──────────────
// Extracts and parses the first valid JSON array from the AI text
function parseJSONArray(text) {
  // 1. Strip markdown code fences aggressively (nested or bare)
  var clean = text.replace(/```[\s\S]*?```/g, function(m){ return m.replace(/```/g,""); });
  clean = clean.replace(/```/g,"").trim();

  // 2. Drop any prose before the first [ or {
  var bracketStart = clean.search(/[\[\{]/);
  if (bracketStart >= 0) clean = clean.slice(bracketStart);
  var startChar = (clean[0] === "[" || clean[0] === "{") ? clean[0] : null;

  // Accept a parsed value, coercing an object → array when possible
  function accept(val){
    if (Array.isArray(val) && val.length) return val;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      for (var k in val) { if (Array.isArray(val[k]) && val[k].length) return val[k]; }
      if (val.de) return [val]; // single record → wrap
    }
    return null;
  }

  // 3. Balanced scan to find the end of the first complete JSON value
  var depth = 0, inString = false, escape = false, end = -1;
  for (var i = 0; i < clean.length; i++) {
    var ch = clean[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "[" || ch === "{") depth++;
    else if (ch === "]" || ch === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end >= 0) {
    try { var got = accept(JSON.parse(clean.slice(0, end + 1))); if (got) return got; } catch(e) {}
  }

  // 4. Truncation recovery (array cut mid-object by max_tokens — balanced scan never closed)
  if (startChar === "[") {
    var lastComplete = clean.lastIndexOf("},");
    if (lastComplete < 0) lastComplete = clean.lastIndexOf("}");
    if (lastComplete > 0) {
      try { var got2 = accept(JSON.parse(clean.slice(0, lastComplete + 1) + "]")); if (got2) return got2; } catch(e) {}
    }
    try { var got3 = accept(JSON.parse(clean + "]")); if (got3) return got3; } catch(e) {}
  }

  // 5. Regex extraction + its own truncation fallback
  var m = clean.match(/\[[\s\S]*\]/);
  if (m) {
    try { var got4 = accept(JSON.parse(m[0])); if (got4) return got4; } catch(e) {}
    var trunc = m[0].replace(/,?\s*\{[^}]*$/, "]");
    try { var got5 = accept(JSON.parse(trunc)); if (got5) return got5; } catch(e) {}
  }

  // 6. Full parse (single object etc.)
  try { var got6 = accept(JSON.parse(clean)); if (got6) return got6; } catch(e) {}

  throw new Error("No JSON array found. Raw response (first 200 chars): " + text.slice(0,200));
}

// HTML-escape untrusted text (AI output, user input) before it ever touches innerHTML.
// Prevents XSS → token theft: the app builds its own markup and injects escaped text into it.
function escHtml(s){
  return String(s==null?"":s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

// Centralized duplicate check — case-insensitive, trims whitespace.
// Single source of truth so every screen dedups the same way.
function isDuplicate(de){
  if(!de) return false;
  var key = String(de).toLowerCase().trim();
  return state.session.saved.some(function(x){
    return x.de && String(x.de).toLowerCase().trim() === key;
  });
}

function hexToRgb(hex) {
  if(typeof hex!=="string") return "0,0,0";
  hex=hex.replace("#","");
  if(!/^[0-9a-f]{6}$/i.test(hex)){
    if(/^[0-9a-f]{3}$/i.test(hex)) hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    else return "0,0,0";
  }
  const r=parseInt(hex.slice(0,2),16), g=parseInt(hex.slice(2,4),16), b=parseInt(hex.slice(4,6),16);
  return r+","+g+","+b;
}

function makeDots(color) {
  const d=document.createElement("div"); d.className="dots";
  [0,0.2,0.4].forEach(function(delay){
    const dot=document.createElement("div"); dot.className="dot";
    dot.style.background=color||"#5dd9d0";
    dot.style.animation="bounce 1.2s "+delay+"s infinite";
    d.appendChild(dot);
  });
  return d;
}

state.app._skelStyle="background:var(--surface);border-radius:var(--r-md);animation:skeletonPulse 1.5s ease-in-out infinite;";
function skelLine(w,h){var el=document.createElement("div");el.style.cssText=state.app._skelStyle+"width:"+w+";height:"+(h||"12px")+";";return el;}
function skelCard(lines){var c=document.createElement("div");c.style.cssText="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:var(--s-4);display:flex;flex-direction:column;gap:8px;";for(var i=0;i<lines;i++){var w=(i===lines-1?"60%":"90%");c.appendChild(skelLine(w,"14px"));}return c;}

function mk(tag,text,style) {
  const el=document.createElement(tag);
  if (text) el.textContent=text;
  if (style) el.style.cssText=style;
  return el;
}

function ico(name,size,color) {
  var paths={
    home:'<path d="M4 11.1 12 4l8 7.1v8a1.9 1.9 0 0 1-1.9 1.9h-3.3v-5.6a1.2 1.2 0 0 0-1.2-1.2h-3.2a1.2 1.2 0 0 0-1.2 1.2V21H5.9A1.9 1.9 0 0 1 4 19.1z"/><path class="ico-detail" d="M2.8 10.8a1.4 1.4 0 0 1 .2-2l7.6-6.3a2.2 2.2 0 0 1 2.8 0L21 8.8a1.4 1.4 0 1 1-1.8 2.1L12 4.9l-7.2 6a1.4 1.4 0 0 1-2-.1z"/>',
    chat:'<path d="M7.4 3h9.2A4.4 4.4 0 0 1 21 7.4v4.4a4.4 4.4 0 0 1-4.4 4.4H11l-4.4 4.1A1 1 0 0 1 5 19.6v-3.8a4.4 4.4 0 0 1-2-3.7V7.4A4.4 4.4 0 0 1 7.4 3z"/><rect class="ico-detail" x="7" y="7" width="10" height="2.2" rx="1.1"/><rect class="ico-detail" x="7" y="11" width="6.8" height="2.2" rx="1.1"/>',
    grammar:'<path d="M6.5 3h8.2A4.3 4.3 0 0 1 19 7.3V21H8.4A4.4 4.4 0 0 1 4 16.6V5.5A2.5 2.5 0 0 1 6.5 3z"/><path class="ico-detail" d="M8.2 3H11v18H8.4A4.4 4.4 0 0 1 4 16.6V5.5A2.5 2.5 0 0 1 6.5 3z"/><rect class="ico-detail" x="12.5" y="7" width="4.2" height="2" rx="1"/><rect class="ico-detail" x="12.5" y="11" width="3.2" height="2" rx="1"/>',
    cards:'<rect x="5" y="4" width="14" height="16" rx="2.8"/><rect class="ico-detail" x="8" y="8" width="8" height="2" rx="1"/><rect class="ico-detail" x="8" y="12" width="8" height="2" rx="1"/><rect class="ico-detail" x="8" y="16" width="5" height="2" rx="1"/>',
    more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/>',
    save:'<path d="M5 3h11.4L19 5.6V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><rect class="ico-detail" x="8" y="3" width="8" height="7" rx="1"/><path class="ico-detail" d="M8 21v-6.2A1.8 1.8 0 0 1 9.8 13h4.4a1.8 1.8 0 0 1 1.8 1.8V21z"/>',
    gear:'<path d="M10.2 3h3.6l.7 2.2c.6.2 1.1.4 1.6.7l2.1-1.1 2.5 2.5-1.1 2.1c.3.5.5 1 .7 1.6l2.2.7v3.6l-2.2.7c-.2.6-.4 1.1-.7 1.6l1.1 2.1-2.5 2.5-2.1-1.1c-.5.3-1 .5-1.6.7l-.7 2.2h-3.6l-.7-2.2a8 8 0 0 1-1.6-.7l-2.1 1.1-2.5-2.5 1.1-2.1a8 8 0 0 1-.7-1.6L1.5 15v-3.6l2.2-.7c.2-.6.4-1.1.7-1.6L3.3 7l2.5-2.5 2.1 1.1c.5-.3 1-.5 1.6-.7z"/><circle class="ico-detail" cx="12" cy="12" r="3.4"/>',
    table:'<rect x="4" y="5" width="16" height="14" rx="2"/><rect class="ico-detail" x="4" y="9" width="16" height="2"/><rect class="ico-detail" x="4" y="14" width="16" height="2"/><rect class="ico-detail" x="9" y="5" width="2" height="14"/>',
    package:'<path d="M12 2.8 21 7.5v9L12 21.2 3 16.5v-9z"/><path class="ico-detail" d="M3 7.5 12 12l9-4.5-9-4.7z"/><path class="ico-detail" d="M11 12h2v9.2h-2z"/>',
    plane:'<path d="M21.2 3.4a1 1 0 0 1 1.3 1.3l-7.4 16.4a1 1 0 0 1-1.9-.1l-2.4-7.2-7.2-2.4a1 1 0 0 1-.1-1.9z"/><path class="ico-detail" d="M10.8 13.8 21.5 3.5l-8.2 11.8z"/>',
    utensils:'<path d="M4 3h2v7h1V3h2v7h1V3h2v8.2a3.2 3.2 0 0 1-2.1 3l-.8 6.8H6.9l-.8-6.8a3.2 3.2 0 0 1-2.1-3z"/><path d="M17 3c2.2 1.7 3.2 4.1 3.2 7 0 2.2-.8 4-2.2 5.1V21h-3V4.2A2.1 2.1 0 0 1 17 3z"/>',
    laptop:'<path d="M6.5 5h11A1.5 1.5 0 0 1 19 6.5V15H5V6.5A1.5 1.5 0 0 1 6.5 5z"/><path class="ico-detail" d="M8 7.5h8v5H8z"/><path d="M4.4 16h15.2l1.4 3H3z"/>',
    file:'<path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"/><path class="ico-detail" d="M14 3v5h5z"/><rect class="ico-detail" x="9" y="12" width="6" height="1.8" rx=".9"/><rect class="ico-detail" x="9" y="16" width="6" height="1.8" rx=".9"/>',
    book:'<path d="M5.8 3H20v16H6.3A3.3 3.3 0 0 1 3 15.7V5.8A2.8 2.8 0 0 1 5.8 3z"/><path class="ico-detail" d="M7 3h3v16H6.3A3.3 3.3 0 0 1 3 15.7V5.8A2.8 2.8 0 0 1 5.8 3z"/><path class="ico-detail" d="M6.5 14H20v2.3H6.5a1.2 1.2 0 0 0 0 2.4H20V21H6.3A3.3 3.3 0 0 1 3 17.7v-.4A3.3 3.3 0 0 1 6.5 14z"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle class="ico-detail" cx="12" cy="12" r="5.8"/><circle cx="12" cy="12" r="2.4"/>',
    pen:'<path d="M4 20.5 5.2 16 16.4 4.8a2.6 2.6 0 0 1 3.8 3.8L9 19.8z"/><path class="ico-detail" d="m14.6 6.6 2.8 2.8-8.7 8.7-3.2.8.8-3.2z"/>',
    headphones:'<path d="M12 3a8.5 8.5 0 0 0-8.5 8.5V17A3.5 3.5 0 0 0 7 20.5h1.5v-8H7a3.4 3.4 0 0 0-1.5.35V11.5a6.5 6.5 0 0 1 13 0v1.35A3.4 3.4 0 0 0 17 12.5h-1.5v8H17a3.5 3.5 0 0 0 3.5-3.5v-5.5A8.5 8.5 0 0 0 12 3z"/>',
    scale:'<path d="M10.8 3h2.4v3H20v2.4h-2l3 6h-6l3-6h-4.8V21h-2.4V8.4H6l3 6H3l3-6H4V6h6.8z"/><path class="ico-detail" d="M3 15h6a3 3 0 0 1-6 0zm12 0h6a3 3 0 0 1-6 0z"/>',
    link:'<path d="M13.7 4.3a5 5 0 0 1 7 7l-2.2 2.2a5 5 0 0 1-6.7.3l2.1-2.1a2 2 0 0 0 2.5-.3l2.2-2.2a2 2 0 0 0-2.8-2.8l-2.2 2.2a2 2 0 0 0-.3 2.5l-2.1 2.1a5 5 0 0 1 .3-6.7z"/><path d="M10.3 19.7a5 5 0 0 1-7-7l2.2-2.2a5 5 0 0 1 6.7-.3l-2.1 2.1a2 2 0 0 0-2.5.3l-2.2 2.2a2 2 0 0 0 2.8 2.8l2.2-2.2a2 2 0 0 0 .3-2.5l2.1-2.1a5 5 0 0 1-.3 6.7z"/>',
    chart:'<path d="M4 4h2.4v14H21v2.4H4z"/><rect x="8" y="11" width="3" height="5.5" rx="1"/><rect x="13" y="8" width="3" height="8.5" rx="1"/><rect x="18" y="6" width="3" height="10.5" rx="1"/>'
  };
  var span=document.createElement("span");
  span.className="dl-ico";
  span.style.fontSize=(size||24)+"px";
  if(color) span.style.color=color;
  span.setAttribute("aria-hidden","true");
  span.innerHTML='<svg viewBox="0 0 24 24">'+(paths[name]||paths.star)+'</svg>';
  return span;
}

function iconChip(iconName,size,color,rgb){
  var chip=document.createElement("span");
  chip.className="ico-chip";
  chip.style.setProperty("--ico-color",color||"currentColor");
  if(rgb) chip.style.setProperty("--ico-rgb",rgb);
  chip.appendChild(ico(iconName,size||20,"currentColor"));
  return chip;
}

function iconLabel(iconName,label,size,color){
  var wrap=document.createElement("span"); wrap.className="label-with-icon";
  wrap.appendChild(ico(iconName,size||16,color));
  wrap.appendChild(document.createTextNode(label));
  return wrap;
}

function langBadge(code,color){
  var b=document.createElement("span"); b.className="lang-badge"; b.textContent=code; b.style.color=color; return b;
}

function setSaveIcon(btn,saved,label){
  btn.innerHTML="";
  btn.appendChild(ico("star",16,saved?"var(--gold)":"currentColor"));
  if(label) btn.appendChild(document.createTextNode(" "+label));
}

function getFocusableEls(root){
  return Array.prototype.slice.call(root.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(function(el){
    return !el.disabled && el.offsetParent!==null;
  });
}

function trapFocus(modalEl,onClose){
  var previous=document.activeElement;
  function focusFirst(){
    var focusable=getFocusableEls(modalEl);
    (focusable[0]||modalEl).focus();
  }
  function onKey(e){
    if(e.key==="Escape"){
      e.preventDefault(); e.stopPropagation();
      onClose();
      return;
    }
    if(e.key!=="Tab") return;
    var focusable=getFocusableEls(modalEl);
    if(!focusable.length){ e.preventDefault(); modalEl.focus(); return; }
    var first=focusable[0], last=focusable[focusable.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
  modalEl.setAttribute("tabindex","-1");
  modalEl.addEventListener("keydown",onKey);
  setTimeout(focusFirst,0);
  return function(){
    modalEl.removeEventListener("keydown",onKey);
    if(previous && document.contains(previous) && previous.focus) previous.focus();
  };
}

// ── Save Card Modal (from chat corrections) ─────────────────────────────────
function showSaveCardModal(de, es, anchor) {
  var overlay=document.createElement("div");
  overlay.className="surface-modal";
  var releaseFocus=null;
  function closeModal(){ if(releaseFocus) releaseFocus(); if(overlay.parentNode) overlay.remove(); }
  overlay._closeModal=closeModal;
  overlay.onclick=function(e){if(e.target===overlay) closeModal();};
  var box=document.createElement("div");
  box.className="modal-box";
  box.setAttribute("role","dialog");
  box.setAttribute("aria-modal","true");
  box.setAttribute("aria-label","Guardar como flashcard");
  var title=mk("p","","font-size:14px;font-weight:800;color:var(--gold-text);margin-bottom:16px;");
  title.appendChild(iconLabel("star","Guardar como flashcard",16));
  box.appendChild(title);
  var deLbl=mk("p","Aleman","font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;letter-spacing:1px;font-family:var(--font-label);");
  var deInp=document.createElement("input");
  deInp.value=de;
  deInp.className="input-field";
  deInp.style.marginBottom="12px";
  deInp.style.fontWeight="600";
  box.appendChild(deLbl); box.appendChild(deInp);
  var esLbl=mk("p","Espanol","font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;letter-spacing:1px;font-family:var(--font-label);");
  var esInp=document.createElement("textarea");
  esInp.value=es;
  esInp.rows=2;
  esInp.className="input-field";
  esInp.style.marginBottom="16px";
  esInp.style.fontWeight="500";
  esInp.style.resize="vertical";
  box.appendChild(esLbl); box.appendChild(esInp);
  var row=mk("div","","display:flex;gap:8px;");
  var saveBtn=document.createElement("button");
  saveBtn.textContent="Guardar";
  saveBtn.className="btn-solid gold";
  saveBtn.style.flex="1";
  saveBtn.onclick=function(){
    var phrase=ensureSrsFields({de:deInp.value.trim(),es:esInp.value.trim(),tip:"",source:"chat-correction"});
    if(!state.session.saved.some(function(x){return x.de===phrase.de;})){
      state.session.saved.push(phrase); invalidateFlashcardQueues(); updateBadge(); syncUp();
    }
    closeModal();
    showToast("Guardada!","success");
  };
  row.appendChild(saveBtn);
  var cancelBtn=document.createElement("button");
  cancelBtn.textContent="Cancelar";
  cancelBtn.className="btn-ghost";
  cancelBtn.onclick=closeModal;
  row.appendChild(cancelBtn);
  box.appendChild(row);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  releaseFocus=trapFocus(box,closeModal);
}

// ── Celebrations (micro-interactions) ──────────────────────────────────────
state.app._motionOK=!window.matchMedia||!window.matchMedia("(prefers-reduced-motion:reduce)").matches;
function celebrate(el,anim,dur){
  if(!state.app._motionOK||!el) return;
  el.style.animation="none";
  void el.offsetHeight;
  el.style.animation=anim+" "+(dur||"0.35s")+" var(--ease-spring) 1";
}
