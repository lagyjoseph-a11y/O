export type Caption = { text: string; startMs: number; endMs: number };
export type Color = "gold" | "green" | "red" | "grey";
export type Arrow = { from: string; to: string; color: Color };
export type Mark = { sq: string; color: Color };

export type Beat = {
  t: number; // secondes
  move?: { from: string; to: string; promo?: "Q"; san: string };
  label?: { text: string; color: Color } | null;
  arrows?: Arrow[];
  marks?: Mark[];
  zoom?: { sq: string; scale: number } | null;
  overlay?: { title: string; sub?: string } | null;
  sfx?: "whoosh" | "impact";
};

export type Lesson = {
  title: string; // « Le gambit … » : la fin s'affiche en grand
  subtitle: string;
  audio: string; // fichier dans public/
  durationS: number;
  captions: Caption[];
  beats: Beat[];
};

// Instant (s) du n-ième mot exact du script.
export const makeAt = (captions: Caption[]) => (word: string, n = 1): number => {
  let k = 0;
  for (const c of captions) {
    if (c.text === word && ++k === n) return c.startMs / 1000;
  }
  throw new Error(`Mot introuvable : ${word} #${n}`);
};
