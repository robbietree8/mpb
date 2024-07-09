async function splits(aid) {
    return await jsonGet(
        `/activity-service/activity/${aid}/splits?_=${Date.now()}`,
        `https://connect.garmin.cn/modern/activity/${aid}`
    );
}

async function typedSplits(aid) {
    return await jsonGet(
        `/activity-service/activity/${aid}/typedsplits?_=${Date.now()}`,
        `https://connect.garmin.cn/modern/activity/${aid}`
    );
}

async function jsonGet(url, referrer) {
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
    return response.json();
}

function accessToken() {
    return JSON.parse(localStorage.token).access_token;
}

function bustValue() {
    return URL_BUST_VALUE;
}
