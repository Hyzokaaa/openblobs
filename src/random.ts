/** 53-bit string hash (cyrb53). Only the first 32 bits seed the generator. */
export function hash(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  return h1 >>> 0;
}

export type Random = () => number;

/** Seeded generator (mulberry32): the same seed always gives the same sequence in [0, 1). */
export function seeded(seed: number): Random {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(random: Random, list: readonly T[]): T {
  return list[Math.floor(random() * list.length)];
}

/** The same person written with different case, spacing or Unicode form gets the same avatar. */
export function normalize(seed: string): string {
  return seed.normalize("NFC").trim().toLowerCase();
}
