"use client";

import { useState } from "react";
import { Difficulty } from "@/lib/gameLogic";

export type GameMode = "flag" | "map";

interface Props {
  onStart: (mode: GameMode, difficulty: Difficulty) => void;
}

const difficulties: { label: string; value: Difficulty; desc: string }[] = [
  { label: "Easy", value: 1, desc: "Famous countries and major nations" },
  { label: "Medium", value: 2, desc: "Notable countries, slightly less obvious" },
  { label: "Hard", value: 3, desc: "Rare nations — islands, micro-states & more" },
];

const modes: { id: GameMode; label: string; desc: string; icon: string }[] = [
  { 
    id: "flag", 
    label: "Flag Quiz", 
    desc: "Identify country from its flag", 
    icon: "🚩" 
  },
  { 
    id: "map", 
    label: "Map Quiz", 
    desc: "Identify country from its location", 
    icon: "🗺️" 
  },
];

export default function StartScreen({ onStart }: Props) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  if (!selectedMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-3">🌍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Geo Quiz</h1>
          <p className="text-gray-500 text-sm mb-10">Test your geography knowledge</p>

          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Select Game Mode
          </p>

          <div className="flex flex-col gap-3">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className="w-full text-left px-5 py-4 border border-gray-200 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{mode.icon}</span>
                  <div>
                    <span className="block font-semibold text-gray-900">
                      {mode.label}
                    </span>
                    <span className="block text-sm text-gray-400 mt-0.5">{mode.desc}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
      <div className="w-full max-w-md text-center">
        <div className="text-5xl mb-3">{selectedMode === "flag" ? "🚩" : "🗺️"}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
          {selectedMode === "flag" ? "Flag Quiz" : "Map Quiz"}
        </h1>
        <p className="text-gray-500 text-sm mb-10">Select your challenge level</p>

        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Select Difficulty
        </p>

        <div className="flex flex-col gap-3">
          {difficulties.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStart(selectedMode, opt.value)}
              className="w-full text-left px-5 py-4 border border-gray-200 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all group"
            >
              <span className="block font-semibold text-gray-900 group-hover:text-gray-900">
                {opt.label}
              </span>
              <span className="block text-sm text-gray-400 mt-0.5">{opt.desc}</span>
            </button>
          ))}
          <button 
            onClick={() => setSelectedMode(null)}
            className="mt-4 text-xs font-medium text-gray-400 hover:text-gray-900 underline underline-offset-4"
          >
            ← Back to modes
          </button>
        </div>
      </div>
    </div>
  );
}
