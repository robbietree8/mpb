import Plotly from 'plotly.js-dist-min'

export { Plotly };

export function pace(v) {
    if (!v) return "--";
    const sec = Math.round(1000 / v);
    const m = String(Math.trunc(sec / 60)).padStart(2, 0);
    const s = String(sec % 60).padStart(2, 0);
    return `${m}:${s}`;
}

export function mpm(p, s) { return (p ? p : s) * 60; }

export function mpb(record) {
    const { averageSpeed: s, avgGradeAdjustedSpeed: a, averageHR: h } = record;
    return mpm(a, s) / h;
}

export function debug(container, data) {
    const e = document.createElement("pre");
    e.innerText = JSON.stringify(data, null, 2);
    container.appendChild(e);
}

export function date(v) { return new Date(v).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }); }
