let deferredPrompt;
let enableNotificationButtons = document.querySelectorAll(
  ".enable-notifications"
);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  console.log("Deferring Prompt");
  deferredPrompt = e;
  return false;
});

function configurePushSub() {
  let swReg;
  navigator.serviceWorker.ready
    .then((sw) => {
      swReg = sw;
      return sw.pushManager.getSubscription();
    })
    .then((sub) => {
      if (sub == null) {
        // Create new subscription
        swReg.pushManager.subscribe({
          userVisibleOnly:true,
        })
      } else {
        //
      }
    });
}

if ("Notification" in window && "serviceWorker" in navigator) {
  for (let i = 0; i < enableNotificationButtons.length; i++) {
    enableNotificationButtons[i].style.display = "inline-block";
    enableNotificationButtons[i].addEventListener("click", () => {
      Notification.requestPermission().then((result) => {
        if (result == "granted") {
          configurePushSub();
        }
      });
    });
  }
}
