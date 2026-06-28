// ── Namespaced State ──────────────────────────────────────────────────────────
const state = {
  app:{}, session:{}, flashcards:{}, savedView:{},
  chat:{}, reading:{}, shadowing:{}, grammar:{}, cases:{}, tempus:{}
};

// ── Auth / Session state ──
state.app.authToken=localStorage.getItem("dl_token")||null;
state.app.authUser=localStorage.getItem("dl_user")||null;
state.session.saved=[], state.session.chatLogs=[], state.session.sessionPhrases=0, state.session.sessionMinutes=0, state.session.minTimer;
state.chat.chatHistory=[], state.chat.chatScenario=null, state.app.currentTab="hoy";
state.flashcards.flashIdx=0, state.savedView.savedTab="frases", state.app.isRegister=false;
state.session.shownPhrases={};
state.session.dailyLog={};
state.session.levelLog={};
state.session.errorJournal=[];
state.session.weeklyGoal=60;
state.grammar.grammarStats={};
state.flashcards.flashReviewMode=true;
state.flashcards.reviewQueue=[];
state.savedView.savedFilter="";
state.savedView.savedFilterCat="Todas";
state.flashcards._flashcardEl=null, state.flashcards._gradeBtns=[];
state.tempus.tempusIdx=0; state.tempus.tempusRight=0; state.tempus.tempusWrong=0; state.tempus.tempusDone=false; state.tempus.tempusResults=[]; state.tempus.tempusSkipped=[]; state.tempus.tempusLogged=false;
state.app.level="B1";
state.savedView.vocabSortCol="de";
state.savedView.vocabSortAsc=true;
state.app.serverInfo={model:"?"};
if(localStorage.getItem("dl_theme")==="light") document.documentElement.classList.add("light-mode");

// ── Constants ──
const CATEGORIES = ["Trabajo","Viaje","Viajes","Comida","Naturaleza","Sentimientos","Hogar","Tr\u00e1mites","Tech","Conectores","General"];

const ERRANDS_VOCAB = [
  {de:"der Termin", es:"la cita", tip:"beim B\u00fcrgeramt"},
  {de:"die Anmeldung", es:"el registro", tip:"Wohnung anmelden"},
  {de:"der Antrag", es:"la solicitud", tip:"Formular ausf\u00fcllen"},
  {de:"die Bescheinigung", es:"el certificado", tip:"offizielles Dokument"},
  {de:"die Versicherung", es:"el seguro", tip:"Krankenversicherung"},
  {de:"die Krankenkasse", es:"la aseguradora de salud", tip:"gesetzlich oder privat"},
  {de:"der Mietvertrag", es:"el contrato de alquiler", tip:"Wohnung mieten"},
  {de:"die Kaution", es:"la fianza/dep\u00f3sito", tip:"3 Kaltmieten"},
  {de:"die Wohnung", es:"el departamento", tip:"Wohnungssuche"},
  {de:"der Vermieter", es:"el arrendador", tip:"Hausbesitzer"},
  {de:"die Nebenkosten", es:"los gastos adicionales", tip:"Heizung, Wasser, Strom"},
  {de:"die Arbeitserlaubnis", es:"el permiso de trabajo", tip:"f\u00fcr Ausl\u00e4nder"},
  {de:"der Arbeitsvertrag", es:"el contrato laboral", tip:"befristet/unbefristet"},
  {de:"das Gehalt", es:"el salario", tip:"monatlich brutto/netto"},
  {de:"die Aufenthaltserlaubnis", es:"el permiso de residencia", tip:"Visum"},
  {de:"die Steuererkl\u00e4rung", es:"la declaraci\u00f3n de impuestos", tip:"einmal pro Jahr"}
];

const TECH_VOCAB = [
  {de:"der Computer", es:"el computador"},
  {de:"der Laptop", es:"el port\u00e1til"},
  {de:"die Software", es:"el software"},
  {de:"der Code", es:"el c\u00f3digo"},
  {de:"der Fehler", es:"el error/bug"},
  {de:"das Programm", es:"el programa"},
  {de:"die Entwicklung", es:"el desarrollo"},
  {de:"der Entwickler", es:"el desarrollador"},
  {de:"die Datenbank", es:"la base de datos"},
  {de:"die App", es:"la aplicaci\u00f3n"},
  {de:"das Netzwerk", es:"la red"},
  {de:"die Cloud", es:"la nube"},
  {de:"der Server", es:"el servidor"},
  {de:"die Schnittstelle", es:"la interfaz/API"},
  {de:"die Abh\u00e4ngigkeit", es:"la dependencia"}
];

const TRAVEL_VOCAB = [
  {de:"der Flughafen", es:"el aeropuerto", tip:"Flugreise"},
  {de:"die Fahrkarte", es:"el billete", tip:"Zug/Bus"},
  {de:"das Gep\u00e4ck", es:"el equipaje", tip:"Koffer, Rucksack"},
  {de:"die Reservierung", es:"la reserva", tip:"Hotel, Flug"},
  {de:"der Pass", es:"el pasaporte", tip:"Reisedokument"},
  {de:"die Abfahrt", es:"la salida", tip:"Zug, Bus"},
  {de:"die Ankunft", es:"la llegada", tip:"am Zielort"},
  {de:"das Hotel", es:"el hotel", tip:"\u00dcbernachtung"},
  {de:"die Reise", es:"el viaje", tip:"Urlaubsreise"},
  {de:"der Ausflug", es:"la excursi\u00f3n", tip:"kurze Reise"}
];

const FOOD_VOCAB = [
  {de:"das Frühstück", es:"el desayuno", tip:"morgens"},
  {de:"das Mittagessen", es:"el almuerzo", tip:"mittags"},
  {de:"das Abendessen", es:"la cena", tip:"abends"},
  {de:"das Getränk", es:"la bebida", tip:"Wasser, Saft, Bier"},
  {de:"die Rechnung", es:"la cuenta", tip:"im Restaurant"},
  {de:"die Bestellung", es:"el pedido", tip:"Essen bestellen"},
  {de:"der Geschmack", es:"el sabor", tip:"lecker oder nicht"},
  {de:"der Hunger", es:"el hambre", tip:"Ich habe Hunger"},
  {de:"der Durst", es:"la sed", tip:"Ich habe Durst"},
  {de:"der Tisch", es:"la mesa", tip:"einen Tisch reservieren"}
];

const CONNECTORS_VOCAB = [
  {de:"weil", es:"porque", tip:"oración subordinada: verbo al final"},
  {de:"obwohl", es:"aunque / a pesar de que", tip:"oración subordinada: verbo al final"},
  {de:"deshalb", es:"por eso / por lo tanto", tip:"adverbio: invierte sujeto-verbo (V2)"},
  {de:"trotzdem", es:"sin embargo / a pesar de eso", tip:"adverbio: invierte sujeto-verbo (V2)"},
  {de:"sondern", es:"sino (que)", tip:"corrige una negación: nicht A, sondern B"},
  {de:"denn", es:"porque / pues", tip:"conjunción coordinante: no cambia orden"},
  {de:"damit", es:"para que", tip:"oración subordinada: verbo al final"},
  {de:"als", es:"cuando (pasado único)", tip:"pasado puntual, una sola vez"},
  {de:"wenn", es:"cuando (repetición) / si", tip:"presente, futuro o pasado repetido"},
  {de:"bevor", es:"antes de que", tip:"subordinada: verbo al final"},
  {de:"nachdem", es:"después de que", tip:"subordinada: verbo al final"},
  {de:"während", es:"mientras / durante", tip:"+ Genitiv (sust.) o subordinada"},
  {de:"seitdem", es:"desde que", tip:"subordinada: verbo al final"},
  {de:"bis", es:"hasta / hasta que", tip:"+ Akkusativ o subordinada"},
  {de:"falls", es:"en caso de que / si", tip:"subordinada: verbo al final"},
  {de:"sobald", es:"tan pronto como", tip:"subordinada: verbo al final"}
];

// ── Navigation constants ──
const TABS=[
  {id:"hoy",      label:"Hoy", icon:"home"},
  {id:"frases",   label:"Frases", icon:"book"},
  {id:"conversar",label:"Conversar", icon:"chat"},
  {id:"corrigeme",label:"Corrigeme", icon:"pen"},
  {id:"noentendi",label:"No entendi", icon:"target"},
  {id:"lectura",  label:"Lectura", icon:"book"},
  {id:"shadowing",label:"Shadowing", icon:"headphones"},
  {id:"gramatica",label:"Gramatica", icon:"grammar"},
  {id:"casos",    label:"Casos", icon:"scale"},
  {id:"genero",   label:"Genero", icon:"target"},
  {id:"conectores",label:"Conectores", icon:"link"},
  {id:"tempus",    label:"⏳ Antes/Después", icon:"link"},
  {id:"flashcards",label:"Flashcards", icon:"cards"},
  {id:"guardadas",label:"Guardadas", icon:"star"},
  {id:"resumen",  label:"Resumen", icon:"chart"},
  {id:"config",   label:"Ajustes", icon:"gear"}
];
const NAV_GROUPS=[
  {id:"hoy",       label:"Hoy",        icon:"home", screens:["hoy"]},
  {id:"practicar", label:"Practicar",  icon:"chat", screens:["conversar","corrigeme","noentendi","shadowing","lectura"]},
  {id:"gramatica", label:"Gramática",  icon:"grammar", screens:["gramatica","casos","genero","conectores","tempus"]},
  {id:"vocabulario",label:"Vocabulario",icon:"cards", screens:["frases","flashcards","guardadas"]},
  {id:"mas",       label:"Más",        icon:"more", screens:["resumen","config"]}
];
const NAV_ICON_STYLE={
  hoy:{color:"var(--green-text)",rgb:"74,222,128"},
  practicar:{color:"var(--teal-text)",rgb:"78,205,196"},
  gramatica:{color:"var(--purple-text)",rgb:"167,139,250"},
  vocabulario:{color:"var(--gold-text)",rgb:"245,166,35"},
  mas:{color:"var(--text2)",rgb:"148,163,184"}
};

// ── SRS constants ──
const BOX_INTERVALS=[0,1,3,7,14,30];

// ── GRAMMAR TOPICS ──
const GRAMMAR_TOPICS=[
  {label:"Articulos der/die/das", icon:"🔤", key:"articles"},
  {label:"Perfekt (haben/sein)",  icon:"⏪", key:"perfekt"},
  {label:"Wortstellung",          icon:"🔀", key:"wortstellung"},
  {label:"Adjektivendungen",      icon:"🎯", key:"adjendings"},
  {label:"Verbos separables",     icon:"✂️", key:"separable"},
  {label:"Praeteritum",           icon:"📜", key:"praeteritum"},
  {label:"Conectores y subord.",  icon:"🔗", key:"conectores"},
  {label:"Conjugacion de verbos", icon:"📝", key:"conjugacion"},
  {label:"Konjunktiv II",         icon:"💭", key:"konjunktiv2"},
  {label:"Plurales irregulares", icon:"🔢", key:"plurales"}
];
state.grammar._gramDrills=[], state.grammar._gramIdx=0, state.grammar._gramCorrect=0, state.grammar._gramMissed=[];

// ── CASES constants ──
const CASES_NOUNS = [
  {es:'el portátil', gen:'m', f:['Laptop','Laptop','Laptop','Laptops']},
  {es:'el monitor', gen:'m', f:['Monitor','Monitor','Monitor','Monitors']},
  {es:'el computador', gen:'m', f:['Computer','Computer','Computer','Computers']},
  {es:'el código', gen:'m', f:['Code','Code','Code','Codes']},
  {es:'el trabajo', gen:'m', f:['Job','Job','Job','Jobs']},
  {es:'el cliente', gen:'m', weak:true, f:['Kunde','Kunden','Kunden','Kunden']},
  {es:'el texto', gen:'m', f:['Text','Text','Text','Textes']},
  {es:'la postulación', gen:'f', f:['Bewerbung','Bewerbung','Bewerbung','Bewerbung']},
  {es:'la clase', gen:'f', f:['Klasse','Klasse','Klasse','Klasse']},
  {es:'el análisis', gen:'f', f:['Analyse','Analyse','Analyse','Analyse']},
  {es:'la estudiante', gen:'f', f:['Studentin','Studentin','Studentin','Studentin']},
  {es:'la respuesta', gen:'f', f:['Antwort','Antwort','Antwort','Antwort']},
  {es:'el video', gen:'n', f:['Video','Video','Video','Videos']},
  {es:'el proyecto', gen:'n', f:['Projekt','Projekt','Projekt','Projekts']},
  {es:'el dashboard', gen:'n', f:['Dashboard','Dashboard','Dashboard','Dashboards']},
  {es:'el micrófono', gen:'n', f:['Mikrofon','Mikrofon','Mikrofon','Mikrofons']},
  {es:'el MacBook', gen:'n', f:['MacBook','MacBook','MacBook','MacBooks']},
  {es:'la entrevista', gen:'n', f:['Interview','Interview','Interview','Interviews']}
];
const CASES_ART = {
  der:  {m:['der','den','dem','des'], f:['die','die','der','der'], n:['das','das','dem','des']},
  ein:  {m:['ein','einen','einem','eines'], f:['eine','eine','einer','einer'], n:['ein','ein','einem','eines']},
  mein: {m:['mein','meinen','meinem','meines'], f:['meine','meine','meiner','meiner'], n:['mein','mein','meinem','meines']}
};
const CASES_CASES = [
  {name:'Nominativ', cls:'nom', dot:'#4ECDC4'},
  {name:'Akkusativ', cls:'akk', dot:'#4ade80'},
  {name:'Dativ', cls:'dat', dot:'#F5A623'},
  {name:'Genitiv', cls:'gen', dot:'#A78BFA'}
];
const CASES_Q = [
  {mode:'articulo', sentence:'___ Laptop ist neu.', hint:'der Laptop', op:['der','den','dem','des'], ok:'der', caso:'nom', why:'¿quién es nuevo? él, es el sujeto → Nominativ.'},
  {mode:'articulo', sentence:'Ich benutze ___ Laptop.', hint:'der Laptop', op:['der','den','dem','des'], ok:'den', caso:'akk', why:'benutzen lleva objeto directo → Akkusativ. der → den.'},
  {mode:'articulo', sentence:'Ich arbeite mit ___ Laptop.', hint:'der Laptop', op:['der','den','dem','des'], ok:'dem', caso:'dat', why:'“mit” siempre manda Dativ. der → dem.'},
  {mode:'articulo', sentence:'Die Tastatur ___ Laptops ist gut.', hint:'der Laptop', op:['der','den','dem','des'], ok:'des', caso:'gen', why:'¿de quién es el teclado? Genitiv. der → des (+ Laptops).'},
  {mode:'articulo', sentence:'___ Dashboard ist fertig.', hint:'das Dashboard', op:['das','dem','des','den'], ok:'das', caso:'nom', why:'el dashboard es el sujeto → Nominativ. Neutro: das.'},
  {mode:'articulo', sentence:'Ich baue ___ Dashboard.', hint:'das Dashboard', op:['das','dem','des','den'], ok:'das', caso:'akk', why:'bauen → objeto directo → Akkusativ. En neutro NO cambia: das.'},
  {mode:'articulo', sentence:'Ich arbeite an ___ Dashboard.', hint:'das Dashboard', op:['das','dem','des','den'], ok:'dem', caso:'dat', why:'“arbeiten an” va con Dativ. das → dem.'},
  {mode:'articulo', sentence:'Die Farbe ___ Dashboards ist blau.', hint:'das Dashboard', op:['das','dem','des','den'], ok:'des', caso:'gen', why:'¿de qué es el color? Genitiv. das → des.'},
  {mode:'articulo', sentence:'___ Bewerbung ist fertig.', hint:'die Bewerbung', op:['die','der','dem','den'], ok:'die', caso:'nom', why:'sujeto → Nominativ. Femenino: die.'},
  {mode:'articulo', sentence:'Ich schreibe ___ Bewerbung.', hint:'die Bewerbung', op:['die','der','dem','den'], ok:'die', caso:'akk', why:'schreiben → objeto directo → Akkusativ. Femenino NO cambia: die.'},
  {mode:'articulo', sentence:'Ich arbeite an ___ Bewerbung.', hint:'die Bewerbung', op:['die','der','dem','den'], ok:'der', caso:'dat', why:'“arbeiten an” → Dativ. Femenino: die → der.'},
  {mode:'articulo', sentence:'Der Titel ___ Bewerbung ist klar.', hint:'die Bewerbung', op:['die','der','dem','den'], ok:'der', caso:'gen', why:'¿de qué es el título? Genitiv. Femenino: die → der.'},
  {mode:'articulo', sentence:'Ich helfe ___ Studentin.', hint:'die Studentin', op:['die','der','dem','den'], ok:'der', caso:'dat', why:'helfen siempre va con Dativ. Femenino: die → der.'},
  {mode:'articulo', sentence:'___ Kunde antwortet nicht.', hint:'der Kunde', op:['der','den','dem','des'], ok:'der', caso:'nom', why:'el cliente es el sujeto → Nominativ.'},
  {mode:'articulo', sentence:'Ich spreche mit ___ Kunden.', hint:'der Kunde', op:['der','den','dem','des'], ok:'dem', caso:'dat', why:'“mit” → Dativ. der → dem (Kunde es débil → Kunden).'},
  {mode:'articulo', sentence:'Die Nachricht ___ Kunden ist wichtig.', hint:'der Kunde', op:['der','den','dem','des'], ok:'des', caso:'gen', why:'¿de quién es el mensaje? Genitiv. der → des.'},
  {mode:'articulo', sentence:'Ich schneide ___ Video.', hint:'das Video', op:['das','dem','des','den'], ok:'das', caso:'akk', why:'schneiden → objeto directo → Akkusativ. Neutro: das.'},
  {mode:'articulo', sentence:'Der Anfang ___ Videos ist stark.', hint:'das Video', op:['das','dem','des','den'], ok:'des', caso:'gen', why:'¿de qué es el inicio? Genitiv. das → des.'},
  {mode:'articulo', sentence:'Ich denke an ___ Interview.', hint:'das Interview', op:['das','dem','des','den'], ok:'das', caso:'akk', why:'“denken an” va con Akkusativ (no es ubicación). Neutro: das.'},
  {mode:'articulo', sentence:'Ich warte auf ___ Antwort.', hint:'die Antwort', op:['die','der','dem','den'], ok:'die', caso:'akk', why:'“warten auf” va con Akkusativ. Femenino: die.'},
  {mode:'articulo', sentence:'Ich suche ___ Job.', hint:'der Job', op:['der','den','dem','des'], ok:'den', caso:'akk', why:'suchen → objeto directo → Akkusativ. der → den.'},
  {mode:'articulo', sentence:'Ich danke ___ Team.', hint:'das Team', op:['das','dem','des','den'], ok:'dem', caso:'dat', why:'danken siempre va con Dativ. Neutro: das → dem.'},
  {mode:'articulo', sentence:'Ich suche ___ Job. (un trabajo)', hint:'der Job · indefinido', op:['ein','einen','einem','eines'], ok:'einen', caso:'akk', why:'objeto directo → Akkusativ. Masculino: ein → einen.'},
  {mode:'articulo', sentence:'Ich kaufe ___ Mikrofon. (un micro)', hint:'das Mikrofon · indefinido', op:['ein','einen','einem','eines'], ok:'ein', caso:'akk', why:'Akkusativ, pero neutro NO cambia: ein.'},
  {mode:'articulo', sentence:'Ich arbeite mit ___ Mikrofon.', hint:'das Mikrofon · mein', op:['mein','meinen','meinem','meines'], ok:'meinem', caso:'dat', why:'“mit” → Dativ. Neutro: mein → meinem.'},
  {mode:'articulo', sentence:'___ Computer ist schnell.', hint:'der Computer · mein', op:['mein','meinen','meinem','meines'], ok:'mein', caso:'nom', why:'sujeto → Nominativ. Masculino: mein.'},
  {mode:'articulo', sentence:'Ich benutze ___ Computer.', hint:'der Computer · mein', op:['mein','meinen','meinem','meines'], ok:'meinen', caso:'akk', why:'objeto directo → Akkusativ. Masculino: mein → meinen.'},
  {mode:'articulo', sentence:'Ich spreche mit ___ Kollegin.', hint:'die Kollegin · indefinido', op:['eine','einen','einer','einem'], ok:'einer', caso:'dat', why:'“mit” → Dativ. Femenino: eine → einer.'},
  {mode:'caso', sentence:'<b class="cs-de">Der Monitor</b> ist groß.', op:['Nominativ','Akkusativ','Dativ','Genitiv'], ok:'Nominativ', why:'es el sujeto, el que “es grande”.'},
  {mode:'caso', sentence:'Ich sehe <b class="cs-de">den Monitor</b>.', op:['Nominativ','Akkusativ','Dativ','Genitiv'], ok:'Akkusativ', why:'recibe la acción de “ver”. der → den lo delata.'},
  {mode:'caso', sentence:'Ich arbeite mit <b class="cs-de">dem Monitor</b>.', op:['Nominativ','Akkusativ','Dativ','Genitiv'], ok:'Dativ', why:'“mit” manda Dativ. der → dem.'},
  {mode:'caso', sentence:'Die Größe <b class="cs-de">des Monitors</b> ist perfekt.', op:['Nominativ','Akkusativ','Dativ','Genitiv'], ok:'Genitiv', why:'“el tamaño DEL monitor” → posesión → Genitiv.'},
  {mode:'caso', sentence:'Ich erkläre <b class="cs-de">dem Schüler</b> die Aufgabe.', op:['Nominativ','Akkusativ','Dativ','Genitiv'], ok:'Dativ', why:'¿a quién le explico? al estudiante → Dativ (segundo objeto).'},
  {mode:'caso', sentence:'Ich erkläre dem Schüler <b class="cs-de">die Aufgabe</b>.', op:['Nominativ','Akkusativ','Dativ','Genitiv'], ok:'Akkusativ', why:'¿qué explico? la tarea → objeto directo → Akkusativ.'},
  {mode:'caso', sentence:'Während <b class="cs-de">des Meetings</b> mache ich Notizen.', op:['Nominativ','Akkusativ','Dativ','Genitiv'], ok:'Genitiv', why:'“während” es preposición de Genitiv.'},
  {mode:'caso', sentence:'<b class="cs-de">Mein Code</b> funktioniert.', op:['Nominativ','Akkusativ','Dativ','Genitiv'], ok:'Nominativ', why:'es el sujeto que “funciona”.'},
  {mode:'caso', sentence:'Das Ergebnis <b class="cs-de">der Analyse</b> ist klar.', op:['Nominativ','Akkusativ','Dativ','Genitiv'], ok:'Genitiv', why:'“el resultado DEL análisis” → Genitiv. Femenino: die → der.'},
  {mode:'caso', sentence:'Ich gebe <b class="cs-de">dem Team</b> die Daten.', op:['Nominativ','Akkusativ','Dativ','Genitiv'], ok:'Dativ', why:'¿a quién le doy? al equipo → Dativ.'},
  {mode:'caso', sentence:'Ich danke <b class="cs-de">dem Kunden</b>.', op:['Nominativ','Akkusativ','Dativ','Genitiv'], ok:'Dativ', why:'danken siempre rige Dativ.'},
  {mode:'mov', sentence:'Ich lege das MacBook auf ___ Tisch.', hint:'der Tisch · ¿lo MUEVO ahí?', op:['den','dem'], ok:'den', caso:'akk', why:'lo estoy moviendo encima → movimiento → Akkusativ. den.'},
  {mode:'mov', sentence:'Das MacBook liegt auf ___ Tisch.', hint:'der Tisch · ¿está quieto?', op:['den','dem'], ok:'dem', caso:'dat', why:'ya está ahí, no se mueve → ubicación → Dativ. dem.'},
  {mode:'mov', sentence:'Ich stelle die Switch neben ___ Monitor.', hint:'der Monitor · la pongo ahí', op:['den','dem'], ok:'den', caso:'akk', why:'la coloco (movimiento) → Akkusativ. den.'},
  {mode:'mov', sentence:'Die Switch steht neben ___ Monitor.', hint:'der Monitor · está ahí', op:['den','dem'], ok:'dem', caso:'dat', why:'está parada (ubicación) → Dativ. dem.'},
  {mode:'mov', sentence:'Ich gehe in ___ Büro.', hint:'das Büro · entro', op:['das','dem'], ok:'das', caso:'akk', why:'me dirijo adentro (movimiento) → Akkusativ. (in + das = ins)'},
  {mode:'mov', sentence:'Ich arbeite in ___ Büro.', hint:'das Büro · ya dentro', op:['das','dem'], ok:'dem', caso:'dat', why:'estoy trabajando dentro (ubicación) → Dativ. dem.'},
  {mode:'mov', sentence:'Ich hänge das Mikrofon über ___ Schreibtisch.', hint:'der Schreibtisch · lo cuelgo', op:['den','dem'], ok:'den', caso:'akk', why:'lo estoy colocando (movimiento) → Akkusativ. den.'},
  {mode:'mov', sentence:'Das Mikrofon hängt über ___ Schreibtisch.', hint:'der Schreibtisch · ya cuelga', op:['den','dem'], ok:'dem', caso:'dat', why:'ya está colgado (ubicación) → Dativ. dem.'},
  {mode:'traduccion', es:'Uso el portátil.', de:'Ich benutze <span class="c-akk">den</span> Laptop.', why:'objeto directo → Akkusativ.'},
  {mode:'traduccion', es:'Trabajo con el portátil.', de:'Ich arbeite mit <span class="c-dat">dem</span> Laptop.', why:'“mit” → Dativ.'},
  {mode:'traduccion', es:'El teclado del portátil es bueno.', de:'Die Tastatur <span class="c-gen">des</span> Laptops ist gut.', why:'Genitiv (+ Laptops).'},
  {mode:'traduccion', es:'Ayudo a la estudiante.', de:'Ich helfe <span class="c-dat">der</span> Studentin.', why:'helfen → Dativ. Femenino die → der.'},
  {mode:'traduccion', es:'Le explico la regla al estudiante.', de:'Ich erkläre <span class="c-dat">dem</span> Schüler <span class="c-akk">die</span> Regel.', why:'a quién = Dativ · qué = Akkusativ.'},
  {mode:'traduccion', es:'Estoy esperando la respuesta.', de:'Ich warte auf <span class="c-akk">die</span> Antwort.', why:'“warten auf” → Akkusativ.'},
  {mode:'traduccion', es:'Pongo la Switch al lado del monitor.', de:'Ich stelle <span class="c-akk">die</span> Switch neben <span class="c-akk">den</span> Monitor.', why:'la muevo ahí → movimiento → Akkusativ.'},
  {mode:'traduccion', es:'La Switch está al lado del monitor.', de:'<span class="c-nom">Die</span> Switch steht neben <span class="c-dat">dem</span> Monitor.', why:'está fija → ubicación → Dativ.'},
  {mode:'traduccion', es:'El inicio del video es importante.', de:'Der Anfang <span class="c-gen">des</span> Videos ist wichtig.', why:'“del video” → Genitiv.'},
  {mode:'traduccion', es:'Busco un trabajo remoto.', de:'Ich suche <span class="c-akk">einen</span> Remote-Job.', why:'objeto directo → Akkusativ. ein → einen.'}
];
const CASES_TIPS = {
  nom:"Tip: Nominativ es el sujeto: ¿quién hace o es algo? Es el artículo de diccionario.",
  akk:"Tip: Akkusativ es el objeto directo: ¿qué recibe la acción? En masculino der cambia a den.",
  dat:"Tip: Dativ aparece con mit/zu/bei y con el receptor: ¿a quién o para quién?",
  gen:"Tip: Genitiv marca posesión o 'de': des en masc/neutro y normalmente añade -s al sustantivo."
};
state.cases.casesSubtab = "identificar";
state.cases.casesArt = "der", state.cases.casesNounIdx = 0;
state.cases.casesQuizMode = "all", state.cases.casesPool = [], state.cases.casesIdx = 0, state.cases.casesAnswered = false;
state.cases.casesHits = 0, state.cases.casesTotal = 0, state.cases.casesStreak = 0;
state.cases.casesWrongStreak = 0; state.cases.casesCaseMisses = {nom:0,akk:0,dat:0,gen:0};

// ── CONNECTORS constants ──
var _conData=null, _conIdx=0, _conRight=0, _conWrong=0, _conDone=false, _conResults=[];
const CONNECTOR_CHOICES=["weil","obwohl","deshalb","dass","wenn"];

// ── TEMPUS constants ──
const TEMPUS_CHOICES=["vor","bevor","vorher","früher","nach","nachdem","danach","später"];
const TEMPUS_CURATED=[
  {sentence:"___ dem Essen wasche ich die Hände.", options:["vor","bevor","vorher","früher"], correct:"vor", tip:"vor + Dativ con sustantivo (dem Essen)"},
  {sentence:"___ der Arbeit trinke ich einen Kaffee.", options:["bevor","vor","vorher","nach"], correct:"vor", tip:"vor + Dativ (der Arbeit → Dativ)"},
  {sentence:"Ich stehe immer ___ dem Wecker auf.", options:["vor","vorher","bevor","früher"], correct:"vor", tip:"vor + Dativ con sustantivo (dem Wecker)"},
  {sentence:"___ ich schlafen gehe, lese ich ein Buch.", options:["vor","bevor","vorher","nachdem"], correct:"bevor", tip:"bevor + oración subordinada (verbo al final: gehe)"},
  {sentence:"Ruf mich an, ___ du losfährst.", options:["bevor","vor","vorher","danach"], correct:"bevor", tip:"bevor + oración subordinada (verbo al final: losfährst)"},
  {sentence:"___ er antwortet, denkt er kurz nach.", options:["vorher","vor","bevor","früher"], correct:"bevor", tip:"bevor + oración subordinada (verbo al final: antwortet)"},
  {sentence:"Ich war ___ beim Arzt.", options:["vor","vorher","bevor","früher"], correct:"vorher", tip:"vorher = adverbio solo, sin sustantivo"},
  {sentence:"Hast du das ___ schon einmal gemacht?", options:["früher","vor","vorher","bevor"], correct:"vorher", tip:"vorher = adverbio solo, 'antes' como adverbio"},
  {sentence:"___ hatte ich keine Ahnung davon.", options:["vor","vorher","bevor","früher"], correct:"vorher", tip:"vorher = adverbio solo al inicio de la sentence"},
  {sentence:"___ habe ich in Berlin gewohnt.", options:["früher","vor","bevor","vorher"], correct:"früher", tip:"früher = antes, en el pasado (no lleva complemento)"},
  {sentence:"___ war hier ein großer Park.", options:["vor","früher","vorher","bevor"], correct:"früher", tip:"früher = en el pasado, 'antes era diferente'"},
  {sentence:"Mein Opa hat ___ als Lehrer gearbeitet.", options:["früher","vorher","vor","bevor"], correct:"früher", tip:"früher = antes, en el pasado"},
  {sentence:"___ der Schule gehe ich ins Fitnessstudio.", options:["nachdem","nach","danach","später"], correct:"nach", tip:"nach + Dativ con sustantivo (der Schule)"},
  {sentence:"___ dem Mittagessen bin ich immer müde.", options:["nachdem","nach","danach","später"], correct:"nach", tip:"nach + Dativ con sustantivo (dem Mittagessen)"},
  {sentence:"___ der Pause machen wir weiter.", options:["nach","nachdem","danach","später"], correct:"nach", tip:"nach + Dativ con sustantivo (der Pause)"},
  {sentence:"___ ich gegessen habe, gehe ich spazieren.", options:["nach","nachdem","danach","bevor"], correct:"nachdem", tip:"nachdem + oración subordinada (verbo al final: habe)"},
  {sentence:"___ er angekommen war, hat er angerufen.", options:["nach","nachdem","danach","später"], correct:"nachdem", tip:"nachdem + oración subordinada (verbo al final: war)"},
  {sentence:"___ wir das Meeting beendet hatten, gingen wir essen.", options:["nach","danach","nachdem","bevor"], correct:"nachdem", tip:"nachdem + oración subordinada (verbo al final: hatten)"},
  {sentence:"Ich habe gegessen. ___ bin ich spazieren gegangen.", options:["nach","danach","nachdem","später"], correct:"danach", tip:"danach = adverbio solo, 'después' como adverbio"},
  {sentence:"Zuerst dusche ich, ___ frühstücke ich.", options:["danach","nach","nachdem","bevor"], correct:"danach", tip:"danach = adverbio solo, 'después' en la sentence"},
  {sentence:"___ fühle ich mich immer besser.", options:["nach","nachdem","danach","vor"], correct:"danach", tip:"danach = adverbio solo al inicio"},
  {sentence:"Wir sehen uns ___!", options:["später","nach","danach","nachdem"], correct:"später", tip:"später = más tarde, después (adverbio)"},
  {sentence:"Das mache ich ___.", options:["nach","später","danach","nachdem"], correct:"später", tip:"später = más tarde, después"},
  {sentence:"Komm ___ noch einmal vorbei.", options:["später","nach","danach","bevor"], correct:"später", tip:"später = más tarde, adverbio temporal"}
];

// ── GENDER constants ──
const GENDER_NOUN_POOL = [
  {noun:"Tisch",article:"der",plural:"Tische",meaning:"mesa"},{noun:"Stuhl",article:"der",plural:"Stühle",meaning:"silla"},{noun:"Schlüssel",article:"der",plural:"Schlüssel",meaning:"llave"},{noun:"Bahnhof",article:"der",plural:"Bahnhöfe",meaning:"estación"},{noun:"Termin",article:"der",plural:"Termine",meaning:"cita"},{noun:"Fehler",article:"der",plural:"Fehler",meaning:"error"},{noun:"Kaffee",article:"der",plural:"Kaffees",meaning:"café"},{noun:"Laptop",article:"der",plural:"Laptops",meaning:"portátil"},
  {noun:"Lampe",article:"die",plural:"Lampen",meaning:"lámpara"},{noun:"Rechnung",article:"die",plural:"Rechnungen",meaning:"factura"},{noun:"Frage",article:"die",plural:"Fragen",meaning:"pregunta"},{noun:"Antwort",article:"die",plural:"Antworten",meaning:"respuesta"},{noun:"Straße",article:"die",plural:"Straßen",meaning:"calle"},{noun:"Wohnung",article:"die",plural:"Wohnungen",meaning:"apartamento"},{noun:"Zeit",article:"die",plural:"Zeiten",meaning:"tiempo"},{noun:"Nachricht",article:"die",plural:"Nachrichten",meaning:"mensaje"},
  {noun:"Buch",article:"das",plural:"Bücher",meaning:"libro"},{noun:"Fenster",article:"das",plural:"Fenster",meaning:"ventana"},{noun:"Handy",article:"das",plural:"Handys",meaning:"celular"},{noun:"Problem",article:"das",plural:"Probleme",meaning:"problema"},{noun:"Ticket",article:"das",plural:"Ticket",meaning:"tiquete"},{noun:"Zimmer",article:"das",plural:"Zimmer",meaning:"habitación"},{noun:"Wort",article:"das",plural:"Wörter",meaning:"palabra"},{noun:"Gespräch",article:"das",plural:"Gespräche",meaning:"conversación"}
];
var _genNouns=null, _genIdx=0, _genRight=0, _genWrong=0, _genMissed=[], _genDone=false;
var _genRecentNouns=[];

// ── SITS (phrase topics) ──
const SITS=[
  {label:"Mi trabajo en data", icon:"💻"},
  {label:"Viajes y Europa",    icon:"✈️"},
  {label:"Emociones",          icon:"💭"},
  {label:"No entendi repite",  icon:"🔄"},
  {label:"Vida diaria",        icon:"☀️"},
  {label:"Con amigos",         icon:"🤝"},
  {label:"Pedir ayuda",        icon:"🙋"},
  {label:"Tecnologia y AI",    icon:"🤖"}
];

// ── SCENARIOS (conversation) ──
const SCENARIOS=[
  {label:"Hablar con un amigo alemán",          icon:"👋"},
  {label:"Explicar tu trabajo",                 icon:"💼"},
  {label:"Pedir aclaración",                    icon:"❓"},
  {label:"Hablar sobre tu día",                 icon:"🌅"},
  {label:"Entrevista de trabajo en Alemania",   icon:"🏢"},
  {label:"Hablar de tu viaje a Europa",         icon:"🗺️"}
];

// ── SHADOWING POOL ──
const SHADOWING_POOL=[
  {de:"Ich heiße Sebastian und komme aus Kolumbien.",es:"Me llamo Sebastian y vengo de Colombia."},
  {de:"Ich arbeite als Datenanalyst bei einem deutschen Unternehmen.",es:"Trabajo como analista de datos en una empresa alemana."},
  {de:"Heute habe ich viel zu tun, aber ich mache eine Pause.",es:"Hoy tengo mucho que hacer, pero tomo un descanso."},
  {de:"Kannst du mir bitte helfen? Ich verstehe das nicht.",es:"¿Puedes ayudarme por favor? No entiendo esto."},
  {de:"Ich möchte nächstes Jahr nach Deutschland reisen.",es:"El próximo año quiero viajar a Alemania."},
  {de:"Gestern habe ich einen interessanten Film gesehen.",es:"Ayer vi una película interesante."},
  {de:"Ich lerne seit sechs Monaten Deutsch.",es:"Llevo seis meses aprendiendo alemán."},
  {de:"Wir können uns am Wochenende treffen und Kaffee trinken.",es:"Podemos encontrarnos el fin de semana y tomar café."},
  {de:"Entschuldigung, wo ist der nächste Supermarkt?",es:"Disculpa, ¿dónde está el supermercado más cercano?"},
  {de:"Ich habe mich über die neue Stelle sehr gefreut.",es:"Me alegré mucho por el nuevo puesto."}
];
