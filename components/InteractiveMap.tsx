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
    <div className="relative w-full aspect-[3/2] bg-blue-50/10 rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-500">
      <style jsx global>{`
        @keyframes map-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.5); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        .pulse-marker {
          animation: map-pulse 2s infinite ease-in-out;
          transform-origin: center;
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
                    fill={isTarget ? "#111827" : "#F8FAFC"}
                    stroke={isTarget ? "#111827" : "#E2E8F0"}
                    strokeWidth={0.3 / position.zoom}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {targetNumeric && isTiny && !isAnswered && (
            <g transform={`translate(${position.center[0]}, ${position.center[1]})`}>
              <circle r={6 / position.zoom} fill="#EF4444" className="pulse-marker" />
              <circle r={2 / position.zoom} fill="#EF4444" />
            </g>
          )}
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10">
        <button 
          onClick={handleZoomIn}
          className="w-11 h-11 bg-white shadow-lg border border-gray-100 rounded-xl flex items-center justify-center text-gray-900 hover:bg-gray-50 active:scale-95 transition-all font-bold text-2xl select-none"
        >
          +
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-11 h-11 bg-white shadow-lg border border-gray-100 rounded-xl flex items-center justify-center text-gray-900 hover:bg-gray-50 active:scale-95 transition-all font-bold text-2xl select-none"
        >
          −
        </button>
      </div>

      {!isAnswered && (
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 focus:pointer-events-none select-none">
          <div className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-widest w-fit shadow-lg shadow-black/10">
            Target Region
          </div>
          {isTiny && (
            <div className="bg-red-500 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-widest w-fit flex items-center gap-1.5 shadow-lg shadow-red-200/50 transition-all">
              <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
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
    <div className="w-full aspect-[4/3] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xl pointer-events-none relative transition-all duration-700 ease-in-out">
      <div className="absolute top-3 left-3 bg-gray-50 px-2 py-1 rounded-md border border-gray-100/50 z-10">
        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Context Map</span>
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
                fill="#F1F5F9"
                stroke="#E2E8F0"
                strokeWidth={0.2}
              />
            ))
          }
        </Geographies>
        <rect
          x={150 + position.center[0] * (miniMapScale/100)} 
          y={112.5 - position.center[1] * (miniMapScale/100)}
          width={Math.max(8, 40 / position.zoom)}
          height={Math.max(8, 25 / position.zoom)}
          fill="rgba(239, 68, 68, 0.08)"
          stroke="#EF4444"
          strokeWidth={0.8}
          transform={`translate(${-Math.max(4, 20/position.zoom)}, ${-Math.max(4, 12.5/position.zoom)})`}
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
