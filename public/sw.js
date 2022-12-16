let staticCache = "static-v4";
let dynamicCache = "dynamic";

self.addEventListener("install", async (e) => {
  e.waitUntil(
    caches.open(staticCache).then((cache) => {
      cache.addAll([
        "/",
        "/src/js/app.js",
        "/src/js/feed.js",
        "/src/js/material.min.js",
        "/src/css/app.css",
        "/src/css/feed.css",
        "/src/images/main-image.jpg",
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
      ]);
    })
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (![staticCache, dynamicCache].includes(key)) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(async (response) => {
      if (response) {
        return response;
      } else {
        let res = await fetch(e.request).catch((e) => {});
        let cache = await caches.open(dynamicCache);
        cache.put(e.request.url, res.clone());
        return res;
      }
    })
  );
});
