import Plotly from 'plotly.js-dist-min'

chrome.storage.session.get(null, ({ activities: a }) => refresh(a));
chrome.storage.session.onChanged.addListener(({ activities: a }) => refresh(a.newValue));

function refresh(activities) {
    const pace = v => {
        if (!v) return "--";
        const sec = Math.round(1000 / v);
        const d = new Date(new Date().toLocaleDateString()).setSeconds(sec);
        return new Date(d).toLocaleTimeString();
    }
    const format = v => `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;

    const values = [
        ({ startTimeLocal: v }) => format(new Date(v)),
        ({ averageHR: v }) => v,
        ({ averageSpeed: v }) => pace(v),
        ({ avgGradeAdjustedSpeed: v }) => pace(v),
        ({ averageSpeed: s, avgGradeAdjustedSpeed: a }) => ((a ? a : s) * 60).toFixed(2),
        ({ averageSpeed: s, avgGradeAdjustedSpeed: a, averageHR: h }) => (((a ? a : s) * 60) / h).toFixed(3),
    ].map(f => activities.map(f));

    const dataTable = {
        type: 'table',
        header: {
            values: [["<b>DATE</b>"], ["<b>HR</b>"], ["<b>Pace</b>"], ["<b>GAP</b>"], ["<b>Speed.mpm</b>"], ["<b>Pref.mpb</b>"]],
            align: "center",
            line: { width: 1, color: 'black' },
            fill: { color: "grey" },
            font: { family: "Arial", size: 12, color: "white" }
        },
        cells: {
            values: values,
            align: "center",
            line: { color: "black", width: 1 },
            font: { family: "Arial", size: 11, color: ["black"] }
        }
    }

    const config = { responsive: true };
    Plotly.newPlot("dt", [dataTable], { title: "Perf of Running" }, config);

    const perfTrace = {
        x: values[0].toReversed(),
        y: values[5].toReversed(),
        mode: 'lines+markers',
        type: "scatter"
    };
    Plotly.newPlot("pt", [perfTrace], { title: "Perf Trace" }, config);
}

function debug(data) {
    const e = document.createElement("pre");
    e.innerText = JSON.stringify(data, null, 2);
    document.querySelector("#dt").appendChild(e);
}
