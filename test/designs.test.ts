// Every design in src/designs runs through these checks, so contributing one needs no tests of its own.
/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import { blobs, openblob, type Design } from "../src/index.js";
import * as registry from "../src/designs/index.js";

const files = Object.keys(import.meta.glob("../src/designs/*.ts"))
  .map((path) => path.replace(/^.*\/|\.ts$/g, ""))
  .filter((file) => file !== "index");
const { designs: ordered, ...bundled } = registry;
const designs: [string, Design][] = [["blobs", blobs], ...ordered.map((design): [string, Design] => [design.name, design])];
const seeds = Array.from({ length: 300 }, (_, i) => `person-${i}@example.test`);

// Inline SVG shares the page: ids, styles and references would leak into it or clash between avatars
const LEAKS = /\bid=|<style|<script|<foreignObject|<image|<use\b|<filter|<mask|<clipPath|Gradient|\bhref=|url\(|\bon\w+=/i;

/** Every opened tag is closed, in order. */
function balanced(svg: string): boolean {
  const open: string[] = [];
  for (const [, closing, name, selfClosing] of svg.matchAll(/<(\/?)([a-zA-Z]+)\b[^>]*?(\/?)>/g)) {
    if (selfClosing) continue;
    if (!closing) open.push(name);
    else if (open.pop() !== name) return false;
  }
  return open.length === 0;
}

describe("src/designs", () => {
  it("exports every design file under the file's name, and lists each one once in order", () => {
    expect(Object.keys(bundled).sort()).toEqual([...files].sort());
    for (const [key, design] of Object.entries(bundled)) expect(design.name).toBe(key);
    expect([...ordered].sort((a, b) => a.name.localeCompare(b.name))).toEqual(Object.values(bundled));
  });
});

describe.each(designs)("%s", (name, design) => {
  const drawings = seeds.map((seed) => openblob(seed, { design }));

  it("has a short, lower-case name and a one-line description", () => {
    expect(design.description).toMatch(/^[^\n]{10,100}$/);
    expect(name).toMatch(/^[a-z][a-z0-9-]{1,30}$/);
  });

  it("draws the same avatar for the same seed", () => {
    for (const seed of seeds.slice(0, 50)) expect(openblob(seed, { design })).toBe(openblob(seed, { design }));
  });

  it("tells people apart", () => {
    expect(new Set(drawings).size).toBeGreaterThanOrEqual(seeds.length * 0.95);
  });

  it("draws well-formed SVG that stays inside its avatar", () => {
    for (const svg of drawings) {
      expect(svg).not.toMatch(LEAKS);
      expect(svg).not.toMatch(/\{\w+\}|NaN|undefined|Infinity|null/);
      expect(svg.match(/<svg/g)).toHaveLength(1);
      expect(balanced(svg)).toBe(true);
    }
  });

  it("draws every mood it lists, each one different", () => {
    for (const seed of design.moods ? seeds.slice(0, 40) : []) {
      const faces = design.moods!.map((mood) => openblob(seed, { design, mood }));
      expect(new Set(faces).size).toBe(design.moods!.length);
      for (const svg of faces) {
        expect(svg).not.toMatch(LEAKS);
        expect(svg).not.toMatch(/\{\w+\}|NaN|undefined|Infinity|null/);
        expect(balanced(svg)).toBe(true);
      }
    }
  });

  it("stays small", () => {
    for (const svg of drawings) expect(svg.length).toBeLessThan(8000);
  });

  // Parts: what design.with() can choose and what the demo's character points at
  const parts = Object.entries(design.parts ?? {});
  const few = seeds.slice(0, 60);

  it("names its parts, each with distinct options and a point on the canvas", () => {
    expect(parts.length).toBeGreaterThan(0);
    expect(design.with).toBeTypeOf("function");
    for (const [part, { options, at }] of parts) {
      expect(part).toMatch(/^[a-z][a-z0-9-]{1,20}$/);
      expect(options.length).toBeGreaterThan(1);
      expect(new Set(options).size).toBe(options.length);
      for (const option of options) expect(option).toMatch(/^[a-z][a-z0-9-]{1,20}$/);
      expect(at).toHaveLength(2);
      for (const v of at!) expect(v).toBeGreaterThanOrEqual(0), expect(v).toBeLessThanOrEqual(100);
    }
  });

  it("draws everyone as before when every option of a part is allowed", () => {
    for (const [part, { options }] of parts) {
      const all = design.with!({ [part]: options });
      for (const seed of few) expect(openblob(seed, { design: all })).toBe(openblob(seed, { design }));
    }
  });

  it("draws each option of each part, different from the others, and keeps a seed's own option as it was", () => {
    for (const [part, { options }] of parts) {
      const limited = options.map((option) => design.with!({ [part]: option }));
      for (const seed of few) {
        const own = openblob(seed, { design });
        const drawn = limited.map((d) => openblob(seed, { design: d }));
        expect(new Set(drawn).size).toBe(options.length);
        // Exactly one option is the seed's own, and it draws exactly what the seed draws anyway
        expect(drawn.filter((svg) => svg === own)).toHaveLength(1);
        for (const svg of drawn) {
          expect(svg).not.toMatch(LEAKS);
          expect(svg).not.toMatch(/\{\w+\}|NaN|undefined|Infinity|null/);
          expect(balanced(svg)).toBe(true);
        }
      }
    }
  });

  it("changes only the chosen part, so every option works in every mood", () => {
    for (const [part, { options }] of parts) {
      for (const mood of design.moods ?? []) {
        for (const option of options) {
          const d = design.with!({ [part]: option });
          expect(openblob("Sam Porter", { design: d, mood })).toBe(openblob("Sam Porter", { design: d, mood }));
        }
      }
    }
  });

  it("rejects parts and options it does not have", () => {
    const [part] = parts[0];
    expect(() => design.with!({ nope: "x" })).toThrow(/no part "nope"/);
    expect(() => design.with!({ [part]: "nope" })).toThrow(/"nope" is not an option/);
    expect(() => design.with!({ [part]: [] })).toThrow(/no option is allowed/);
  });

  // Changing this snapshot redraws everyone who uses the design: only on purpose, in a major version.
  it("keeps its output", () => {
    for (const seed of ["Sam Porter", "01JD8X2K4PZ3", "李伟"]) expect(openblob(seed, { design })).toMatchSnapshot(seed);
  });
});
