let dbPromise = idb.open("posts-store", 1, (db) => {
  if (!db.objectStoreNames.contains("posts")) {
    db.createObjectStore("posts", { keyPath: "id" });
  }
  if (!db.objectStoreNames.contains("sync-post")) {
    db.createObjectStore("sync-post", { keyPath: "id" });
  }
});

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

async function createPost(data) {
  let response = await fetch(
    "https://pwagram-4199d-default-rtdb.firebaseio.com/posts.json",
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  console.log("Shared Post", response);
}