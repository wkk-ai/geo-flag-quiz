"use client";

import { useState, useEffect, useMemo } from "react";
import { MainMap, MiniMap } from "./InteractiveMap";
import Hud from "./Hud";
import { AnswerState, Flag } from "@/lib/gameLogic";
import { optionClass } from "@/lib/optionClass";
import countries from "i18n-iso-countries";
import { feature } from "topojson-client";
import enLocale from "i18n-iso-countries/langs/en.json";
import { geoCentroid, geoBounds } from "d3-geo";

countries.registerLocale(enLocale);

const BASE_PATH = "/geo-flag-quiz";
const geoUrl = `${BASE_PATH}/maps/world-50m.json`;

interface Props {
  country: Flag;
  countryOptions: Flag[];
  streak: number;
  tier: string;
  answerState: AnswerState;
  selectedCountry: string | null;
  lives: number;
  score: number;
  bestScore: number;
  lastDelta: number | null;
  muted: boolean;
  onSelectCountry: (code: string) => void;
  onNext: () => void;
  onHome: () => void;
  onToggleMute: () => void;
}

export default function MapScreen({
  country,
  countryOptions,
  streak,
  tier,
  answerState,
  selectedCountry,
  lives,
  score,
  bestScore,
  lastDelta,
  muted,
  onSelectCountry,
  onNext,
  onHome,
  onToggleMute,
}: Props) {
  const isAnswered = answerState !== "idle";
  const [mapError, setMapError] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geographies, setGeographies] = useState<any[]>([]);
  const [override, setOverride] = useState<{
    code: string;
    center: [number, number];
    zoom: number;
  } | null>(null);
  const mapReady = geographies.length > 0;

  const targetNumeric = useMemo(() => {
    const num = countries.alpha2ToNumeric(country.code.toUpperCase());
    if (!num) return null;
    return String(num).padStart(3, "0");
  }, [country.code]);

  useEffect(() => {
    fetch(geoUrl)
      .then((res) => {
        if (!res.ok) throw new Error("map");
        return res.json();
      })
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const countriesFeature = feature(data, data.objects.countries) as any;
        setGeographies(countriesFeature.features);
        setMapError(false);
      })
      .catch(() => setMapError(true));
  }, []);

  const targetFeature = useMemo(
    () => geographies.find((geo) => String(geo.id).padStart(3, "0") === targetNumeric),
    [geographies, targetNumeric]
  );

  const fitted = useMemo(() => {
    if (!targetFeature) {
      if (country.latlng) {
        return { center: [country.latlng[1], country.latlng[0]] as [number, number], zoom: 35, isTiny: true };
      }
      return { center: [0, 0] as [number, number], zoom: 1, isTiny: false };
    }
    const centroid = geoCentroid(targetFeature) as [number, number];
    const bounds = geoBounds(targetFeature);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const maxDim = Math.max(dx, dy);
    const zoom = maxDim > 0 ? Math.max(1.5, Math.min(40, 50 / maxDim)) : 1;
    return { center: centroid, zoom, isTiny: maxDim < 0.8 };
  }, [targetFeature, country.latlng]);

  const position = {
    center: override?.code === country.code ? override.center : fitted.center,
    zoom: override?.code === country.code ? override.zoom : fitted.zoom,
  };
  const isTiny = fitted.isTiny;
  const setPosition = (pos: { center: [number, number]; zoom: number }) => {
    setOverride({ code: country.code, center: pos.center, zoom: pos.zoom });
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" && isAnswered) {
        onNext();
        return;
      }
      if (isAnswered) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4) {
        const opt = countryOptions[n - 1];
        if (opt) onSelectCountry(opt.code);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAnswered, countryOptions, onSelectCountry, onNext]);

  return (
    <main
      id="main"
      className="flex flex-col items-center min-h-screen px-4 sm:px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-slate-950 text-slate-100"
    >
      <div className="w-full max-w-6xl space-y-4">
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

        <div className="w-full flex flex-col lg:flex-row gap-4">
          <div className="flex-[3] relative min-h-[42vh] lg:min-h-0">
            {!mapReady && !mapError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[2rem] bg-slate-900 border border-white/10">
                <p className="text-slate-400 text-sm">Loading map…</p>
              </div>
            )}
            {mapError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[2rem] bg-slate-900 border border-white/10 p-6 text-center">
                <p className="text-slate-300 text-sm">Map didn’t load. Check your connection, then try again.</p>
              </div>
            )}
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

          <div className="hidden lg:flex flex-1 min-w-[280px] flex-col gap-4">
            <MiniMap position={position} geographies={geographies} isTiny={isTiny} />
          </div>
        </div>

        {isAnswered ? (
          <div
            className={`rounded-3xl p-5 border border-white/10 bg-white/[0.03] max-w-xl mx-auto w-full ${
              answerState === "wrong" ? "animate-shake motion-reduce:animate-none" : ""
            }`}
          >
            <h2
              className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${
                answerState === "correct" ? "text-emerald-400" : "text-rose-400"
              }`}
              aria-live="polite"
            >
              {answerState === "correct" ? "Correct" : "Wrong"}
            </h2>
            <p className="text-white font-bold text-2xl tracking-tight text-pretty">{country.name}</p>
            <p className="text-slate-400 text-sm mt-1">Capital {country.capital}</p>
            <button
              type="button"
              onClick={onNext}
              className="w-full mt-5 min-h-12 py-3 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-colors"
            >
              {lives <= 0 ? "See results" : "Next"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-white font-semibold text-sm">Which country is highlighted?</h2>
            <p className="hidden sm:block text-[11px] text-slate-500">Keys 1–4 to answer</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-3xl">
              {countryOptions.map((opt, i) => (
                <button
                  key={opt.code}
                  type="button"
                  data-choice={i + 1}
                  onClick={() => onSelectCountry(opt.code)}
                  disabled={!mapReady && !mapError}
                  className={optionClass(opt.code, country.code, selectedCountry, answerState, false)}
                >
                  <span className="hidden sm:inline text-[10px] font-medium text-slate-500 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="leading-snug text-pretty">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
