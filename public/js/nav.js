// ── Navigation (bottom nav + sheet) ─────────────────────────────────────
function navStyleForGroup(id){return NAV_ICON_STYLE[id]||NAV_ICON_STYLE.mas;}
function navStyleForScreen(id){return navStyleForGroup(getGroupForScreen(id).id);}
function getGroupForScreen(id){
  for(var i=0;i<NAV_GROUPS.length;i++) if(NAV_GROUPS[i].screens.indexOf(id)>=0) return NAV_GROUPS[i];
  return NAV_GROUPS[0];
}
function openNavSheet(groupId){
  var group=null;
  for(var i=0;i<NAV_GROUPS.length;i++) if(NAV_GROUPS[i].id===groupId){group=NAV_GROUPS[i];break;}
  if(!group) return;
  document.getElementById("sheet-panel").innerHTML="";
  var hdr=document.createElement("div"); hdr.className="sheet-hdr";
  var title=mk("p","","font-size:16px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:10px;");
  var groupIconStyle=navStyleForGroup(group.id);
  title.appendChild(iconChip(group.icon,20,groupIconStyle.color,groupIconStyle.rgb));
  title.appendChild(document.createTextNode(group.label));
  hdr.appendChild(title);
  var closeBtn=document.createElement("button"); closeBtn.className="sheet-close";
  closeBtn.textContent="✕"; closeBtn.setAttribute("aria-label","Cerrar menú");
  closeBtn.onclick=hideNavSheet;
  hdr.appendChild(closeBtn);
  document.getElementById("sheet-panel").appendChild(hdr);
  group.screens.forEach(function(sid){
    // Find the screen label from TABS
    var tab=null, label=sid;
    for(var j=0;j<TABS.length;j++) if(TABS[j].id===sid){tab=TABS[j];label=TABS[j].label;break;}
    var btn=document.createElement("button"); btn.className="sheet-btn"+(sid===state.app.currentTab?" active":"");
    var screenIconStyle=navStyleForScreen(sid);
    btn.style.setProperty("--ico-color",screenIconStyle.color);
    btn.style.setProperty("--ico-rgb",screenIconStyle.rgb);
    var row=document.createElement("span"); row.className="label-with-icon";
    row.appendChild(iconChip(tab&&tab.icon?tab.icon:group.icon,17,screenIconStyle.color,screenIconStyle.rgb));
    row.appendChild(document.createTextNode(label));
    btn.appendChild(row);
    btn.onclick=function(){
      hideNavSheet();
      if(state.app._reviewPlan&&!state.app._reviewPlan.done) state.app._reviewPlan=null;
      state.app.currentTab=sid;renderTabs();showScreen(sid);
    };
    document.getElementById("sheet-panel").appendChild(btn);
  });
  document.getElementById("sheet-overlay").style.display="block";
  document.getElementById("sheet-panel").style.display="block";
}
function hideNavSheet(){
  document.getElementById("sheet-overlay").style.display="none";
  document.getElementById("sheet-panel").style.display="none";
}
function renderTabs(){
  var nav=document.getElementById("bottom-nav"); nav.innerHTML="";
  var curGroup=getGroupForScreen(state.app.currentTab);
  var curTab=TABS.filter(function(t){return t.id===state.app.currentTab;})[0];
  var titleEl=document.getElementById("screen-title");
  var subEl=document.getElementById("screen-subtitle");
  if(titleEl) titleEl.textContent=curTab&&curTab.id==="hoy"?"Hoy":(curTab?curTab.label:curGroup.label);
  if(subEl) subEl.textContent=curGroup.label+" · "+lvlRange();
  var brand=document.createElement("div"); brand.className="side-brand";
  brand.appendChild(mk("h1","DeutschLernen",""));
  brand.appendChild(mk("p","Estudiante Premium",""));
  nav.appendChild(brand);
  var navList=document.createElement("div"); navList.className="side-nav-list";
  NAV_GROUPS.forEach(function(g){
    var btn=document.createElement("button"); btn.className="nav-item"+(g.id===curGroup.id?" active":"");
    var iconStyle=navStyleForGroup(g.id);
    btn.style.setProperty("--nav-accent",iconStyle.color);
    btn.style.setProperty("--nav-accent-rgb",iconStyle.rgb);
    var iconSpan=document.createElement("span"); iconSpan.className="nav-item-icon"; iconSpan.appendChild(iconChip(g.icon,21,iconStyle.color,iconStyle.rgb));
    var lblSpan=document.createElement("span"); lblSpan.className="nav-item-lbl"; lblSpan.textContent=g.label;
    btn.appendChild(iconSpan); btn.appendChild(lblSpan);
    btn.onclick=function(){
      if(g.id==="hoy"){
        hideNavSheet();
        if(state.app._reviewPlan&&!state.app._reviewPlan.done) state.app._reviewPlan=null;
        state.app.currentTab="hoy";renderTabs();showScreen("hoy");
      } else {
        openNavSheet(g.id);
      }
    };
    navList.appendChild(btn);
  });
  nav.appendChild(navList);
  var sideFoot=document.createElement("div"); sideFoot.className="side-footer";
  var start=document.createElement("button"); start.className="side-start-btn"; start.textContent="Empezar repaso diario";
  start.onclick=function(){
    hideNavSheet();
    state.app.currentTab="hoy";renderTabs();
    if(typeof startPersonalizedReview==="function") startPersonalizedReview();
    else showScreen("hoy");
  };
  sideFoot.appendChild(start);
  var profile=document.createElement("div"); profile.className="side-profile";
  var initial=(state.app.authUser||"S").trim().charAt(0).toUpperCase()||"S";
  profile.appendChild(mk("span",initial,""));
  var profileTxt=mk("div","","");
  profileTxt.appendChild(mk("b",state.app.authUser||"Sebastian",""));
  profileTxt.appendChild(mk("small","Nivel "+state.app.level,""));
  profile.appendChild(profileTxt);
  sideFoot.appendChild(profile);
  nav.appendChild(sideFoot);
}

// Activate tab without re-rendering — used by inline review steps that manage their own DOM
function activateTab(id) {
  state.app.currentTab = id;
  renderTabs();
  TABS.forEach(function(t){document.getElementById("s-"+t.id).classList.remove("active");});
  document.getElementById("s-"+id).classList.add("active");
}
function showScreen(id) {
  clearInterval(state.session.minTimer);
  if (id!=="conversar"&&state.chat.chatScenario) { runPostChatAnalysis(); saveChatLog(); }
  const apply=function(){
    TABS.forEach(function(t){document.getElementById("s-"+t.id).classList.remove("active");});
    document.getElementById("s-"+id).classList.add("active");
    if(id==="hoy") renderToday();
    else if(id==="frases") renderPhrases();
    else if(id==="conversar") { renderConversation(); if(state.chat.chatScenario) startMinTimer(); }
    else if(id==="corrigeme") renderCorrectMe();
    else if(id==="noentendi") renderDidntUnderstand();
    else if(id==="lectura") renderReading();
    else if(id==="shadowing") renderShadowing();
    else if(id==="gramatica") renderGrammar();
    else if(id==="casos") renderCases();
    else if(id==="genero") renderGender();
    else if(id==="conectores") renderConnectors();
    else if(id==="tempus") renderTempus();
    else if(id==="flashcards") renderFlashcards();
    else if(id==="guardadas") renderSaved();
    else if(id==="resumen") renderSummary();
    else if(id==="config") renderSettings();
  };
  if(!document.startViewTransition||matchMedia("(prefers-reduced-motion: reduce)").matches){apply();return;}
  try {
    document.startViewTransition(apply);
  } catch (e) {
    console.warn("ViewTransition failed, falling back:", e);
    apply();
  }
}
