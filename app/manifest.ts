import type { MetadataRoute } from "next";
import { withBase } from "@/lib/paths";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Geo Quiz",
    short_name: "Geo Quiz",
    description: "Flags and maps on this phone. Open once online, then play offline.",
    start_url: withBase("/"),
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    icons: [
      { src: withBase("/icon.svg"), sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: withBase("/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: withBase("/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: withBase("/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
