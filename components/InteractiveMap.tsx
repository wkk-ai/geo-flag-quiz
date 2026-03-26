"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { feature } from "topojson-client";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { geoCentroid, geoBounds } from "d3-geo";

countries.registerLocale(enLocale);

const geoUrl = "/maps/world-50m.json";

interface Props {
  targetCode: string;
  isAnswered: boolean;
  fallbackLatLng?: [number, number];
}

interface MapProps {
  targetCode: string; // ISO alpha-2
  isAnswered: boolean;
  fallbackLatLng?: [number, number]; // [lat, lng] from flags.json
  position: { center: [number, number]; zoom: number };
  setPosition: (pos: { center: [number, number]; zoom: number }) => void;
  geographies: any[];
  targetNumeric: string | null;
  isTiny: boolean;
}

export function MainMap({ 
  position, 
  setPosition, 
  geographies, 
  targetNumeric, 
  isTiny, 
  isAnswered 
}: MapProps) {
  const handleZoomIn = () => {
    setPosition({ ...position, zoom: Math.min(position.zoom * 1.5, 100) });
  };

  const handleZoomOut = () => {
    setPosition({ ...position, zoom: Math.max(position.zoom / 1.5, 1) });
  };

  return (
    <div className="relative w-full aspect-[2.4/1] bg-slate-950 rounded-[2rem] overflow-hidden border border-white/5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 ring-1 ring-white/10">
      <style jsx global>{`
        @keyframes map-pulse {
          0% { transform: scale(1); opacity: 0.8; filter: drop-shadow(0 0 2px #3b82f6); }
          50% { transform: scale(1.5); opacity: 0.4; filter: drop-shadow(0 0 8px #3b82f6); }
          100% { transform: scale(1); opacity: 0.8; filter: drop-shadow(0 0 2px #3b82f6); }
        }
        .pulse-marker {
          animation: map-pulse 2s infinite ease-in-out;
          transform-origin: center;
        }
        .target-glow {
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
        }
      `}</style>

      <ComposableMap
        projectionConfig={{ scale: 140 }}
        width={800}
        height={500}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup 
          center={position.center} 
          zoom={position.zoom} 
          onMoveEnd={(pos) => setPosition({ center: pos.coordinates, zoom: pos.zoom })}
          filterZoomEvent={(e: any) => e.type !== "wheel" && e.type !== "dblclick"}
        >
          <Geographies geography={geographies}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isTarget = String(geo.id).padStart(3, "0") === targetNumeric;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isTarget ? "#3b82f6" : "#1e293b"}
                    stroke={isTarget ? "#60a5fa" : "#334155"}
                    strokeWidth={isTarget ? 0.8 / position.zoom : 0.4 / position.zoom}
                    className={isTarget ? "target-glow" : ""}
                    style={{
                      default: { outline: "none", transition: "all 300ms" },
                      hover: { outline: "none", fill: isTarget ? "#60a5fa" : "#334155" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {targetNumeric && isTiny && !isAnswered && (
            <g transform={`translate(${position.center[0]}, ${position.center[1]})`}>
              <circle r={8 / position.zoom} fill="#3b82f6" className="pulse-marker" />
              <circle r={3 / position.zoom} fill="#3b82f6" />
            </g>
          )}
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom Controls - Glassmorphism */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-3 z-10">
        <button 
          onClick={handleZoomIn}
          className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all font-bold text-2xl select-none"
        >
          +
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all font-bold text-2xl select-none"
        >
          −
        </button>
      </div>

      {!isAnswered && (
        <div className="absolute top-6 left-6 flex flex-col gap-2 focus:pointer-events-none select-none">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white text-[10px] font-black underline-offset-4 decoration-blue-500/50 underline px-3.5 py-2 rounded-xl uppercase tracking-[0.2em] w-fit shadow-2xl">
            Target Region
          </div>
          {isTiny && (
            <div className="bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 text-blue-400 text-[10px] font-black px-3.5 py-2 rounded-xl uppercase tracking-[0.2em] w-fit flex items-center gap-2 shadow-2xl transition-all">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>
              Small Location
            </div>
          )}
        </div>
      )}
    </div>
  );

}

export function MiniMap({ 
  position, 
  geographies, 
  isTiny 
}: { 
  position: { center: [number, number]; zoom: number }; 
  geographies: any[]; 
  isTiny: boolean;
}) {
  const miniMapScale = isTiny ? 140 : 45;

  return (
    <div className="w-full aspect-[1.8/1] bg-slate-900 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl pointer-events-none relative transition-all duration-700 ease-in-out ring-1 ring-white/10">
      <div className="absolute top-4 left-4 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Context Map</span>
      </div>
      <ComposableMap
        projectionConfig={{ 
          scale: miniMapScale,
          center: isTiny ? position.center : [0, 0]
        }}
        width={300}
        height={225}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geographies}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#1e293b"
                stroke="#334155"
                strokeWidth={0.2}
              />
            ))
          }
        </Geographies>
        <rect
          x={150 + position.center[0] * (miniMapScale/100)} 
          y={112.5 - position.center[1] * (miniMapScale/100)}
          width={Math.max(10, 45 / position.zoom)}
          height={Math.max(10, 30 / position.zoom)}
          fill="rgba(59, 130, 246, 0.15)"
          stroke="#3b82f6"
          strokeWidth={1.2}
          transform={`translate(${-Math.max(5, 22.5/position.zoom)}, ${-Math.max(5, 15/position.zoom)})`}
          className="transition-all duration-500"
        />
      </ComposableMap>
    </div>
  );

}

export default function InteractiveMap({ targetCode, isAnswered, fallbackLatLng }: Props) {
  // This wrapper is no longer used directly in the side-by-side layout, 
  // but kept for compatibility or handled in MapScreen.
  return null; 
}
