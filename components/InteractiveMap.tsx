import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

interface MapProps {
  targetCode: string;
  isAnswered: boolean;
  fallbackLatLng?: [number, number];
  position: { center: [number, number]; zoom: number };
  setPosition: (pos: { center: [number, number]; zoom: number }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  isAnswered,
}: MapProps) {
  const handleZoomIn = () => {
    setPosition({ ...position, zoom: Math.min(position.zoom * 1.5, 100) });
  };

  const handleZoomOut = () => {
    setPosition({ ...position, zoom: Math.max(position.zoom / 1.5, 1) });
  };

  return (
    <div
      className="relative w-full min-h-[42vh] aspect-[4/3] md:aspect-[2.2/1] bg-slate-950 rounded-[2rem] overflow-hidden border border-white/10"
      role="img"
      aria-label="World map. The highlighted country is the question."
    >
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
        @media (prefers-reduced-motion: reduce) {
          .pulse-marker { animation: none; }
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onMoveEnd={(pos: any) => setPosition({ center: pos.coordinates, zoom: pos.zoom })}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filterZoomEvent={(e: any) => e.type !== "wheel" && e.type !== "dblclick"}
        >
          <Geographies geography={geographies}>
            {({ geographies }) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              geographies.map((geo: any) => {
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
                      default: { outline: "none" },
                      hover: { outline: "none", fill: isTarget ? "#60a5fa" : "#1e293b" },
                      pressed: { outline: "none" },
                    }}
                    tabIndex={-1}
                    focusable={false}
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

      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="w-11 h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-[transform,background-color] font-bold text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          +
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="w-11 h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-[transform,background-color] font-bold text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          −
        </button>
      </div>

      {!isAnswered && isTiny && (
        <div className="absolute top-4 left-4 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-[11px] font-semibold px-3 py-1.5 rounded-lg">
          Small country — look for the glow
        </div>
      )}
    </div>
  );
}

export function MiniMap({
  position,
  geographies,
  isTiny,
}: {
  position: { center: [number, number]; zoom: number };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geographies: any[];
  isTiny: boolean;
}) {
  const miniMapScale = isTiny ? 140 : 45;

  return (
    <div
      className="w-full aspect-[1.8/1] bg-slate-900 rounded-[2rem] overflow-hidden border border-white/10 pointer-events-none relative"
      aria-hidden="true"
    >
      <div className="absolute top-4 left-4 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 z-10">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">World view</span>
      </div>
      <ComposableMap
        projectionConfig={{
          scale: miniMapScale,
          center: isTiny ? position.center : [0, 0],
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
          x={150 + position.center[0] * (miniMapScale / 100)}
          y={112.5 - position.center[1] * (miniMapScale / 100)}
          width={Math.max(10, 45 / position.zoom)}
          height={Math.max(10, 30 / position.zoom)}
          fill="rgba(59, 130, 246, 0.15)"
          stroke="#3b82f6"
          strokeWidth={1.2}
          transform={`translate(${-Math.max(5, 22.5 / position.zoom)}, ${-Math.max(5, 15 / position.zoom)})`}
        />
      </ComposableMap>
    </div>
  );
}
