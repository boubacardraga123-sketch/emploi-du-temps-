// ══ GestionEDT SW — GitHub Pages ══
const CACHE = 'gestion-edt-v1';
const SCOPE = '/emploi-du-temps-/';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.add(SCOPE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (url.includes('firebase') || url.includes('googleapis') || url.includes('gstatic')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', {status: 503})));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          caches.open(CACHE).then(c => c.put(e.request, resp.clone()));
        }
        return resp;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
