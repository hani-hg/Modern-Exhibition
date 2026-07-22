// sw.js - Service Worker للتخزين المؤقت

const CACHE_NAME = 'modern-exhibition-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/CSS/style.css',
    '/js/app.js',
    '/js/firebase-config.js',
    '/js/toast.js',
    '/js/modal.js',
    '/js/slider.js',
    '/favicon.svg',
    '/manifest.json'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Cache opened');
                return cache.addAll(urlsToCache);
            })
    );
});

// استرجاع الملفات من الكاش
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// تحديث الكاش
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});