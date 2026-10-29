export const MOODS = ["calm", "happy", "sleepy", "surprised", "busy"] as const;

export type Mood = (typeof MOODS)[number];

/** Weighted draw for the mood of a seed: calm faces are the most common. */
export const MOOD_DRAW: readonly Mood[] = ["calm", "calm", "calm", "happy", "happy", "sleepy", "surprised", "busy"];
