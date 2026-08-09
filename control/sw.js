/* =====================================================================
   PFC CONTROL — Service Worker
   =====================================================================
   This keeps a copy of the app's own files on the phone. The app then
   opens on site with no signal.

   It does NOT keep a copy of the data. Status values always come from the
   network. Old status values shown as current would be worse than no
   status at all.

   AFTER YOU CHANGE ANY FILE IN control/, RAISE THE VERSION NUMBER BELOW.
   The phone keeps serving the old copy until the number changes.
   ===================================================================== */

var CACHE_NAME = 'pfc-control-0.2-step3-fix5';

/** The app's own files. Everything needed to open with no signal. */
var SHELL = [
  './',
  './index.html',
  './manifest.json',
  './shared/theme.css',
  './shared/common.js',
  './shared/logo.png',
  './tracker/index.html',
  './tracker/building.html',
  './tracker/unit.html',
  './tracker/queue.html',
  './setup/index.html'
];


/* ── INSTALL ──────────────────────────────────────────────────────── */

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      // addAll fails as a whole if one file is missing. Add them one at a
      // time instead, so a single missing file cannot block the install.
      return Promise.all(SHELL.map(function (path) {
        return cache.add(path).catch(function () {
          // This file is missing. The app still installs.
        });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});


/* ── ACTIVATE ─────────────────────────────────────────────────────── */

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.map(function (name) {
        if (name !== CACHE_NAME) return caches.delete(name);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});


/* ── FETCH ────────────────────────────────────────────────────────── */

self.addEventListener('fetch', function (event) {
  var request = event.request;

  // Only plain page loads are handled. Leave the rest alone.
  if (request.method !== 'GET') return;

  var url = new URL(request.url);

  // Anything on another site goes straight to the network, always. That
  // covers every call to Apps Script. A saved status value could be hours
  // old, and nothing on the screen would say so.
  if (url.origin !== self.location.origin) return;

  /*
   * The key a file is saved under drops the question mark part of the
   * address.
   *
   * This matters. The app puts the project and the unit in the address,
   * for example unit.html?p=elsliger&u=205. There is only ever one
   * unit.html file. Without this line every unit would miss the saved
   * copy, and the app would fall back to the home screen on site.
   */
  var key = url.origin + url.pathname;

  /*
   * Always ask the network as well, so the next open gets the newest file.
   *
   * The save must be waited for, not fired and forgotten. A Service Worker
   * is shut down as soon as the phone thinks it is finished, and iOS is
   * quick about it. An unwaited cache.put is killed part way through, so
   * the new file never lands and the app stays on the old copy for ever.
   */
  var fresh = fetch(request).then(function (response) {
    if (!response || !response.ok) return response;

    var copy = response.clone();
    return caches.open(CACHE_NAME).then(function (cache) {
      return cache.put(key, copy);
    }).then(function () {
      return response;
    });
  }).catch(function () {
    return null;
  });

  event.waitUntil(fresh);

  event.respondWith(
    caches.match(key).then(function (saved) {

      // A saved copy answers at once. This is what makes the app open
      // with no signal.
      if (saved) return saved;

      return fresh.then(function (response) {
        if (response) return response;

        // No network and no saved copy. Give a page rather than a blank
        // browser error.
        if (request.mode === 'navigate') {
          return caches.match(self.registration.scope + 'index.html').then(function (home) {
            return home || offlinePage();
          });
        }
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});


/** Last resort. Shown only when even the home screen is not saved. */
function offlinePage() {
  var html =
    '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Offline — PFC Control</title></head>' +
    '<body style="margin:0;background:#0D0D0D;color:#fff;font-family:Arial,Helvetica,sans-serif;' +
    'display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center">' +
    '<div style="padding:24px;max-width:300px">' +
    '<h1 style="font-size:18px;margin:0 0 10px">No connection</h1>' +
    '<p style="font-size:14px;line-height:1.5;color:rgba(255,255,255,0.55);margin:0 0 18px">' +
    'PFC Control has no saved copy yet. Open it once with signal, then it works offline.</p>' +
    '<button onclick="location.reload()" style="background:#DE7452;color:#0D0D0D;border:none;' +
    'border-radius:12px;padding:14px 22px;font-size:15px;font-weight:700;font-family:inherit">' +
    'Try again</button></div></body></html>';

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
