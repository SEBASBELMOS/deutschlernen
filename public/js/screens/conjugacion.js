// ── Conjugación (verb reference cheat-sheet — static, no AI) ──────────────────
var CONJ_VERBS=[
  {inf:"sein", pres:"bin, bist, ist, sind, seid, sind", perf:"ist gewesen", prat:"war", tipo:"irregular"},
  {inf:"haben", pres:"habe, hast, hat, haben, habt, haben", perf:"hat gehabt", prat:"hatte", tipo:"irregular"},
  {inf:"werden", pres:"werde, wirst, wird, werden, werdet, werden", perf:"ist geworden", prat:"wurde", tipo:"irregular"},
  {inf:"machen", pres:"mache, machst, macht, machen, macht, machen", perf:"hat gemacht", prat:"machte", tipo:"regular"},
  {inf:"gehen", pres:"gehe, gehst, geht, gehen, geht, gehen", perf:"ist gegangen", prat:"ging", tipo:"irregular"},
  {inf:"kommen", pres:"komme, kommst, kommt, kommen, kommt, kommen", perf:"ist gekommen", prat:"kam", tipo:"irregular"},
  {inf:"fahren", pres:"fahre, fährst, fährt, fahren, fahrt, fahren", perf:"ist gefahren", prat:"fuhr", tipo:"irregular"},
  {inf:"sprechen", pres:"spreche, sprichst, spricht, sprechen, sprecht, sprechen", perf:"hat gesprochen", prat:"sprach", tipo:"irregular"},
  {inf:"nehmen", pres:"nehme, nimmst, nimmt, nehmen, nehmt, nehmen", perf:"hat genommen", prat:"nahm", tipo:"irregular"},
  {inf:"geben", pres:"gebe, gibst, gibt, geben, gebt, geben", perf:"hat gegeben", prat:"gab", tipo:"irregular"},
  {inf:"sehen", pres:"sehe, siehst, sieht, sehen, seht, sehen", perf:"hat gesehen", prat:"sah", tipo:"irregular"},
  {inf:"lesen", pres:"lese, liest, liest, lesen, lest, lesen", perf:"hat gelesen", prat:"las", tipo:"irregular"},
  {inf:"essen", pres:"esse, isst, isst, essen, esst, essen", perf:"hat gegessen", prat:"aß", tipo:"irregular"},
  {inf:"wissen", pres:"weiß, weißt, weiß, wissen, wisst, wissen", perf:"hat gewusst", prat:"wusste", tipo:"irregular"},
  {inf:"müssen", pres:"muss, musst, muss, müssen, müsst, müssen", perf:"hat gemusst", prat:"musste", tipo:"modal"},
  {inf:"können", pres:"kann, kannst, kann, können, könnt, können", perf:"hat gekonnt", prat:"konnte", tipo:"modal"},
  {inf:"dürfen", pres:"darf, darfst, darf, dürfen, dürft, dürfen", perf:"hat gedurft", prat:"durfte", tipo:"modal"},
  {inf:"wollen", pres:"will, willst, will, wollen, wollt, wollen", perf:"hat gewollt", prat:"wollte", tipo:"modal"},
  {inf:"sollen", pres:"soll, sollst, soll, sollen, sollt, sollen", perf:"hat gesollt", prat:"sollte", tipo:"modal"},
  {inf:"mögen", pres:"mag, magst, mag, mögen, mögt, mögen", perf:"hat gemocht", prat:"mochte", tipo:"modal"},
  {inf:"arbeiten", pres:"arbeite, arbeitest, arbeitet, arbeiten, arbeitet, arbeiten", perf:"hat gearbeitet", prat:"arbeitete", tipo:"regular"},
  {inf:"spielen", pres:"spiele, spielst, spielt, spielen, spielt, spielen", perf:"hat gespielt", prat:"spielte", tipo:"regular"},
  {inf:"helfen", pres:"helfe, hilfst, hilft, helfen, helft, helfen", perf:"hat geholfen", prat:"half", tipo:"irregular"},
  {inf:"laufen", pres:"laufe, läufst, läuft, laufen, lauft, laufen", perf:"ist gelaufen", prat:"lief", tipo:"irregular"},
  {inf:"schlafen", pres:"schlafe, schläfst, schläft, schlafen, schlaft, schlafen", perf:"hat geschlafen", prat:"schlief", tipo:"irregular"}
];

function conjTipoColor(t){ return t==="irregular"?"var(--gold-text)":t==="modal"?"var(--purple-text)":"var(--green-text)"; }
function conjTipoRgb(t){ return t==="irregular"?"var(--gold-rgb)":t==="modal"?"var(--purple-rgb)":"var(--green-rgb)"; }

function renderConjugacion(){
  var el=document.getElementById("s-conjugacion"); el.innerHTML="";

  // ── Header ──
  var hdr=mk("div","","margin-bottom:14px;");
  hdr.appendChild(mk("p","Referencia · Verbos","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","📋 Conjugación","font-size:24px;font-weight:900;letter-spacing:-.03em;line-height:1.1;margin:3px 0 4px;color:var(--text);"));
  hdr.appendChild(mk("p","Los 25 verbos más usados en Präsens, Perfekt y Präteritum. Toca para expandir.","font-size:13px;color:var(--muted);font-weight:500;margin-bottom:0;"));
  el.appendChild(hdr);

  // ── Type legend ──
  var legend=mk("div","","display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;");
  [["regular","Regulares"],["irregular","Irregulares"],["modal","Modales"]].forEach(function(t){
    var chip=mk("span","","display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--muted);");
    chip.appendChild(mk("span","","width:8px;height:8px;border-radius:99px;background:"+conjTipoColor(t[0])+";display:inline-block;"));
    chip.appendChild(document.createTextNode(t[1]));
    legend.appendChild(chip);
  });
  el.appendChild(legend);

  // ── Verb cards (expandable) ──
  var list=mk("div","","");
  list.className="stagger";
  CONJ_VERBS.forEach(function(v){
    var card=mk("div","","background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:14px 16px;margin-bottom:8px;transition:border-color .15s;");
    card.className="lift"; card.style.setProperty("--lift-rgb",conjTipoRgb(v.tipo));
    var header=mk("div","","display:flex;justify-content:space-between;align-items:center;cursor:pointer;gap:10px;");
    header.setAttribute("role","button"); header.setAttribute("tabindex","0"); header.setAttribute("aria-expanded","false");
    var left=mk("div","","display:flex;align-items:center;gap:10px;min-width:0;");
    left.appendChild(mk("b",v.inf,"font-size:16px;font-weight:800;color:var(--text);letter-spacing:-.01em;"));
    left.appendChild(mk("span",v.tipo,"font-size:9.5px;color:"+conjTipoColor(v.tipo)+";font-weight:800;text-transform:uppercase;letter-spacing:1px;background:rgba("+conjTipoRgb(v.tipo)+",0.1);padding:2px 8px;border-radius:99px;"));
    header.appendChild(left);
    var chevron=mk("span","▾","font-size:13px;color:var(--muted);flex-shrink:0;transition:transform .2s;");
    header.appendChild(chevron);
    card.appendChild(header);

    var body=mk("div","","display:none;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);");
    function tenseRow(label,val,color){
      var row=mk("div","","display:flex;gap:8px;align-items:baseline;margin-bottom:6px;");
      row.appendChild(mk("span",label,"font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:"+color+";width:82px;flex-shrink:0;"));
      row.appendChild(mk("span",val,"font-size:12.5px;color:var(--text);font-weight:600;line-height:1.5;"));
      return row;
    }
    body.appendChild(tenseRow("Präsens",v.pres,"var(--muted)"));
    body.appendChild(tenseRow("Perfekt",v.perf,"var(--teal-text)"));
    body.appendChild(tenseRow("Präteritum",v.prat,"var(--gold-text)"));
    card.appendChild(body);

    function toggle(){
      var open=body.style.display==="block";
      body.style.display=open?"none":"block";
      chevron.style.transform=open?"":"rotate(180deg)";
      header.setAttribute("aria-expanded",open?"false":"true");
    }
    header.onclick=toggle;
    header.onkeydown=function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggle(); } };
    list.appendChild(card);
  });
  el.appendChild(list);
}
