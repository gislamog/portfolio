export type CgmPoint = { minute: number; glucose: number; meal: boolean };

export function syntheticCgm(hours = 24, seed = 11): CgmPoint[] {
  const points: CgmPoint[] = [];
  const mealMinutes = [8 * 60, 13 * 60, 19 * 60];
  for (let minute = 0; minute <= hours * 60; minute += 5) {
    const hour = (minute / 60) % 24;
    const circadian = 108 + 10 * Math.sin((hour - 6) / 24 * Math.PI * 2);
    let meal = 0;
    let isMeal = false;
    for (const start of mealMinutes) {
      const dt = minute - start;
      if (dt >= 0 && dt < 150) {
        meal += 55 * Math.exp(-((dt - 45) ** 2) / (2 * 28 ** 2));
        if (dt === 0) isMeal = true;
      }
    }
    const noise = ((seed * 17 + minute * 13) % 7) - 3;
    points.push({
      minute,
      glucose: Math.round(circadian + meal + noise),
      meal: isMeal,
    });
  }
  return points;
}

export function timeInRange(points: CgmPoint[], lo = 70, hi = 180) {
  if (!points.length) return 0;
  return points.filter((p) => p.glucose >= lo && p.glucose <= hi).length / points.length;
}

export function meanGlucose(points: CgmPoint[]) {
  if (!points.length) return 0;
  return points.reduce((s, p) => s + p.glucose, 0) / points.length;
}
