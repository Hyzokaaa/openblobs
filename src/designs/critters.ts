import { layeredDesign } from "../design.js";

// Cats, bears and bunnies, made of plain SVG parts in a 100 × 100 box.
// Append parts or layers at the end: reordering them redraws everyone.
const line = (d: string, width = 3.2) => `<path d="${d}" stroke="{ink}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
const dots = (r = 3.6) => `<circle cx="40" cy="54" r="${r}" fill="{ink}"/><circle cx="60" cy="54" r="${r}" fill="{ink}"/>`;
const shiny = (rx = 4, ry = 5) =>
  `<ellipse cx="40" cy="54" rx="${rx}" ry="${ry}" fill="{ink}"/><ellipse cx="60" cy="54" rx="${rx}" ry="${ry}" fill="{ink}"/>`
  + `<circle cx="41.4" cy="${54 - ry * 0.4}" r="1.5" fill="#fff"/><circle cx="61.4" cy="${54 - ry * 0.4}" r="1.5" fill="#fff"/>`;
const nose = `<path d="M46.6 62.4h6.8q-.4 2.6-3.4 3.6-3-1-3.4-3.6z" fill="{ink}"/>`;

export const critters = layeredDesign({
  name: "critters",
  description: "Cats, bears and bunnies with button noses, in five moods.",
  layers: [
    // Ears, drawn first so the head hides their base
    {
      name: "ears",
      options: ["cat", "bear", "bunny"],
      at: [30, 24],
      parts: [
        `<path d="M29.5 44 26 13l18.5 21.5zM70.5 44 74 13 55.5 34.5z" fill="{body}"/><path d="M31.5 38.5 29 20.5l11.5 12zM68.5 38.5 71 20.5l-11.5 12z" fill="{blush}"/>`,
        `<circle cx="28" cy="32" r="11" fill="{body}"/><circle cx="72" cy="32" r="11" fill="{body}"/><circle cx="28" cy="32" r="5.6" fill="{shade}"/><circle cx="72" cy="32" r="5.6" fill="{shade}"/>`,
        `<ellipse cx="38" cy="23" rx="7.5" ry="16" fill="{body}"/><ellipse cx="62" cy="23" rx="7.5" ry="16" fill="{body}"/><ellipse cx="38" cy="24" rx="3.4" ry="10.5" fill="{blush}"/><ellipse cx="62" cy="24" rx="3.4" ry="10.5" fill="{blush}"/>`,
      ],
    },
    {
      name: "head",
      options: ["round", "wide"],
      at: [79, 60],
      parts: [
        `<circle cx="50" cy="57" r="28" fill="{body}"/>`,
        `<ellipse cx="50" cy="58" rx="31" ry="26" fill="{body}"/>`,
      ],
    },
    // Markings, now and then
    {
      name: "markings",
      options: ["none", "muzzle", "muzzle", "stripes"],
      at: [56, 39],
      parts: [
        "",
        `<ellipse cx="50" cy="67" rx="12.5" ry="8.5" fill="#fff" opacity=".5"/>`,
        `<ellipse cx="50" cy="67" rx="12.5" ry="8.5" fill="#fff" opacity=".5"/>`,
        `<path d="M44 37.5v4.5M50 35.5v6M56 37.5v4.5" stroke="{shade}" stroke-width="3" stroke-linecap="round"/>`,
      ],
    },
    // Dots or shiny, in every mood
    {
      name: "eyes",
      options: ["dots", "shiny"],
      at: [40, 54],
      parts: {
        calm: [dots(), shiny()],
        happy: [line("M35 56q5-7 10 0M55 56q5-7 10 0"), line("M34.5 56.5q5.5-8 11 0M54.5 56.5q5.5-8 11 0")],
        sleepy: [line("M35 54q5 5 10 0M55 54q5 5 10 0"), line("M35 54q5 5 10 0M55 54q5 5 10 0M35.6 56.6l-1.8 1.8M64.4 56.6l1.8 1.8")],
        surprised: [dots(4.8), shiny(5, 6.2)],
        busy: [`<circle cx="40" cy="54" r="3.6" fill="{ink}"/>` + line("M55 54h10"), `<ellipse cx="40" cy="54" rx="4" ry="5" fill="{ink}"/><circle cx="41.4" cy="52" r="1.5" fill="#fff"/>` + line("M55 54h10")],
      },
    },
    // Nose and mouth, in every mood
    {
      name: "mouth",
      options: ["whiskers", "smile"],
      at: [54, 68],
      parts: {
        calm: [nose + line("M50 65.6q-2.6 4-6 1.4M50 65.6q2.6 4 6 1.4", 2.4), nose + line("M46 67.6q4 3 8 0", 2.4)],
        happy: [nose + `<path d="M45 66.6h10q-.8 7.4-5 7.4t-5-7.4z" fill="{ink}"/>`, nose + line("M44 66.6q6 6.4 12 0", 2.6)],
        sleepy: [nose + line("M48 69h4", 2.4), nose + `<circle cx="50" cy="69.6" r="1.7" fill="{ink}"/>`],
        surprised: [nose + `<ellipse cx="50" cy="70.4" rx="3" ry="3.6" fill="{ink}"/>`, nose + `<ellipse cx="50" cy="70.4" rx="2.4" ry="3" fill="{ink}"/>`],
        busy: [nose + line("M46 68.6h8", 2.4), nose + line("M45 69l2.5-1.6 2.5 1.6 2.5-1.6 2.5 1.6", 2.2)],
      },
    },
    // Cheeks, now and then
    {
      name: "cheeks",
      options: ["none", "blush"],
      at: [31.5, 63],
      parts: [
        "",
        `<ellipse cx="31.5" cy="63" rx="5" ry="3" fill="{blush}" opacity=".7"/><ellipse cx="68.5" cy="63" rx="5" ry="3" fill="{blush}" opacity=".7"/>`,
      ],
    },
  ],
});
