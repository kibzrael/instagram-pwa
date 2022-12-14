importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

let staticCache = "static-v8";
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
  let url = "https://pwagram-4199d-default-rtdb.firebaseio.com/posts.json";
  if (e.request.url.indexOf(url) > -1) {
    // Cache then Network
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          let posts = res.clone();
          clearAllData("posts")
            .then(() => {
              return posts.json();
            })
            .then((data) => {
              for (let key in data) {
                writeData("posts", data[key]);
              }
            });
          return res;
        })
        .catch((error) => {
          return null;
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

self.addEventListener("sync", (e) => {
  console.log("Syncing...", e);

  if (e.tag == "create-post") {
    console.log("Syncing Posts");
    e.waitUntil(
      readAllData("sync-posts").then((data) => {
        for (let post of data) {
          createPost(post).then((res) => {
            console.log("Shared Post", res);
            if (res.ok) {
              deleteDataItem("sync-posts", post.id);
            }
          });
        }
      })
    );
  }
});

self.addEventListener("notificationclick", (e) => {
  let notification = e.notification;
  let action = e.action;
  console.log(notification);
  if (action == "confirm") {
    console.log(action);
  } else {
    console.log(action);
  }
  e.waitUntil(
    clients.matchAll().then((cls) => {
      let client = cls.find((c) => c.visibilityState === "visible");
      if (client) {
        client.navigate("/help");
        client.focus();
      } else {
        clients.openWindow("/help");
      }
    })
  );
  notification.close();
});

self.addEventListener("notificationclose", (e) => {
  console.log("Closed: ", e);
});

self.addEventListener("push", (e) => {
  let data;
  if (e.data) {
    data = Json.parse(e.data.text());
    let options = {
      body: data.content,
      icon: "/src/images/icons/app-icon-96x96.png",
      badge: "/src/images/icons/app-icon-96x96.png",
      image: "/src/images/sf-boat.jpg",
      data: {
        url: "/",
      },
    };
    e.waitUntil(self.registration.showNotification(data.title, options));
  }
});
