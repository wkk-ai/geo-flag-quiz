import flags from "@/data/flags.json";

export type Difficulty = 1 | 2 | 3; // 1=Easy 2=Medium 3=Hard

export interface Flag {
  name: string;
  code: string;
  capital: string;
  difficulty: Difficulty;
  latlng?: [number, number];
}

const allFlags: Flag[] = flags as Flag[];

export function getDifficultySequence(start: Difficulty): Difficulty[] {
  if (start === 3) return [3, 2, 1];
  if (start === 2) return [2, 1, 3];
  return [1, 2, 3];
}

export function getFlagsByDifficulty(difficulty: Difficulty): Flag[] {
  return shuffle(allFlags.filter((f) => f.difficulty === difficulty));
}

/** Generate 5 country-name options (1 correct + 4 random). */
export function generateCountryOptions(correct: Flag): Flag[] {
  const distractors = shuffle(allFlags.filter((f) => f.code !== correct.code)).slice(0, 3);
  return shuffle([correct, ...distractors]);
}

/** Generate 5 capital options (1 correct + 4 random). */
export function generateCapitalOptions(correct: Flag): Flag[] {
  const distractors = shuffle(allFlags.filter((f) => f.code !== correct.code)).slice(0, 3);
  return shuffle([correct, ...distractors]);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
