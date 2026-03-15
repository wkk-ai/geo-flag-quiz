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

const geoUrl = "/maps/world.json";

interface Props {
  targetCode: string; // ISO alpha-2
  isAnswered: boolean;
}

export default function InteractiveMap({ targetCode, isAnswered }: Props) {
  const [geographies, setGeographies] = useState<any[]>([]);
  const targetNumeric = useMemo(() => {
    const num = countries.alpha2ToNumeric(targetCode.toUpperCase());
    if (!num) return null;
    // ensure 3 digits with leading zeros (e.g. "032")
    return String(num).padStart(3, "0");
  }, [targetCode]);

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

  const { center, zoom } = useMemo(() => {
    if (!targetFeature) return { center: [0, 0] as [number, number], zoom: 1 };
    
    const centroid = geoCentroid(targetFeature);
    const bounds = geoBounds(targetFeature);
    
    // Calculate zoom based on bounds
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const maxDim = Math.max(dx, dy);
    
    // Adjusted zoom logic: smaller countries get higher zoom
    // 110m map is 800x450 approx in internal coords
    let calculatedZoom = 1;
    if (maxDim > 0) {
      calculatedZoom = Math.max(1, Math.min(25, 40 / maxDim));
    }

    return { 
      center: centroid as [number, number], 
      zoom: calculatedZoom 
    };
  }, [targetFeature]);

  return (
    <div className="relative w-full aspect-[3/2] bg-blue-50/30 rounded-xl overflow-hidden border border-gray-100 shadow-inner">
      <ComposableMap
        projectionConfig={{
          scale: 140,
        }}
        width={800}
        height={500}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup center={center} zoom={zoom} filterZoomEvent={(e) => e.type !== "wheel" && e.type !== "dblclick"}>
          <Geographies geography={geographies}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isTarget = String(geo.id).padStart(3, "0") === targetNumeric;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isTarget ? "#111827" : "#F3F4F6"}
                    stroke={isTarget ? "#111827" : "#D1D5DB"}
                    strokeWidth={0.5 / zoom}
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
        </ZoomableGroup>
      </ComposableMap>

      {/* Mini-map Context */}
      <div className="absolute top-3 right-3 w-28 aspect-[2/1] bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg overflow-hidden shadow-sm pointer-events-none">
        <ComposableMap
          projectionConfig={{ scale: 35 }}
          width={200}
          height={100}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geographies}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#E5E7EB"
                  stroke="#D1D5DB"
                  strokeWidth={0.2}
                />
              ))
            }
          </Geographies>
          {/* Viewport rectangle on mini-map */}
          {targetFeature && (
            <rect
              x={100 + center[0] * 0.4} // Simplified projection mapping for mini-map
              y={50 - center[1] * 0.4}
              width={Math.max(4, 30 / zoom)}
              height={Math.max(4, 20 / zoom)}
              fill="rgba(239, 68, 68, 0.1)"
              stroke="#EF4444"
              strokeWidth={0.5}
              transform={`translate(${-Math.max(2, 15/zoom)}, ${-Math.max(2, 10/zoom)})`}
            />
          )}
        </ComposableMap>
      </div>

      {!isAnswered && (
        <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
          Highlight Area
        </div>
      )}
    </div>
  );
}
