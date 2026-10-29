import { hash, normalize, pick, seeded, type Random } from "./random.js";
import { palette, type Palette, type PaletteChoice } from "./palette.js";
import type { Mood } from "./traits.js";

export type Background = "circle" | "squircle" | "none";

export interface OpenblobOptions {
  /** Width and height in pixels. Omit it to size the SVG with CSS. */
  size?: number;
  /** Default `circle`. Drawn only when the design gives a background colour. */
  background?: Background;
  /** Overrides the mood drawn from the seed; nothing else changes. Designs without faces ignore it. */
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

export interface LayeredDesignOptions {
  name: string;
  /** One line on what it draws, shown in the demo. */
  description?: string;
  /**
   * Drawn bottom to top. Each layer is a list of SVG snippets in a 100 × 100 viewBox and the seed picks one;
   * an empty string makes the layer optional. Colours can be `{body}`, `{ink}`, `{shade}`, `{gear}`,
   * `{accent}`, `{background}` or `{blush}`. Append layers or designs at the end: reordering redraws everyone.
   */
  layers: readonly (readonly string[])[];
  /** Hues to choose from. Default: the whole wheel. */
  hues?: readonly number[];
}

/** A design made of interchangeable parts, for art drawn in a design tool rather than in code. */
export function layeredDesign({ name, description, layers, hues }: LayeredDesignOptions): Design {
  layers.forEach((parts, i) => {
    if (!parts.length) throw new Error(`openblobs: layer ${i} of "${name}" has no parts`);
  });
  if (hues && !hues.length) throw new Error(`openblobs: "${name}" has an empty list of hues`);
  return defineDesign({
    name,
    description,
    draw({ pick, palette }) {
      const colors = palette({ hue: hues ? pick(hues) : undefined });
      const svg = layers
        .map((parts) => pick(parts))
        .join("")
        .replace(/\{(\w+)\}/g, (match, key: string) => (key in colors ? colors[key as keyof Palette] : match));
      return { background: colors.background, svg };
    },
  });
}
