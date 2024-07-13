const GARMIN_ACTIVITIES = "https://connect.garmin.cn/modern/activities";
const GARMIN_WORKOUT = "https://connect.garmin.cn/modern/workout/";

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {

    if (!tab.url) return;
    // TODO tab.url.startsWith(GARMIN_ACTIVITIES) ||
    if (tab.url.startsWith(GARMIN_WORKOUT)) {
        await chrome.sidePanel.setOptions({
            tabId,
            path: "side/index.html",
            enabled: true
        });
    } else {
        await chrome.sidePanel.setOptions({
            tabId,
            enabled: false
        });
    }
});

chrome.runtime.onMessage.addListener((message) => {
    chrome.storage.session.set(message);
});
