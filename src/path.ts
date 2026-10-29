export type Point = [number, number];

/** One decimal is plenty at 100 units and keeps the SVG small. */
export const round = (v: number) => Math.round(v * 10) / 10;

/** A smooth closed curve through every point (Catmull-Rom turned into cubic Béziers). */
export function smoothClosed(pts: Point[]): string {
  const n = pts.length;
  let d = `M${round(pts[0][0])} ${round(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${round(p1[0] + (p2[0] - p0[0]) / 6)} ${round(p1[1] + (p2[1] - p0[1]) / 6)} `
      + `${round(p2[0] - (p3[0] - p1[0]) / 6)} ${round(p2[1] - (p3[1] - p1[1]) / 6)} `
      + `${round(p2[0])} ${round(p2[1])}`;
  }
  return d + "Z";
}
