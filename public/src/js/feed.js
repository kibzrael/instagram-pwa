var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");

let url = "https://pwagram-4199d-default-rtdb.firebaseio.com/posts.json";

function openCreatePostModal() {
  createPostArea.style.display = "block";
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
  createPostArea.style.display = "none";
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
  for (let i = 0; i < data.length; i++) {
    if (data[i]) {
      createCard(data[i]);
    }
  }
}

let networkData = false;

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

if ("caches" in window) {
  caches
    .match(url)
    .then((response) => {
      if (response) {
        return response.json();
      }
    })
    .then((data) => {
      if (!networkData) createCard();
    });
}
