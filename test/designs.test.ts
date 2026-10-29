// Every design in src/designs runs through these checks, so contributing one needs no tests of its own.
/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import { blobs, openblob, type Design } from "../src/index.js";
import * as bundled from "../src/designs/index.js";

const files = Object.keys(import.meta.glob("../src/designs/*.ts"))
  .map((path) => path.replace(/^.*\/|\.ts$/g, ""))
  .filter((file) => file !== "index");
const designs: [string, Design][] = [["blobs", blobs], ...Object.entries(bundled)];
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
  it("lists every design file in its index, under the file's name", () => {
    expect(Object.keys(bundled).sort()).toEqual([...files].sort());
    for (const [key, design] of Object.entries(bundled)) expect(design.name).toBe(key);
  });
});

describe.each(designs)("%s", (name, design) => {
  const drawings = seeds.map((seed) => openblob(seed, { design }));

  it("has a short, lower-case name", () => {
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

  it("stays small", () => {
    for (const svg of drawings) expect(svg.length).toBeLessThan(8000);
  });

  // Changing this snapshot redraws everyone who uses the design: only on purpose, in a major version.
  it("keeps its output", () => {
    for (const seed of ["Sam Porter", "01JD8X2K4PZ3", "李伟"]) expect(openblob(seed, { design })).toMatchSnapshot(seed);
  });
});
