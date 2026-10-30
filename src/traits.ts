import { context, type DesignContext } from "./design.js";
import { BACKGROUND_SHIFTS, type Palette } from "./palette.js";
import { MOOD_DRAW, type Mood } from "./moods.js";
import type { Random } from "./random.js";

export { MOODS, type Mood } from "./moods.js";

export const SHAPES = ["blob", "pebble", "bean", "drop"] as const;
export const TOPS = ["none", "antenna", "sprout", "tuft", "headset", "ears"] as const;

export type Shape = (typeof SHAPES)[number];
export type Top = (typeof TOPS)[number];

// Weighted draw: plain heads are the most common.
const TOP_DRAW: Top[] = ["none", "none", "antenna", "sprout", "tuft", "headset", "ears"];

export interface Traits {
  hue: number;
  shape: Shape;
  top: Top;
  mood: Mood;
  blush: boolean;
  palette: Palette;
  /** Fixed draws for the face and the top, so changing the mood leaves everything else alone. */
  details: number[];
}

/** Which shapes and tops a blob may have: one, or a list to choose from. */
export interface BlobChoice {
  shape?: Shape | readonly Shape[];
  top?: Top | readonly Top[];
}

/** A choice as lists, checked once: from plain JS any string may come in. */
export interface Allowed {
  shape?: readonly Shape[];
  top?: readonly Top[];
}

function allowed<T extends string>(what: string, value: T | readonly T[] | undefined, all: readonly T[]): readonly T[] | undefined {
  if (value === undefined) return undefined;
  const list: readonly T[] = typeof value === "string" ? [value] : value;
  if (!list.length) throw new Error(`No ${what} allowed: list at least one of ${all.join(", ")}.`);
  for (const v of list) if (!all.includes(v)) throw new Error(`Unknown ${what} "${v}": use one of ${all.join(", ")}.`);
  return list;
}

export function allow(choice: BlobChoice = {}, base: Allowed = {}): Allowed {
  return {
    shape: allowed("shape", choice.shape, SHAPES) ?? base.shape,
    top: allowed("top", choice.top, TOPS) ?? base.top,
  };
}

// Draws exactly as `pick` does, so allowing values never shifts the draws that follow.
// A seed whose drawn value is allowed keeps it; the others get one of the allowed values.
function choose<T>(random: Random, list: readonly T[], only: readonly T[] | undefined): T {
  const r = random(), drawn = list[Math.floor(r * list.length)];
  return !only || only.includes(drawn) ? drawn : only[Math.floor(r * only.length)];
}

/** The order of the draws is part of the output: never reorder them. The body draws from `random` next. */
export function drawTraits({ random, pick, palette }: DesignContext, only: Allowed = {}): Traits {
  const hue = Math.floor(random() * 360);
  const shape = choose(random, SHAPES, only.shape);
  const top = choose(random, TOP_DRAW, only.top);
  const mood = pick(MOOD_DRAW);
  const blush = random() < 0.45;
  const backgroundShift = pick(BACKGROUND_SHIFTS);
  const details = Array.from({ length: 6 }, () => random());
  return { hue, shape, top, mood, blush, palette: palette({ hue, backgroundShift }), details };
}

/** Everything about a blob that comes from its seed, optionally limited as in `blobs.with(choice)`. */
export function traitsOf(seed: string, choice?: BlobChoice): Traits {
  return drawTraits(context(seed), allow(choice));
}
