importScripts('/js/moment-with-locales.js');
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

moment.locale('id');
const now = moment().format('LTS');
const CACHE_NAME = `pwa-${now}`;

const urlsToCache = [
    "/",
    "/nav.html",
    "/index.html",
    "/detail.html",
    "/manifest.json",

    "/pages/about.html",
    "/pages/favorite.html",
    "/pages/home.html",

    "/css/fontawesome-free/css/all.min.css",
    "/css/font-google.css",
    "/css/materialize.min.css",
    "/css/materialize-icon.css",
    "/css/lazyload.css",
    "/css/style.css",
    "/css/woff2/materialize-icon.woff2",

    "/js/api.js",
    "/js/db.js",
    "/js/helper.js",
    "/js/idb.js",
    "/js/jquery-3.5.1.js",
    "/js/jquery-3.5.1.min.js",
    "/js/main.js",
    "/js/materialize.min.js",
    "/js/moment-with-locales.js",
    "/js/snarkdown.umd.js",
    
    
    "/img/icon.png",
    "/img/icon-72x72.png",
    "/img/icon-96x96.png",
    "/img/icon-128x128.png",
    "/img/icon-144x144.png",
    "/img/icon-152x152.png",
    "/img/icon-192x192.png",
    "/img/icon-384x384.png",
    "/img/icon-512x512.png",
    "/img/me.jpg",
    "/img/moonsleep.jpg",
    "/img/foot-ball.jpg",

    "/sw.js",
];

self.addEventListener("install", event => {
    //console.log('install sw');
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});
self.addEventListener("fetch", function(event) {
    const corsProx = '';//'https://cors-anywhere.herokuapp.com/';
    const targetUrl = "https://api.football-data.org/v2/";
    const base_url = `${corsProx}${targetUrl}`;
    if (event.request.url.indexOf(base_url) > -1) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache)=> {
                return fetch(event.request).then((response)=> {
                    cache.put(event.request.url, response.clone());
                    console.log('put into cache',event.request.url,response.clone());
                    return response;
                })
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request,{ ignoreSearch: true })
            .then(function(response) {
            return response || fetch (event.request);
            })
        )
    }
});
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
        return Promise.all(
            cacheNames.map(function(cacheName) {
                //console.log(cacheName,CACHE_NAME);
                if (cacheName != CACHE_NAME) {
                    console.log("ServiceWorker: cache " + cacheName + " dihapus");
                    return caches.delete(cacheName);
                }
            })
        );
        })
    );
});
self.addEventListener('push', function(event) {
    let title = "Push Notification",
    body = 'Push message no payload',
    icon = '/img/icon.png',
    image = '',
    tag = 'tag-1';
    
    if (event.data) {
        title = event.data.json().title;
        body = event.data.json().body;
        tag = event.data.json().tag || tag;
        image = event.data.json().image || image;
    }
    var options = {
        body: body,
        tag: tag,
        icon: icon,
        badge:icon,
        image: image,
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});