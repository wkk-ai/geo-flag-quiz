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
  const base = "w-full text-left px-4 py-3.5 border rounded-2xl text-[13px] font-black transition-all duration-300 shadow-sm ";
  if (answerState === "idle") {
    if (selected === code) return `${base} bg-blue-600 border-blue-400 text-white shadow-blue-500/20 scale-[1.05] ring-2 ring-blue-500/50`;
    if (disabled) return `${base} border-white/5 bg-white/[0.01] text-slate-600 cursor-default opacity-50`;
    return `${base} border-white/10 bg-white/[0.03] backdrop-blur-md text-slate-400 hover:border-white/20 hover:text-white hover:bg-white/[0.06] active:scale-[0.98]`;
  }
  if (code === correctCode) return `${base} bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20 scale-[1.05] z-10 ring-4 ring-emerald-500/20`;
  if (code === selected && selected !== correctCode) return `${base} bg-rose-500 border-rose-400 text-white shadow-rose-500/20 scale-[0.98] ring-4 ring-rose-500/20`;
  return `${base} border-white/5 bg-white/[0.01] text-slate-700 opacity-40 blur-[1px]`;
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-slate-950 text-slate-100 py-8 selection:bg-blue-500/30">
      <div className="w-full max-w-lg space-y-4">
        {/* Header - Premium Navigation */}
        <div className="grid grid-cols-3 items-center px-4 mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 text-left">{tier} Mode</span>
          
          <button 
            onClick={onHome}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all group mx-auto active:scale-95"
          >
            <span className="text-base group-hover:scale-110 transition-transform">🏠</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white">Exit</span>
          </button>
          
          <div className="flex items-center justify-end gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Streak</span>
            <span className="text-lg font-black text-white tabular-nums tracking-tighter">{streak}</span>
          </div>
        </div>

        {/* Flag - Premium Display */}
        <div className={`relative w-full rounded-3xl overflow-hidden border transition-all duration-700 ease-in-out bg-white/[0.02] aspect-[2/1] shadow-2xl ring-1 ring-white/5 ${answerState === "both-correct" ? "border-emerald-500 shadow-emerald-500/10" : answerState === "wrong" ? "border-rose-500 shadow-rose-500/10" : "border-white/10"}`}
        >
          <div className="absolute inset-0 bg-blue-500/5 blur-[80px]"></div>
          <Image
            src={`https://flagcdn.com/w640/${flag.code}.png`}
            alt="Country flag"
            fill
            className="object-contain p-6 relative z-10 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            sizes="(max-width: 768px) 100vw, 512px"
            priority
          />
        </div>

        {/* Column headers - Compact */}
        <div className="grid grid-cols-2 gap-4 px-2 pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 text-center">Country</p>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 text-center">Capital</p>
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
                <span className="text-xs font-black leading-tight truncate w-full text-center">{opt.name}</span>
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
                <span className="text-xs font-black leading-tight truncate w-full text-center">{opt.capital}</span>
                {isAnswered && (
                  <span className="block text-[8px] font-black uppercase tracking-tighter mt-0.5 opacity-50 truncate w-full text-center">{opt.name}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback + Next Section */}
        {isAnswered ? (
          <div className="flex flex-col items-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col items-center gap-1">
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${answerState === "both-correct" ? "text-emerald-400" : "text-rose-400"}`}>
                {answerState === "both-correct" ? "Perfect Match!" : "Discovery Insight"}
              </p>
              {answerState === "wrong" && (
                <p className="text-white font-black text-xl tracking-tight text-center">
                  That was {flag.name}, {flag.capital}
                </p>
              )}
            </div>
            
            <button
              onClick={onNext}
              className="w-full max-w-sm py-4 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-2 group"
            >
              Continue Expedition
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        ) : (
          <div className="h-24" />
        )}
      </div>
    </div>
  );
}
