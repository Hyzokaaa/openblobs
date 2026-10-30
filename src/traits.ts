import { context, type DesignContext } from "./design.js";
import { BACKGROUND_SHIFTS, type Palette } from "./palette.js";
import { MOOD_DRAW, type Mood } from "./moods.js";
import { allowedBy, choose, type Allowed } from "./choice.js";

export { MOODS, type Mood } from "./moods.js";

export const SHAPES = ["blob", "pebble", "bean", "drop"] as const;
export const TOPS = ["none", "antenna", "sprout", "tuft", "headset", "ears"] as const;

export type Shape = (typeof SHAPES)[number];
export type Top = (typeof TOPS)[number];

// Weighted draw: plain heads are the most common.
const TOP_DRAW: readonly Top[] = ["none", "none", "antenna", "sprout", "tuft", "headset", "ears"];

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
export type BlobChoice = {
  readonly shape?: Shape | readonly Shape[];
  readonly top?: Top | readonly Top[];
};

/** Each part's draw list, for `blobs.with()`. */
export const BLOB_DRAWS = { shape: SHAPES, top: TOP_DRAW } as const;

/** The order of the draws is part of the output: never reorder them. The body draws from `random` next. */
export function drawTraits({ random, pick, palette }: DesignContext, only: Allowed = {}): Traits {
  const hue = Math.floor(random() * 360);
  const shape = SHAPES[choose(random(), SHAPES.length, only.shape)];
  const top = TOP_DRAW[choose(random(), TOP_DRAW.length, only.top)];
  const mood = pick(MOOD_DRAW);
  const blush = random() < 0.45;
  const backgroundShift = pick(BACKGROUND_SHIFTS);
  const details = Array.from({ length: 6 }, () => random());
  return { hue, shape, top, mood, blush, palette: palette({ hue, backgroundShift }), details };
}

/** Everything about a blob that comes from its seed, optionally limited as in `blobs.with(choice)`. */
export function traitsOf(seed: string, choice?: BlobChoice): Traits {
  return drawTraits(context(seed), choice ? allowedBy("blobs", BLOB_DRAWS, choice) : {});
}
