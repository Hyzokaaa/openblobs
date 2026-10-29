# openblobs

**[Live demo](https://hyzokaaa.github.io/openblobs/)**

Friendly, deterministic SVG avatars from any string. The same seed always draws the same little creature: a blob, a pebble, a bean or a drop, sometimes with an antenna, a sprout or a support headset.

- Zero dependencies, runs anywhere JavaScript does (browser, Node, edge).
- Nothing leaves your app: avatars are drawn locally, no third-party requests.
- Eyes always reach a 4.5:1 contrast against the body.
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

Seed with a stable id rather than a name or an email: the avatar survives renames and reveals nothing about the person.

## Options

| Option       | Default     | Meaning |
|--------------|-------------|---------|
| `size`       | none        | Width and height in px. Omit it to size with CSS. |
| `background` | `"circle"`  | `"circle"`, `"squircle"` or `"none"`. |
| `mood`       | from seed   | `calm`, `happy`, `sleepy`, `surprised` or `busy`. Only the face changes. |
| `title`      | none        | Accessible name. Without it the avatar is decorative. |

Seeds are normalised (Unicode NFC, trimmed, lower-cased) before hashing.

## Stability

Within a `GENERATION` the same seed always draws the same avatar. A change that would redraw existing avatars ships as a new major version with a new generation; new options and moods may arrive in minor versions.

## Demo

Online at https://hyzokaaa.github.io/openblobs/. To run it locally:

```sh
npm run build
npx serve .
```

Then open `/demo/`.

## License

MIT
