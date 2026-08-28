"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Hud from "./Hud";
import { AnswerState, Flag, FlagStep } from "@/lib/gameLogic";
import { optionClass } from "@/lib/optionClass";

interface Props {
  flag: Flag;
  countryOptions: Flag[];
  capitalOptions: Flag[];
  streak: number;
  tier: string;
  answerState: AnswerState;
  flagStep: FlagStep;
  selectedCountry: string | null;
  selectedCapital: string | null;
  lives: number;
  score: number;
  bestScore: number;
  lastDelta: number | null;
  muted: boolean;
  onSelectCountry: (code: string) => void;
  onSelectCapital: (code: string) => void;
  onSkipCapital: () => void;
  onNext: () => void;
  onHome: () => void;
  onToggleMute: () => void;
}

export default function GameScreen({
  flag,
  countryOptions,
  capitalOptions,
  streak,
  tier,
  answerState,
  flagStep,
  selectedCountry,
  selectedCapital,
  lives,
  score,
  bestScore,
  lastDelta,
  muted,
  onSelectCountry,
  onSelectCapital,
  onSkipCapital,
  onNext,
  onHome,
  onToggleMute,
}: Props) {
  const isAnswered = answerState !== "idle";
  const askingCapital = flagStep === "capital" && !isAnswered;
  const options = askingCapital ? capitalOptions : countryOptions;
  const selected = askingCapital ? selectedCapital : selectedCountry;
  const onSelect = askingCapital ? onSelectCapital : onSelectCountry;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" && isAnswered) {
        onNext();
        return;
      }
      if (isAnswered) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4) {
        const opt = options[n - 1];
        if (opt) onSelect(opt.code);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAnswered, options, onSelect, onNext]);

  const border =
    answerState === "correct"
      ? "border-emerald-500"
      : answerState === "wrong"
        ? "border-rose-500"
        : answerState === "partial"
          ? "border-amber-500"
          : "border-white/10";

  return (
    <main
      id="main"
      className="flex flex-col items-center min-h-screen px-4 bg-slate-950 text-slate-100 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="w-full max-w-lg space-y-5">
        <Hud
          tier={tier}
          score={score}
          streak={streak}
          lives={lives}
          bestScore={bestScore}
          lastDelta={lastDelta}
          muted={muted}
          onHome={onHome}
          onToggleMute={onToggleMute}
        />

        <div className={`relative w-full rounded-3xl overflow-hidden border bg-white/[0.02] aspect-[2/1] ${border}`}>
          <FlagPane key={flag.code} code={flag.code} onSkip={onNext} />
        </div>

        {isAnswered ? (
          <div className={`flex flex-col items-center gap-4 pt-1 ${answerState === "wrong" ? "animate-shake motion-reduce:animate-none" : ""}`}>
            <div className="text-center">
              <p
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  answerState === "correct"
                    ? "text-emerald-400"
                    : answerState === "partial"
                      ? "text-amber-400"
                      : "text-rose-400"
                }`}
                aria-live="polite"
              >
                {answerState === "correct"
                  ? "Correct"
                  : answerState === "partial"
                    ? "Country right, capital missed"
                    : "Wrong"}
              </p>
              <p className="text-white font-bold text-xl tracking-tight text-pretty mt-1">
                {flag.name}
                <span className="block text-base font-medium text-slate-400">{flag.capital}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onNext}
              className="w-full max-w-sm min-h-12 py-3 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-colors"
            >
              {lives <= 0 ? "See results" : "Next"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-center text-sm font-semibold text-slate-300">
              {askingCapital ? `Bonus: capital of ${flag.name}?` : "Which country is this?"}
            </h2>
            <p className="hidden sm:block text-center text-[11px] text-slate-500">Keys 1–4 to answer</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.map((opt, i) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => onSelect(opt.code)}
                  data-choice={i + 1}
                  className={optionClass(opt.code, flag.code, selected, answerState, false)}
                >
                  <span className="hidden sm:inline text-[10px] font-medium text-slate-500 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="leading-snug text-pretty">{askingCapital ? opt.capital : opt.name}</span>
                </button>
              ))}
            </div>

            {askingCapital && (
              <button
                type="button"
                onClick={onSkipCapital}
                className="w-full min-h-11 text-sm font-semibold text-slate-500 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-xl"
              >
                Skip bonus
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function FlagPane({ code, onSkip }: { code: string; onSkip: () => void }) {
  const [fail, setFail] = useState(false);

  if (fail) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-slate-300">Flag didn’t load.</p>
        <button
          type="button"
          onClick={onSkip}
          className="px-4 py-2 rounded-xl bg-white/10 text-sm font-semibold hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          Skip this one
        </button>
      </div>
    );
  }

  return (
    <Image
      src={`https://flagcdn.com/w640/${code}.png`}
      alt="Mystery flag"
      fill
      className="object-contain p-5"
      sizes="(max-width: 768px) 100vw, 512px"
      priority
      onError={() => setFail(true)}
    />
  );
}
