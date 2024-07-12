
const callback = onActivityMutated(ids => {
    const send = m => window.postMessage({ mbp: { activities: m } })
    Promise.all(ids.map(activeSplit)).then(send, console.error);
});

new MutationObserver(callback).observe(
    document.querySelector("div.main-body"),
    { childList: true, subtree: true }
);

async function activeSplit(id) {
    const isType = t => ({ type }) => type === t;
    const referrer = `https://connect.garmin.cn/modern/activity/${id}`;
    const activity = api => `/activity-service/activity/${id}/${api}?_=${Date.now()}`

    const { splits } = await get(activity("typedsplits"), referrer);
    const { lapIndexes: idxs = [], ...split } = splits.find(isType("INTERVAL_ACTIVE"));

    const { lapDTOs: laps } = await get(activity("splits"), referrer);
    split.laps = idxs.length > 0 ? laps.slice(idxs[0] - 1, idxs.at(-1)) : laps;
    return split;
}

function onActivityMutated(callback) {
    const className = pred => ([e]) => e && e.className && pred(e.className);
    const activityIn = className(s => s.startsWith("list-item"));
    const id = ({ href }) => href.split("/").at(-1);
    return (mutations, observer) => {
        const pred = ({ addedNodes: a, removedNodes: r }) => activityIn(a) || activityIn(r)
        const mutated = mutations.findIndex(pred) != -1;

        if (mutated) {
            const [...nodes] = document.querySelectorAll("a.inline-edit-target");
            callback(nodes.map(id));
        }
    };
}

async function get(url, referrer) {
    const accessToken = () => JSON.parse(localStorage.token).access_token;
    const bustValue = () => URL_BUST_VALUE;

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