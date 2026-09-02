/* =========================================================================
   Leeway — service worker

   TWO strategies, because the two kinds of request fail differently.

   Documents  → network first.  A booking screen showing yesterday's slot is
                worse than a screen that took another 300ms. The network is
                asked first every time; the cache only catches the fall.

   Assets     → cache first.  style.css, script.js, the 31 images and the
                fonts do not change between deploys — and they are ~2.2MB,
                the overwhelming majority of the weight. Going to the network
                for them buys nothing and costs everything.

   BYPASSED ENTIRELY (no respondWith at all, so the browser handles it
   natively): any request carrying a Range header, and any video file.
   A service worker that answers a Range request with a complete 200 body
   breaks seeking and can break playback outright. There is no video in the
   project today; this guard is here so that adding one cannot break it.

   VERSION is the whole cache-busting story. It is baked into the cache
   names, and on activate EVERY cache whose name does not start with the
   current prefix is deleted. Bump VERSION and the old world disappears.

   >>> IMPORTANT: assets are served cache-first, so editing style.css or
   >>> script.js will NOT reach anyone who already has the app until
   >>> VERSION below is bumped. Bump it in the same commit as the edit.
   ========================================================================= */

const VERSION = "v4";

const PREFIX = "leeway-" + VERSION;      /* every cache we own starts with this */
const SHELL_CACHE = PREFIX + "-shell";   /* documents + the offline screen      */
const ASSET_CACHE = PREFIX + "-assets";  /* css, js, images, fonts              */

const OFFLINE_URL = "offline.html";

/* Kept deliberately small. All 42 <img> tags load eagerly (not one carries
   loading="lazy"), so a single online visit fills ASSET_CACHE with the rest
   on its own. Precaching 2.2MB up front would only move the same bytes
   earlier and make install slow and failure-prone. */
const SHELL = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "manifest.webmanifest",
  "privacy.html",     /* a store listing links straight here — without it, an
                         offline visit would fall through to index.html and
                         show the app instead of the policy. */
  OFFLINE_URL
];

const VIDEO = /\.(mp4|webm|ogv|ogg|mov|m4v|m3u8|ts)$/i;

const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

/* A destination photo fetched from Wikipedia is an image like any other:
   worth keeping so the flight card still has it offline. The lookup APIs
   themselves are deliberately NOT here — cache-first on a data endpoint
   would serve yesterday's answer forever. They fall through to the
   browser untouched. */
const PHOTO_HOSTS = ["upload.wikimedia.org"];

/* ---------------------------------------------------------------------- */

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    /* Individually, not addAll: addAll is atomic, so one 404 would throw
       away the whole install and leave the app with no offline screen. */
    await Promise.all(SHELL.map(async (url) => {
      try {
        const res = await fetch(url, { cache: "reload" });
        if (res && res.ok) await cache.put(url, res);
      } catch (err) { /* a missing shell entry must not fail the install */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((name) => !name.startsWith(PREFIX))   /* the rule, literally */
        .map((name) => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

/* ---------------------------------------------------------------------- */

function isDocument(request) {
  return request.mode === "navigate" || request.destination === "document";
}

function isFont(url) {
  return FONT_HOSTS.indexOf(url.hostname) !== -1;
}

function isRemotePhoto(url) {
  return PHOTO_HOSTS.indexOf(url.hostname) !== -1;
}

/* Documents: network first, cache second, offline screen last.
   Every fallback below is a cached Response, so it carries the 200 it was
   stored with — the offline screen is a real 200, never a synthesised error. */
async function networkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    /* ignoreSearch matters: a shortcut opens ?screen=status, which is the
       same document as the cached "./" but would never match exactly. */
    const hit = await cache.match(request, { ignoreSearch: true })
             || await cache.match("index.html")
             || await cache.match("./");
    if (hit) return hit;

    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;

    /* Only reachable if the shell cache was wiped — e.g. by the
       "מחק את כל מה שנשמר" button — and the device is still offline. */
    return new Response("אין חיבור לאינטרנט", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}

/* Assets: cache first. Only successful, non-opaque responses are stored, so
   a failed CDN fetch can never poison the cache with an error page. */
async function cacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;

  try {
    const res = await fetch(request);
    /* Opaque responses are normally refused: status is always 0, so an error
       page is indistinguishable from a real one and caching it would poison
       the entry. A cross-origin <img> is always opaque, though, so the
       destination photo could never be stored under that rule. It is allowed
       here for the photo hosts only, where the cost of guessing wrong is one
       broken image that falls back to the bundled artwork. */
    const opaqueOk = res && res.type === "opaque" && isRemotePhoto(new URL(request.url));
    if (res && ((res.ok && res.type !== "opaque") || opaqueOk)) cache.put(request, res.clone());
    return res;
  } catch (err) {
    /* Not in ASSET_CACHE and the network is gone — but it may still be in
       SHELL_CACHE. offline.html, index.html, style.css, script.js and the
       manifest all live there, and asking for one of them as a subresource
       (rather than as a navigation) must not fail just because we looked in
       one cache instead of both. caches.match searches every cache. */
    const anywhere = await caches.match(request, { ignoreSearch: true });
    if (anywhere) return anywhere;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  /* ---- the two total bypasses, before anything else ------------------ */
  if (request.headers.has("range")) return;

  const url = new URL(request.url);
  if (VIDEO.test(url.pathname)) return;
  /* ------------------------------------------------------------------- */

  if (isDocument(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.origin === self.location.origin || isFont(url) || isRemotePhoto(url)) {
    event.respondWith(cacheFirst(request));
  }
  /* anything else cross-origin is left to the browser */
});
