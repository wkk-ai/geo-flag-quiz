import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

const MAX_ZOOM = 16;
const LAND = "#94a3b8";
const LAND_STROKE = "#cbd5e1";
const TARGET = "#38bdf8";
const TARGET_STROKE = "#e0f2fe";

interface MapProps {
  isAnswered: boolean;
  pin: [number, number];
  position: { center: [number, number]; zoom: number };
  setPosition: (pos: { center: [number, number]; zoom: number }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geographies: any[];
  targetNumeric: string | null;
  showPin: boolean;
}

function Pin({
  pin,
  zoom,
  pulse,
}: {
  pin: [number, number];
  zoom: number;
  pulse: boolean;
}) {
  const core = Math.max(2.4, 12 / zoom);
  const glow = Math.max(5, 20 / zoom);
  const stroke = Math.max(0.4, 2 / zoom);
  return (
    <Marker coordinates={pin} style={{ default: { pointerEvents: "none" } }}>
      {pulse && (
        <circle r={glow} fill={TARGET} fillOpacity={0.28} className="pulse-marker" />
      )}
      <circle r={core} fill={TARGET} stroke={TARGET_STROKE} strokeWidth={stroke} />
    </Marker>
  );
}

export function MainMap({
  pin,
  position,
  setPosition,
  geographies,
  targetNumeric,
  showPin,
  isAnswered,
}: MapProps) {
  const handleZoomIn = () => {
    setPosition({ ...position, zoom: Math.min(position.zoom * 1.5, MAX_ZOOM) });
  };

  const handleZoomOut = () => {
    setPosition({ ...position, zoom: Math.max(position.zoom / 1.5, 1) });
  };

  return (
    <div
      className="relative w-full min-h-[42vh] aspect-[4/3] md:aspect-[2.2/1] rounded-[2rem] overflow-hidden border border-white/10"
      style={{ background: "#123047" }}
      role="img"
      aria-label="World map. The highlighted country is the question."
    >
      <style jsx global>{`
        @keyframes map-pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.18; }
        }
        .pulse-marker {
          animation: map-pulse 2s infinite ease-in-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-marker { animation: none; }
        }
        .target-glow {
          filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.85));
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
          minZoom={1}
          maxZoom={MAX_ZOOM}
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
                    fill={isTarget ? TARGET : LAND}
                    stroke={isTarget ? TARGET_STROKE : LAND_STROKE}
                    strokeWidth={isTarget ? Math.max(0.5, 1.4 / position.zoom) : 0.35 / position.zoom}
                    className={isTarget ? "target-glow" : ""}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: isTarget ? TARGET_STROKE : LAND },
                      pressed: { outline: "none" },
                    }}
                    tabIndex={-1}
                    focusable={false}
                  />
                );
              })
            }
          </Geographies>

          {showPin && <Pin pin={pin} zoom={position.zoom} pulse={!isAnswered} />}
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

      {!isAnswered && showPin && (
        <div className="absolute top-4 left-4 bg-sky-500/20 border border-sky-400/30 text-sky-200 text-[11px] font-semibold px-3 py-1.5 rounded-lg">
          Small country — look for the blue pin
        </div>
      )}
    </div>
  );
}

export function MiniMap({
  pin,
  geographies,
}: {
  pin: [number, number];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geographies: any[];
}) {
  return (
    <div
      className="w-full h-40 lg:h-auto lg:aspect-[1.8/1] rounded-[2rem] overflow-hidden border border-white/10 pointer-events-none relative"
      style={{ background: "#123047" }}
      aria-hidden="true"
    >
      <div className="absolute top-4 left-4 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 z-10">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">World view</span>
      </div>
      <ComposableMap
        projectionConfig={{ scale: 55, center: [0, 0] }}
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
                fill={LAND}
                stroke={LAND_STROKE}
                strokeWidth={0.3}
              />
            ))
          }
        </Geographies>
        <Marker coordinates={pin}>
          <circle r={11} fill={TARGET} fillOpacity={0.25} />
          <circle r={5.5} fill={TARGET} stroke={TARGET_STROKE} strokeWidth={1.4} />
        </Marker>
      </ComposableMap>
    </div>
  );
}
