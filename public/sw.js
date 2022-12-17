let staticCache = "static-v1";
let dynamicCache = "dynamic";
let staticFiles = [
  "/",
  "/offline",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/material.min.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "/src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
];

// async function trimCache(name, maxItems) {
//   let cache = await caches.open(name);
//   let keys = await cache.keys();
//   if (keys.length > maxItems) {
//     await cache.delete(keys[0]);
//     trimCache(name, maxItems);
//   }
// }

self.addEventListener("install", async (e) => {
  e.waitUntil(
    caches.open(staticCache).then((cache) => {
      cache.addAll(staticFiles);
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

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) {
    console.log("matched ", string);
    cachePath = string.substring(self.origin.length);
  } else {
    cachePath = string;
  }
  return array.indexOf(cachePath) > -1;
}

self.addEventListener("fetch", (e) => {
  // let url = "https://pwagram-4199d-default-rtdb.firebaseio.com/posts.json";
  if (e.request.url.indexOf(url) > -1) {
    // Cache then Network
    e.respondWith(
      caches.open(dynamicCache).then((cache) => {
        return fetch(e.request).then((res) => {
          //   trimCache(dynamicCache, 5);
          cache.put(e.request, res.clone());
          return res;
        });
      })
    );
  } else if (isInArray(e.request.url, staticFiles)) {
    // cache only
    e.respondWith(caches.match(e.request));
  } else {
    // Cache with Network Fallback
    e.respondWith(
      caches.match(e.request).then(async (response) => {
        if (response) {
          return response;
        } else {
          let res = await fetch(e.request).catch(async (error) => {
            let statCache = await caches.open(staticCache);
            if (e.request.headers.get("accept").includes("text/html")) {
              return statCache.match("/offline");
            }
          });
          let cache = await caches.open(dynamicCache);
          //   trimCache(dynamicCache, 5);
          cache.put(e.request.url, res.clone());
          return res;
        }
      })
    );
  }
});
