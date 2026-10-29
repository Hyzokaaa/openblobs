# openblobs

**[Live demo](https://hyzokaaa.github.io/openblobs/)**

![A row of blobs and a row of monsters, a custom design](https://raw.githubusercontent.com/Hyzokaaa/openblobs/main/media/preview.svg)

Friendly, deterministic SVG avatars from any string. The same seed always draws the same little creature, and you can bring your own design and keep every guarantee.

- Zero dependencies, runs anywhere JavaScript does (browser, Node, edge).
- Nothing leaves your app: avatars are drawn locally, no third-party requests.
- Ink always reaches a 4.5:1 contrast against the body, in the built-in blobs and in your own designs.
- No element ids, gradients or filters, so any number of avatars can share a page.

## Install

```sh
npm install openblobs
```

## Use

```ts
import { openblob, openblobUri } from "openblobs";

const svg = openblob("01JD8X2K4PZ3", { size: 32 });   // SVG string
img.src = openblobUri("01JD8X2K4PZ3");                 // data URI
```

React:

```tsx
import { Openblob } from "openblobs/react";

<Openblob seed={user.id} size={32} title={user.name} />
```

Anything else (Vue, Svelte, a template, an email) can use the data URI:

```html
<img :src="openblobUri(user.id)" width="32" height="32" alt="">
```

Seed with a stable id rather than a name or an email: the avatar survives renames and reveals nothing about the person.

## Options

| Option       | Default     | Meaning |
|--------------|-------------|---------|
| `size`       | none        | Width and height in px. Omit it to size with CSS. |
| `background` | `"circle"`  | `"circle"`, `"squircle"` or `"none"`. |
| `mood`       | from seed   | `calm`, `happy`, `sleepy`, `surprised` or `busy`. Only the face changes. Blobs only. |
| `title`      | none        | Accessible name. Without it the avatar is decorative. |
| `design`     | `blobs`     | What to draw. See below. |

Seeds are normalised (Unicode NFC, trimmed, lower-cased) before hashing. An empty or blank seed draws the avatar of `"?"`.

## Your own design

### From parts

Draw the parts in any design tool on a 100 × 100 canvas, paste the SVG, and let the seed pick one part per layer. Colour them with placeholders and openblobs fills in a palette whose ink always reads on the body.

```ts
import { layeredDesign, openblob } from "openblobs";

const monsters = layeredDesign({
  name: "monsters",
  layers: [
    // Bottom to top. "" makes a layer optional.
    ["", `<path d="M31 36 25 13 43 29zM69 36l6-23-18 16z" fill="{gear}"/>`],
    [`<circle cx="50" cy="54" r="31" fill="{body}"/>`, `<rect x="21" y="24" width="58" height="60" rx="24" fill="{body}"/>`],
    [`<circle cx="50" cy="47" r="12" fill="#fff"/><circle cx="51.5" cy="48.5" r="6" fill="{ink}"/>`],
    [`<path d="M42 65q8 7 16 0" stroke="{ink}" stroke-width="3.4" stroke-linecap="round" fill="none"/>`],
  ],
});

openblob(user.id, { design: monsters });
```

Placeholders: `{body}`, `{ink}`, `{shade}`, `{gear}` (readable on light and dark pages), `{accent}`, `{blush}` and `{background}`. Pass `hues: [200, 220, 240]` to stay within your brand. The full monsters of the demo are in [`demo/monsters.js`](demo/monsters.js).

### In code

When parts are not enough, draw with code. You get a seeded generator and the same contrast-checked palette:

```ts
import { defineDesign } from "openblobs";

const rings = defineDesign({
  name: "rings",
  draw({ random, pick, palette }) {
    const c = palette();                       // or palette({ hue: 210 })
    const count = 2 + Math.floor(random() * 3);
    let svg = "";
    for (let i = count; i > 0; i--) svg += `<circle cx="50" cy="50" r="${i * 12}" fill="${i % 2 ? c.body : c.shade}"/>`;
    return { background: c.background, svg: svg + `<circle cx="50" cy="50" r="5" fill="${pick([c.ink, c.accent])}"/>` };
  },
});
```

`draw` returns the SVG elements without the `<svg>` wrapper, and the colour of the backdrop (leave it out for none). openblobs adds the wrapper, the size, the backdrop and the accessible name. The built-in `blobs` are written with this same API.

### Keeping your design stable

Within a design, the same seed draws the same avatar as long as the draws happen in the same order. So append new layers, parts or `random()` calls at the end, and never reorder them. Adding a part to an existing layer redraws that layer for some seeds. Avoid ids, gradients and filters in inline SVG, or they will clash when two avatars share a page (avatars used as `<img>` are not affected).

## Stability

The built-in blobs have a `GENERATION`. Within a generation the same seed always draws the same avatar. A change that would redraw existing avatars ships as a new major version with a new generation; new options, moods and designs may arrive in minor versions.

Coordinates are rounded to one decimal, so every engine draws the same SVG in practice. Engines may differ in the last digit of `Math.sin` and friends, though, so a byte-for-byte match between, say, Node on the server and Safari in the browser is very likely rather than promised.

## Demo

Online at https://hyzokaaa.github.io/openblobs/. To run it locally:

```sh
npm run build
npx serve .
```

Then open `/demo/`. `npm run preview` redraws the image at the top of this file.

## License

MIT
