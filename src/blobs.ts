import { allowedBy, partsOf, type Allowed } from "./choice.js";
import type { Customizable } from "./design.js";
import { body, face, topBehind, topInFront } from "./parts.js";
import { BLOB_DRAWS, drawTraits, MOODS, type BlobChoice } from "./traits.js";

// Where each part sits, for pickers that point at it
const AT = { shape: [80, 62], top: [50, 13] } as const;

function blobDesign(allowed: Allowed): Customizable<BlobChoice> {
  return {
    name: "blobs",
    description: "Blobs, pebbles, beans and drops, with five moods.",
    moods: MOODS,
    parts: partsOf(BLOB_DRAWS, AT),
    with: (choice) => blobDesign(allowedBy("blobs", BLOB_DRAWS, choice, allowed)),
    draw(context) {
      const t = drawTraits(context, allowed);
      const cx = 50, cy = t.top === "none" ? 52 : 56;
      return {
        background: t.palette.background,
        svg: topBehind(t, cx, cy)
          + `<path d="${body(t, context.random, cx, cy)}" fill="${t.palette.body}"/>`
          + topInFront(t, cx, cy)
          + face(t, context.options.mood ?? t.mood, cx, cy),
      };
    },
  };
}

/**
 * The default design: a blob, a pebble, a bean or a drop, sometimes with an antenna, a sprout or a headset.
 * `blobs.with({ top: "headset" })` keeps them to the shapes or tops you choose.
 */
export const blobs = blobDesign({});
