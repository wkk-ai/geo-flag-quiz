import flags from "@/data/flags.json";

export type Difficulty = 1 | 2 | 3; // 1=Easy 2=Medium 3=Hard

export interface Flag {
  name: string;
  code: string;
  capital: string;
  difficulty: Difficulty;
  latlng?: [number, number];
}

export type AnswerState = "idle" | "correct" | "partial" | "wrong";
export type FlagStep = "country" | "capital";

export const START_LIVES = 3;
export const COUNTRY_PTS = 100;
export const CAPITAL_PTS = 50;
export const MAP_PTS = 100;

const allFlags: Flag[] = flags as Flag[];

export const TIER_LABELS: Record<Difficulty, string> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

export function streakMultiplier(streak: number): number {
  return 1 + Math.min(Math.max(streak - 1, 0), 10) * 0.15;
}

export function pointsFor(base: number, streakAfter: number): number {
  return Math.round(base * streakMultiplier(streakAfter));
}

export function getFlagsByDifficulty(difficulty: Difficulty, excludeCode?: string): Flag[] {
  const pool = allFlags.filter(
    (f) => f.difficulty === difficulty && f.code !== excludeCode
  );
  return shuffle(pool.length > 0 ? pool : allFlags.filter((f) => f.code !== excludeCode));
}

function geoDist2(a: Flag, b: Flag): number {
  if (!a.latlng || !b.latlng) return Number.POSITIVE_INFINITY;
  const dLat = a.latlng[0] - b.latlng[0];
  const dLng = a.latlng[1] - b.latlng[1];
  return dLat * dLat + dLng * dLng;
}

/** 4 options: correct + 3 same-difficulty. Map mode prefers nearby countries. */
export function generateCountryOptions(correct: Flag, nearby = false): Flag[] {
  return pickOptions(correct, nearby);
}

export function generateCapitalOptions(correct: Flag): Flag[] {
  return pickOptions(correct, false);
}

function pickOptions(correct: Flag, nearby: boolean): Flag[] {
  const pool = allFlags.filter((f) => f.code !== correct.code);
  const same = pool.filter((f) => f.difficulty === correct.difficulty);
  const rest = pool.filter((f) => f.difficulty !== correct.difficulty);
  const byNear = (list: Flag[]) =>
    [...list].sort((a, b) => geoDist2(a, correct) - geoDist2(b, correct));
  const ranked = nearby
    ? [...byNear(same), ...byNear(rest)]
    : [...shuffle(same), ...shuffle(rest)];
  return shuffle([correct, ...ranked.slice(0, 3)]);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
