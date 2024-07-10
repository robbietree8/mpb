async function detail(aid) {
    return await jsonGet(
        `/activity-service/activity/${aid}/splits?_=${Date.now()}`,
        `https://connect.garmin.cn/modern/activity/${aid}`
    );
}

async function summary(aid) {
    return await jsonGet(
        `/activity-service/activity/${aid}/typedsplits?_=${Date.now()}`,
        `https://connect.garmin.cn/modern/activity/${aid}`
    );
}

async function jsonGet(url, referrer) {
    function accessToken() {
        return JSON.parse(localStorage.token).access_token;
    }

    function bustValue() {
        return URL_BUST_VALUE;
    }

    const response = await fetch(url, {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "authorization": `Bearer ${accessToken()}`,
            "di-backend": "connectapi.garmin.cn",
            "nk": "NT",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-app-ver": bustValue(),
            "x-lang": "zh-CN",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrer": referrer,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    return response.ok ? response.json() : Promise.reject(new Error(response.status));
}

function observe(target, callback) {
    const config = { childList: true, subtree: true };
    const hasActivity = function (nodes) {
        return nodes.length > 0
            && nodes[0].className
            && nodes[0].className.startsWith("list-item");
    };

    const observer = new MutationObserver((mutations, observer) => {
        const changed = mutations.findIndex((m) => hasActivity(m.addedNodes) || hasActivity(m.removedNodes)) != -1
        if (changed) callback();
    });
    observer.observe(document.querySelector(target), config);
    return observer;
}

function activities() {
    const links = document.querySelectorAll("a.inline-edit-target");
    return [...links].map(a => a.href.split("/").at(-1));
}


function post() {
    const zip = async (aid) => {
        const s = await summary(aid);
        const { lapDTOs } = await detail(aid);
        const { lapIndexes = [], ...activity } = s.splits.find(({ type }) => type === "INTERVAL_ACTIVE")
        activity.laps = lapIndexes.length > 1 ? lapDTOs.slice(lapIndexes.at(0), lapIndexes.at(-1) + 1) : lapDTOs;
        return activity;
    }
    Promise.all(activities().map(zip))
        .then(
            rs => window.postMessage({ mbp: { activities: rs } }),
            e => console.error(e)
        )
}

observe('div.main-body', post);

console.log("Observer is ready!");
