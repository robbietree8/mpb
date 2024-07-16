export function onMutated({ predicate, callback }) {
    return (mutations, observer) => {
        if (mutations.some(predicate)) {
            callback();
        }
    };
}

export function observe(target, callback) {
    function node(value) {
        if (value instanceof Node) return value;
        console.assert(typeof value === 'string', `Unsupported node ${value}`)
        return document.querySelector(value);
    };
    new MutationObserver(callback).observe(node(target),
        { childList: true, subtree: true }
    );
}