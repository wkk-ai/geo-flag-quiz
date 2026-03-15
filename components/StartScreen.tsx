"use client";

import { Difficulty } from "@/lib/gameLogic";

interface Props {
  onStart: (difficulty: Difficulty) => void;
}

const options: { label: string; value: Difficulty; desc: string }[] = [
  { label: "Easy", value: 1, desc: "Famous flags from major nations" },
  { label: "Medium", value: 2, desc: "Notable countries, slightly less obvious" },
  { label: "Hard", value: 3, desc: "Rare flags — islands, micro-states & more" },
];

export default function StartScreen({ onStart }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
      <div className="w-full max-w-md text-center">
        <div className="text-5xl mb-3">🌍</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Flag Quiz</h1>
        <p className="text-gray-500 text-sm mb-10">How well do you know the world's flags?</p>

        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Select difficulty
        </p>

        <div className="flex flex-col gap-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStart(opt.value)}
              className="w-full text-left px-5 py-4 border border-gray-200 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all group"
            >
              <span className="block font-semibold text-gray-900 group-hover:text-gray-900">
                {opt.label}
              </span>
              <span className="block text-sm text-gray-400 mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
