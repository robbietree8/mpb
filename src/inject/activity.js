import { onMutated, observe } from "../lib/observer";
import { plotPanel, unit } from "../lib/utils";
import Plotly from 'plotly.js-dist-min';

var flag = true;
observe(document.querySelector("div.main-body"), onMutated({
    predicate: () => flag,
    callback: () => {
        const prs = [...document.querySelectorAll("td i.icon-pointer-right")].map(p => p.click());
        const active = document.querySelector('span[data-value="ACTIVE"]');
        if (prs.length == 0 && active != null) {
            flag = false;

            if (document.querySelector('div[data-activity-type="running"]') != null) {
                Plotly.newPlot(
                    plotPanel("trend", n => document.querySelector("div.activity-map").before(n)),
                    intervals(active.innerText),
                    { title: "速心比变化趋势", height: 200, margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 } },
                    { responsive: true, displayModeBar: false }
                );
            }
        }
    }
}));

function intervals(label) {
    const [...nodes] = document.querySelectorAll('tr[class^="IntervalsTable_tableRow"]');
    const pred = ({ children: [, , t] }) => t && t.innerText == label;
    const extract = ({ children: [, , , { innerText: lap }, , , { innerText: d }, { innerText: speed }, { innerText: gas }, { innerText: hr }, , , , { innerText: c }] }) => {
        return [lap, speed, gas, hr, c, d];
    }
    const rows = nodes.filter(pred).map(extract);
    console.log(label);
    const detail = ([, speed, gas, hr, c, d]) =>
        [unit(hr, "bpm"), unit(c, "cpm"), unit(speed, "km"), unit(gas, "km"), unit(d, "km")].join("<br>");
    return [{
        y: rows.map(metersPerBeat),
        x: rows.map(([lap]) => Number(lap)),
        mode: "lines+markers",
        hovertext: rows.map(detail),
        hoverinfo: "y",
        hovertemplate: "<b>%{y:.3f}</b><br>%{hovertext}<extra></extra>"
    }];
}

function metersPerBeat([, speed, gas, hr]) {
    const [, min, sec] = /(\d+):(\d+)/.exec(gas === '--' ? speed : gas);
    return 1000 / (Number(min) * 60 + Number(sec)) * 60 / Number(hr);
}