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
        const pp = plotPanel("max", n => document.querySelector("div.sorter").before(n));
        if (isFitness) {
            const rs = await historyRecords();
            Plotly.newPlot(
              pp,
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
              plotPanel("trend", (n) =>
                document.querySelector("div.sorter").before(n)
              ),
              [
                trend(rs, "DUMBBELL_SHOULDER_PRESS"),
                trend(rs, "BARBELL_BACK_SQUAT"),
                trend(rs, "DUMBBELL_BENCH_PRESS"),
              ].flatMap((t) => t),
              {
                title: "重量趋势",
                height: 200,
                margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
              },
              { responsive: true }
            );
        } else {
            pp.remove();
        }
    }
}));

function exerciseWithMaxProbability(exercises) {
    const categoryWithMaxProbability = exercises.reduce((acc, item) => {
        return item.probability > acc.probability ? item : acc;
    }, { probability: -Infinity });

    return categoryWithMaxProbability.name || categoryWithMaxProbability.category;
}

function maxWeight(exercises) {
    return Object.values(
      buildExercisesWithMaxProbability(exercises).reduce((groups, item) => {
        const { category, weight, st } = item;
        if (!groups[category] || weight > groups[category].weight) {
          groups[category] = { category, weight, st };
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
    }));
}

function historyMaxWeights(data) {
  const categoryWithMaxWeight = maxWeight(data);
  const dataX = categoryWithMaxWeight.map(({ category }) => translate(category));
  const dataY = categoryWithMaxWeight.map(({ weight }) => weight);
  const dataText = categoryWithMaxWeight.map(({ weight, st }) => `${weight}Kg on ${st}`);
  return [
    {
      x: dataX,
      y: dataY,
      type: "bar",
      text: dataText,
      marker: {
        color: "rgb(142,124,195)",
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
  ).map(({ weight, st }) => ({
    x: [st],
    y: [weight],
    mode: "lines+markers",
    hoverinfo: "x+y",
    hovertemplate: "%{y:.3f}<extra>%{x|%m/%d}</extra>",
    name: translate(type),
  }));
}