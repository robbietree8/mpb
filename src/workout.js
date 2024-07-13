import { activities, splits } from "./api";

(async () => {
    const send = m => window.postMessage({ mbp: { activities: m, page: "workout" } });
    const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    const aa = await activities({ startDate: sevenDaysAgo });
    const currentId = URL.parse(window.location.href).pathname.split("/").at(-1);
    const activity = async ({ activityId, startTimeLocal }) => {
        const { lapDTOs } = await splits(activityId);
        const laps = lapDTOs.filter(({ intensityType: t }) => t === "ACTIVE");
        return { activityId, startTimeLocal, laps };
    }
    const pas = aa.filter(({ workoutId }) => workoutId == currentId).map(activity);
    const ass = await Promise.all(pas);
    send(ass);
})();
