import { defineDesign } from "./design.js";
import { body, face, topBehind, topInFront } from "./parts.js";
import { drawTraits, MOODS } from "./traits.js";

/** The default design: a blob, a pebble, a bean or a drop, sometimes with an antenna, a sprout or a headset. */
export const blobs = defineDesign({
  name: "blobs",
  description: "Blobs, pebbles, beans and drops, with five moods.",
  moods: MOODS,
  draw(context) {
    const t = drawTraits(context);
    const cx = 50, cy = t.top === "none" ? 52 : 56;
    return {
      background: t.palette.background,
      svg: topBehind(t, cx, cy)
        + `<path d="${body(t, context.random, cx, cy)}" fill="${t.palette.body}"/>`
        + topInFront(t, cx, cy)
        + face(t, context.options.mood ?? t.mood, cx, cy),
    };
  },
});
