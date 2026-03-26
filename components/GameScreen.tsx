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
  onHome: () => void;
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
  onHome,
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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white py-6">
      <div className="w-full max-w-lg space-y-4">
        {/* Header - Permanently shrunk */}
        <div className="grid grid-cols-3 items-center transition-all duration-500 opacity-70 scale-95">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-left">{tier} Mode</span>
          
          <button 
            onClick={onHome}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-100 hover:border-gray-900 hover:bg-gray-50 transition-all group mx-auto"
          >
            <span className="text-sm">🏠</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-900">Home</span>
          </button>

          <div className="flex items-center justify-end gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Streak</span>
            <span className="text-sm font-black text-gray-900">{streak}</span>
          </div>
        </div>

        {/* Flag - Permanently shrunk and compact */}
        <div className={`relative w-full rounded-xl overflow-hidden border-2 transition-all duration-500 ease-in-out bg-gray-50 aspect-[2.2/1] scale-95 shadow-sm ${flagBorderColor}`}
        >
          <Image
            src={`https://flagcdn.com/w640/${flag.code}.png`}
            alt="Country flag"
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, 512px"
            priority
          />
        </div>

        {/* Column headers - Compact */}
        <div className="grid grid-cols-2 gap-3 -mb-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Country</p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Capital</p>
        </div>

        {/* Two-column options - 4 alternatives */}
        <div className="grid grid-cols-2 gap-3 px-2">
          {/* Country options */}
          <div className="flex flex-col gap-2">
            {countryOptions.map((opt) => (
              <button
                key={opt.code}
                onClick={() => !countryLocked && onSelectCountry(opt.code)}
                disabled={countryLocked}
                className={optionClass(opt.code, flag.code, selectedCountry, answerState, countryLocked)}
              >
                <span className="text-xs font-bold leading-tight truncate w-full text-center">{opt.name}</span>
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
                <span className="text-xs font-bold leading-tight truncate w-full text-center">{opt.capital}</span>
                {isAnswered && (
                  <span className="block text-[8px] font-black uppercase tracking-tighter mt-0.5 opacity-50 truncate w-full text-center">{opt.name}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback + Next Section */}
        {isAnswered ? (
          <div className="flex flex-col items-center gap-3 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className={`text-xs font-black uppercase tracking-widest ${answerState === "both-correct" ? "text-green-600" : "text-red-500"}`}>
              {answerState === "both-correct"
                ? "Both correct! 🎉"
                : `Wrong — ${flag.name}, capital: ${flag.capital}`}
            </p>
            <button
              onClick={onNext}
              className="w-full max-w-xs py-3.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200"
            >
              Next Flag →
            </button>
          </div>
        ) : (
          <div className="h-20" /> /* Reserved space for feedback/nav */
        )}
      </div>
    </div>
  );
}
