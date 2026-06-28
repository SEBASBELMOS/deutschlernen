// ── Init ──────────────────────────────────────────────────────────────────────
// Flush-on-close: si hay un sync debounced pendiente, dispararlo con keepalive
window.addEventListener("beforeunload",function(){
  if(!state.app.authToken) return;
  clearTimeout(state.app.syncTimer); state.app.syncTimer=null;
  try {
    fetch("/api/sync",{method:"POST",keepalive:true,headers:{"content-type":"application/json","x-token":state.app.authToken},body:syncPayload()});
  } catch(e){}
});

document.addEventListener("keydown",function(e){
  if(e.key==="Enter"&&document.getElementById("login-screen").style.display!=="none"){ doAuth(); return; }
  var tag=document.activeElement&&document.activeElement.tagName;
  if(tag==="INPUT"||tag==="TEXTAREA"){
    if(e.key==="Enter"&&e.ctrlKey){}else return;
  }
  if(e.key===" "){
    e.preventDefault();
    if(state.flashcards._flashcardEl&&document.getElementById("s-flashcards").classList.contains("active")) state.flashcards._flashcardEl.click();
  }
  if(e.key>="1"&&e.key<="4"){
    var idx=parseInt(e.key)-1;
    if(state.flashcards._gradeBtns&&state.flashcards._gradeBtns[idx]&&state.flashcards._gradeBtns[idx].offsetParent!==null&&document.getElementById("s-flashcards").classList.contains("active")) state.flashcards._gradeBtns[idx].click();
  }
  if(e.key==="Enter"&&e.ctrlKey){
    var inp=document.querySelector(".chat-input");
    if(inp&&document.getElementById("s-conversar").classList.contains("active")){
      var sb=document.querySelector(".send-btn");
      if(sb) sb.click();
    }
  }
  if(e.key==="Escape"){
    var modal=document.querySelector(".modal-overlay,.surface-modal");
    if(modal){ if(modal._closeModal) modal._closeModal(); else modal.remove(); }
    else if(window.speechSynthesis) window.speechSynthesis.cancel();
  }
});

if(state.app.authToken) {
  document.getElementById("loading-screen").style.display="flex";
  fetch("/api/sync",{headers:{"x-token":state.app.authToken}}).then(function(r){return r.json();}).then(function(data){
    if(data.ok){ if(data.data) applyServerData(data.data); if(data.serverInfo) state.app.serverInfo=data.serverInfo; showApp(); }
    else {
      state.app.authToken=null; state.app.authUser=null;
      localStorage.removeItem("dl_token"); localStorage.removeItem("dl_user");
      document.getElementById("loading-screen").style.display="none";
      document.getElementById("login-screen").style.display="flex";
      showToast("Tu sesión expiró, iniciá de nuevo","info");
    }
  }).catch(function(){
    state.app.authToken=null; state.app.authUser=null;
    localStorage.removeItem("dl_token"); localStorage.removeItem("dl_user");
    document.getElementById("loading-screen").style.display="none";
    document.getElementById("login-screen").style.display="flex";
  });
} else {
  document.getElementById("loading-screen").style.display="none";
}
