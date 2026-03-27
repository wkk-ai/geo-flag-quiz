"use client";

import { useState, useEffect, useMemo } from "react";
import { MainMap, MiniMap } from "./InteractiveMap";
import { Flag } from "@/lib/gameLogic";
import countries from "i18n-iso-countries";
import { feature } from "topojson-client";
import { geoCentroid, geoBounds } from "d3-geo";

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

const BASE_PATH = "/geo-flag-quiz";
const geoUrl = `${BASE_PATH}/maps/world-50m.json`;

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
  onHome: () => void;
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
  onHome,
}: Props) {
  const isAnswered = answerState !== "idle";
  
  // Map State
  const [position, setPosition] = useState({ center: [0, 0] as [number, number], zoom: 1 });
  const [isTiny, setIsTiny] = useState(false);
  const [geographies, setGeographies] = useState<any[]>([]);

  const targetNumeric = useMemo(() => {
    const num = countries.alpha2ToNumeric(country.code.toUpperCase());
    if (!num) return null;
    return String(num).padStart(3, "0");
  }, [country.code]);

  useEffect(() => {
    fetch(geoUrl)
      .then((res) => res.json())
      .then((data) => {
        const countriesFeature = feature(data, data.objects.countries) as any;
        setGeographies(countriesFeature.features);
      });
  }, []);

  const targetFeature = useMemo(() => 
    geographies.find((geo) => String(geo.id).padStart(3, "0") === targetNumeric), 
    [geographies, targetNumeric]
  );

  useEffect(() => {
    if (!targetFeature) {
      if (country.latlng) {
        setPosition({ center: [country.latlng[1], country.latlng[0]], zoom: 35 });
        setIsTiny(true);
      } else {
        setPosition({ center: [0, 0], zoom: 1 });
        setIsTiny(false);
      }
      return;
    }

    const centroid = geoCentroid(targetFeature);
    const bounds = geoBounds(targetFeature);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const maxDim = Math.max(dx, dy);
    const isActuallyTiny = maxDim < 0.8;

    let calculatedZoom = 1;
    if (maxDim > 0) {
      calculatedZoom = Math.max(1.5, Math.min(40, 50 / maxDim));
    }

    setPosition({ center: centroid as [number, number], zoom: calculatedZoom });
    setIsTiny(isActuallyTiny);
  }, [targetFeature, country.latlng, country.code]);

  return (
    <div className="flex flex-col items-center justify-start h-screen max-h-screen pt-4 pb-6 px-6 bg-slate-950 text-slate-100 selection:bg-blue-500/30 overflow-hidden">
      <div className="w-full max-w-6xl space-y-2">
        {/* Header - Permanently compact, elevated z-index */}
        <div className="relative z-20 flex items-center justify-between px-4 mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 leading-none">{tier} Mode</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Streak</span>
              <span className="text-lg font-black text-white leading-none tabular-nums tracking-tighter">{streak}</span>
            </div>
          </div>
          
          <button 
            onClick={onHome}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group active:scale-95 shadow-xl"
          >
            <span className="text-base group-hover:scale-110 transition-transform">🏠</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white">Exit</span>
          </button>
        </div>

        {/* Dynamic Map Layout - Permanently shrunk for better side-by-side visibility */}
        <div className={`relative z-10 w-full flex flex-col lg:flex-row gap-6 transition-all duration-1000 ease-in-out`}>
          {/* Main Focus Area */}
          <div className="flex-[3] relative">
            <MainMap 
              targetCode={country.code}
              isAnswered={isAnswered}
              fallbackLatLng={country.latlng}
              position={position}
              setPosition={setPosition}
              geographies={geographies}
              targetNumeric={targetNumeric}
              isTiny={isTiny}
            />
          </div>

          {/* Context Area */}
          <div className="flex-1 lg:min-w-[300px] flex flex-col gap-4">
            <MiniMap 
              position={position}
              geographies={geographies}
              isTiny={isTiny}
            />
            
            {isAnswered && (
              <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[2rem] p-6 border border-white/10 animate-in fade-in slide-in-from-right-8 duration-700 shadow-2xl ring-1 ring-white/5 flex-grow">
                <h3 className={`text-[9px] font-black uppercase tracking-[0.3em] mb-2 ${answerState === "both-correct" ? "text-emerald-400" : "text-rose-400"}`}>
                  {answerState === "both-correct" ? "Excellent discovery!" : "Not quite right"}
                </h3>
                <p className="text-white font-black text-2xl mb-1 tracking-tight truncate">{country.name}</p>
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold bg-white/5 w-fit px-2.5 py-1 rounded-lg border border-white/5">
                  <span className="uppercase tracking-widest text-[8px] opacity-50">Capital</span>
                  <span className="text-white">{country.capital}</span>
                </div>
                
                <button
                  onClick={onNext}
                  className="w-full mt-6 py-3.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-2 group"
                >
                  Continue
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Options Selection - Always visible, optimized for 4 items */}
        <div className="flex flex-col items-center gap-4 pt-4 transition-all duration-500">
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-white font-black uppercase tracking-[0.4em] text-[10px] opacity-60">
              Identify the highlight
            </h2>
          </div>
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-4xl transition-all duration-700 ${isAnswered ? "opacity-40 scale-[0.98] blur-[2px]" : ""}`}>
            {countryOptions.map((opt) => {
              const isSelected = selectedCountry === opt.code;
              const isCorrectTarget = opt.code === country.code;
              
              let btnClass = "w-full py-3.5 px-8 rounded-2xl text-[14px] font-black transition-all duration-300 border text-center flex flex-col items-center justify-center gap-1 shadow-md hover:shadow-2xl ";
              
              if (!isAnswered) {
                btnClass += isSelected 
                  ? "bg-blue-600 border-blue-400 text-white shadow-blue-500/20 scale-[1.03] ring-2 ring-blue-500/50" 
                  : "bg-white/[0.03] backdrop-blur-md border-white/10 text-slate-400 hover:border-white/20 hover:text-white hover:bg-white/[0.06] active:scale-[0.98]";
              } else {
                if (isCorrectTarget) {
                  btnClass += "bg-emerald-500/90 border-emerald-400 text-white shadow-emerald-500/20 scale-105 z-10 ring-4 ring-emerald-500/20";
                } else if (isSelected) {
                  btnClass += "bg-rose-500/90 border-rose-400 text-white shadow-rose-500/20 scale-[0.98] ring-4 ring-rose-500/20";
                } else {
                  btnClass += "bg-white/[0.01] border-white/5 text-slate-600 opacity-40";
                }
              }

              return (
                <button
                  key={opt.code}
                  onClick={() => !isAnswered && onSelectCountry(opt.code)}
                  disabled={isAnswered}
                  className={btnClass}
                >
                  <span className="truncate w-full tracking-wide">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
