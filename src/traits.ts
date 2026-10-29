import { hash, normalize, pick, seeded, type Random } from "./random.js";
import { contrast, hsl, luminance } from "./color.js";

export const SHAPES = ["blob", "pebble", "bean", "drop"] as const;
export const TOPS = ["none", "antenna", "sprout", "tuft", "headset", "ears"] as const;
export const MOODS = ["calm", "happy", "sleepy", "surprised", "busy"] as const;

export type Shape = (typeof SHAPES)[number];
export type Top = (typeof TOPS)[number];
export type Mood = (typeof MOODS)[number];

// Weighted draws: plain heads and calm faces are the most common.
const TOP_DRAW: Top[] = ["none", "none", "antenna", "sprout", "tuft", "headset", "ears"];
const MOOD_DRAW: Mood[] = ["calm", "calm", "calm", "happy", "happy", "sleepy", "surprised", "busy"];
const BACKGROUND_SHIFTS = [0, 30, 180, -40];

export interface Palette {
  body: string;
  ink: string;
  shade: string;
  /** What sticks out of the body (antenna, headset, tuft): readable on light and dark pages alike. */
  gear: string;
  accent: string;
  background: string;
  blush: string;
}

export interface Traits {
  hue: number;
  shape: Shape;
  top: Top;
  mood: Mood;
  blush: boolean;
  palette: Palette;
  /** Fixed draws for the face and the top, so changing the mood leaves everything else alone. */
  details: number[];
  /** Left for the body, which draws a different number of values per shape. */
  random: Random;
}

/** Eyes always reach 4.5:1 against the body (WCAG AA for text). */
export const MIN_CONTRAST = 4.5;

/** WCAG 1.4.11: graphics need 3:1 against what surrounds them. */
export const MIN_GEAR_CONTRAST = 3;

// Luminance window that keeps 3:1 against near-black pages and against the light backdrop.
const GEAR_MIN_LUMINANCE = 0.12, GEAR_MAX_LUMINANCE = 0.22;

function gear(hue: number): string {
  let lo = 5, hi = 95;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (luminance(hsl(hue, 55, mid)) < (GEAR_MIN_LUMINANCE + GEAR_MAX_LUMINANCE) / 2) lo = mid; else hi = mid;
  }
  return hsl(hue, 55, (lo + hi) / 2);
}

function palette(random: Random, hue: number, backgroundShift: number): Palette {
  let bodyL = 60 + random() * 10, inkL = 16;
  const sat = 58 + random() * 16;
  let body = hsl(hue, sat, bodyL), ink = hsl(hue, 38, inkL);
  while (contrast(body, ink) < MIN_CONTRAST && inkL > 4) { inkL -= 2; ink = hsl(hue, 38, inkL); }
  while (contrast(body, ink) < MIN_CONTRAST && bodyL < 85) { bodyL += 3; body = hsl(hue, sat, bodyL); }
  return {
    body,
    ink,
    shade: hsl(hue, sat, bodyL - 14),
    gear: gear(hue),
    accent: hsl((hue + 150) % 360, 70, 58),
    background: hsl((hue + backgroundShift + 360) % 360, 50, 91),
    blush: hsl((hue + 340) % 360, 80, 72),
  };
}

/** Everything about an avatar that comes from its seed. The order of the draws is part of the output: never reorder them. */
export function traitsOf(seed: string): Traits {
  const random = seeded(hash(normalize(seed)));
  const hue = Math.floor(random() * 360);
  const shape = pick(random, SHAPES);
  const top = pick(random, TOP_DRAW);
  const mood = pick(random, MOOD_DRAW);
  const blush = random() < 0.45;
  const backgroundShift = pick(random, BACKGROUND_SHIFTS);
  const details = Array.from({ length: 6 }, () => random());
  return { hue, shape, top, mood, blush, palette: palette(random, hue, backgroundShift), details, random };
}
