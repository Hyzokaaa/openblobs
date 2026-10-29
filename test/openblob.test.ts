import { describe, expect, it } from "vitest";
import {
  MIN_CONTRAST, MIN_GEAR_CONTRAST, MOODS, blobs, defineDesign, layeredDesign, openblob, openblobUri, traitsOf,
} from "../src/index.js";
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

  it("draws something for an empty or blank seed", () => {
    expect(openblob("")).toBe(openblob("?"));
    expect(openblob("  ")).toBe(openblob("?"));
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

  it("never lets the size inject markup", () => {
    const svg = openblob("a", { size: '32" onload="alert(1)' as unknown as number });
    expect(svg).not.toContain("onload");
    expect(svg).not.toContain("width=");
    expect(openblob("a", { size: "48" as unknown as number })).toContain('width="48" height="48"');
  });

  it("keeps the generator out of the public traits", () => {
    expect(traitsOf("ana")).not.toHaveProperty("random");
    expect(traitsOf("ana")).toEqual(traitsOf("ana"));
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

describe("designs", () => {
  const dot = defineDesign({
    name: "dot",
    draw: ({ random, palette }) => {
      const c = palette();
      return { background: c.background, svg: `<circle cx="50" cy="50" r="${10 + Math.round(random() * 20)}" fill="${c.body}"/>` };
    },
  });

  it("draws blobs by default", () => {
    expect(openblob("ana", { design: blobs })).toBe(openblob("ana"));
  });

  it("draws a custom design inside the same wrapper", () => {
    const svg = openblob("ana", { design: dot, size: 40, title: "Ana", background: "squircle" });
    expect(svg).toMatch(/^<svg [^>]*width="40"[^>]*role="img"[^>]*><title>Ana<\/title><rect width="100" height="100" rx="30" fill="#[0-9a-f]{6}"\/><circle /);
    expect(openblob(" ANA ", { design: dot })).toBe(openblob("ana", { design: dot }));
  });

  it("leaves the backdrop out when the design gives no background", () => {
    const bare = defineDesign({ name: "bare", draw: () => ({ svg: "<g/>" }) });
    expect(openblob("a", { design: bare })).toBe('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true"><g/></svg>');
  });

  it("gives every design a contrast-checked palette, whatever the hue", () => {
    for (let hue = -360; hue <= 720; hue += 7) {
      const check = defineDesign({
        name: "check",
        draw: ({ palette }) => {
          const c = palette({ hue });
          expect(contrast(c.body, c.ink)).toBeGreaterThanOrEqual(MIN_CONTRAST);
          return { svg: "" };
        },
      });
      openblob(`hue-${hue}`, { design: check });
    }
  });

  const faces = layeredDesign({
    name: "faces",
    layers: [
      ['<circle cx="50" cy="50" r="34" fill="{body}"/>', '<rect x="16" y="16" width="68" height="68" rx="20" fill="{body}"/>'],
      ['<circle cx="40" cy="46" r="4" fill="{ink}"/><circle cx="60" cy="46" r="4" fill="{ink}"/>'],
      ["", '<path d="M40 62 q10 8 20 0" stroke="{ink}" stroke-width="3" fill="none"/>'],
    ],
  });

  it("fills the colours of a layered design and picks its parts from the seed", () => {
    const drawn = seeds.slice(0, 200).map((s) => openblob(s, { design: faces }));
    for (const svg of drawn) expect(svg).not.toMatch(/\{\w+\}/);
    expect(new Set(drawn.map((svg) => svg.includes("<rect x="))).size).toBe(2);
    expect(new Set(drawn.map((svg) => svg.includes("<path"))).size).toBe(2);
  });

  it("leaves unknown placeholders alone", () => {
    const odd = layeredDesign({ name: "odd", layers: [['<g data-x="{nope}"/>']] });
    expect(openblob("a", { design: odd })).toContain('data-x="{nope}"');
  });

  it("keeps a layered design within the hues it is given", () => {
    const red = layeredDesign({ name: "red", layers: [['<g fill="{body}"/>']], hues: [0] });
    const fills = new Set(seeds.slice(0, 50).map((s) => openblob(s, { design: red }).match(/<g fill="(#[0-9a-f]{6})"/)![1]));
    for (const fill of fills) {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(fill.slice(i, i + 2), 16));
      expect(r).toBeGreaterThan(g);
      expect(g).toBe(b);
    }
  });

  it("rejects a layer without parts", () => {
    expect(() => layeredDesign({ name: "broken", layers: [[]] })).toThrow(/layer 0/);
  });
});
