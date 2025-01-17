import { onMutated, observe } from '../lib/observer';
import { plotPanel } from "../lib/utils";
import Plotly from 'plotly.js-dist-min';

observe(document.querySelector("div.main-body"), onMutated({
    predicate: ({ addedNodes: a, removedNodes: r }) => {
        const className = pred => ([e]) => e && (typeof e.className === 'string') && pred(e.className);
        const activityIn = className(s => s.startsWith("list-item"));
        return activityIn(a) || activityIn(r);
    },
    callback: () => {
        const isRunning = URL.parse(window.location.href).searchParams.has("activityType", "running");
        const pp = plotPanel("trend", n => document.querySelector("div.search-results").after(n));
        if (isRunning) {
            const idxs = indexes();
            console.assert(idxs, "Missing HR or Speed field");
            const data = [{
                y: mpbs(idxs),
                x: dates(),
                mode: "lines+markers",
                hoverinfo: "x+y",
                hovertemplate: "%{y:.3f}<extra>%{x|%m/%d}</extra>"
            }];
            Plotly.newPlot(
                pp,
                data,
                { title: "速心比变化趋势", height: 200, margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 } },
                { responsive: true, displayModeBar: false }
            );
        } else {
            pp.remove();
        }
    }
}));

function mpbs({ iHR, iSpeed, iGASpeed }) {
    const exec = (regex, text, fn) => fn(regex.exec(text))
    const mpm = (m, s) => 1000 / (Number(m) * 60 + Number(s)) * 60;
    const mpb = node => {
        const nan = "--"
        const value = i => i < 0 ? nan : node.children[i].querySelector("span.unit").getAttribute("title");
        const gas = value(iGASpeed)
        const speed = exec(/(\d+):(\d+) \/公里/, gas == nan ? value(iSpeed) : gas, ([, m, s]) => mpm(m, s));
        const hr = exec(/(\d+) bpm/, value(iHR), ([, hr]) => Number(hr));
        return speed / hr;
    }
    return [...document.querySelectorAll("div.five-metric")].map(mpb).filter(v => v);
}

function indexes() {
    const { children: [...ns] } = document.querySelector("div.metric-sort");
    const index = (a, n, i) => {
        for (k of Object.keys(a)) {
            if (n.querySelector(`a.filter[data-filter-value="${k}"]`)) {
                a[k] = i;
            }
        }
        return a;
    };
    const { averageHR: iHR, averageSpeed: si, avgGradeAdjustedSpeed: gi } =
        ns.reduce(index, { averageHR: -1, averageSpeed: -1, avgGradeAdjustedSpeed: -1 });
    return (iHR >= 0 && si >= 0) ? { iHR, iSpeed: si, iGASpeed: gi } : undefined;
}


function dates() {
    function date(node) {
        const { innerText: y } = node.querySelector("span.label");
        const { innerText: md } = node.querySelector("span.unit");
        const [, m, d,] = /(\d+)月 (\d+)日/.exec(md)
        return new Date(y, Number(m) - 1, d);
    }
    return [...document.querySelectorAll("div.activity-date")].map(date);
}

