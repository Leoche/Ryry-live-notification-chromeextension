const ENDPOINT = "https://www.youtube.com/embed/live_stream?channel=";
const CHANNEL_ID = "UCTI0uTrhBxjRiUDdJJIhmGw";
const CHANNEL_URL = "https://www.youtube.com/channel/" + CHANNEL_ID + "/live";
const NOTIFICATION_ID = "RYRY_NOTIFICATION_" + chrome.runtime.id.toUpperCase();
const STORAGE_ID = "RYRY_STORAGE" + chrome.runtime.id.toUpperCase();
const DARK_MODE =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

async function checkLive() {
  let response = await fetch(ENDPOINT + CHANNEL_ID);
  if (response.status === 200) {
    let data = await response.text();
    return data.indexOf("canonical") !== -1;
  }
  return false;
}

function localStoreGet(cb) {
  chrome.storage.local.get("STORAGE_ID", function (result) {
    if (result.STORAGE_ID != true && result.STORAGE_ID != false) {
      result.STORAGE_ID = false;
    }
    cb(result.STORAGE_ID);
  });
}
function localStoreSet(value) {
  chrome.storage.local.set({ "STORAGE_ID": value });
}

function notify() {
  chrome.notifications.create(NOTIFICATION_ID, {
    type: "basic",
    iconUrl: DARK_MODE ? "images/logo_dark.png" : "images/logo_white.png",
    title: "Ryu7z est en LIVE!",
    message: "Cliquez ici pour regarder le live.",
    priority: 2,
  });
}

chrome.notifications.onClicked.addListener(function (notificationId) {
  if (notificationId === NOTIFICATION_ID) {
    chrome.notifications.clear(NOTIFICATION_ID);
    chrome.tabs.create({ url: CHANNEL_URL });
  }
});

function run() {
  let isLiveStored = null;
  console.log("R is running")
  localStoreGet(function (result) {
    isLiveStored = result;
    console.log("isLiveStored = " + isLiveStored)
  });
  checkLive().then((isLive) => {
    console.log("isLive = " + isLiveStored)
    if (isLive && !isLiveStored) {
        console.log("need to notify ...")
      notify();
    }
    localStoreSet(isLive);
  });
}

chrome.alarms.create(NOTIFICATION_ID, {delayInMinutes: 1, periodInMinutes: 5});
chrome.alarms.onAlarm.addListener(function( alarm ) {
  run();
});
run();