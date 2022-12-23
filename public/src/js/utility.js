let dbPromise = idb.open("posts-store", 1, (db) => {
  if (!db.objectStoreNames.contains("posts")) {
    db.createObjectStore("posts", { keyPath: "id" });
  }
  if (!db.objectStoreNames.contains("sync-posts")) {
    db.createObjectStore("sync-posts", { keyPath: "id" });
  }
});

function createPost(data) {
  return fetch("https://pwagram-4199d-default-rtdb.firebaseio.com/posts.json", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }).catch((error) => {
    console.log(error);
  });
}

function writeData(st, data) {
  return dbPromise.then((db) => {
    let transaction = db.transaction(st, "readwrite");
    let store = transaction.objectStore(st);
    store.put(data);
    return transaction.complete;
  });
}

function readAllData(st) {
  return dbPromise.then((db) => {
    let transaction = db.transaction(st, "readonly");
    let store = transaction.objectStore(st);
    return store.getAll();
  });
}

function clearAllData(st) {
  return dbPromise.then((db) => {
    let transaction = db.transaction(st, "readwrite");
    let store = transaction.objectStore(st);
    store.clear();
    return transaction.complete;
  });
}

function deleteDataItem(st, id) {
  return dbPromise.then((db) => {
    let transaction = db.transaction(st, "readwrite");
    let store = transaction.objectStore(st);
    store.delete(id);
    return transaction.complete;
  });
}

function dataURItoBlob(dataURI) {
  var byteString = atob(dataURI.split(",")[1]);
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  var blob = new Blob([ab], { type: mimeString });
  return blob;
}
