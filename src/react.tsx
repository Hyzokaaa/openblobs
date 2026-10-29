import { useMemo, type ImgHTMLAttributes } from "react";
import { openblobUri, type OpenblobOptions } from "./index.js";

export interface OpenblobProps extends OpenblobOptions, Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "title"> {
  /** The seed: a user id is best, it survives renames and reveals nothing. */
  seed: string;
}

/** Rendered as an `<img>`, so long lists stay cheap and avatars never clash with the page's CSS. */
export function Openblob({ seed, size, background, mood, title, alt, ...img }: OpenblobProps) {
  const src = useMemo(() => openblobUri(seed, { background, mood }), [seed, background, mood]);
  return <img src={src} width={size} height={size} alt={alt ?? title ?? ""} draggable={false} {...img} />;
}
