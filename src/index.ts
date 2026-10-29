import { blobs } from "./blobs.js";
import { context, type OpenblobOptions } from "./design.js";

export { blobs } from "./blobs.js";
export { defineDesign, layeredDesign } from "./design.js";
export type { Background, Design, DesignContext, Drawing, LayeredDesignOptions, OpenblobOptions } from "./design.js";
export { MIN_CONTRAST, MIN_GEAR_CONTRAST } from "./palette.js";
export type { Palette, PaletteChoice } from "./palette.js";
export type { Random } from "./random.js";
export { traitsOf, SHAPES, TOPS, MOODS } from "./traits.js";
export type { Mood, Shape, Top, Traits } from "./traits.js";

/**
 * Generation of the built-in `blobs` design. Bumped only when the same seed would draw a different
 * blob; within a generation the output of a seed never changes. New moods or options may still be added.
 */
export const GENERATION = 1;

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The avatar of `seed` as an SVG string. The same seed always gives the same avatar. */
export function openblob(seed: string, options: OpenblobOptions = {}): string {
  const { size, background = "circle", title, design = blobs } = options;
  const drawing = design.draw(context(seed, options));
  const fill = drawing.background && escape(drawing.background);
  const backdrop = !fill ? ""
    : background === "circle" ? `<circle cx="50" cy="50" r="50" fill="${fill}"/>`
    : background === "squircle" ? `<rect width="100" height="100" rx="30" fill="${fill}"/>`
    : "";
  // Checked at runtime too: from plain JS, `size` may be anything a caller passes along
  const px = Number(size);
  const dimensions = Number.isFinite(px) && px > 0 ? ` width="${px}" height="${px}"` : "";
  const a11y = title ? ` role="img" aria-label="${escape(title)}"><title>${escape(title)}</title>` : ` aria-hidden="true">`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${dimensions}${a11y}${backdrop}${drawing.svg}</svg>`;
}

/** The avatar as a data URI, for `<img src>` or CSS `background-image`. */
export function openblobUri(seed: string, options: OpenblobOptions = {}): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(openblob(seed, options))}`;
}
