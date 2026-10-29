import { describe, expect, it } from "vitest";
import { MIN_CONTRAST, MIN_GEAR_CONTRAST, MOODS, openblob, openblobUri, traitsOf } from "../src/index.js";
import { contrast } from "../src/color.js";

const seeds = Array.from({ length: 2000 }, (_, i) => `user-${i}@example.test`);
const bodyOf = (svg: string) => svg.match(/<path d="[^"]+" fill="#[0-9a-f]{6}"\/>/)?.[0];

describe("openblob", () => {
  it("draws the same avatar for the same seed", () => {
    expect(openblob("Sam Porter")).toBe(openblob("Sam Porter"));
  });

  it("ignores case, outer spaces and Unicode form", () => {
    expect(openblob("  José@Example.test ")).toBe(openblob("jos\u0065\u0301@example.test"));
  });

  it("gives different seeds different avatars", () => {
    expect(new Set(seeds.map((s) => openblob(s))).size).toBe(seeds.length);
  });

  it("keeps the eyes readable against the body", () => {
    for (const s of seeds) {
      const { palette } = traitsOf(s);
      expect(contrast(palette.body, palette.ink)).toBeGreaterThanOrEqual(MIN_CONTRAST);
    }
  });

  it("keeps what sticks out of the body visible on light and dark pages", () => {
    for (const s of seeds) {
      const { palette } = traitsOf(s);
      for (const page of ["#ffffff", "#0f1219", "#000000", palette.background]) {
        expect(contrast(palette.gear, page)).toBeGreaterThanOrEqual(MIN_GEAR_CONTRAST);
      }
    }
  });

  it("never emits broken numbers", () => {
    for (const s of seeds) expect(openblob(s)).not.toMatch(/NaN|undefined|Infinity/);
  });

  it("changes only the face when the mood is forced", () => {
    for (const mood of MOODS) expect(bodyOf(openblob("ana", { mood }))).toBe(bodyOf(openblob("ana")));
  });

  it("draws something for an empty seed", () => {
    expect(openblob("")).toBe(openblob("?"));
  });

  it("is decorative without a title and named with one, escaped", () => {
    expect(openblob("a")).toContain('aria-hidden="true"');
    const named = openblob("a", { title: `<Tom "O'Brien">` });
    expect(named).toContain('role="img"');
    expect(named).not.toContain("<Tom");
    expect(named).toContain("&#60;Tom &#34;O&#39;Brien&#34;&#62;");
  });

  it("sets the size only when asked", () => {
    expect(openblob("a")).not.toContain("width=");
    expect(openblob("a", { size: 32 })).toContain('width="32" height="32"');
  });

  it("leaves the backdrop out on request", () => {
    expect(openblob("a", { background: "none" })).not.toMatch(/<circle cx="50" cy="50" r="50"|<rect width="100"/);
    expect(openblob("a", { background: "squircle" })).toContain('<rect width="100" height="100" rx="30"');
  });

  it("encodes a data URI", () => {
    expect(decodeURIComponent(openblobUri("a").split(",")[1])).toBe(openblob("a"));
  });

  // Changing these snapshots means every avatar out there changes: that is a new GENERATION.
  it("keeps the output of this generation", () => {
    for (const s of ["Sam Porter", "luis", "01JD8X2K4PZ3", "李伟", "support@example.com"]) {
      expect(openblob(s)).toMatchSnapshot(s);
    }
  });
});
