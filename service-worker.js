var cacheName = 'weatherPWA-v1.9.0';
var filesToCache = [
    '/weatherPWAMine/',
    '/weatherPWAMine/index.html',
    '/weatherPWAMine/js/app.js',
    '/weatherPWAMine/manifest.json',
    '/weatherPWAMine/js/localforage.js',
    '/weatherPWAMine/images/clear.png',
    '/weatherPWAMine/images/cloudy-scattered-showers.png',
    '/weatherPWAMine/images/cloudy.png',
    '/weatherPWAMine/images/cloudy_s_sunny.png',
    '/weatherPWAMine/images/partly-cloudy.png',
    '/weatherPWAMine/images/rain.png',
    '/weatherPWAMine/images/wind.png',
    '/weatherPWAMine/images/sleet.png',
    '/weatherPWAMine/favicon.ico'
];

self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        })
    )
});
self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('fetch', function(e) {
    console.log('[ServiceWorker] Fetch', e.request.url);
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );
});

