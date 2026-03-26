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
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-slate-950 text-slate-100">
        <div className="w-full max-w-md text-center">
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full group-hover:bg-blue-500/30 transition-all duration-1000"></div>
            <div className="text-7xl mb-4 relative drop-shadow-2xl animate-float">🌍</div>
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">Geo Quiz</h1>
            <p className="text-slate-400 text-sm font-medium tracking-[0.2em] uppercase opacity-70">Master the Planet</p>
          </div>

          <div className="relative px-6 py-8 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl ring-1 ring-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-8">
              Select Expedition Mode
            </p>

            <div className="flex flex-col gap-4">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className="w-full text-left px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-blue-500/50 hover:scale-[1.02] transition-all group active:scale-95 shadow-lg"
                >
                  <div className="flex items-center gap-5">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{mode.icon}</span>
                    <div>
                      <span className="block font-black text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors">
                        {mode.label}
                      </span>
                      <span className="block text-xs text-slate-400 font-medium mt-1 leading-relaxed">{mode.desc}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md text-center">
        <div className="relative mb-8 pt-4">
          <div className="text-7xl mb-4 drop-shadow-2xl">{selectedMode === "flag" ? "🚩" : "🗺️"}</div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            {selectedMode === "flag" ? "Flag Explorer" : "Map Scout"}
          </h1>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Tier Selection</p>
        </div>

        <div className="relative px-6 py-8 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl ring-1 ring-white/5">
          <div className="flex flex-col gap-4">
            {difficulties.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onStart(selectedMode, opt.value)}
                className="w-full text-left px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-blue-500/50 hover:scale-[1.02] transition-all group active:scale-95 shadow-lg"
              >
                <span className="block font-black text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors">
                  {opt.label}
                </span>
                <span className="block text-xs text-slate-400 font-medium mt-1 leading-relaxed">{opt.desc}</span>
              </button>
            ))}
            
            <button 
              onClick={() => setSelectedMode(null)}
              className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Adjust Approach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
