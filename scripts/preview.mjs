// Draws the images in media/ that the README shows: the banner (light and dark), how it works,
// avatars in an interface, and moods and designs. Run with `npm run preview`.
import { mkdirSync, writeFileSync } from "node:fs";
import { blobs, openblob } from "../dist/index.js";
import { designs, monsters } from "../dist/designs/index.js";

const DESIGNS = [blobs, ...designs];

const FONT = `font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"`;
const MONO = `font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"`;
const LIGHT = { bg: "#f6f7f9", card: "#ffffff", text: "#1d2330", muted: "#596170", border: "#e3e6eb", primary: "#4f46e5" };
const DARK = { bg: "#0f1219", card: "#171b24", text: "#e6e8ee", muted: "#a0a7b3", border: "#283040", primary: "#818cf8" };
const NAMES = ["Sam Porter", "Carla Méndez", "Leo Martín", "Ana López", "01JD8X2K4P", "Priya Natarajan", "Øyvind Hansen", "hello@example.com",
  "Kenji Watanabe", "Olga Ivanova", "Fatima Zahra", "Tom O'Brien", "Lucía Fernández", "Sven Berg", "Aisha Bello", "Diego Ramírez"];

const avatar = (seed, size, x, y, options = {}) =>
  openblob(seed, { size, ...options }).replace("<svg ", `<svg x="${x}" y="${y}" `);
const image = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>\n`;
const text = (x, y, size, fill, content, extra = "") => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${FONT} ${extra}>${content}</text>`;
const save = (name, svg) => writeFileSync(new URL(`../media/${name}.svg`, import.meta.url), svg);

// The banner, also the social preview: title on the left, blobs and monsters on the right
function banner(t) {
  const w = 1280, h = 640, size = 112, gap = 14, x0 = 740, y0 = 75;
  const chip = (x, label) => `<g transform="translate(${x} 468)"><rect width="${label.length * 11 + 32}" height="44" rx="22" fill="${t.card}" stroke="${t.border}"/>${text(16, 29, 19, t.muted, label)}</g>`;
  let grid = "";
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    grid += avatar(NAMES[r * 4 + c], size, x0 + c * (size + gap), y0 + r * (size + gap), { design: DESIGNS[(r + c) % DESIGNS.length] });
  }
  return image(w, h, `<rect width="${w}" height="${h}" fill="${t.bg}"/>`
    + avatar("openblobs", 96, 80, 150, { background: "squircle", mood: "happy" })
    + text(80, 340, 88, t.text, "openblobs", `font-weight="800" letter-spacing="-3"`)
    + text(82, 396, 26, t.muted, "Friendly avatars from any string.")
    + text(82, 432, 26, t.muted, "Same seed, same avatar. Bring your own design.")
    + chip(80, "Zero dependencies") + chip(305, "WCAG contrast") + chip(500, "SVG · React")
    + grid);
}

// A seed becomes the same avatar every time, in every design
function howItWorks() {
  const w = 1100, h = 420, t = LIGHT, size = 92, step = 112, x0 = 520;
  const heading = (x, label) => text(x, 64, 15, t.muted, label, `font-weight="700" letter-spacing="1.5" text-anchor="middle"`);
  let body = `<rect width="${w}" height="${h}" rx="24" fill="${t.bg}"/>` + text(60, 64, 15, t.muted, "SEED", `font-weight="700" letter-spacing="1.5"`);
  DESIGNS.forEach((design, i) => { body += heading(x0 + i * step + size / 2, design.name.toUpperCase()); });
  ["sam@example.com", "01JD8X2K4P", "Ana López"].forEach((seed, row) => {
    const y = 90 + row * 108;
    body += `<rect x="60" y="${y + 22}" width="340" height="52" rx="12" fill="${t.card}" stroke="${t.border}"/>`
      + `<text x="80" y="${y + 55}" font-size="22" fill="${t.text}" ${MONO}>"${seed}"</text>`
      + `<path d="M420 ${y + 48}h70m-12 -10 12 10 -12 10" stroke="${t.primary}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
      + DESIGNS.map((design, i) => avatar(seed, size, x0 + i * step, y + 2, { design })).join("");
  });
  return image(w, h, body);
}

// What it looks like in an app: a comment thread with blobs, a team list with monsters
function inContext() {
  const w = 1000, h = 440, t = LIGHT;
  const comments = [
    ["Sam Porter", "2 h ago", "Love the new palette, it reads much better", "on dark backgrounds."],
    ["Leo Martín", "1 h ago", "Agreed. Could we try the squircle backdrop", "in the sidebar?"],
    ["Ana López", "now", "Shipped! Every user keeps their avatar."],
  ];
  const team = [["Carla Méndez", "Engineering", "#22c55e"], ["Kenji Watanabe", "Design", "#22c55e"], ["Priya Natarajan", "Product", "#f59e0b"],
    ["Tom O'Brien", "Support", "#22c55e"], ["Olga Ivanova", "Marketing", "#9ca3af"]];
  let body = `<rect width="${w}" height="${h}" rx="24" fill="${t.bg}"/>`
    + `<rect x="24" y="24" width="580" height="392" rx="16" fill="${t.card}" stroke="${t.border}"/>`
    + text(48, 64, 18, t.text, "Comments", `font-weight="700"`);
  comments.forEach(([name, when, line1, line2], i) => {
    const y = 88 + i * 106;
    body += avatar(name, 44, 48, y)
      + `<rect x="108" y="${y}" width="472" height="${line2 ? 88 : 64}" rx="12" fill="${t.bg}" stroke="${t.border}"/>`
      + text(124, y + 26, 16, t.text, name, `font-weight="700"`) + text(124 + name.length * 9 + 10, y + 26, 14, t.muted, when)
      + text(124, y + 50, 16, t.text, line1) + (line2 ? text(124, y + 72, 16, t.text, line2) : "");
  });
  body += `<rect x="628" y="24" width="348" height="392" rx="16" fill="${t.card}" stroke="${t.border}"/>`
    + text(652, 64, 18, t.text, "Team", `font-weight="700"`);
  team.forEach(([name, role, status], i) => {
    const y = 86 + i * 64;
    body += avatar(name, 40, 652, y, { design: monsters })
      + text(706, y + 18, 16, t.text, name, `font-weight="600"`) + text(706, y + 38, 14, t.muted, role)
      + `<circle cx="944" cy="${y + 20}" r="6" fill="${status}"/>`;
  });
  return image(w, h, body);
}

// One person as every design, and an empty slot for the one you draw
function designsRow() {
  const seed = "sam@example.com", t = LIGHT, size = 120, step = 170, x0 = 60, y = 140;
  const one = (design) => { const noun = design.name.replace(/s$/, ""); return `${/^[aeiou]/.test(noun) ? "an" : "a"} ${noun}`; };
  const slots = DESIGNS.length + 1, w = x0 * 2 + (slots - 1) * step + size, h = 344;
  let body = `<rect width="${w}" height="${h}" rx="24" fill="${t.bg}"/>`
    + text(x0, 66, 28, t.text, `Be ${DESIGNS.map(one).join(", ")}…`, `font-weight="800"`)
    + text(x0, 100, 18, t.muted, "…or whatever your inspiration draws. Same seed, same person, any design.");
  DESIGNS.forEach((design, i) => {
    body += avatar(seed, size, x0 + i * step, y, { design })
      + text(x0 + i * step + size / 2, y + size + 34, 18, t.muted, one(design), `text-anchor="middle"`);
  });
  const cx = x0 + DESIGNS.length * step + size / 2, cy = y + size / 2;
  body += `<circle cx="${cx}" cy="${cy}" r="${size / 2 - 2}" fill="${t.card}" stroke="${t.primary}" stroke-width="2.5" stroke-dasharray="8 7"/>`
    + `<path d="M${cx - 14} ${cy}h28M${cx} ${cy - 14}v28" stroke="${t.primary}" stroke-width="4" stroke-linecap="round"/>`
    + text(cx, y + size + 34, 18, t.primary, "yours", `text-anchor="middle" font-weight="700"`);
  return image(w, h, body);
}

// Five moods: big in the default design, small in each of the others below
function moods() {
  const seed = "sam@example.com", t = LIGHT, size = 112, mini = 40, step = 176, x0 = 60, y = 128;
  const list = ["calm", "happy", "sleepy", "surprised", "busy"], others = DESIGNS.slice(1);
  const w = x0 * 2 + (list.length - 1) * step + size, h = y + size + 30 + mini + 64;
  let body = `<rect width="${w}" height="${h}" rx="24" fill="${t.bg}"/>`
    + text(x0, 66, 28, t.text, "Five moods, in every design", `font-weight="800"`)
    + `<text x="${x0}" y="100" font-size="18" fill="${t.muted}" ${FONT}>Only the face changes: <tspan ${MONO}>openblob(seed, { mood })</tspan>.</text>`;
  list.forEach((mood, i) => {
    const x = x0 + i * step, row = others.length * mini + (others.length - 1) * 4;
    body += avatar(seed, size, x, y, { mood })
      + others.map((design, j) => avatar(seed, mini, x + (size - row) / 2 + j * (mini + 4), y + size + 14, { design, mood })).join("")
      + text(x + size / 2, y + size + 14 + mini + 30, 18, t.muted, mood, `text-anchor="middle"`);
  });
  return image(w, h, body);
}

mkdirSync(new URL("../media/", import.meta.url), { recursive: true });
save("banner-light", banner(LIGHT));
save("banner-dark", banner(DARK));
save("how-it-works", howItWorks());
save("in-context", inContext());
save("designs", designsRow());
save("moods", moods());
