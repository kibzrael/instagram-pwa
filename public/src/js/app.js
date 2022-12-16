let deferredPrompt;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  console.log("Deferring Prompt");
  deferredPrompt = e;
  return false;
});
