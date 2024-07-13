import { activities } from "./api";

const callback = onActivityMutated(() => {
    const send = m => window.postMessage({ mbp: { activities: m, page: "activities" } })
    const search = {};
    for ( [k, v] of URL.parse(window.location.href).searchParams.entries()) {
        search[k] = v;
    }
    activities(search).then(send, console.error);
});

// TODO
// new MutationObserver(callback).observe(
//     document.querySelector("div.main-body"),
//     { childList: true, subtree: true }
// );

function onActivityMutated(callback) {
    const className = pred => ([e]) => e && e.className && pred(e.className);
    const activityIn = className(s => s.startsWith("list-item"));
    return (mutations, observer) => {
        const pred = ({ addedNodes: a, removedNodes: r }) => activityIn(a) || activityIn(r)
        const mutated = mutations.findIndex(pred) != -1;
        if (mutated) {
            callback();
        }
    };
}

