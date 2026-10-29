# Contributing

Thanks for helping. Bug fixes, docs and new designs are all welcome. For anything bigger than a fix, open an issue first so we can agree on it before you spend the time.

## Setup

```sh
git clone https://github.com/<you>/openblobs.git
cd openblobs
npm install
npm test
```

`npm run typecheck`, `npm test` and `npm run build` run on every pull request.

## Adding a design

A design is one file in [`src/designs`](src/designs). The quickest kind is a layered one: SVG parts, and the seed picks one per layer.

**The fastest start:** the [demo](https://hyzokaaa.github.io/openblobs/#h-design) has a playground. Paste your parts, watch them on twelve seeds, and "Copy as a design file" gives you the file for step 4, ready to commit.

1. **Draw the parts** in any tool on a 100 × 100 canvas: bodies, eyes, mouths, hats, whatever your creatures are made of. Keep everything inside the canvas, and leave room for the round backdrop.
2. **Export each part as SVG** and keep only the elements (`<path>`, `<circle>`, `<rect>`, `<ellipse>`, `<g>`...), without the `<svg>` wrapper.
3. **Replace the colours with placeholders** so every avatar gets its own contrast-checked palette:

   | Placeholder    | Use it for |
   |----------------|------------|
   | `{body}`       | The main shape. |
   | `{ink}`        | Eyes, mouths, outlines on the body. Always 4.5:1 against `{body}`. |
   | `{shade}`      | A darker body tone: ears, spots, shadows. |
   | `{gear}`       | What sticks out of the body. Readable on light and dark pages. |
   | `{accent}`     | Small details in a contrasting hue. |
   | `{blush}`      | Cheeks. |
   | `{background}` | Rarely needed: the backdrop already uses it. |

   Fixed colours like `#fff` for the white of an eye are fine.
4. **Create `src/designs/<name>.ts`**, with the file name, the export and the `name` all the same, lower-case:

   ```ts
   import { layeredDesign } from "../design.js";

   export const robots = layeredDesign({
     name: "robots",
     description: "Boxy robots with antennas and screens for faces.",
     layers: [
       // Bottom to top. "" makes a layer optional; repeat a part to make it more common.
       [`<rect x="22" y="26" width="56" height="54" rx="10" fill="{body}"/>`, `...`],
       [`...eyes...`],
       ["", `...antenna...`],
     ],
   });
   ```

   [`monsters.ts`](src/designs/monsters.ts) is a complete example. If parts are not enough, `defineDesign` lets you draw in code; [`blobs.ts`](src/blobs.ts) is written that way.
   **Give it moods.** Eyes and mouths can come per mood: `{ calm: [...], happy: [...], sleepy: [...], surprised: [...], busy: [...] }`, with the same number of parts in the same order for every mood, so each person keeps their features and only the expression changes. The tests check that every mood draws something different. All the bundled designs do this; [`robots.ts`](src/designs/robots.ts) and [`critters.ts`](src/designs/critters.ts) are short examples.
5. **Add it to [`src/designs/index.ts`](src/designs/index.ts):** export it in alphabetical order, and add it at the end of the `designs` list, which sets the order of the demo and the docs. Add it at the end of the table of designs in the README too.
6. **Run `npm test`.** Every design is checked for you: same seed, same avatar; enough variety; well-formed SVG; no ids, styles, gradients, filters, scripts or links that would leak into the page; no leftover placeholders. The first run writes a snapshot of your design: commit it.
7. **Look at it:** `npm run build`, `npx serve .` and open `/demo/?design=<name>`. Try the dark mode and the small sizes (20 and 24 px): details that vanish there are better left out.
8. **Open a pull request** with a screenshot of the demo grid.

### What makes a design a good fit

- It reads at 24 px: big shapes, few details, eyes that stay visible.
- It works on any hue, since the palette turns all the way round. Use `hues` only for a strong reason.
- It feels friendly and neutral: no faces of real people, brands, logos or anything that could read as mocking someone.
- It is your own work, released under the MIT licence along with the rest of the project.

### Once it is merged

The design's snapshot freezes it: people will have it on their profiles. After a release, add parts or layers only at the end, and a change that redraws existing avatars waits for a major version. Small fixes before the first release are fine.

## Publishing a design yourself

You do not need to be in this repository: `layeredDesign` and `defineDesign` are public, so you can publish `openblobs-design-<name>` on npm with `openblobs` as a peer dependency. Open an issue and we will link it from the README.

## Commits

Short messages in the imperative, with a prefix: `feat:`, `fix:`, `docs:`, `test:`, `chore:`. One topic per pull request.
