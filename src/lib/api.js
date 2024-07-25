export async function splits(activityId) {
    return await api({
        url: `${baseUrl}/activity-service/activity/${activityId}/splits?_=${Date.now()}`,
        referrer: `https://connect.garmin.cn/modern/activity/${activityId}`
    });
}

export async function activities(search) {
    function withDefaults(v) {
        const defaultValues = { excludeChildren: false, limit: 20, start: 0, _: Date.now(), activityType: "running" };
        return { ...defaultValues, ...v };
    }
    const ns = normalize(withDefaults(search));
    return await api({
        url: `${baseUrl}/activitylist-service/activities/search/activities${ns}`,
        referrer: `https://connect.garmin.cn/modern/activities${ns}`
    });
}

export async function exerciseSetsApi(activityId) {
    return await api({
        url: `${baseUrl}/activity-service/activity/${activityId}/exerciseSets?_=${Date.now()}`,
        referrer: `https://connect.garmin.cn/modern/activity/${activityId}`
    });
}

const baseUrl = "https://connect.garmin.cn";

function normalize(search) {
    if (search instanceof Object) {
        const format = v => v instanceof Date ? v.toLocaleDateString("fr-CA") : v
        const ss = Object.entries(search).map(([k, v]) => `${k}=${format(v)}`).join("&");
        return ss.length == 0 ? "" : `?${ss}`;
    }
    throw new Error(`Unexpected search ${search}`);
}


async function api({ method = "GET", url, referrer }) {
    const accessToken = () => JSON.parse(localStorage.token).access_token;
    const bustValue = () => document.querySelector("#garmin-connect-version").innerText;

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
        "method": method,
        "mode": "cors",
        "credentials": "include"
    });
    return response.ok ? response.json() : Promise.reject(new Error(response.status));
}