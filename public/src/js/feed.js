var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
var postForm = document.querySelector("#form");
var videoPlayer = document.querySelector("#player");
var canvas = document.querySelector("#canvas");
var captureButton = document.querySelector("#capture-btn");
var locationInput = document.querySelector("#location");
var locationButton = document.querySelector("#location-btn");
var locationLoader = document.querySelector("#location-loader");

let url = "https://pwagram-4199d-default-rtdb.firebaseio.com/posts.json";

function initializeMedia() {
  // Polyfills
  if (!("mediaDevices" in navigator)) {
    navigator.mediaDevices = {};
  }
  if (!("getUserMedia" in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      let getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!getUserMedia) {
        return Promise.reject(new Error("getUserMedia is not implemented"));
      }
      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = "block";
    })
    .catch((error) => {
      captureButton.style.display = "none";
    });
}

captureButton.addEventListener("click", (event) => {
  videoPlayer.style.display = "none";
  canvas.style.display = "block";
  captureButton.style.display = "none";
  let context = canvas.getContext("2d");
  context.drawImage(
    videoPlayer,
    0,
    0,
    canvas.width,
    videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width)
  );
  stopVideo();
  let picture = dataURItoBlob(canvas.toDataURL());
});

locationButton.addEventListener("click", (event) => {
  locationButton.style.display = "none";
  locationLoader.style.display = "initial";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      locationButton.style.display = "initial";
      locationLoader.style.display = "none";
      let location = position.coords.latitude;
      //TODO: use google's geolocation API
      locationInput.value = "In Nairobi";
    },
    (error) => {
      locationButton.style.display = "initial";
      locationLoader.style.display = "none";
    },
    { timeout: 7000 }
  );
});

function initializeLocation() {
  if (!("geolocation" in navigator)) {
    locationButton.style.display = "none";
  }
}

function stopVideo() {
  videoPlayer.srcObject.getVideoTracks().forEach((track) => {
    track.stop();
  });
}

function openCreatePostModal() {
  createPostArea.style.display = "block";
  captureButton.style.display = "initial";
  videoPlayer.style.display = "none";
  canvas.style.display = "none";
  setTimeout(() => {
    createPostArea.style.transform = "translateY(0)";
    initializeLocation();
    initializeMedia();
  }, 1);
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((result) => {
      console.log(result);
      if (result.outcome == "dismissed") {
        console.log("User dismissed Prompt");
      } else {
        console.log("User installed Prompt");
      }
    });
    deferredPrompt = null;
  }
  // // Unregister
  // if('serviceWorker' in navigator){
  //   navigator.serviceWorker.getRegistrations().then(reg=>{
  //     for(let i=0;i<reg.length;i++){
  //       reg[i].unregister();
  //     }
  //   })
  // }
}

function closeCreatePostModal() {
  stopVideo();
  createPostArea.style.transform = "translateY(100vh)";
  navigator.serviceWorker.ready.then((sw) => {
    sw.showNotification("Succesfully Created a post.", {
      body: "The post will be shared with other users of the app.",
      icon: "/src/images/icons/app-icon-96x96.png",
      badge: "/src/images/icons/app-icon-96x96.png",
      image: "/src/images/sf-boat.jpg",
      tag: "Confirm Notification",
      renotify: true,
      actions: [
        {
          action: "confirm",
          title: "Okay",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
        {
          action: "cancel",
          title: "Cancel",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
      ],
    });
  });
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

async function onSave(data) {
  if ("caches" in window) {
    let cache = await caches.open("saved");
    cache.addAll([url, data.image]);
  }
}

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = 'url("' + data.image + '")';
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.title;
  cardTitleTextElement.style.color = "white";
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = "center";
  cardWrapper.appendChild(cardSupportingText);
  var cardSaveButton = document.createElement("button");
  cardSaveButton.className = "save-button";
  cardSaveButton.textContent = "Save";
  cardSaveButton.addEventListener("click", () => onSave(data));
  cardSupportingText.appendChild(cardSaveButton);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  for (key in data) {
    if (data[key]) {
      createCard(data[key]);
    }
  }
}

let networkData = false;

function fetchData() {
  fetch(url)
    .then(function (res) {
      console.log(res);
      return res.json();
    })
    .catch((e) => {})
    .then((data) => {
      console.log(data);
      if (data) {
        networkData = true;
        clearCards();
        updateUI(data);
      }
    });
}
fetchData();

if ("indexedDB" in window) {
  readAllData("posts").then((data) => {
    if (!networkData) updateUI(data);
  });
}

postForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let title = postForm["title"].value.trim();
  let location = postForm["location"].value.trim();
  if ([title, location].includes("")) return;
  closeCreatePostModal();
  let post = {
    id: new Date().toISOString(),
    title: title,
    location: location,
    image:
      "https://firebasestorage.googleapis.com/v0/b/pwagram-4199d.appspot.com/o/sf-boat.jpg?alt=media&token=d78ca2b8-d17a-4d6a-b442-da6e441d31a2",
  };
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then((sw) => {
      console.log("Post:", post);
      writeData("sync-posts", post)
        .then(() => {
          return sw.sync.register("create-post");
        })
        .then(() => {
          let snackbar = document.querySelector("#confirmation-toast");
          snackbar.MaterialSnackbar.showSnackbar({
            message: "Your Post has been shared",
          });
        })
        .catch((error) => {
          console.log(error);
        });
    });
  } else {
    createPost(post).then(() => {
      fetchData();
    });
  }
});
