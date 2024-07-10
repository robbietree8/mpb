window.addEventListener("message", (event) => {
    // We only accept messages from ourselves
    if (event.source !== window) {
        return;
    }

    if (event.data.mbp) {
        console.log("Content script received: " + event.data);
        chrome.runtime.sendMessage(event.data.mbp);        
    }
}, false);

console.log("Poster is ready!");