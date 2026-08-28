"use client";

import { useEffect, useState } from "react";
import { withBase } from "@/lib/paths";

const VERSION_KEY = "geo-quiz-offline-v2";

type Assets = { version: string; urls: string[] };

export function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(withBase("/sw.js")).catch(() => {});
  }, []);

  return null;
}

export function useOfflineSave(): { status: "idle" | "saving" | "ready" | "error"; progress: number } {
  const [status, setStatus] = useState<"idle" | "saving" | "ready" | "error">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!("caches" in window)) return;

    let cancelled = false;

    (async () => {
      try {
        const saved = localStorage.getItem(VERSION_KEY);
        const res = await fetch(withBase("/offline-assets.json"), { cache: "no-store" });
        if (!res.ok) throw new Error("assets");
        const assets = (await res.json()) as Assets;
        if (saved === assets.version) {
          setStatus("ready");
          setProgress(1);
          return;
        }
        setStatus("saving");
        const cache = await caches.open(`geoquiz-${assets.version}`);
        const urls = [...new Set([withBase("/"), ...assets.urls.map((u) => withBase(u))])];
        let done = 0;
        const chunk = 12;
        for (let i = 0; i < urls.length; i += chunk) {
          if (cancelled) return;
          await Promise.all(
            urls.slice(i, i + chunk).map(async (url) => {
              try {
                const r = await fetch(url);
                if (r.ok) await cache.put(url, r.clone());
              } catch {
                /* skip one flag */
              }
              done += 1;
              if (!cancelled) setProgress(done / urls.length);
            })
          );
        }
        localStorage.setItem(VERSION_KEY, assets.version);
        if (!cancelled) {
          setStatus("ready");
          setProgress(1);
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { status, progress };
}

export function OfflineHint() {
  const { status, progress } = useOfflineSave();

  if (status === "idle") return null;

  const label =
    status === "saving"
      ? `Saving on this phone… ${Math.round(progress * 100)}%`
      : status === "ready"
        ? "Ready offline. On iPhone: Share → Add to Home Screen."
        : "Couldn’t save offline. Open once with signal, then try again.";

  return <p className="mt-6 text-xs text-slate-500 text-pretty">{label}</p>;
}
