import { hsl } from "./color.js";
import { round as r, smoothClosed, type Point } from "./path.js";
import type { Mood, Palette, Traits } from "./traits.js";

export function body(t: Traits, cx: number, cy: number): string {
  const random = t.random;
  if (t.shape === "blob") {
    const n = 6 + Math.floor(random() * 3), rotation = random() * Math.PI * 2, pts: Point[] = [];
    for (let i = 0; i < n; i++) {
      const angle = rotation + (i / n) * Math.PI * 2, radius = 30 * (0.86 + random() * 0.24);
      pts.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
    }
    return smoothClosed(pts);
  }
  if (t.shape === "pebble" || t.shape === "bean") {
    // Superellipse: higher exponents look squarer
    const e = t.shape === "pebble" ? 2.4 + random() * 1.6 : 2.1;
    const ax = 31 * (0.9 + random() * 0.15), ay = 29 * (0.9 + random() * 0.15), pts: Point[] = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2, c = Math.cos(angle), s = Math.sin(angle);
      const x = cx + ax * Math.sign(c) * Math.abs(c) ** (2 / e);
      let y = cy + ay * Math.sign(s) * Math.abs(s) ** (2 / e);
      if (t.shape === "bean" && s > 0.2) y -= 5 * Math.exp(-(c ** 2) * 9); // the notch at the bottom
      pts.push([x, y]);
    }
    return smoothClosed(pts);
  }
  // drop: a dome on top and a wide, wavy base
  const w = 30 + random() * 4, top = cy - 30, base = cy + 27, waves = 2 + Math.floor(random() * 2), pts: Point[] = [];
  for (let i = 0; i <= 10; i++) {
    const angle = Math.PI + (i / 10) * Math.PI;
    pts.push([cx + Math.cos(angle) * w, cy - 2 + Math.sin(angle) * (cy - 2 - top)]);
  }
  pts.push([cx + w, base - 6]);
  for (let i = 1; i < waves * 2; i++) pts.push([cx + w - (i / (waves * 2)) * w * 2, base + (i % 2 ? 3 : -2)]);
  pts.push([cx - w, base - 6]);
  return smoothClosed(pts);
}

const stroke = (p: Palette, color = p.ink) => `stroke="${color}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"`;

/** Drawn before the body, which covers part of it. */
export function topBehind(t: Traits, cx: number, cy: number): string {
  if (t.top !== "ears") return "";
  const p = t.palette;
  return `<circle cx="${cx - 20}" cy="${cy - 24}" r="9" fill="${p.shade}"/><circle cx="${cx + 20}" cy="${cy - 24}" r="9" fill="${p.shade}"/>`;
}

export function topInFront(t: Traits, cx: number, cy: number): string {
  const p = t.palette, k = stroke(p, p.gear);
  switch (t.top) {
    case "antenna": {
      const ex = r(cx - 4 + t.details[0] * 8);
      return `<path d="M${cx} ${cy - 28} Q${cx} ${cy - 36} ${ex} ${cy - 41}" ${k}/><circle cx="${ex}" cy="${cy - 42}" r="4" fill="${p.accent}"/>`;
    }
    case "sprout":
      return `<path d="M${cx} ${cy - 28} L${cx} ${cy - 36}" ${k}/>`
        + `<path d="M${cx} ${cy - 35} C${cx - 2} ${cy - 45} ${cx - 12} ${cy - 45} ${cx - 13} ${cy - 41} C${cx - 10} ${cy - 37} ${cx - 3} ${cy - 36} ${cx} ${cy - 35}Z" fill="${hsl(120, 45, 45)}"/>`
        + `<path d="M${cx} ${cy - 35} C${cx + 2} ${cy - 43} ${cx + 10} ${cy - 43} ${cx + 11} ${cy - 40} C${cx + 8} ${cy - 36} ${cx + 3} ${cy - 35} ${cx} ${cy - 35}Z" fill="${hsl(110, 50, 55)}"/>`;
    case "tuft":
      return `<path d="M${cx - 7} ${cy - 27} q2 -9 7 -11 M${cx} ${cy - 28} q0 -9 4 -12 M${cx + 6} ${cy - 27} q2 -7 6 -8" ${k}/>`;
    case "headset":
      // Cups in the accent: they straddle body and page. The boom lies on the body, so it takes the ink.
      return `<path d="M${cx - 31} ${cy - 3} C${cx - 32} ${cy - 47} ${cx + 32} ${cy - 47} ${cx + 31} ${cy - 3}" stroke="${p.gear}" stroke-width="3.6" fill="none"/>`
        + `<rect x="${cx - 36}" y="${cy - 10}" width="10" height="17" rx="5" fill="${p.accent}"/><rect x="${cx + 26}" y="${cy - 10}" width="10" height="17" rx="5" fill="${p.accent}"/>`
        + `<path d="M${cx - 31} ${cy + 7} Q${cx - 28} ${cy + 19} ${cx - 13} ${cy + 18}" ${stroke(p)}/><circle cx="${cx - 12}" cy="${cy + 18}" r="3.4" fill="${p.accent}"/>`;
    default:
      return "";
  }
}

export function face(t: Traits, mood: Mood, cx: number, cy: number): string {
  const p = t.palette, d = t.details, k = stroke(p);
  const ey = cy - 3 + d[1] * 3, dx = 10 + d[2] * 3.5, my = ey + 12;
  const eye = (x: number, size = 3.6) =>
    `<ellipse cx="${r(x)}" cy="${r(ey)}" rx="${size}" ry="${r(size * 1.18)}" fill="${p.ink}"/>`
    + `<circle cx="${r(x + size * 0.35)}" cy="${r(ey - size * 0.45)}" r="${r(size * 0.32)}" fill="#fff"/>`;
  const arcs = (bend: number) =>
    `<path d="M${r(cx - dx - 4)} ${r(ey - bend / 4)} q4 ${bend} 8 0 M${r(cx + dx - 4)} ${r(ey - bend / 4)} q4 ${bend} 8 0" ${k}/>`;
  let eyes = "", mouth = "";
  switch (mood) {
    case "calm":
      eyes = eye(cx - dx) + eye(cx + dx);
      if (d[3] < 0.55) mouth = `<path d="M${r(cx - 4)} ${r(my)} q4 3.5 8 0" ${k}/>`;
      break;
    case "happy":
      eyes = arcs(-6);
      mouth = `<path d="M${r(cx - 6)} ${r(my - 1)} q6 6 12 0" ${k}/>`;
      break;
    case "sleepy":
      eyes = arcs(4);
      mouth = `<circle cx="${cx}" cy="${r(my + 1)}" r="1.8" fill="${p.ink}"/>`;
      break;
    case "surprised":
      eyes = eye(cx - dx, 4.6) + eye(cx + dx, 4.6);
      mouth = `<ellipse cx="${cx}" cy="${r(my + 1)}" rx="3" ry="3.6" fill="${p.ink}"/>`;
      break;
    case "busy":
      eyes = eye(cx - dx) + `<path d="M${r(cx + dx - 4)} ${r(ey)} h8" ${k}/>`;
      mouth = `<path d="M${r(cx - 4)} ${r(my)} h8" ${k}/>`;
      break;
  }
  const cheeks = t.blush
    ? `<ellipse cx="${r(cx - dx - 5)}" cy="${r(ey + 8)}" rx="4.5" ry="2.6" fill="${p.blush}" opacity=".55"/>`
      + `<ellipse cx="${r(cx + dx + 5)}" cy="${r(ey + 8)}" rx="4.5" ry="2.6" fill="${p.blush}" opacity=".55"/>`
    : "";
  return cheeks + eyes + mouth;
}
