import { hash, normalize, pick, seeded, type Random } from "./random.js";
import { palette, type Palette, type PaletteChoice } from "./palette.js";
import { MOOD_DRAW, MOODS, type Mood } from "./moods.js";

export type Background = "circle" | "squircle" | "none";

export interface OpenblobOptions {
  /** Width and height in pixels. Omit it to size the SVG with CSS. */
  size?: number;
  /** Default `circle`. Drawn only when the design gives a background colour. */
  background?: Background;
  /** Overrides the mood drawn from the seed; nothing else changes. Designs without moods ignore it. */
  mood?: Mood;
  /** Accessible name. Without it the avatar is decorative (`aria-hidden`). */
  title?: string;
  /** What to draw. Default `blobs`. */
  design?: Design;
}

/** What a design gets to draw one avatar. */
export interface DesignContext {
  /** The normalised seed. */
  seed: string;
  /** Seeded generator in [0, 1). The order of your draws is part of the output: append new ones, never reorder. */
  random: Random;
  /** One item of `list`, drawn from `random`. */
  pick<T>(list: readonly T[]): T;
  /** Contrast-checked colours: ink on body always reaches 4.5:1. Draws from `random` for whatever you leave out. */
  palette(choice?: PaletteChoice): Palette;
  options: Readonly<OpenblobOptions>;
}

export interface Drawing {
  /** Colour of the backdrop. Leave it out for no backdrop. */
  background?: string;
  /** SVG elements in a 100 × 100 viewBox, without the `<svg>` wrapper. */
  svg: string;
}

export interface Design {
  name: string;
  /** One line on what it draws, shown in the demo. */
  description?: string;
  /** The moods it can draw. Without them, the `mood` option is ignored. */
  moods?: readonly Mood[];
  draw(context: DesignContext): Drawing;
}

/** Identity, there for the types: `defineDesign({ name, draw })`. */
export function defineDesign(design: Design): Design {
  return design;
}

export function context(seed: string, options: OpenblobOptions = {}): DesignContext {
  const normalized = normalize(seed) || "?";
  const random = seeded(hash(normalized));
  return {
    seed: normalized,
    random,
    pick: (list) => pick(random, list),
    palette: (choice) => palette(random, choice),
    options,
  };
}

/** Parts that change with the mood. `calm` is required and stands in for any mood left out. */
export type MoodParts = { readonly calm: readonly string[] } & { readonly [M in Exclude<Mood, "calm">]?: readonly string[] };

/** A list of parts, or parts per mood. */
export type Layer = readonly string[] | MoodParts;

export interface LayeredDesignOptions {
  name: string;
  /** One line on what it draws, shown in the demo. */
  description?: string;
  /**
   * Drawn bottom to top. Each layer is a list of SVG snippets in a 100 × 100 viewBox and the seed picks one;
   * an empty string makes the layer optional. Colours can be `{body}`, `{ink}`, `{shade}`, `{gear}`,
   * `{accent}`, `{background}` or `{blush}`. Append layers or designs at the end: reordering redraws everyone.
   *
   * A layer can also give its parts per mood, `{ calm: [...], happy: [...] }`. Every mood lists the same
   * number of parts in the same order, so a person keeps their features and only the expression changes.
   */
  layers: readonly Layer[];
  /** Hues to choose from. Default: the whole wheel. */
  hues?: readonly number[];
}

const byMood = (layer: Layer): layer is MoodParts => !Array.isArray(layer);

/** A design made of interchangeable parts, for art drawn in a design tool rather than in code. */
export function layeredDesign({ name, description, layers, hues }: LayeredDesignOptions): Design {
  const fail = (message: string) => { throw new Error(`openblobs: ${message} in "${name}"`); };
  layers.forEach((layer, i) => {
    if (!byMood(layer)) {
      if (!layer.length) fail(`layer ${i} has no parts`);
      return;
    }
    if (!layer.calm?.length) fail(`layer ${i} has no calm parts`);
    for (const mood of MOODS) {
      const parts = layer[mood];
      if (parts && parts.length !== layer.calm.length) fail(`layer ${i} lists ${parts.length} ${mood} parts for ${layer.calm.length} calm ones`);
    }
  });
  if (hues && !hues.length) fail("the list of hues is empty");
  const moodLayers = layers.filter(byMood);
  const moods = moodLayers.length ? MOODS.filter((mood) => moodLayers.some((layer) => layer[mood])) : undefined;

  return defineDesign({
    name,
    description,
    moods,
    draw({ random, pick, palette, options }) {
      const colors = palette({ hue: hues ? pick(hues) : undefined });
      // Drawn even when the mood is forced, so forcing it changes nothing else
      const drawn = moods ? pick(MOOD_DRAW) : "calm";
      const mood = options.mood ?? drawn;
      const svg = layers
        .map((layer) => {
          if (!byMood(layer)) return pick(layer);
          // One draw per layer whatever the mood: the same index picks the same feature in every mood
          const index = Math.floor(random() * layer.calm.length);
          return (layer[mood] ?? layer.calm)[index];
        })
        .join("")
        .replace(/\{(\w+)\}/g, (match, key: string) => (key in colors ? colors[key as keyof Palette] : match));
      return { background: colors.background, svg };
    },
  });
}
