
import { date, pace, mpb, Plotly } from './mpb'

chrome.storage.session.get(null, render);
// chrome.storage.session.onChanged.addListener(({ page: p, activities: a }) => render({ page: p.newValue, activities: a.newValue }));

function render({ page, activities }) {
    const container = document.querySelector("#plots");
    // container.replaceChildren(); // clean previous plots

    [
        [lapBoxes(activities), { title: "近七日速心比分布对比", showlegend: false, height: 350 }],
        [lapScatters(activities), { title: "近七日速心比趋势对比", height: 350 }],
    ].forEach(([data, layout]) => draw(container, div => Plotly.newPlot(div, data, layout, { responsive: true })));

    // if (page === "activities") {
    //     draw(container, div => {
    //         const layout = { title: "最近的跑步" };
    //         const config = { responsive: true, displayModeBar: false };
    //         Plotly.newPlot(div, summaries(data), layout, config);
    //     });
    //     return;
    // }
}

function draw(container, callback) {
    const div = document.createElement("div");
    container.appendChild(div);
    callback(div)
}

function lapBoxes(data) {
    return data.map(({ startTimeLocal: v, laps }) => {
        return {
            y: laps.map(mpb).toSorted((a, b) => a - b),
            hoverinfo: "y",
            width: 0.2,
            type: "box",
            name: date(v)
        }
    }).toReversed();
}

function lapScatters(data) {
    return data.map(({ startTimeLocal: v, laps }) => {
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
    return [{
        type: 'table',
        columnwidth: [3, 1.5, 3, 2, 2, 3],
        header: {
            values: [
                ["<b>日期</b>"],
                ["<b>心率</b>"],
                ["<b>步频</b>"],
                ["<b>配速</b>"],
                ["<b>配速<sup>ga</sup></b>"],
                ["<b>速心比"],
            ],
            align: "center",
            line: { width: 1, color: 'black' },
            fill: { color: "grey" },
            font: { family: "Arial", size: 12, color: "white" }
        },
        cells: {
            values: [
                ({ startTimeLocal: v }) => new Date(v).toLocaleDateString("fr-CA"),
                ({ averageHR: v }) => v,
                ({ averageRunningCadenceInStepsPerMinute: v }) => v,
                ({ averageSpeed: v }) => pace(v),
                ({ avgGradeAdjustedSpeed: v }) => pace(v),
                mpb,
            ].map(f => activities.map(f)),
            format: [
                "",
                "",
                ".1f",
                "",
                "",
                ".3f",
            ],
            align: "center",
            line: { color: "black", width: 1 },
            font: { family: "Arial", size: 11, color: ["black"] }
        }
    }];
}
