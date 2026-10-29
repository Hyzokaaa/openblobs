import { context, type DesignContext } from "./design.js";
import { BACKGROUND_SHIFTS, type Palette } from "./palette.js";

export const SHAPES = ["blob", "pebble", "bean", "drop"] as const;
export const TOPS = ["none", "antenna", "sprout", "tuft", "headset", "ears"] as const;
export const MOODS = ["calm", "happy", "sleepy", "surprised", "busy"] as const;

export type Shape = (typeof SHAPES)[number];
export type Top = (typeof TOPS)[number];
export type Mood = (typeof MOODS)[number];

// Weighted draws: plain heads and calm faces are the most common.
const TOP_DRAW: Top[] = ["none", "none", "antenna", "sprout", "tuft", "headset", "ears"];
const MOOD_DRAW: Mood[] = ["calm", "calm", "calm", "happy", "happy", "sleepy", "surprised", "busy"];

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

/** The order of the draws is part of the output: never reorder them. The body draws from `random` next. */
export function drawTraits({ random, pick, palette }: DesignContext): Traits {
  const hue = Math.floor(random() * 360);
  const shape = pick(SHAPES);
  const top = pick(TOP_DRAW);
  const mood = pick(MOOD_DRAW);
  const blush = random() < 0.45;
  const backgroundShift = pick(BACKGROUND_SHIFTS);
  const details = Array.from({ length: 6 }, () => random());
  return { hue, shape, top, mood, blush, palette: palette({ hue, backgroundShift }), details };
}

/** Everything about a blob that comes from its seed. */
export function traitsOf(seed: string): Traits {
  return drawTraits(context(seed));
}
