import { body, face, topBehind, topInFront } from "./parts.js";
import { traitsOf, type Mood } from "./traits.js";

export { traitsOf, SHAPES, TOPS, MOODS, MIN_CONTRAST, MIN_GEAR_CONTRAST } from "./traits.js";
export type { Mood, Shape, Top, Traits, Palette } from "./traits.js";

/**
 * Bumped only when the same seed would draw a different avatar. Within a generation the
 * output of a seed never changes; new moods or options may still be added.
 */
export const GENERATION = 1;

export type Background = "circle" | "squircle" | "none";

export interface OpenblobOptions {
  /** Width and height in pixels. Omit it to size the SVG with CSS. */
  size?: number;
  /** Default `circle`. */
  background?: Background;
  /** Overrides the mood drawn from the seed; nothing else changes. */
  mood?: Mood;
  /** Accessible name. Without it the avatar is decorative (`aria-hidden`). */
  title?: string;
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The avatar of `seed` as an SVG string. The same seed always gives the same avatar. */
export function openblob(seed: string, options: OpenblobOptions = {}): string {
  const { size, background = "circle", mood, title } = options;
  const t = traitsOf(seed || "?");
  const cx = 50, cy = t.top === "none" ? 52 : 56;
  const backdrop = background === "circle"
    ? `<circle cx="50" cy="50" r="50" fill="${t.palette.background}"/>`
    : background === "squircle"
      ? `<rect width="100" height="100" rx="30" fill="${t.palette.background}"/>`
      : "";
  const dimensions = size ? ` width="${size}" height="${size}"` : "";
  const a11y = title ? ` role="img" aria-label="${escape(title)}"><title>${escape(title)}</title>` : ` aria-hidden="true">`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${dimensions}${a11y}`
    + backdrop
    + topBehind(t, cx, cy)
    + `<path d="${body(t, cx, cy)}" fill="${t.palette.body}"/>`
    + topInFront(t, cx, cy)
    + face(t, mood ?? t.mood, cx, cy)
    + `</svg>`;
}

/** The avatar as a data URI, for `<img src>` or CSS `background-image`. */
export function openblobUri(seed: string, options: OpenblobOptions = {}): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(openblob(seed, options))}`;
}
