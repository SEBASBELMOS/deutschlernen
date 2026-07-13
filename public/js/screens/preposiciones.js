// ── Preposiciones (case-by-case reference — static, no AI) ────────────────────
var PREP_SECTIONS=[
  {
    titulo:"Akkusativ (objeto directo / movimiento)",
    color:"var(--green-text)", rgb:"var(--green-rgb)",
    items:[
      {prep:"durch", ej:"Ich gehe durch den Park.", tr:"Camino por el parque."},
      {prep:"für", ej:"Das Geschenk ist für den Chef.", tr:"El regalo es para el jefe."},
      {prep:"gegen", ej:"Er ist gegen den Vorschlag.", tr:"Está en contra de la propuesta."},
      {prep:"ohne", ej:"Ohne den Schlüssel kann ich nicht rein.", tr:"Sin la llave no puedo entrar."},
      {prep:"um", ej:"Wir sitzen um den Tisch.", tr:"Nos sentamos alrededor de la mesa."}
    ]
  },
  {
    titulo:"Dativ (receptor / ubicación estática)",
    color:"var(--gold-text)", rgb:"var(--gold-rgb)",
    items:[
      {prep:"mit", ej:"Ich fahre mit dem Bus.", tr:"Voy en bus."},
      {prep:"nach", ej:"Nach der Arbeit gehe ich heim.", tr:"Después del trabajo voy a casa."},
      {prep:"bei", ej:"Ich wohne bei meinen Eltern.", tr:"Vivo con mis padres."},
      {prep:"seit", ej:"Seit einem Jahr lerne ich Deutsch.", tr:"Hace un año que aprendo alemán."},
      {prep:"von", ej:"Das Buch ist von dem Autor.", tr:"El libro es del autor."},
      {prep:"zu", ej:"Ich gehe zum Arzt.", tr:"Voy al médico."},
      {prep:"aus", ej:"Ich komme aus Kolumbien.", tr:"Vengo de Colombia."},
      {prep:"außer", ej:"Außer mir war niemand da.", tr:"Salvo yo, no había nadie."},
      {prep:"gegenüber", ej:"Das Café ist gegenüber dem Bahnhof.", tr:"El café está frente a la estación."}
    ]
  },
  {
    titulo:"Genitiv (posesión / formal)",
    color:"var(--purple-text)", rgb:"var(--purple-rgb)",
    items:[
      {prep:"während", ej:"Während des Meetings klingelte mein Handy.", tr:"Durante la reunión sonó mi celular."},
      {prep:"wegen", ej:"Wegen des Regens bleibe ich zu Hause.", tr:"Por la lluvia me quedo en casa."},
      {prep:"trotz", ej:"Trotz des Staus kam er pünktlich.", tr:"A pesar del tráfico llegó puntual."},
      {prep:"statt", ej:"Statt eines Autos kaufte er ein Fahrrad.", tr:"En vez de un auto compró una bici."}
    ]
  },
  {
    titulo:"Wechselpräpositionen (Akk ↔ Dat según movimiento)",
    color:"var(--teal-text)", rgb:"var(--teal-rgb)",
    extra:"in, an, auf, vor, hinter, neben, zwischen, über, unter",
    items:[
      {prep:"in + Akk", ej:"Ich gehe ins Kino.", tr:"Voy al cine (movimiento)."},
      {prep:"in + Dat", ej:"Ich bin im Kino.", tr:"Estoy en el cine (ubicación)."},
      {prep:"auf + Akk", ej:"Ich lege das Buch auf den Tisch.", tr:"Pongo el libro sobre la mesa."},
      {prep:"auf + Dat", ej:"Das Buch liegt auf dem Tisch.", tr:"El libro está sobre la mesa."},
      {prep:"an + Akk", ej:"Ich hänge das Bild an die Wand.", tr:"Cuelgo el cuadro en la pared."},
      {prep:"an + Dat", ej:"Das Bild hängt an der Wand.", tr:"El cuadro está colgado en la pared."}
    ]
  }
];

function renderPreposiciones(){
  var el=document.getElementById("s-preposiciones"); el.innerHTML="";

  // ── Header ──
  var hdr=mk("div","","margin-bottom:14px;");
  hdr.appendChild(mk("p","Referencia rápida","font-size:10px;letter-spacing:2.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:2px;"));
  hdr.appendChild(mk("h2","📍 Preposiciones","font-size:24px;font-weight:900;letter-spacing:-.03em;line-height:1.1;margin:3px 0 4px;color:var(--text);"));
  hdr.appendChild(mk("p","Agrupadas por el caso que rigen, con ejemplos.","font-size:13px;color:var(--muted);font-weight:500;margin-bottom:0;"));
  el.appendChild(hdr);

  var wrap=mk("div","",""); wrap.className="stagger";
  PREP_SECTIONS.forEach(function(sec){
    var card=mk("div","","background:rgba("+sec.rgb+",0.06);border:1px solid rgba("+sec.rgb+",0.22);border-radius:18px;padding:16px;margin-bottom:12px;");
    card.className="anim-in";
    card.appendChild(mk("p",sec.titulo,"font-size:11px;font-weight:800;color:"+sec.color+";text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;line-height:1.4;"));
    if(sec.extra) card.appendChild(mk("p",sec.extra,"font-size:11px;color:var(--muted);font-weight:600;font-style:italic;margin-bottom:8px;"));
    sec.items.forEach(function(item){
      var row=mk("div","","display:flex;gap:10px;margin-bottom:6px;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,0.03);");
      row.appendChild(mk("b",item.prep,"font-size:13px;color:"+sec.color+";min-width:72px;font-weight:800;flex-shrink:0;"));
      var txt=mk("div","","flex:1;min-width:0;");
      txt.appendChild(mk("p",item.ej,"font-size:12.5px;color:var(--text);font-weight:600;line-height:1.45;"));
      txt.appendChild(mk("p",item.tr,"font-size:11.5px;color:var(--muted);font-weight:500;margin-top:1px;"));
      row.appendChild(txt);
      card.appendChild(row);
    });
    wrap.appendChild(card);
  });
  el.appendChild(wrap);
}
