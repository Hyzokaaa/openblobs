import { layeredDesign } from "../design.js";

// Robots with a screen for a face. The face glows in the body colour on an ink screen, so it keeps 4.5:1 too.
// Append parts or layers at the end: reordering them redraws everyone.
const glow = (d: string, width = 3) => `<path d="${d}" stroke="{body}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
const dots = (r = 3.6) => `<circle cx="42" cy="50" r="${r}" fill="{body}"/><circle cx="58" cy="50" r="${r}" fill="{body}"/>`;
const squares = (size = 7) => {
  const at = (x: number) => `<rect x="${x - size / 2}" y="${50 - size / 2}" width="${size}" height="${size}" rx="1.6" fill="{body}"/>`;
  return at(42) + at(58);
};

export const robots = layeredDesign({
  name: "robots",
  description: "Robots with a screen for a face, antennas and bolts, in five moods.",
  layers: [
    // Ears, drawn first so the head hides their base
    [
      "",
      "",
      `<rect x="13" y="44" width="12" height="22" rx="5" fill="{gear}"/><rect x="75" y="44" width="12" height="22" rx="5" fill="{gear}"/>`,
    ],
    // Heads
    [
      `<rect x="22" y="26" width="56" height="56" rx="16" fill="{body}"/>`,
      `<rect x="19" y="30" width="62" height="50" rx="13" fill="{body}"/>`,
      `<path d="M24 52a26 26 0 0 1 52 0v18a11 11 0 0 1-11 11H35a11 11 0 0 1-11-11z" fill="{body}"/>`,
    ],
    // Antennas
    [
      "",
      `<path d="M50 27V15" stroke="{gear}" stroke-width="3.4" stroke-linecap="round"/><circle cx="50" cy="12" r="5" fill="{accent}"/>`,
      `<path d="M39 29 33 16M61 29l6-13" stroke="{gear}" stroke-width="3.4" stroke-linecap="round"/><circle cx="32" cy="14" r="4" fill="{accent}"/><circle cx="68" cy="14" r="4" fill="{accent}"/>`,
      `<rect x="43" y="19" width="14" height="9" rx="3" fill="{gear}"/><circle cx="50" cy="16" r="3.5" fill="{accent}"/>`,
    ],
    // Screens
    [
      `<rect x="30" y="38" width="40" height="30" rx="9" fill="{ink}"/>`,
      `<rect x="27" y="38" width="46" height="28" rx="14" fill="{ink}"/>`,
    ],
    // Eyes: round or square LEDs, in every mood
    {
      calm: [dots(), squares()],
      happy: [glow("M38 52q4-6 8 0M54 52q4-6 8 0"), glow("M38 52l4-4 4 4M54 52l4-4 4 4")],
      sleepy: [glow("M38 49q4 4 8 0M54 49q4 4 8 0"), glow("M38 51h8M54 51h8")],
      surprised: [
        `<circle cx="42" cy="50" r="4.4" stroke="{body}" stroke-width="2.6" fill="none"/><circle cx="58" cy="50" r="4.4" stroke="{body}" stroke-width="2.6" fill="none"/>`,
        `<rect x="37.5" y="45.5" width="9" height="9" rx="2" stroke="{body}" stroke-width="2.6" fill="none"/><rect x="53.5" y="45.5" width="9" height="9" rx="2" stroke="{body}" stroke-width="2.6" fill="none"/>`,
      ],
      busy: [
        `<circle cx="42" cy="50" r="3.6" fill="{body}"/>` + glow("M54 50h8"),
        `<rect x="38.5" y="46.5" width="7" height="7" rx="1.6" fill="{body}"/>` + glow("M54 50h8"),
      ],
    },
    // Mouths: a line or a speaker grille, in every mood
    {
      calm: [glow("M45 59.5q5 3 10 0", 2.6), glow("M44 59v3M48 59v3M52 59v3M56 59v3", 2)],
      happy: [glow("M43 58.5q7 6 14 0", 2.8), `<path d="M44 58h12q-1 5.5-6 5.5T44 58z" fill="{body}"/>`],
      sleepy: [`<circle cx="50" cy="61" r="1.8" fill="{body}"/>`, glow("M47 61h6", 2.4)],
      surprised: [
        `<ellipse cx="50" cy="61" rx="2.8" ry="3.2" fill="{body}"/>`,
        `<rect x="45" y="57.5" width="10" height="7" rx="2" stroke="{body}" stroke-width="2.2" fill="none"/>`,
      ],
      busy: [glow("M45 61h10", 2.6), glow("M44 61.5l3-2 3 2 3-2 3 2", 2.2)],
    },
    // Cheek lights, now and then
    [
      "",
      "",
      `<circle cx="33.5" cy="72.5" r="2.4" fill="{accent}"/><circle cx="66.5" cy="72.5" r="2.4" fill="{accent}"/>`,
    ],
  ],
});
