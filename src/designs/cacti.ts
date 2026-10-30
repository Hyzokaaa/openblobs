import { layeredDesign } from "../design.js";

// Potted cacti, made of plain SVG parts in a 100 × 100 box, in greens.
// Append parts or layers at the end: reordering them redraws everyone.
const line = (d: string, width = 2.6) => `<path d="${d}" stroke="{ink}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
const pair = (left: number, right: number, draw: (x: number) => string) => draw(left) + draw(right);
const dot = (r: number, glint = false) => (x: number) =>
  `<circle cx="${x}" cy="50" r="${r}" fill="{ink}"/>` + (glint ? `<circle cx="${x + r * 0.35}" cy="${50 - r * 0.4}" r="${r * 0.32}" fill="#fff"/>` : "");
const arm = (x: number, y: number, bar: number, width: number) =>
  `<rect x="${x}" y="${y}" width="11" height="22" rx="5.5" fill="{shade}"/><rect x="${bar}" y="${y + 12}" width="${width}" height="10" rx="5" fill="{shade}"/>`;
const spines = (d: string) => `<path d="${d}" stroke="{shade}" stroke-width="2.6" stroke-linecap="round"/>`;
const petals = [[0, -4.2], [4, -1.3], [2.5, 3.4], [-2.5, 3.4], [-4, -1.3]]
  .map(([x, y]) => `<circle cx="${58 + x}" cy="${30 + y}" r="3.3" fill="#f78fb3"/>`).join("");

export const cacti = layeredDesign({
  name: "cacti",
  description: "Potted cacti with arms, spines and now and then a flower, in five moods.",
  hues: [85, 100, 115, 130, 145, 160],
  layers: [
    // Arms, behind the body
    {
      name: "arms",
      options: ["none", "one", "two"],
      at: [20, 46],
      parts: ["", arm(15, 36, 15, 26), arm(15, 36, 15, 26) + arm(74, 30, 59, 26)],
    },
    // Bodies, with spines
    {
      name: "body",
      options: ["tall", "round"],
      at: [66, 38],
      parts: [
        `<rect x="33" y="20" width="34" height="58" rx="17" fill="{body}"/>` + spines("M40 30v0M60 33v0M38 67v0M62 65v0M50 25v0"),
        `<rect x="29" y="30" width="42" height="48" rx="21" fill="{body}"/>` + spines("M37 44v0M63 42v0M36 67v0M64 66v0M50 35v0"),
      ],
    },
    // Small dots or big shiny ones, in every mood
    {
      name: "eyes",
      options: ["dots", "shiny"],
      at: [43, 50],
      parts: {
        calm: [pair(44, 56, dot(3.3)), pair(42.5, 57.5, dot(4.2, true))],
        happy: [line("M40.5 51q3.5-4 7 0M52.5 51q3.5-4 7 0"), line("M38 51.5q4.5-5.5 9 0M53 51.5q4.5-5.5 9 0", 3)],
        sleepy: [line("M40.5 50q3.5 3 7 0M52.5 50q3.5 3 7 0"), line("M38 50q4.5 4 9 0M53 50q4.5 4 9 0", 3)],
        surprised: [pair(44, 56, dot(4)), pair(42.5, 57.5, dot(5, true))],
        busy: [`<circle cx="44" cy="50" r="3.3" fill="{ink}"/>` + line("M52.5 50h7"), dot(4.2, true)(42.5) + line("M53 50h9", 3)],
      },
    },
    // A smile or a grin, in every mood
    {
      name: "mouth",
      options: ["smile", "grin"],
      at: [57, 59],
      parts: {
        calm: [line("M46 57.5q4 3.5 8 0"), line("M44 57q6 5 12 0")],
        happy: [`<path d="M45.5 57h9q-.8 5.5-4.5 5.5T45.5 57z" fill="{ink}"/>`, `<path d="M43.5 57h13q-1 7-6.5 7T43.5 57z" fill="{ink}"/>`],
        sleepy: [`<circle cx="50" cy="59" r="1.6" fill="{ink}"/>`, line("M47 59h6")],
        surprised: [`<ellipse cx="50" cy="59.5" rx="2.2" ry="2.8" fill="{ink}"/>`, `<ellipse cx="50" cy="60" rx="3" ry="3.6" fill="{ink}"/>`],
        busy: [line("M47 58.5h6"), line("M45 59l2.5-1.5 2.5 1.5 2.5-1.5 2.5 1.5", 2.2)],
      },
    },
    // Cheeks, now and then
    {
      name: "cheeks",
      options: ["none", "none", "blush"],
      at: [38, 57],
      parts: ["", "", `<ellipse cx="38.5" cy="57" rx="3.6" ry="2.2" fill="#f78fb3" opacity=".6"/><ellipse cx="61.5" cy="57" rx="3.6" ry="2.2" fill="#f78fb3" opacity=".6"/>`],
    },
    // A flower, now and then
    {
      name: "flower",
      options: ["none", "bloom"],
      at: [58, 30],
      parts: ["", petals + `<circle cx="58" cy="30" r="2.6" fill="#fff4b8"/>`],
    },
    // The pot, drawn last so it hides the base of the body
    {
      name: "pot",
      options: ["clay", "painted"],
      at: [68, 86],
      parts: [
        `<path d="M33 78h34l-4 16H37z" fill="#c9653d"/><rect x="29" y="72" width="42" height="9" rx="3" fill="#dc7a4f"/>`,
        `<path d="M33 78h34l-4 16H37z" fill="{accent}"/><rect x="29" y="72" width="42" height="9" rx="3" fill="{accent}"/>`,
      ],
    },
  ],
});
