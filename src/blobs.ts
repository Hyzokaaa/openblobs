import { defineDesign, type Design } from "./design.js";
import { body, face, topBehind, topInFront } from "./parts.js";
import { allow, drawTraits, MOODS, type Allowed, type BlobChoice } from "./traits.js";

export interface BlobsDesign extends Design {
  /**
   * The same blobs, limited to the shapes or tops you allow: `blobs.with({ top: "headset" })`.
   * Everyone keeps their colours, face and mood; a seed whose shape or top is allowed keeps it too.
   */
  with(choice: BlobChoice): BlobsDesign;
}

function blobDesign(only: Allowed): BlobsDesign {
  return {
    ...defineDesign({
      name: "blobs",
      description: "Blobs, pebbles, beans and drops, with five moods.",
      moods: MOODS,
      draw(context) {
        const t = drawTraits(context, only);
        const cx = 50, cy = t.top === "none" ? 52 : 56;
        return {
          background: t.palette.background,
          svg: topBehind(t, cx, cy)
            + `<path d="${body(t, context.random, cx, cy)}" fill="${t.palette.body}"/>`
            + topInFront(t, cx, cy)
            + face(t, context.options.mood ?? t.mood, cx, cy),
        };
      },
    }),
    with: (choice) => blobDesign(allow(choice, only)),
  };
}

/** The default design: a blob, a pebble, a bean or a drop, sometimes with an antenna, a sprout or a headset. */
export const blobs = blobDesign({});
