import Plotly from 'plotly.js-dist-min'

chrome.storage.session.get(null, ({ activities: a }) => refresh(a));
chrome.storage.session.onChanged.addListener(({ activities: a }) => refresh(a.newValue));

function refresh(activities) {
    const container = document.querySelector("#plots");
    container.replaceChildren();
    [
        [lapBoxes(activities), { title: "Running Performance Distribution", showlegend: false, height: 350 }],
        [lapScatters(activities), { title: "Running Performance Trend", height: 350 }],
        // [summaries(activities), { title: "Perf of Running" }],
    ].forEach(([data, layout]) => plot(container, data, layout));
}

function plot(container, data, layout) {
    const div = document.createElement("div");
    Plotly.newPlot(div, data, layout, { responsive: true });
    container.appendChild(div);
}

function lapBoxes(activities) {
    const trace = {
        y: activities.map(mpb),
        x: activities.map(({ startTimeLocal: v }) => date(v)),
        type: "scatter",
        mode: "lines",
        name: "Trace"
    };
    return activities.map(({ startTimeLocal: v, laps }) => {
        return {
            y: laps.map(mpb).toSorted((a, b) => a - b),
            hoverinfo: "y",
            width: 0.2,
            type: "box",
            name: date(v)
        }
    }).toReversed().concat(trace);
}

function lapScatters(activities) {
    return activities.map(({ startTimeLocal: v, laps }) => {
        const detail = ({
            averageHR: h,
            averageRunCadence: c,
            averageSpeed: s,
            avgGradeAdjustedSpeed: a,
            distance: d
        }) => [h, c.toFixed(1), pace(s), pace(a), Math.round(d)].join("|")
        return {
            y: laps.map(mpb),
            x: laps.map(l => l.lapIndex),
            hovertext: laps.map(detail),
            hoverinfo: "y+text",
            mode: "lines+markers",
            name: date(v)
        }
    }).toReversed();
}

function summaries(activities) {
    return {
        type: 'table',
        header: {
            values: [
                ["<b>DATE</b>"],
                ["<b>HR</b>"],
                ["<b>Cadence</b>"],
                ["<b>Pace</b>"],
                ["<b>GAP</b>"],
                ["<b>Speed.mpm</b>"],
                ["<b>Pref.mpb</b>"],
            ],
            align: "center",
            line: { width: 1, color: 'black' },
            fill: { color: "grey" },
            font: { family: "Arial", size: 12, color: "white" }
        },
        cells: {
            values: [
                ({ startTimeLocal: v }) => date(v),
                ({ averageHR: v }) => v,
                ({ averageRunCadence: v }) => v,
                ({ averageSpeed: v }) => pace(v),
                ({ avgGradeAdjustedSpeed: v }) => pace(v),
                ({ averageSpeed: s, avgGradeAdjustedSpeed: a }) => mpm(a, s),
                mpb,
            ].map(f => activities.map(f)),
            format: [
                "",
                "",
                ".1f",
                "",
                "",
                ".2f",
                ".3f",
            ],
            align: "center",
            line: { color: "black", width: 1 },
            font: { family: "Arial", size: 11, color: ["black"] }
        }
    };
}

function pace(v) {
    if (!v) return "--";
    const sec = Math.round(1000 / v);
    const d = new Date(new Date().toLocaleDateString()).setSeconds(sec);
    return new Date(d).toLocaleTimeString();
}
function date(v) { return new Date(v).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }); }

function mpm(p, s) { return (p ? p : s) * 60; }

function mpb(record) {
    const { averageSpeed: s, avgGradeAdjustedSpeed: a, averageHR: h } = record;
    return mpm(a, s) / h;
}

function debug(data) {
    const e = document.createElement("pre");
    e.innerText = JSON.stringify(data, null, 2);
    document.querySelector("#summaries").appendChild(e);
}
