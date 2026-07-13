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
function updateHeaderForScreen(id){
  var curGroup=getGroupForScreen(id);
  var curTab=TABS.filter(function(t){return t.id===id;})[0];
  var titleEl=document.getElementById("screen-title");
  var subEl=document.getElementById("screen-subtitle");
  if(titleEl) titleEl.textContent=curTab&&curTab.id==="hoy"?"Hoy":(curTab?curTab.label:curGroup.label);
  if(subEl) subEl.textContent=curGroup.label+" · "+lvlRange();
}
function setSubtabOffset(){
  var header=document.getElementById("app-header");
  var top=0;
  if(header&&header.style.display!=="none") top=Math.max(0,Math.round(header.getBoundingClientRect().bottom));
  document.documentElement.style.setProperty("--subtab-top",top+"px");
}
function measureSubtabBar(){
  var bar=document.getElementById("subtab-bar");
  if(!bar||bar.style.display==="none"){document.documentElement.style.removeProperty("--subtab-height");return;}
  var h=Math.round(bar.getBoundingClientRect().height);
  if(h>0) document.documentElement.style.setProperty("--subtab-height",h+"px");
}
window.addEventListener("resize",setSubtabOffset);
window.addEventListener("orientationchange",function(){setTimeout(setSubtabOffset,150);});
// ── Sub-tab bar (horizontal pill tabs at top of multi-screen groups) ──
// Lives outside screen DOM in .content so screen re-renders don't destroy it.
function renderGroupTabs(screenId){
  screenId=screenId||state.app.currentTab;
  if(state.app.currentTab&&screenId!==state.app.currentTab) screenId=state.app.currentTab;
  var bar=document.getElementById("subtab-bar");
  if(!bar) return;
  var group=getGroupForScreen(screenId);
  var content=document.querySelector(".content");
  setSubtabOffset();
  if(!group||group.screens.length<2){
    bar.style.display="none";
    bar.innerHTML="";
    bar.removeAttribute("data-group");
    if(content) content.classList.remove("has-subtabs");
    return;
  }
  if(content) content.classList.add("has-subtabs");
  bar.className="subtab-bar";
  bar.style.display="flex";
  var groupStyle=navStyleForGroup(group.id);
  bar.style.setProperty("--subtab-accent",groupStyle.color);
  bar.style.setProperty("--subtab-accent-rgb",groupStyle.rgb);
  if(bar.dataset.group!==group.id){
    bar.innerHTML="";
    bar.dataset.group=group.id;
  }
  group.screens.forEach(function(sid){
    var tabLabel=sid;
    for(var j=0;j<TABS.length;j++) if(TABS[j].id===sid){tabLabel=TABS[j].label;break;}
    var btn=bar.querySelector('[data-screen="'+sid+'"]');
    if(!btn){
      btn=document.createElement("button");
      btn.type="button";
      btn.dataset.screen=sid;
      btn.textContent=tabLabel;
      btn.setAttribute("aria-label","Ir a "+tabLabel);
      btn.onclick=function(){
        if(sid===state.app.currentTab) return;
        showScreen(sid,{skipGroupTabs:true});
        renderGroupTabs(sid);
      };
      bar.appendChild(btn);
    }
    var active=sid===screenId;
    btn.className="subtab"+(active?" active":"");
    if(active) btn.setAttribute("aria-current","page");
    else btn.removeAttribute("aria-current");
  });
  // Ensure the active pill is centered when switching groups or tabs.
  var active=bar.querySelector(".subtab.active");
  if(active){
    requestAnimationFrame(function(){
      try{
        var target=active.offsetLeft-(bar.clientWidth-active.offsetWidth)/2;
        bar.scrollTo({left:Math.max(0,target),behavior:"auto"});
      }catch(e){
        try{active.scrollIntoView({block:"nearest",inline:"center",behavior:"auto"});}catch(_e){}
      }
    });
  }
  requestAnimationFrame(function(){measureSubtabBar();});
}

function renderTabs(){
  var nav=document.getElementById("bottom-nav"); nav.innerHTML="";
  var curGroup=getGroupForScreen(state.app.currentTab);
  updateHeaderForScreen(state.app.currentTab);
  var brand=document.createElement("div"); brand.className="side-brand";
  brand.appendChild(mk("h1","DeutschLernen",""));
  brand.appendChild(mk("p","Plan Pro","font-size:10px;color:var(--gold-text);font-weight:700;letter-spacing:1px;"));
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
      hideNavSheet();
      if(state.app._reviewPlan&&!state.app._reviewPlan.done) state.app._reviewPlan=null;
      if(g.id==="hoy"){
        state.app.currentTab="hoy";renderTabs();showScreen("hoy");
      } else {
        var curGroup=getGroupForScreen(state.app.currentTab);
        var target=curGroup&&curGroup.id===g.id?state.app.currentTab:g.screens[0];
        state.app.currentTab=target;renderTabs();showScreen(target);
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
  renderGroupTabs(id);
}
function showScreen(id, opts) {
  opts=opts||{};
  state.app.currentTab=id;
  updateHeaderForScreen(id);
  clearInterval(state.session.minTimer);
  if (id!=="conversar"&&state.chat.chatScenario) { runPostChatAnalysis(); saveChatLog(); }
  const apply=function(){
    TABS.forEach(function(t){document.getElementById("s-"+t.id).classList.remove("active");});
    document.getElementById("s-"+id).classList.add("active");
    if(id==="hoy") renderToday();
    else if(id==="practicar") renderPracticar();
    else if(id==="frases") renderPhrases();
    else if(id==="conversar") { renderConversation(); if(state.chat.chatScenario) startMinTimer(); }
    else if(id==="corrigeme") renderCorrectMe();
    else if(id==="noentendi") renderDidntUnderstand();
    else if(id==="lectura") renderReading();
    else if(id==="dictado") renderDictado();
    else if(id==="shadowing") renderShadowing();
    else if(id==="gramatica") renderGrammar();
    else if(id==="casos") renderCases();
    else if(id==="genero") renderGender();
    else if(id==="conectores") renderConnectors();
    else if(id==="tempus") renderTempus();
    else if(id==="perfekt") renderPerfekt();
    else if(id==="satzbau") renderSatzbau();
    else if(id==="adjektive") renderAdjektive();
    else if(id==="ndeklination") renderNdeklination();
    else if(id==="trennbare") renderTrennbare();
    else if(id==="flashcards") renderFlashcards();
    else if(id==="guardadas") renderSaved();
    else if(id==="resumen") renderSummary();
    else if(id==="conjugacion") renderConjugacion();
    else if(id==="preposiciones") renderPreposiciones();
    else if(id==="leveltest") renderLeveltest();
    else if(id==="config") renderSettings();
  };
  if(!document.startViewTransition||matchMedia("(prefers-reduced-motion: reduce)").matches){
    apply();
    if(!opts.skipGroupTabs) renderGroupTabs(id);
    return;
  }
  try {
    var transition=document.startViewTransition(apply);
    if(!opts.skipGroupTabs){
      if(transition&&transition.ready){
        transition.ready.then(function(){if(state.app.currentTab===id) renderGroupTabs(id);}).catch(function(){if(state.app.currentTab===id) renderGroupTabs(id);});
      } else {
        renderGroupTabs(id);
      }
    }
  } catch (e) {
    console.warn("ViewTransition failed, falling back:", e);
    apply();
    if(!opts.skipGroupTabs) renderGroupTabs(id);
  }
}
