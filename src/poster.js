window.addEventListener("message", (event) => {
    if (event.source !== window) {
        return;
    }

    if (event.data.mbp) {
        chrome.runtime.sendMessage(event.data.mbp);
    }
}, false);
