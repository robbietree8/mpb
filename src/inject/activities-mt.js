import { activities, exerciseSetsApi } from "../lib/api";
import { onMutated, observe } from '../lib/observer';
import { plotPanel } from "../lib/utils";
import { translate } from "../lib/i18n"
import Plotly from 'plotly.js-dist-min';

async function historyRecords() {
    const aa = await activities({ activityType: "fitness_equipment", search: "MT" });
    const activity = async ({ activityId }) => {
        const { exerciseSets } = await exerciseSetsApi(activityId);
        const exercises = exerciseSets.filter(({ setType: t }) => t === "ACTIVE");
        return { activityId, exercises };
    }
    const pas = aa.map(activity);
    return await Promise.all(pas);
};

observe(document.querySelector("div.main-body"), onMutated({
    predicate: ({ addedNodes: a, removedNodes: r }) => {
        const className = pred => ([e]) => e && (typeof e.className === 'string') && pred(e.className);
        const activityIn = className(s => s.startsWith("list-item"));
        return activityIn(a) || activityIn(r);
    },
    callback: async () => {
        const isFitness = URL.parse(window.location.href).searchParams.has("activityType", "fitness_equipment");
        const maxPlot = plotPanel("max", n => document.querySelector("div.sorter").before(n));
        const trendPlot = plotPanel("trend", n => document.querySelector("div.sorter").before(n));
        if (isFitness) {
            const rs = await historyRecords();
            Plotly.newPlot(
              maxPlot,
              historyMaxWeights(rs),
              {
                title: "历史最大重量",
                height: 200,
                margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
                yaxis: { title: "重量(kg)" },
                xaxis: { tickfont: { size: 8 } },
              },
              { responsive: true }
            );

            Plotly.newPlot(
              trendPlot,
              [
                trend(rs, "SHOULDER_PRESS_DUMBBELL_SHOULDER_PRESS"), //哑铃推肩
                trend(rs, "SQUAT_BARBELL_BACK_SQUAT"), //杠铃深蹲
                trend(rs, "BENCH_PRESS_DUMBBELL_BENCH_PRESS"), //哑铃卧推
                trend(rs, "BENCH_PRESS_INCLINE_DUMBBELL_BENCH_PRESS"), //哑铃上斜卧推
                trend(rs, "BENCH_PRESS_BARBELL_BENCH_PRESS"), //杠铃卧推
                trend(rs, "BENCH_PRESS_INCLINE_BARBELL_BENCH_PRESS"), //杠铃上斜卧推
                trend(rs, "ROW_WIDE_GRIP_SEATED_CABLE_ROW"), //坐姿宽握划船
              ].flatMap((t) => t),
              {
                title: "重量趋势",
                height: 200,
                margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
              },
              { responsive: true }
            );
        } else {
            maxPlot.remove();
            trendPlot.remove();
        }
    }
}));

function exerciseWithMaxProbability(exercises) {
    const categoryWithMaxProbability = exercises.reduce((acc, item) => {
        return item.probability > acc.probability ? item : acc;
    }, { probability: -Infinity });

    return categoryWithMaxProbability.category + (categoryWithMaxProbability.name === undefined || categoryWithMaxProbability.name === null ? '' : '_' +categoryWithMaxProbability.name);
}

function maxWeight(exercises) {
    return Object.values(
      buildExercisesWithMaxProbability(exercises).reduce((groups, item) => {
        const { category, weight, st, repetitionCount } = item;
        if (!groups[category] || weight > groups[category].weight) {
          groups[category] = { category, weight, st, repetitionCount };
        }
        return groups;
      }, {})
    );
}

function buildExercisesWithMaxProbability(exercises) {
  return exercises
    .flatMap((obj) => obj.exercises)
    .filter(({ startTime: t }) => t != undefined)
    .map((obj) => ({
      category: exerciseWithMaxProbability(obj.exercises),
      weight: obj.weight / 1000,
      st: obj.startTime.substr(0, 10),
      repetitionCount: obj.repetitionCount
    }));
}

function historyMaxWeights(data) {
  const categoryWithMaxWeight = maxWeight(data);
  const dataX = categoryWithMaxWeight.map(({ category }) => translate(category));
  const dataY = categoryWithMaxWeight.map(({ weight }) => weight);
  const dataText = categoryWithMaxWeight.map(({ weight, st, repetitionCount }) => `${weight}Kg x ${repetitionCount} on ${st}`);
  return [
    {
      x: dataX,
      y: dataY,
      type: "bar",
      text: dataText,
      marker: {
        color: "rgb(237,208,145)",
      },
    },
  ];
}

function trend(exercises, type) {
  return Object.values(
    buildExercisesWithMaxProbability(exercises)
      .filter(({ category }) => category === type)
      .reduce((groups, item) => {
        const { weight, st } = item;
        if (!groups[st] || weight > groups[st].weight) {
          groups[st] = { weight, st };
        }
        return groups;
      }, {})
  ).reduce((result, item) => {
    result.x.push(item.st);
    result.y.push(item.weight);
    return result;
  }, {
    x: [],
    y: [],
    mode: "lines+markers",
    hoverinfo: "x+y",
    hovertemplate: "%{y:.3f}<extra>%{x|%m/%d}</extra>",
    name: translate(type),
  });
}