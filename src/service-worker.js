const GARMIN_ACTIVITIES = 'https://connect.garmin.cn/modern/activities';

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    console.log(`!!! ${tab.url}`);
    if (!tab.url) return;
    if (tab.url.startsWith(GARMIN_ACTIVITIES)) {
        await chrome.sidePanel.setOptions({
            tabId,
            path: 'index.html',
            enabled: true
        });
    } else {
        await chrome.sidePanel.setOptions({
            tabId,
            enabled: false
        });
    }
});
