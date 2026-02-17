const CACHE_NAME = 'stats-hub-v1';
const ASSETS = [
  './stats_hub.html',
  './index.html',
  './scripts/stats_hub.js',
  './styles/stats_hub.css',
  './manifest.json',
  './fonts/space-mono-400.woff2',
  './fonts/space-mono-700.woff2',
  './fonts/instrument-serif-400.woff2',
  './fonts/instrument-serif-400-italic.woff2',
  './fonts/dm-sans-300.woff2',
  './fonts/dm-sans-400.woff2',
  './fonts/dm-sans-500.woff2',
  './fonts/dm-sans-600.woff2',
  './fonts/dm-sans-700.woff2'
];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE_NAME).then(function(c){return c.addAll(ASSETS);}));
});

self.addEventListener('fetch', function(e){
  e.respondWith(
    caches.match(e.request).then(function(r){
      return r || fetch(e.request);
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k !== CACHE_NAME;}).map(function(k){return caches.delete(k);}));
    })
  );
});
