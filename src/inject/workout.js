import { activities, splits } from "../lib/api";
import { onMutated, observe } from "../lib/observer";
import { plotPanel, unit } from "../lib/utils";
import Plotly from 'plotly.js-dist-min';

async function latest7days(workout) {
    const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    const aa = await activities({ startDate: sevenDaysAgo });
    const activity = async ({ activityId, startTimeLocal }) => {
        const { lapDTOs } = await splits(activityId);
        const laps = lapDTOs.filter(({ intensityType: t }) => t === "ACTIVE");
        return { activityId, startTimeLocal, laps };
    }
    const pas = aa.filter(({ workoutId: id }) => id == workout).map(activity);
    return await Promise.all(pas);
};


const expr = '#pageContainer div[class^="WorkoutPageHeader_headerWrapper"]';

observe(document.querySelector("div.main-body"), onMutated({
    predicate: ({ addedNodes: [...ns] }) => ns.some(n => n.querySelector instanceof Function && n.querySelector(expr)),
    callback: async () => {
        const workout = URL.parse(window.location.href).pathname.split("/").at(-1)
        const rs = await latest7days(workout);
        Plotly.newPlot(
            plotPanel("dist", n => document.querySelector(expr).appendChild(n)),
            dist(rs),
            { title: "近七日速心比分布对比", height: 200, margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 } },
            { responsive: true }
        )
        Plotly.newPlot(
            plotPanel("trend", n => document.querySelector(expr).appendChild(n)),
            trend(rs),
            { title: "近七日速心比趋势对比", height: 200, margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 } },
            { responsive: true }
        )
    }
}));


function dist(data) {
    return data.map(({ startTimeLocal: v, laps }) => {
        return {
            y: laps.map(metersPerBeat).toSorted((a, b) => a - b),
            hoverinfo: "y",
            width: 0.1,
            type: "box",
            name: date(v)
        }
    }).toReversed();
}

function trend(data) {
    return data.map(({ startTimeLocal: v, laps }) => {
        const detail = ({
            averageHR: h,
            averageRunCadence: c,
            averageSpeed: s,
            avgGradeAdjustedSpeed: a,
            distance: d
        }) => [unit(h, "bpm"), unit(Math.round(c), "cpm"), pace(s), pace(a), unit(Math.round(d), "m")].join("<br>")
        return {
            y: laps.map(metersPerBeat),
            x: laps.map(l => l.lapIndex),
            hovertext: laps.map(detail),
            hoverinfo: "y+text+name",
            hovertemplate: "<b>%{y:.3f}</b><br>%{hovertext}",
            mode: "lines+markers",
            name: date(v)
        }
    }).toReversed();
}

function metersPerBeat({ averageHR: h, averageSpeed: s, avgGradeAdjustedSpeed: g }) {
    return (g ? g : s) * 60 / h
}

function date(v) { return new Date(v).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }); }

function pace(metersPerSecond) {
    if (!metersPerSecond) return "--";
    const sec = Math.round(1000 / metersPerSecond);
    const m = String(Math.trunc(sec / 60)).padStart(2, 0);
    const s = String(sec % 60).padStart(2, 0);
    return unit(`${m}:${s}`, "km");
}
