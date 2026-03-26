"use client";

import { useState, useEffect, useMemo } from "react";
import { MainMap, MiniMap } from "./InteractiveMap";
import { Flag } from "@/lib/gameLogic";
import countries from "i18n-iso-countries";
import { feature } from "topojson-client";
import { geoCentroid, geoBounds } from "d3-geo";

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

const geoUrl = "/maps/world-50m.json";

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
    <div className="flex flex-col items-center justify-start min-h-screen pt-4 pb-8 px-4 bg-white">
      <div className="w-full max-w-6xl space-y-2">
        {/* Header - Permanently compact, elevated z-index */}
        <div className="relative z-20 flex items-center justify-between px-2 mb-1 opacity-70 scale-95">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none">{tier} Mode</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Streak</span>
              <span className="text-sm font-black text-gray-900 leading-none">{streak}</span>
            </div>
          </div>
          
          <button 
            onClick={onHome}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-100 hover:border-gray-900 hover:bg-gray-50 transition-all group"
          >
            <span className="text-sm">🏠</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-900">Home</span>
          </button>
        </div>

        {/* Dynamic Map Layout - Permanently shrunk for better side-by-side visibility */}
        <div className={`relative z-10 w-full flex flex-col lg:flex-row gap-4 transition-all duration-700 ease-in-out origin-top scale-[0.82] -my-10 lg:scale-90 lg:-my-8`}>
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
          <div className="flex-1 lg:min-w-[320px] flex flex-col gap-4">
            <MiniMap 
              position={position}
              geographies={geographies}
              isTiny={isTiny}
            />
            
            {isAnswered && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${answerState === "both-correct" ? "text-green-600" : "text-red-500"}`}>
                  {answerState === "both-correct" ? "Correct Answer!" : "Wrong Selection"}
                </h3>
                <p className="text-gray-900 font-bold text-lg mb-1">{country.name}</p>
                <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                  <span>Capital:</span>
                  <span className="text-gray-600 font-bold">{country.capital}</span>
                </div>
                
                <button
                  onClick={onNext}
                  className="w-full mt-4 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200"
                >
                  Next Country →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Options Selection - Always visible, optimized for 4 items */}
        <div className="flex flex-col items-center space-y-4 pt-0 transition-all duration-500 -mt-6">
          <h2 className="text-gray-300 font-black uppercase tracking-[0.2em] text-[10px]">
            Which country is highlighted?
          </h2>
          
          <div className={`grid grid-cols-2 gap-3 w-full max-w-4xl transition-all duration-500 ${isAnswered ? "opacity-60 scale-95" : ""}`}>
            {countryOptions.map((opt) => {
              const isSelected = selectedCountry === opt.code;
              const isCorrectTarget = opt.code === country.code;
              
              let btnClass = "w-full py-4 px-6 rounded-2xl text-[13px] font-bold transition-all duration-300 border-2 text-center flex flex-col items-center justify-center gap-1 ";
              
              if (!isAnswered) {
                btnClass += isSelected 
                  ? "bg-gray-900 border-gray-900 text-white shadow-xl shadow-gray-400 scale-[1.02]" 
                  : "bg-white border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-700 active:scale-[0.98]";
              } else {
                if (isCorrectTarget) {
                  btnClass += "bg-green-500 border-green-500 text-white shadow-lg shadow-green-100";
                } else if (isSelected) {
                  btnClass += "bg-red-500 border-red-500 text-white shadow-lg shadow-red-100";
                } else {
                  btnClass += "bg-white border-gray-100 text-gray-200 opacity-60";
                }
              }

              return (
                <button
                  key={opt.code}
                  onClick={() => !isAnswered && onSelectCountry(opt.code)}
                  disabled={isAnswered}
                  className={btnClass}
                >
                  <span className="truncate w-full">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
