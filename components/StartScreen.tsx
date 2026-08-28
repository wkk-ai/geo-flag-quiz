"use client";

import { useState } from "react";
import { Difficulty } from "@/lib/gameLogic";
import { OfflineHint } from "@/components/PwaRegistration";

export type GameMode = "flag" | "map";

interface Props {
  onStart: (mode: GameMode, difficulty: Difficulty) => void;
  bestScore: number;
  bestStreak: number;
}

const difficulties: { label: string; value: Difficulty; desc: string }[] = [
  { label: "Easy", value: 1, desc: "Well-known countries" },
  { label: "Medium", value: 2, desc: "A bit trickier" },
  { label: "Hard", value: 3, desc: "Tiny nations and odd flags" },
];

const modes: { id: GameMode; label: string; desc: string; icon: string }[] = [
  {
    id: "flag",
    label: "Flag Quiz",
    desc: "Name the country. Capital is bonus points.",
    icon: "🚩",
  },
  {
    id: "map",
    label: "Map Quiz",
    desc: "Name the highlighted country.",
    icon: "🗺️",
  },
];

export default function StartScreen({ onStart, bestScore, bestStreak }: Props) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  if (!selectedMode) {
    return (
      <main
        id="main"
        className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-slate-950 text-slate-100"
      >
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="text-7xl mb-4 drop-shadow-2xl animate-float motion-reduce:animate-none" aria-hidden="true">
              🌍
            </div>
            <h1 className="text-5xl font-black text-white mb-2 tracking-tight text-balance">Geo Quiz</h1>
            <p className="text-slate-400 text-sm">How many can you name?</p>
          </div>

          {(bestScore > 0 || bestStreak > 0) && (
            <div className="mb-6 flex justify-center gap-6 text-sm">
              {bestScore > 0 && (
                <p>
                  <span className="block text-[11px] uppercase tracking-wider text-slate-500">Best score</span>
                  <span className="font-bold tabular-nums text-white">{bestScore.toLocaleString()}</span>
                </p>
              )}
              {bestStreak > 0 && (
                <p>
                  <span className="block text-[11px] uppercase tracking-wider text-slate-500">Best streak</span>
                  <span className="font-bold tabular-nums text-white">{bestStreak}</span>
                </p>
              )}
            </div>
          )}

          <div className="px-5 py-7 rounded-3xl bg-white/[0.03] border border-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 mb-5">
              Choose a game
            </p>
            <p className="text-xs text-slate-500 mb-5">3 lives. Streaks boost your score.</p>

            <div className="flex flex-col gap-3">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSelectedMode(mode.id)}
                  className="w-full text-left px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-blue-500/50 active:scale-[0.98] transition-[transform,background-color,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl" aria-hidden="true">
                      {mode.icon}
                    </span>
                    <div className="min-w-0">
                      <span className="block font-bold text-white text-lg tracking-tight">{mode.label}</span>
                      <span className="block text-xs text-slate-400 mt-1 leading-relaxed">{mode.desc}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <OfflineHint />
        </div>
      </main>
    );
  }

  return (
    <main
      id="main"
      className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-slate-950 text-slate-100"
    >
      <div className="w-full max-w-md text-center">
        <div className="mb-8 pt-2">
          <div className="text-7xl mb-4" aria-hidden="true">
            {selectedMode === "flag" ? "🚩" : "🗺️"}
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight text-balance">
            {selectedMode === "flag" ? "Flag Quiz" : "Map Quiz"}
          </h1>
          <p className="text-slate-400 text-sm">Pick a difficulty</p>
        </div>

        <div className="px-5 py-7 rounded-3xl bg-white/[0.03] border border-white/10">
          <div className="flex flex-col gap-3">
            {difficulties.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onStart(selectedMode, opt.value)}
                className="w-full text-left px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-blue-500/50 active:scale-[0.98] transition-[transform,background-color,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <span className="block font-bold text-white text-lg tracking-tight">{opt.label}</span>
                <span className="block text-xs text-slate-400 mt-1 leading-relaxed">{opt.desc}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setSelectedMode(null)}
              className="mt-4 min-h-11 text-sm font-semibold text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-xl"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
