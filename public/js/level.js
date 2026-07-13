// ── User level pill + i+1 prompt helper ──────────────────────────────────────
var LEVELS=["A2","A2-B1","B1","B1-B2","B2"];
var userLevel=localStorage.getItem("dl_level")||"A2-B1";
if(LEVELS.indexOf(userLevel)<0) userLevel="A2-B1";

function paintLevelPill(){
  var p=document.getElementById("level-pill");
  if(p) p.textContent=userLevel.replace("-","\u2013");
}
// Level changes happen in Settings (setLevel in sync.js) or via the level test (setUserLevel).
// Returns i+1 instruction for AI prompts: mostly comprehensible + 1-2 stretching structures
function levelPrompt(){
  return "Target level: "+userLevel+". Mostly comprehensible at this level, but include 1-2 slightly harder structures per response (i+1) so the learner stretches.";
}
