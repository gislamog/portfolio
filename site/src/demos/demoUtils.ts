export function recentRows<T>(rows: T[], limit: number) {
  return {
    rows: rows.slice(-limit).reverse(),
    truncated: rows.length > limit,
  };
}

export function randomWalkDelta(
  randomValue: number,
  stepSize: number,
  speed: number,
) {
  return randomValue * stepSize * speed;
}
