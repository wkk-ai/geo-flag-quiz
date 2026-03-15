"use client";

import Image from "next/image";
import { Flag } from "@/lib/gameLogic";

type AnswerState = "idle" | "both-correct" | "wrong";

interface Props {
  flag: Flag;
  countryOptions: Flag[];
  capitalOptions: Flag[];
  streak: number;
  tier: string;
  answerState: AnswerState;
  selectedCountry: string | null;
  selectedCapital: string | null;
  onSelectCountry: (code: string) => void;
  onSelectCapital: (code: string) => void;
  onNext: () => void;
}

function optionClass(
  code: string,
  correctCode: string,
  selected: string | null,
  answerState: AnswerState,
  disabled: boolean
): string {
  const base = "w-full text-left px-3 py-2.5 border rounded-xl text-sm font-medium transition-all";
  if (answerState === "idle") {
    if (selected === code) return `${base} border-gray-900 bg-gray-50 text-gray-900`;
    if (disabled) return `${base} border-gray-100 text-gray-300 cursor-default`;
    return `${base} border-gray-200 text-gray-800 hover:border-gray-900 hover:bg-gray-50`;
  }
  if (code === correctCode) return `${base} border-green-500 bg-green-50 text-green-800`;
  if (code === selected && selected !== correctCode) return `${base} border-red-400 bg-red-50 text-red-700`;
  return `${base} border-gray-100 text-gray-300`;
}

export default function GameScreen({
  flag,
  countryOptions,
  capitalOptions,
  streak,
  tier,
  answerState,
  selectedCountry,
  selectedCapital,
  onSelectCountry,
  onSelectCapital,
  onNext,
}: Props) {
  const isAnswered = answerState !== "idle";
  // Country column is locked once user picks a country AND capital, or if answered
  const countryLocked = isAnswered;
  const capitalLocked = isAnswered;

  const flagBorderColor =
    answerState === "both-correct"
      ? "border-green-400"
      : answerState === "wrong"
      ? "border-red-400"
      : "border-gray-100";

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

        {/* Flag - Shrinks when answered to save space */}
        <div className={`relative w-full rounded-xl overflow-hidden border-2 transition-all duration-500 ease-in-out bg-gray-50 
          ${isAnswered ? "aspect-[2/1] mb-3 scale-90" : "aspect-[3/2] mb-5"} 
          ${flagBorderColor}`}
        >
          <Image
            src={`https://flagcdn.com/w640/${flag.code}.png`}
            alt="Country flag"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 512px"
            priority
          />
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-2 gap-3 mb-1.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center">Country</p>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center">Capital</p>
        </div>

        {/* Two-column options */}
        <div className="grid grid-cols-2 gap-3">
          {/* Country options */}
          <div className="flex flex-col gap-2">
            {countryOptions.map((opt) => (
              <button
                key={opt.code}
                onClick={() => !countryLocked && onSelectCountry(opt.code)}
                disabled={countryLocked}
                className={optionClass(opt.code, flag.code, selectedCountry, answerState, countryLocked)}
              >
                {opt.name}
              </button>
            ))}
          </div>

          {/* Capital options */}
          <div className="flex flex-col gap-2">
            {capitalOptions.map((opt) => (
              <button
                key={opt.code}
                onClick={() => !capitalLocked && onSelectCapital(opt.code)}
                disabled={capitalLocked}
                className={optionClass(opt.code, flag.code, selectedCapital, answerState, capitalLocked)}
              >
                <span>{opt.capital}</span>
                {isAnswered && (
                  <span className="block text-xs font-normal mt-0.5 opacity-60">{opt.name}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Spacer so fixed bar doesn't overlap last option */}
        {isAnswered && <div className="h-32" />}
      </div>

      {/* Feedback + Next — fixed to bottom, always visible */}
      {isAnswered && (
        <div className="fixed bottom-0 left-0 right-0 flex flex-col items-center gap-3 px-6 py-5 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
          <p className={`text-sm font-semibold ${answerState === "both-correct" ? "text-green-600" : "text-red-500"}`}>
            {answerState === "both-correct"
              ? "Both correct! 🎉"
              : `Wrong — ${flag.name}, capital: ${flag.capital}`}
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
