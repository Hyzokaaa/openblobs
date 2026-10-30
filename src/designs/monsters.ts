import { layeredDesign } from "../design.js";

// Horned, one-eyed or furry monsters, made of plain SVG parts in a 100 × 100 box.
// Append parts or layers at the end: reordering them redraws everyone.
const line = (d: string, width = 3.4) => `<path d="${d}" stroke="{ink}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
const whites = (r = 7.5, y = 48) => `<circle cx="40" cy="${y}" r="${r}" fill="#fff"/><circle cx="60" cy="${y}" r="${r}" fill="#fff"/>`;
const pupils = (x: number, y: number, r: number) => `<circle cx="${40 + x}" cy="${y}" r="${r}" fill="{ink}"/><circle cx="${60 + x}" cy="${y}" r="${r}" fill="{ink}"/>`;
const tooth = (y: number, xs: number[], w: number, h: number) =>
  xs.map((x) => `M${x - w / 2} ${y}h${w}q-.4 ${h * 0.55} -${w / 2} ${h}q-${w / 2 - 0.4} -${h * 0.45} -${w / 2} -${h}z`).join("");
// White fangs hanging inside a dark mouth, where they always stand out
const fangs = (y: number, xs: number[], w = 4.8, h = 5) => `<path d="${tooth(y, xs, w, h)}" fill="#fff"/>`;
// Fangs over the lip: drawn first, from the middle of the mouth line, so they hang from it whole
const lip = (y: number, xs: number[]) => `<path d="${tooth(y, xs, 5, 6.6)}" fill="#fff"/>`;

export const monsters = layeredDesign({
  name: "monsters",
  description: "Horned, one-eyed or furry monsters, in five moods.",
  layers: [
    // Horns and ears, drawn first so the body hides their base
    {
      name: "horns",
      options: ["none", "horns", "ears"],
      at: [28, 24],
      parts: [
        "",
        `<path d="M31 36 25 13 43 29zM69 36l6-23-18 16z" fill="{gear}"/>`,
        `<circle cx="29" cy="31" r="10" fill="{shade}"/><circle cx="71" cy="31" r="10" fill="{shade}"/>`,
      ],
    },
    {
      name: "body",
      options: ["square", "round", "ghost"],
      at: [78, 72],
      parts: [
        `<rect x="21" y="24" width="58" height="60" rx="24" fill="{body}"/>`,
        `<circle cx="50" cy="54" r="31" fill="{body}"/>`,
        `<path d="M23 83V49a27 27 0 0 1 54 0v34l-9-6-9 6-9-6-9 6-9-6z" fill="{body}"/>`,
      ],
    },
    // Two eyes or one, in every mood
    {
      name: "eyes",
      options: ["two", "one"],
      at: [40, 47],
      parts: {
        calm: [
          whites() + pupils(1.5, 49, 3.6),
          `<circle cx="50" cy="47" r="12" fill="#fff"/><circle cx="51.5" cy="48.5" r="6" fill="{ink}"/>`,
        ],
        happy: [
          line("M33 50q7-8 14 0M53 50q7-8 14 0"),
          line("M39 50q11-13 22 0", 3.8),
        ],
        sleepy: [
          line("M33 48q7 6 14 0M53 48q7 6 14 0"),
          line("M39 47q11 9 22 0", 3.8),
        ],
        surprised: [
          whites(8.6, 47) + pupils(0, 47, 2.6),
          `<circle cx="50" cy="46" r="13.6" fill="#fff"/><circle cx="50" cy="46" r="3.8" fill="{ink}"/>`,
        ],
        busy: [
          whites() + pupils(3, 50, 3.6) + `<path d="M32 48a8 8 0 0 1 16 0zM52 48a8 8 0 0 1 16 0z" fill="{shade}"/>`,
          `<circle cx="50" cy="47" r="12" fill="#fff"/><circle cx="54" cy="49.5" r="6" fill="{ink}"/><path d="M37.5 47a12.5 12.5 0 0 1 25 0z" fill="{shade}"/>`,
        ],
      },
    },
    // Plain, fangs over the lip, or a toothy open mouth, in every mood
    {
      name: "mouth",
      options: ["plain", "fangs", "toothy"],
      at: [56, 66],
      parts: {
        calm: [
          line("M42 65q8 7 16 0"),
          lip(66.3, [44.5, 55.5]) + line("M40 63.5q10 8 20 0"),
          `<path d="M40 63h20q-2.5 8.5-10 8.5T40 63z" fill="{ink}"/>` + fangs(63, [44.6, 55.4], 4.4, 4.6),
        ],
        happy: [
          `<path d="M39 62h22q-1 12-11 12T39 62z" fill="{ink}"/>`,
          lip(65.9, [43.5, 56.5]) + line("M38 62q12 11 24 0"),
          `<path d="M38 62h24q-1 11-12 11T38 62z" fill="{ink}"/>` + fangs(62, [44, 56], 5.2, 5.6),
        ],
        sleepy: [
          `<ellipse cx="50" cy="67" rx="3" ry="3.5" fill="{ink}"/>`,
          lip(66, [50]) + line("M44 66h12"),
          `<path d="M44 64.5h12q-1 5-6 5t-6-5z" fill="{ink}"/>` + fangs(64.5, [50], 3.8, 3.8),
        ],
        surprised: [
          `<ellipse cx="50" cy="67" rx="5" ry="6.5" fill="{ink}"/>`,
          lip(65.3, [46, 54]) + line("M43 67q7-5 14 0"),
          `<path d="M42 61.5h16q0 12-8 12t-8-12z" fill="{ink}"/>` + fangs(61.5, [45.6, 54.4], 4.4, 4.8),
        ],
        busy: [
          line("M43 66h14"),
          lip(65, [54]) + line("M42 65h16"),
          `<rect x="42" y="63.6" width="16" height="4.4" rx="2.2" fill="{ink}"/>` + fangs(63.6, [53.4], 3.6, 3.6),
        ],
      },
    },
    // Cheeks, now and then
    {
      name: "cheeks",
      options: ["none", "none", "blush"],
      at: [33, 60],
      parts: [
        "",
        "",
        `<ellipse cx="33" cy="60" rx="5" ry="3" fill="{blush}" opacity=".6"/><ellipse cx="67" cy="60" rx="5" ry="3" fill="{blush}" opacity=".6"/>`,
      ],
    },
  ],
});
