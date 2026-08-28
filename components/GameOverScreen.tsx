"use client";

interface Props {
  score: number;
  bestScore: number;
  streak: number;
  bestStreak: number;
  correct: number;
  asked: number;
  newBestScore: boolean;
  onPlayAgain: () => void;
  onHome: () => void;
}

export default function GameOverScreen({
  score,
  bestScore,
  streak,
  bestStreak,
  correct,
  asked,
  newBestScore,
  onPlayAgain,
  onHome,
}: Props) {
  const accuracy = asked > 0 ? Math.round((correct / asked) * 100) : 0;

  return (
    <main
      id="main"
      className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-slate-950 text-slate-100"
    >
      <div className="w-full max-w-md text-center space-y-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-400 mb-2">
            Out of lives
          </p>
          <h1 className="text-4xl font-black tracking-tight text-balance">Game over</h1>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-8 space-y-6">
          {newBestScore && (
            <p className="text-amber-400 text-sm font-bold uppercase tracking-wider">New best score</p>
          )}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Score</p>
            <p className="text-5xl font-black tabular-nums">{score.toLocaleString()}</p>
          </div>
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-slate-500">Best</dt>
              <dd className="text-lg font-bold tabular-nums">{bestScore.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-slate-500">Streak</dt>
              <dd className="text-lg font-bold tabular-nums">
                {streak}
                <span className="block text-[10px] font-medium text-slate-500">best {bestStreak}</span>
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-slate-500">Right</dt>
              <dd className="text-lg font-bold tabular-nums">
                {correct}/{asked}
                <span className="block text-[10px] font-medium text-slate-500">{accuracy}%</span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full min-h-12 py-3 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-colors"
          >
            Play again
          </button>
          <button
            type="button"
            onClick={onHome}
            className="w-full min-h-12 py-3 text-sm font-semibold text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-2xl transition-colors"
          >
            Change game
          </button>
        </div>
      </div>
    </main>
  );
}
