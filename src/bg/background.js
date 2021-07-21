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
  chrome.storage.local.get([STORAGE_ID], function (result) {
    if (result.key != true && result.key != false) {
      result.key = false;
    }
    cb(result.key);
  });
}
function localStoreSet(value) {
  chrome.storage.local.set({ STORAGE_ID: value });
}

function notify() {
  chrome.notifications.create(NOTIFICATION_ID, {
    type: "basic",
    iconUrl: DARK_MODE ? "images/logo_dark.png" : "images/logo_white.png",
    title: "Ryu7z est en LIVE!",
    message: "Cliquer ici pour regarder le live.",
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
  localStoreGet(function (result) {
    isLiveStored = result;
  });
  checkLive().then((isLive) => {
    if (isLive && !isLiveStored) {
      notify();
    }
    localStoreSet(isLive);
  });
}

setInterval(run, 60000);
