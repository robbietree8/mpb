const cases = [
    {
        regex: /https:\/\/connect.garmin.cn\/modern\/activity\/\d+/,
        files: ["./inject/activity.js"],
        world: "ISOLATED"
    },
    {
        regex: /https:\/\/connect.garmin.cn\/modern\/activities.*/,
        files: ["./inject/activities.js"],
        world: "ISOLATED"
    },
    {
        regex: /https:\/\/connect.garmin.cn\/modern\/workout\/\d+\?workoutType=running/,
        files: ["./inject/workout.js"],
        world: "MAIN"
    },
]

chrome.tabs.onUpdated.addListener((id, info, tab) => {
    if (info.status === 'complete') {
        const found = cases.findIndex(({ regex }) => regex.test(tab.url));
        if (found >= 0) {
            const { files, world } = cases[found];
            chrome.scripting.executeScript({
                target: { tabId: id },
                files,
                world
            }).then(console.log);
        }
    }
});