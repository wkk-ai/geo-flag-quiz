const KEY = "geo-quiz-v1";

export type Stats = {
  bestScore: number;
  bestStreak: number;
  gamesPlayed: number;
  muted: boolean;
};

export const DEFAULT_STATS: Stats = {
  bestScore: 0,
  bestStreak: 0,
  gamesPlayed: 0,
  muted: false,
};

let cached: Stats = DEFAULT_STATS;
let clientHydrated = false;
const listeners = new Set<() => void>();

function readStorage(): Stats {
  if (typeof window === "undefined") return { ...DEFAULT_STATS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw) as Partial<Stats>;
    return { ...DEFAULT_STATS, ...parsed };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function getStatsSnapshot(): Stats {
  if (!clientHydrated) {
    cached = readStorage();
    clientHydrated = true;
  }
  return cached;
}

export function getServerStats(): Stats {
  return DEFAULT_STATS;
}

export function subscribeStats(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function loadStats(): Stats {
  return getStatsSnapshot();
}

export function saveStats(partial: Partial<Stats>): Stats {
  cached = { ...getStatsSnapshot(), ...partial };
  try {
    localStorage.setItem(KEY, JSON.stringify(cached));
  } catch {
    /* private mode */
  }
  emit();
  return cached;
}

export function saveBests(score: number, streak: number): Stats {
  const prev = getStatsSnapshot();
  return saveStats({
    bestScore: Math.max(prev.bestScore, score),
    bestStreak: Math.max(prev.bestStreak, streak),
  });
}

export function recordRun(score: number, streak: number): {
  stats: Stats;
  newBestScore: boolean;
  newBestStreak: boolean;
} {
  const prev = getStatsSnapshot();
  const newBestScore = score > prev.bestScore;
  const newBestStreak = streak > prev.bestStreak;
  const stats = saveStats({
    bestScore: Math.max(prev.bestScore, score),
    bestStreak: Math.max(prev.bestStreak, streak),
    gamesPlayed: prev.gamesPlayed + 1,
  });
  return { stats, newBestScore, newBestStreak };
}
