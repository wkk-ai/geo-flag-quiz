"use client";

import { Flag } from "@/lib/gameLogic";
import InteractiveMap from "./InteractiveMap";

type AnswerState = "idle" | "both-correct" | "wrong";

interface Props {
  country: Flag;
  countryOptions: Flag[];
  streak: number;
  tier: string;
  answerState: AnswerState;
  selectedCountry: string | null;
  onSelectCountry: (code: string) => void;
  onNext: () => void;
}

function optionClass(
  code: string,
  correctCode: string,
  selected: string | null,
  answerState: AnswerState,
  disabled: boolean
): string {
  const base = "w-full text-left px-3 py-2.5 border rounded-xl text-sm font-medium transition-all flex flex-col items-start";
  if (answerState === "idle") {
    if (selected === code) return `${base} border-gray-900 bg-gray-50 text-gray-900`;
    if (disabled) return `${base} border-gray-100 text-gray-300 cursor-default`;
    return `${base} border-gray-200 text-gray-800 hover:border-gray-900 hover:bg-gray-50`;
  }
  if (code === correctCode) return `${base} border-green-500 bg-green-50 text-green-800`;
  if (code === selected && selected !== correctCode) return `${base} border-red-400 bg-red-50 text-red-700`;
  return `${base} border-gray-100 text-gray-300`;
}

export default function MapScreen({
  country,
  countryOptions,
  streak,
  tier,
  answerState,
  selectedCountry,
  onSelectCountry,
  onNext,
}: Props) {
  const isAnswered = answerState !== "idle";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className={`flex items-center justify-between transition-all duration-500 ${isAnswered ? "mb-2 opacity-60 scale-95" : "mb-6"}`}>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{tier}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Streak</span>
            <span className="text-sm font-bold text-gray-800">{streak}</span>
          </div>
        </div>

        {/* Map - Shrinks slightly when answered */}
        <div className={`transition-all duration-500 ease-in-out ${isAnswered ? "scale-90 mb-3" : "mb-6"}`}>
          <InteractiveMap targetCode={country.code} isAnswered={isAnswered} />
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center mb-4">
          Which country is highlighted?
        </p>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-2 mb-8">
          {countryOptions.map((opt) => (
            <button
              key={opt.code}
              onClick={() => !isAnswered && onSelectCountry(opt.code)}
              disabled={isAnswered}
              className={optionClass(opt.code, country.code, selectedCountry, answerState, isAnswered)}
            >
              <span className="font-semibold">{opt.name}</span>
              {isAnswered && (
                <span className="text-xs font-normal opacity-60 mt-0.5">Capital: {opt.capital}</span>
              )}
            </button>
          ))}
        </div>

        {/* Spacer for sticky bar */}
        {isAnswered && <div className="h-28" />}
      </div>

      {/* Sticky Bottom Bar */}
      {isAnswered && (
        <div className="fixed bottom-0 left-0 right-0 flex flex-col items-center gap-3 px-6 py-5 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
          <p className={`text-sm font-semibold ${answerState === "both-correct" ? "text-green-600" : "text-red-500"}`}>
            {answerState === "both-correct"
              ? `Correct! That's ${country.name} 🎉`
              : `Wrong — It's ${country.name} (Capital: ${country.capital})`}
          </p>
          <button
            onClick={onNext}
            className="w-full max-w-xs py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
