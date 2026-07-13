// ── Correct me (Stitch "Corrigeme" visual port) ────────────────────────────────
function renderCorrectMe() {
  const el=document.getElementById("s-corrigeme"); el.innerHTML="";

  // ── Eyebrow + heading ──
  var hdr=mk("div","","margin-bottom:14px;");
  hdr.appendChild(mk("p","Escritura · Corrección","font-size:10px;letter-spacing:2.5px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
  hdr.appendChild(mk("h1","✍️ Corrígeme","font-size:22px;font-weight:900;letter-spacing:-.03em;margin:2px 0 0;"));
  el.appendChild(hdr);

  // ── Tagebuch: daily writing prompt (curated, rotates by date) ──
  var TAGEBUCH_PROMPTS=[
    {de:"Was hast du heute gemacht?", es:"¿Qué hiciste hoy? (usa Perfekt)"},
    {de:"Was wirst du morgen machen?", es:"¿Qué vas a hacer mañana? (Futur o presente)"},
    {de:"Beschreibe dein Frühstück.", es:"Describe tu desayuno"},
    {de:"Was machst du gern am Wochenende?", es:"¿Qué te gusta hacer el fin de semana?"},
    {de:"Warum lernst du Deutsch?", es:"¿Por qué aprendes alemán? (usa weil)"},
    {de:"Beschreibe deinen Arbeitstag.", es:"Describe tu día de trabajo"},
    {de:"Was ist dein Lieblingsessen und warum?", es:"¿Tu comida favorita y por qué?"},
    {de:"Wohin möchtest du reisen?", es:"¿A dónde te gustaría viajar?"},
    {de:"Beschreibe deine Stadt.", es:"Describe tu ciudad"},
    {de:"Was hast du am Wochenende gemacht?", es:"¿Qué hiciste el fin de semana? (Perfekt)"},
    {de:"Obwohl es schwierig ist… — schreib weiter!", es:"Completa: 'Aunque es difícil…' (obwohl)"},
    {de:"Was machst du, wenn du müde bist?", es:"¿Qué haces cuando estás cansado? (wenn)"},
    {de:"Beschreibe dein Zimmer oder Büro.", es:"Describe tu cuarto u oficina (¡Dativ!)"},
    {de:"Was ist dir heute gut gelungen?", es:"¿Qué te salió bien hoy?"},
    {de:"Erzähl von deinem letzten Video-Projekt.", es:"Cuenta de tu último proyecto de video"},
    {de:"Was würdest du mit mehr Zeit machen?", es:"¿Qué harías con más tiempo? (Konjunktiv II)"},
    {de:"Welche App benutzt du am meisten und warum?", es:"¿Qué app usas más y por qué?"},
    {de:"Beschreibe das Wetter heute.", es:"Describe el clima de hoy"},
    {de:"Was hast du diese Woche gelernt?", es:"¿Qué aprendiste esta semana?"},
    {de:"Zuerst…, dann…, danach… — dein Morgen.", es:"Tu mañana con conectores de secuencia"},
    {de:"Was fehlt dir aus Kolumbien?", es:"¿Qué extrañas de Colombia?"}
  ];
  var _doy=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/864e5);
  var tgPrompt=TAGEBUCH_PROMPTS[_doy%TAGEBUCH_PROMPTS.length];
  var tgCard=mk("div","","border-radius:16px;padding:14px 16px;margin-bottom:12px;background:rgba(var(--gold-rgb),0.07);border:1px solid rgba(var(--gold-rgb),0.25);");
  tgCard.className="anim-in";
  tgCard.appendChild(mk("p","📓 Tagebuch · prompt de hoy","font-size:9.5px;letter-spacing:1.8px;font-weight:900;color:var(--gold-text);text-transform:uppercase;margin-bottom:6px;"));
  tgCard.appendChild(mk("p",tgPrompt.de,"font-size:15.5px;font-weight:800;color:var(--text);line-height:1.45;letter-spacing:-0.01em;"));
  tgCard.appendChild(mk("p",tgPrompt.es,"font-size:12px;color:var(--muted);font-weight:500;margin-top:3px;"));
  var tgBtn=mk("button","Responder en 3 frases →","margin-top:10px;padding:9px 16px;border-radius:11px;border:none;background:rgba(var(--gold-rgb),0.16);color:var(--gold-text);font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit;transition:background .15s;");
  tgBtn.onclick=function(){ var t=document.getElementById("corrigeme-input"); if(t){ t.focus(); t.scrollIntoView({behavior:"smooth",block:"center"}); } };
  tgCard.appendChild(tgBtn);
  el.appendChild(tgCard);

  // ── Input shell (Stitch card) ──
  var shell=mk("div","",""); shell.className="stitch-input-shell";
  // Badge row
  var badgeRow=mk("div","","display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;");
  badgeRow.appendChild(mk("span","Deutsch","font-size:10.5px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:var(--primary);background:rgba(var(--primary-rgb),0.12);border:1px solid rgba(var(--primary-rgb),0.22);padding:4px 12px;border-radius:20px;"));
  var clearBtn=mk("button","Borrar","font-size:11px;font-weight:700;color:var(--text2);background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:5px 12px;transition:background 0.2s;");
  clearBtn.onmouseenter=function(){clearBtn.style.background="rgba(255,255,255,0.08)";};
  clearBtn.onmouseleave=function(){clearBtn.style.background="rgba(255,255,255,0.04)";};
  clearBtn.onclick=function(){ta.value="";var old=el.querySelector("#fix-result");if(old)old.remove();ta.focus();};
  badgeRow.appendChild(clearBtn);
  shell.appendChild(badgeRow);

  // Textarea
  var ta=document.createElement("textarea"); ta.rows=5; ta.id="corrigeme-input";
  ta.placeholder="Schreibe hier auf Deutsch…";
  ta.setAttribute("aria-label","Tu frase en alemán");
  ta.style.cssText="width:100%;min-height:130px;background:transparent;border:none;color:var(--text);padding:0;font-family:inherit;font-size:16px;font-weight:600;line-height:1.6;resize:vertical;outline:none;margin-top:6px;";
  ta.onfocus=function(){shell.style.borderColor="rgba(var(--primary-rgb),0.45)";shell.style.boxShadow="0 0 0 3px rgba(var(--primary-rgb),0.08),0 6px 24px rgba(0,0,0,0.22)";};
  ta.onblur=function(){shell.style.borderColor="rgba(143,144,158,0.30)";shell.style.boxShadow="0 4px 20px rgba(0,0,0,0.16)";};
  shell.appendChild(ta);
  el.appendChild(shell);

  // ── Example chips row ──
  var exRow=mk("div","","display:flex;gap:7px;flex-wrap:wrap;margin:14px 0;");
  var exLbl=mk("p","O prueba con un ejemplo","font-size:10px;letter-spacing:2px;font-weight:800;color:var(--dim);text-transform:uppercase;width:100%;margin-bottom:2px;");
  exRow.appendChild(exLbl);
  var examples=[
    {label:"Ich habe gekauft der Monitor…", text:"Ich habe gekauft der Monitor für meine Arbeit."},
    {label:"Gestern ich war im Kino…", text:"Gestern ich war im Kino mit meine Freundin."},
    {label:"Ich arbeite in eine Firma weil…", text:"Ich arbeite in eine Firma weil ich brauche Geld."}
  ];
  examples.forEach(function(ex){
    var b=mk("button",ex.label,"font-size:11.5px;font-weight:700;color:var(--muted);background:var(--surface);border:1px dashed var(--dim);border-radius:11px;padding:7px 12px;transition:all .2s;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;");
    b.onmouseenter=function(){b.style.color="var(--text)";b.style.borderColor="var(--muted)";};
    b.onmouseleave=function(){b.style.color="var(--muted)";b.style.borderColor="var(--dim)";};
    b.onclick=function(){ta.value=ex.text;var old=el.querySelector("#fix-result");if(old)old.remove();ta.focus();};
    exRow.appendChild(b);
  });
  el.appendChild(exRow);

  // ── Fix button (Stitch primary) ──
  var fixBtn=document.createElement("button"); fixBtn.id="corrigeme-fix-btn";
  fixBtn.style.cssText="width:100%;padding:15px;border-radius:16px;border:none;background:var(--primary);color:var(--on-primary);font-size:15px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:9px;transition:transform .12s,box-shadow .2s;box-shadow:0 6px 22px rgba(var(--primary-rgb),.28);cursor:pointer;";
  fixBtn.innerHTML='<span id="corrigeme-spinner" style="width:17px;height:17px;border:2.5px solid rgba(186,195,255,.3);border-top-color:var(--on-primary);border-radius:50%;animation:spin .7s linear infinite;display:none;"></span><span id="corrigeme-btn-txt">Korrigiere mich</span>';
  fixBtn.onclick=function(){doFix(ta,fixBtn,el);};
  el.appendChild(fixBtn);
}

async function doFix(ta, fixBtn, el) {
  const text=ta.value.trim(); if(!text){ showToast("Escribe algo primero","error"); return; }
  ta.disabled=true; fixBtn.disabled=true; fixBtn.style.opacity=".6";
  var spinner=document.getElementById("corrigeme-spinner");
  var btnTxt=document.getElementById("corrigeme-btn-txt");
  if(spinner)spinner.style.display="block";
  if(btnTxt)btnTxt.style.display="none";
  const old=el.querySelector("#fix-result"); if(old) el.removeChild(old);
  try {
    const sys="You are a friendly German corrector. Reply ONLY with valid JSON, no markdown: {\"correcto\":\"correct German phrase\",\"errores\":\"what was wrong in Spanish max 2 lines\",\"alternativa\":\"more natural version\",\"pronunciacion\":\"simplified pronunciation\"}";
    const reply=await ai(sys,[{role:"user",content:text}]);
    const r=JSON.parse(reply.replace(/```json|```/g,"").trim());
    if(r.correcto&&r.correcto.trim()!==text.trim()) logError("corrigeme", text, r.correcto, r.errores||"");
    var result=document.createElement("div"); result.id="fix-result";
    result.style.cssText="display:block;margin-top:16px;animation:fadeUp .35s cubic-bezier(.16,1,.3,1);";

    // ── Diff card: original vs corrected ──
    var diffCard=mk("div","",""); diffCard.className="stitch-diff-card";
    // Eyebrow
    var topRow=mk("div","","display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px;");
    topRow.appendChild(mk("p","Tu texto","font-size:9.5px;letter-spacing:2.5px;font-weight:800;text-transform:uppercase;color:var(--red-text);"));
    topRow.appendChild(mk("p","Corrección","font-size:9.5px;letter-spacing:2.5px;font-weight:800;text-transform:uppercase;color:var(--green-text);"));
    diffCard.appendChild(topRow);
    // Content grid
    var contentRow=mk("div","","display:grid;grid-template-columns:1fr 1fr;gap:12px;");
    contentRow.appendChild(mk("p",text,"font-size:14px;font-weight:600;line-height:1.65;color:var(--red-text);text-decoration:line-through;text-decoration-thickness:1.5px;opacity:.8;"));
    contentRow.appendChild(mk("p",r.correcto,"font-size:16px;font-weight:700;line-height:1.65;color:var(--green-text);"));
    diffCard.appendChild(contentRow);
    result.appendChild(diffCard);

    // ── Error detail card ──
    if(r.errores){
      var errCard=mk("div","",""); errCard.className="stitch-diff-card";
      errCard.appendChild(mk("p","Errores encontrados","class:st-lbl;",true));
      // Override label style
      errCard.firstChild.style.cssText="font-size:9.5px;letter-spacing:2.5px;font-weight:800;text-transform:uppercase;margin-bottom:7px;color:var(--red-text);";

      // Split error text into individual points
      var errorLines=r.errores.split(/\n+|(?<=\.)\s+(?=[A-ZÁÉÍÓÚ])/).filter(function(l){return l.trim().length>0;});
      if(errorLines.length===0)errorLines=[r.errores];

      errorLines.forEach(function(line,i){
        var errRow=mk("div","",""); errRow.className="stitch-err-row";
        errRow.appendChild(mk("span",String(i+1),"class:stitch-err-num;",true));
        errRow.lastChild.style.cssText="width:22px;height:22px;border-radius:8px;background:rgba(var(--red-rgb),0.12);border:1px solid rgba(var(--red-rgb),0.35);color:var(--red-text);font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;";

        // Detect category
        var cat=detectErrCategory(line);
        var catColors={
          "Gramática":"color:var(--gold-text);background:rgba(var(--gold-rgb),0.10);border:1px solid rgba(var(--gold-rgb),0.30);",
          "Vocabulario":"color:var(--teal-text);background:rgba(var(--teal-rgb),0.10);border:1px solid rgba(var(--teal-rgb),0.30);",
          "Ortografía":"color:var(--purple-text);background:rgba(var(--purple-rgb),0.10);border:1px solid rgba(var(--purple-rgb),0.30);"
        };

        var body=mk("div","","font-size:13.5px;font-weight:600;line-height:1.55;flex:1;");
        var wr=extractWrongRight(line,text,r.correcto);
        if(wr.w&&wr.r){
          body.innerHTML='<span class="stitch-err-wrong" style="color:var(--red-text);text-decoration:line-through;font-weight:700;">'+escHtml(wr.w)+'</span><span class="stitch-err-arrow" style="color:var(--text2);margin:0 4px;">→</span><span style="color:var(--green-text);font-weight:800;">'+escHtml(wr.r)+'</span> '+
            '<span style="display:inline-block;font-size:9px;font-weight:800;letter-spacing:.8px;padding:2px 8px;border-radius:7px;text-transform:uppercase;vertical-align:2px;'+catColors[cat]+'">'+cat+'</span>'+
            '<span style="display:block;font-size:12px;color:var(--muted);margin-top:3px;">'+escHtml(line.trim())+'</span>';
        }else{
          body.innerHTML='<span style="display:inline-block;font-size:9px;font-weight:800;letter-spacing:.8px;padding:2px 8px;border-radius:7px;text-transform:uppercase;vertical-align:2px;'+catColors[cat]+'">'+cat+'</span>'+
            '<span style="display:block;font-size:12px;color:var(--muted);margin-top:3px;">'+escHtml(line.trim())+'</span>';
        }
        errRow.appendChild(body);
        errCard.appendChild(errRow);
      });
      result.appendChild(errCard);
    }

    // ── Natural alternative ──
    if(r.alternativa){
      var altCard=mk("div","",""); altCard.className="stitch-diff-card";
      altCard.appendChild(mk("p","Más natural","font-size:9.5px;letter-spacing:2.5px;font-weight:800;text-transform:uppercase;margin-bottom:7px;color:var(--purple-text);"));
      var altRow=mk("div","","display:flex;justify-content:space-between;align-items:center;gap:8px;");
      altRow.appendChild(mk("p",r.alternativa,"font-size:16px;color:var(--text);flex:1;font-weight:700;line-height:1.4;"));
      var pa=document.createElement("button");
      pa.setAttribute("aria-label","Escuchar");pa.innerHTML="▶";
      pa.style.cssText="background:none;border:none;color:var(--purple-text);font-size:20px;cursor:pointer;min-width:44px;min-height:44px;display:inline-flex;align-items:center;justify-content:center;";
      pa.onclick=function(){speakGerman(r.alternativa);};
      altRow.appendChild(pa); altCard.appendChild(altRow);
      result.appendChild(altCard);
    }

    // ── Pronunciation ──
    if(r.pronunciacion){
      var pronCard=mk("div","","background:rgba(var(--teal-rgb),0.04);border:1px solid rgba(var(--teal-rgb),0.15);border-radius:14px;padding:14px;margin-bottom:12px;");
      var pronRow=mk("div","","display:flex;align-items:center;justify-content:space-between;gap:8px;");
      pronRow.appendChild(mk("span","🎤 Practicar pronunciación","font-size:13px;color:var(--teal-text);font-weight:700;"));
      pronRow.appendChild(makePronMicBtn("#5dd9d0", r.correcto, pronCard));
      pronCard.appendChild(pronRow);
      result.appendChild(pronCard);
    }

    // ── Save button (Stitch star) ──
    var saveBtn=document.createElement("button");
    saveBtn.style.cssText="width:100%;padding:13px;border-radius:15px;border:1.5px solid rgba(var(--gold-rgb),0.45);background:rgba(var(--gold-rgb),0.12);color:var(--gold-text);font-size:14px;font-weight:900;cursor:pointer;transition:background .15s,transform .1s;";
    saveBtn.textContent="⭐ Guardar frase corregida";
    saveBtn.onmouseenter=function(){if(!saveBtn.disabled)saveBtn.style.background="rgba(var(--gold-rgb),0.22)";};
    saveBtn.onmouseleave=function(){if(!saveBtn.disabled)saveBtn.style.background="rgba(var(--gold-rgb),0.12)";};
    saveBtn.onclick=function(){
      saveBtn.style.background="var(--green)";saveBtn.style.borderColor="var(--green)";saveBtn.style.color="#06340f";
      saveBtn.textContent="✓ Guardada en tus flashcards";saveBtn.disabled=true;
      showToast("⭐ Frase guardada — entra al repaso SRS de hoy");
    };
    result.appendChild(saveBtn);

    // ── Reset ──
    var reset=mk("button","Corregir otra frase","width:100%;background:transparent;border:1px dashed var(--border);color:var(--muted);border-radius:12px;padding:11px;font-size:13px;font-weight:600;cursor:pointer;margin-top:10px;");
    reset.onclick=renderCorrectMe;
    result.appendChild(reset);

    el.appendChild(result);
  } catch(e){
    el.appendChild(mk("p","Error al corregir. Intenta de nuevo.","color:var(--red-text);font-size:13px;text-align:center;margin-top:10px;font-weight:500;"));
  }
  ta.disabled=false; fixBtn.disabled=false; fixBtn.style.opacity="1";
  if(spinner)spinner.style.display="none";
  if(btnTxt)btnTxt.style.display="inline";
}

// ── Helpers for error display ──────────────────────────────────────────────────

// Detect category from Spanish error text keywords
function detectErrCategory(line){
  var l=line.toLowerCase();
  if(/verbo|satzklammer|posici[oó]n|inversi[oó]n|nebensatz|subordin|konjugation|perfekt|modalverb|trennbar|infinitiv|konjunktiv|zeitform|pasado|pasiv|futuro/i.test(l))return "Gramática";
  if(/nominativ|akkusativ|dativ|genitiv|art[ií]culo|pronombre|preposici[oó]n|declinaci[oó]n|artikel|kasus|caso/i.test(l))return "Gramática";
  if(/vocabulario|palabra|significado|traducci[oó]n|falsche|falsos/i.test(l))return "Vocabulario";
  if(/ortograf[ií]a|may[uú]scula|min[uú]scula|tilde|acento|puntuaci[oó]n|coma|punto|comillas|umlaut|schreibweise/i.test(l))return "Ortografía";
  return "Gramática"; // default
}

// Extract wrong→right pair from error text, original input, and corrected version
function extractWrongRight(line, original, corrected){
  // Try to extract quoted pairs: "X" should be "Y"
  var qmatch=line.match(/"([^"]+)"\s+(?:debe(?:r[ií]a)?\s+(?:ser|ir)|en\s+lugar\s+de)\s+"([^"]+)"/i);
  if(qmatch)return{w:qmatch[1],r:qmatch[2]};
  // Try single quote: X should be Y / X en lugar de Y / X → Y
  var smatch=line.match(/"([^"]+)"/);
  if(smatch){
    var wrong=smatch[1];
    var ow=original.toLowerCase().replace(/[.,!?¿¡;:"'()]/g,"").split(/\s+/);
    var cw=corrected.toLowerCase().replace(/[.,!?¿¡;:"'()]/g,"").split(/\s+/);
    for(var i=0;i<ow.length;i++){
      if(ow[i].indexOf(wrong.toLowerCase())!==-1||wrong.toLowerCase().indexOf(ow[i])!==-1){
        if(cw[i]&&cw[i]!==ow[i])return{w:ow[i],r:cw[i]};
      }
    }
  }
  return{w:"",r:""};
}
