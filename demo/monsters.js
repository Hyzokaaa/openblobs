// An example of a layered design: plain SVG parts in a 100 × 100 box, coloured with placeholders.
// Use it with `layeredDesign(monsters)`. Append parts or layers at the end: reordering redraws everyone.
const pupils = (y, r) => `<circle cx="41.5" cy="${y}" r="${r}" fill="{ink}"/><circle cx="61.5" cy="${y}" r="${r}" fill="{ink}"/>`;

export const monsters = {
  name: "monsters",
  layers: [
    // Horns and ears, drawn first so the body hides their base
    [
      "",
      `<path d="M31 36 25 13 43 29zM69 36l6-23-18 16z" fill="{gear}"/>`,
      `<circle cx="29" cy="31" r="10" fill="{shade}"/><circle cx="71" cy="31" r="10" fill="{shade}"/>`,
    ],
    // Bodies
    [
      `<rect x="21" y="24" width="58" height="60" rx="24" fill="{body}"/>`,
      `<circle cx="50" cy="54" r="31" fill="{body}"/>`,
      `<path d="M23 83V49a27 27 0 0 1 54 0v34l-9-6-9 6-9-6-9 6-9-6z" fill="{body}"/>`,
    ],
    // Eyes
    [
      `<circle cx="40" cy="48" r="7.5" fill="#fff"/><circle cx="60" cy="48" r="7.5" fill="#fff"/>` + pupils(49, 3.6),
      `<circle cx="50" cy="47" r="12" fill="#fff"/><circle cx="51.5" cy="48.5" r="6" fill="{ink}"/>`,
      `<path d="M33 49q7 6 14 0M53 49q7 6 14 0" stroke="{ink}" stroke-width="3.4" stroke-linecap="round" fill="none"/>`,
    ],
    // Mouths
    [
      `<path d="M42 65q8 7 16 0" stroke="{ink}" stroke-width="3.4" stroke-linecap="round" fill="none"/>`,
      `<path d="M38 62h24q-1 11-12 11T38 62z" fill="{ink}"/><path d="M42 62l2.5 5 2.5-5zM53 62l2.5 5 2.5-5z" fill="#fff"/>`,
      `<ellipse cx="50" cy="67" rx="4" ry="5" fill="{ink}"/>`,
    ],
    // Cheeks, now and then
    [
      "",
      "",
      `<ellipse cx="33" cy="60" rx="5" ry="3" fill="{blush}" opacity=".6"/><ellipse cx="67" cy="60" rx="5" ry="3" fill="{blush}" opacity=".6"/>`,
    ],
  ],
};
