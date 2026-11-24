const VER = 'space-v1';
const CORE = ['./', 'index.html', 'app.html', 'frame.html', 'privacy.html', 'app.webmanifest', 'preview.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VER).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== VER; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var u = new URL(e.request.url);
  var cdn = (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com' || u.hostname === 'cdnjs.cloudflare.com' || u.hostname === 'cdn.jsdelivr.net');
  if (u.origin !== location.origin && !cdn) return;
  if (cdn) {
    e.respondWith(
      caches.open(VER).then(function (c) {
        return c.match(e.request).then(function (hit) {
          var net = fetch(e.request).then(function (res) { try { c.put(e.request, res.clone()); } catch (err) {} return res; }).catch(function () { return hit; });
          return hit || net;
        });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).then(function (res) {
        if (res.ok && u.origin === location.origin) {
          var copy = res.clone();
          caches.open(VER).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      });
    })
  );
});
