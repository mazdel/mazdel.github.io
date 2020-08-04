importScripts('/js/moment-with-locales.js');
self.importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

if(workbox){
    console.log('workbox dimuat');
}else{
    console.log('workbox gagal dimuat');
}

moment.locale('id');
const now = moment().format('LTS');
const CACHE_NAME = `${now}`;
const revision = 1;
const urlsToCache = 
[
    "/",
    "/index.html",
    "/detail.html",
    {url :"/nav.html", revision : revision },
    {url :"/manifest.json", revision : revision },

    {url :"/pages/about.html", revision : revision },
    {url :"/pages/favorite.html", revision : revision },
    {url :"/pages/home.html", revision : revision },

    {url :"/css/fontawesome-free/css/all.min.css", revision : revision },
    {url :"/css/font-google.css", revision : revision },
    {url :"/css/materialize.min.css", revision : revision },
    {url :"/css/materialize-icon.css", revision : revision },
    {url :"/css/lazyload.css", revision : revision },
    {url :"/css/style.css", revision : revision },
    {url :"/css/woff2/materialize-icon.woff2", revision : revision },

    {url :"/js/api.js", revision : revision },
    {url :"/js/db.js", revision : revision },
    {url :"/js/helper.js", revision : revision },
    {url :"/js/idb.js", revision : revision },
    {url :"/js/jquery-3.5.1.js", revision : revision },
    {url :"/js/jquery-3.5.1.min.js", revision : revision },
    {url :"/js/main.js", revision : revision },
    {url :"/js/materialize.min.js", revision : revision },
    {url :"/js/moment-with-locales.js", revision : revision },
    {url :"/js/snarkdown.umd.js", revision : revision },
    
    {url :"/img/icon.png", revision : revision },
    {url :"/img/icon-72x72.png", revision : revision },
    {url :"/img/icon-96x96.png", revision : revision },
    {url :"/img/icon-128x128.png", revision : revision },
    {url :"/img/icon-144x144.png", revision : revision },
    {url :"/img/icon-152x152.png", revision : revision },
    {url :"/img/icon-192x192.png", revision : revision },
    {url :"/img/icon-384x384.png", revision : revision },
    {url :"/img/icon-512x512.png", revision : revision },
    {url :"/img/maskable_icon.png", revision : revision },
    {url :"/img/me.jpg", revision : revision },
    {url :"/img/moonsleep.jpg", revision : revision },
    {url :"/img/foot-ball.jpg", revision : revision },

    {url :"/service-worker.js", revision : revision }
];

//pengaturan untuk precache
const precacheOptions = {
    // Ignore all URL parameters.
    ignoreURLParametersMatching: [/.*/],
}
//deklarasi variabel API
const corsProx = '';//'https://cors-anywhere.herokuapp.com/';
const targetUrl = "https://api.football-data.org/v2/";
const base_url = `${corsProx}${targetUrl}`;

//console.log(workbox);

//callback untuk memisahkan cache dari hasil fetch yang dilakukan aplikasi
const matchFB = ({url,request,event})=>{
    return `${url.origin}/${url.pathname.split('/')[1]}/` === base_url;
}
const notMatchFB = ({url,request,event})=>{
    return `${url.origin}/${url.pathname.split('/')[1]}/` !== base_url;
}
const matchDetail = ({url,request,event})=>{    
    return `${url.host}` === self.location.host;
}
//mulai men-cache aplikasi
workbox.precaching.precacheAndRoute(urlsToCache,);

//pemisahan cache dan membuat strategi cache
workbox.routing.registerRoute(
    matchFB,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName : "api"
    })
);
workbox.routing.registerRoute(
    matchDetail,
    new workbox.strategies.CacheFirst({
        cacheName : "selfCrawl"
    })
);
workbox.routing.registerRoute(
    notMatchFB,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName : "other"
    })
);


//fungsi untuk menunggu pesan pushh dari server FCM
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