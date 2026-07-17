// ── DeutschLernen service worker (offline cache) ─────────────────────────────
// Network-first for same-origin GETs: always fresh when online, cached when offline.
// (Cache-first was avoided on purpose — it would freeze the app on a stale version.)
const CACHE = "deutschlernen-v1";
const ASSETS = [
  "/", "/index.html", "/style.css", "/manifest.json",
  "/js/state.js", "/js/utils.js", "/js/api.js", "/js/auth.js", "/js/sync.js",
  "/js/srs.js", "/js/level.js", "/js/voice.js", "/js/nav.js", "/js/ui.js", "/js/main.js",
  "/js/screens/today.js", "/js/screens/practicar.js", "/js/screens/phrases.js",
  "/js/screens/conversation.js", "/js/screens/correct_me.js", "/js/screens/didnt_understand.js",
  "/js/screens/reading.js", "/js/screens/dictado.js", "/js/screens/shadowing.js",
  "/js/screens/grammar.js", "/js/screens/cases.js", "/js/screens/gender.js",
  "/js/screens/connectors.js", "/js/screens/tempus.js", "/js/screens/perfekt.js",
  "/js/screens/satzbau.js", "/js/screens/flashcards.js", "/js/screens/saved.js",
  "/js/screens/summary.js", "/js/screens/leveltest.js", "/js/screens/conjugacion.js",
  "/js/screens/preposiciones.js", "/js/screens/adjektive.js", "/js/screens/ndeklination.js",
  "/js/screens/trennbare.js", "/js/screens/settings.js"
];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys()
      .then(function(keys){ return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); })
      .then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET") return;                       // POST (/api/chat) passes straight to network
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;         // don't touch fonts / external hosts
  e.respondWith(
    fetch(req)
      .then(function(res){
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      })
      .catch(function(){
        return caches.match(req).then(function(r){ return r || caches.match("/index.html"); });
      })
  );
});
