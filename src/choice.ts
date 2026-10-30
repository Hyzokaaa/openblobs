// Limiting a design to some of its parts: `design.with({ eyes: "one" })`.
// The seed still draws exactly as before; only a value that is not allowed is swapped for one that is.
// So everyone keeps everything else, and seeds that already had an allowed value draw unchanged.

/** Part name to the option, or options, to keep: `{ top: "headset" }` or `{ eyes: ["one", "two"] }`. */
export type Choice = { readonly [part: string]: string | readonly string[] | undefined };

/** A part of a design that `with` can limit. */
export interface Part {
  /** Its options, without repeats, in the order the design lists them. */
  readonly options: readonly string[];
  /** Where it sits on the 100 × 100 canvas, for pickers that point at it. */
  readonly at?: readonly [number, number];
}

/** Per part, the positions in its draw list that may be drawn. */
export type Allowed = { readonly [part: string]: readonly number[] };

/**
 * The positions a choice allows, merged over `base` (the later choice wins per part).
 * `draws` gives each part's draw list, where an option may repeat to be drawn more often.
 */
export function allowedBy(design: string, draws: { readonly [part: string]: readonly string[] }, choice: Choice, base: Allowed = {}): Allowed {
  const fail = (message: string): never => { throw new Error(`openblobs: ${message} in "${design}"`); };
  const names = Object.keys(draws);
  const allowed: Record<string, readonly number[]> = { ...base };
  for (const [part, value] of Object.entries(choice)) {
    if (value === undefined) continue;
    if (!Object.prototype.hasOwnProperty.call(draws, part)) fail(`there is no part "${part}"; the parts are ${names.join(", ") || "none"}`);
    const list = draws[part], options = [...new Set(list)];
    const wanted: readonly string[] = typeof value === "string" ? [value] : value;
    if (!wanted.length) fail(`no option is allowed for "${part}"; use one of ${options.join(", ")}`);
    for (const w of wanted) if (!options.includes(w)) fail(`"${w}" is not an option of "${part}"; use one of ${options.join(", ")}`);
    allowed[part] = list.flatMap((option, i) => (wanted.includes(option) ? [i] : []));
  }
  return allowed;
}

/**
 * Draws one position of a list of `n`, consuming exactly one draw as `pick` does, so limiting a part
 * never shifts the draws that follow. A drawn position that is allowed stays; any other becomes an allowed one.
 */
export function choose(r: number, n: number, allowed?: readonly number[]): number {
  const drawn = Math.floor(r * n);
  return !allowed || allowed.includes(drawn) ? drawn : allowed[Math.floor(r * allowed.length)];
}

/** The parts of a design as `design.parts` lists them. */
export const partsOf = (draws: { readonly [part: string]: readonly string[] }, at: { readonly [part: string]: readonly [number, number] | undefined } = {}) =>
  Object.fromEntries(Object.entries(draws).map(([name, list]) => [name, { options: [...new Set(list)], ...(at[name] ? { at: at[name] } : {}) }])) as { readonly [part: string]: Part };
