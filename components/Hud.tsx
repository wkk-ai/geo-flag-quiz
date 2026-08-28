"use client";

interface Props {
  tier: string;
  score: number;
  streak: number;
  lives: number;
  bestScore: number;
  lastDelta: number | null;
  muted: boolean;
  onHome: () => void;
  onToggleMute: () => void;
}

export default function Hud({
  tier,
  score,
  streak,
  lives,
  bestScore,
  lastDelta,
  muted,
  onHome,
  onToggleMute,
}: Props) {
  const hot = streak >= 3;

  return (
    <header className="w-full space-y-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onHome}
          className="min-h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-colors"
        >
          Menu
        </button>

        <div
          className="flex items-center gap-1.5"
          aria-live="polite"
          aria-label={`${lives} ${lives === 1 ? "life" : "lives"} left`}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`text-lg leading-none ${i < lives ? "text-rose-400" : "text-slate-700"}`}
            >
              ♥
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Unmute sounds" : "Mute sounds"}
          className="min-h-11 min-w-11 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-colors"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">{tier}</p>
          <p className="text-[11px] text-slate-500">
            Best {bestScore.toLocaleString()}
          </p>
        </div>

        <div className="text-center relative">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Score</p>
          <p className="text-2xl font-black tabular-nums leading-none" aria-live="polite">
            {score.toLocaleString()}
          </p>
          {lastDelta != null && lastDelta > 0 && (
            <span className="absolute -right-8 -top-1 text-sm font-bold text-emerald-400 animate-pop motion-reduce:animate-none">
              +{lastDelta}
            </span>
          )}
        </div>

        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Streak</p>
          <p className={`text-2xl font-black tabular-nums leading-none ${hot ? "text-amber-400" : "text-white"}`}>
            {streak}
            {hot ? " 🔥" : ""}
          </p>
        </div>
      </div>
    </header>
  );
}
