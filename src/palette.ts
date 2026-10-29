import { contrast, hsl, luminance } from "./color.js";
import { pick, type Random } from "./random.js";

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

export interface PaletteChoice {
  /** 0 to 360. Drawn from the seed when left out. */
  hue?: number;
  /** How far the backdrop's hue turns from the body's. Drawn from the seed when left out. */
  backgroundShift?: number;
}

/** Ink always reaches 4.5:1 against the body (WCAG AA for text). */
export const MIN_CONTRAST = 4.5;

/** WCAG 1.4.11: graphics need 3:1 against what surrounds them. */
export const MIN_GEAR_CONTRAST = 3;

export const BACKGROUND_SHIFTS = [0, 30, 180, -40];

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

/** Contrast-checked colours. Draws, in this order: the hue and the shift when not given, then two values of its own. */
export function palette(
  random: Random,
  { hue = Math.floor(random() * 360), backgroundShift = pick(random, BACKGROUND_SHIFTS) }: PaletteChoice = {},
): Palette {
  hue = ((hue % 360) + 360) % 360;
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
    background: hsl((((hue + backgroundShift) % 360) + 360) % 360, 50, 91),
    blush: hsl((hue + 340) % 360, 80, 72),
  };
}
