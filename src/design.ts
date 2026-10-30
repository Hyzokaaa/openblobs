import { hash, normalize, pick, seeded, type Random } from "./random.js";
import { palette, type Palette, type PaletteChoice } from "./palette.js";
import { MOOD_DRAW, MOODS, type Mood } from "./moods.js";
import { allowedBy, choose, partsOf, type Allowed, type Choice, type Part } from "./choice.js";

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
  /** The parts `with` can limit, by name. */
  parts?: { readonly [part: string]: Part };
  /** The same design, limited to the options you choose for some of its parts. */
  with?(choice: Choice): Design;
  draw(context: DesignContext): Drawing;
}

/**
 * A design whose parts can be chosen: `monsters.with({ eyes: "one" })`. Everyone keeps everything else,
 * and seeds that already have an allowed option draw exactly as before.
 */
export interface Customizable<C extends Choice = Choice> extends Design {
  parts: { readonly [part: string]: Part };
  with(choice: C): Customizable<C>;
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

/** A layer with a name, so `design.with({ [name]: option })` can choose its parts. */
export interface NamedLayer {
  /** The part's name, such as `"eyes"`. */
  readonly name: string;
  /** One option name per part, in order. Repeat a name to draw it more often, as in `["none", "none", "blush"]`. */
  readonly options: readonly string[];
  /** The parts, as in any other layer: a list, or parts per mood. */
  readonly parts: Layer;
  /** Where the part sits on the 100 × 100 canvas, for pickers that point at it. */
  readonly at?: readonly [number, number];
}

// The choice a design takes, worked out from its named layers: { eyes?: "two" | "one" | readonly (...)[] }.
type ChoiceOfLayer<L> = L extends { readonly name: infer N extends string; readonly options: readonly (infer O extends string)[] }
  ? { readonly [K in N]?: O | readonly O[] }
  : {};
type Intersect<U> = (U extends unknown ? (u: U) => void : never) extends (u: infer I) => void ? I : never;
export type ChoiceOf<Layers extends readonly unknown[]> = Intersect<ChoiceOfLayer<Layers[number]>> extends infer C extends Choice ? C : never;

export interface LayeredDesignOptions<Layers extends readonly (Layer | NamedLayer)[] = readonly (Layer | NamedLayer)[]> {
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
   *
   * Name a layer, `{ name: "eyes", options: ["two", "one"], parts: [...] }`, and `design.with({ eyes: "one" })`
   * can choose it. Naming a layer never changes what the seed draws.
   */
  layers: Layers;
  /** Hues to choose from. Default: the whole wheel. */
  hues?: readonly number[];
}

const byMood = (layer: Layer): layer is MoodParts => !Array.isArray(layer);
const isNamed = (layer: Layer | NamedLayer): layer is NamedLayer => !Array.isArray(layer) && "parts" in layer;

/** A design made of interchangeable parts, for art drawn in a design tool rather than in code. */
export function layeredDesign<const Layers extends readonly (Layer | NamedLayer)[]>(
  { name, description, layers, hues }: LayeredDesignOptions<Layers>,
): Customizable<ChoiceOf<Layers>> {
  const fail = (message: string): never => { throw new Error(`openblobs: ${message} in "${name}"`); };
  const parts = layers.map((layer) => (isNamed(layer) ? layer.parts : layer));
  const count = (layer: Layer) => (byMood(layer) ? layer.calm?.length ?? 0 : layer.length);
  parts.forEach((layer, i) => {
    if (!byMood(layer)) {
      if (!layer.length) fail(`layer ${i} has no parts`);
      return;
    }
    if (!layer.calm?.length) fail(`layer ${i} has no calm parts`);
    for (const mood of MOODS) {
      const list = layer[mood];
      if (list && list.length !== layer.calm.length) fail(`layer ${i} lists ${list.length} ${mood} parts for ${layer.calm.length} calm ones`);
    }
  });
  if (hues && !hues.length) fail("the list of hues is empty");

  // Named layers: their draw lists, by name, and where each one sits
  const draws: Record<string, readonly string[]> = {}, at: Record<string, readonly [number, number] | undefined> = {}, index: Record<string, number> = {};
  layers.forEach((layer, i) => {
    if (!isNamed(layer)) return;
    if (!layer.name) fail(`layer ${i} has an empty name`);
    if (layer.name in draws) fail(`two layers are named "${layer.name}"`);
    if (layer.options.length !== count(layer.parts)) fail(`layer "${layer.name}" names ${layer.options.length} options for ${count(layer.parts)} parts`);
    if (layer.options.some((option) => !option)) fail(`layer "${layer.name}" has an empty option name`);
    draws[layer.name] = layer.options;
    at[layer.name] = layer.at;
    index[layer.name] = i;
  });
  const moodLayers = parts.filter(byMood);
  const moods = moodLayers.length ? MOODS.filter((mood) => moodLayers.some((layer) => layer[mood])) : undefined;
  const designParts = partsOf(draws, at);

  const build = (allowed: Allowed): Customizable<ChoiceOf<Layers>> => {
    // Per layer, the positions it may draw
    const only: (readonly number[] | undefined)[] = parts.map(() => undefined);
    for (const [part, positions] of Object.entries(allowed)) only[index[part]] = positions;
    return {
      name,
      description,
      moods,
      parts: designParts,
      with: (choice) => build(allowedBy(name, draws, choice, allowed)),
      draw({ random, pick, palette, options }) {
        const colors = palette({ hue: hues ? pick(hues) : undefined });
        // Drawn even when the mood is forced, so forcing it changes nothing else
        const drawn = moods ? pick(MOOD_DRAW) : "calm";
        const mood = options.mood ?? drawn;
        const svg = parts
          .map((layer, i) => {
            // One draw per layer whatever the mood: the same position picks the same feature in every mood
            const at = choose(random(), count(layer), only[i]);
            return byMood(layer) ? (layer[mood] ?? layer.calm)[at] : layer[at];
          })
          .join("")
          .replace(/\{(\w+)\}/g, (match, key: string) => (key in colors ? colors[key as keyof Palette] : match));
        return { background: colors.background, svg };
      },
    };
  };
  return build({});
}
