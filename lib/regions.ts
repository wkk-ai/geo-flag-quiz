export type RegionId =
  | "world"
  | "europe"
  | "africa"
  | "middle-east"
  | "asia"
  | "oceania"
  | "north-america"
  | "latam";

export const REGION_OPTIONS: { id: RegionId; label: string; desc: string }[] = [
  { id: "world", label: "Worldwide", desc: "Every country" },
  { id: "europe", label: "Europe", desc: "Iceland to Russia" },
  { id: "latam", label: "Latin America", desc: "Mexico, Caribbean, South America" },
  { id: "north-america", label: "North America", desc: "Canada, USA, Greenland" },
  { id: "africa", label: "Africa", desc: "The whole continent" },
  { id: "middle-east", label: "Middle East", desc: "Gulf, Levant, Iran, Turkey" },
  { id: "asia", label: "Asia", desc: "South, East, and Central Asia" },
  { id: "oceania", label: "Oceania", desc: "Australia, NZ, and the Pacific" },
];

export const REGION_LABELS: Record<RegionId, string> = {
  world: "Worldwide",
  europe: "Europe",
  africa: "Africa",
  "middle-east": "Middle East",
  asia: "Asia",
  oceania: "Oceania",
  "north-america": "North America",
  latam: "Latin America",
};

const REGION_CODES: Record<Exclude<RegionId, "world">, readonly string[]> = {
  europe: [
    "ad", "al", "at", "ax", "ba", "be", "bg", "by", "ch", "cy", "cz", "de", "dk",
    "ee", "es", "fi", "fo", "fr", "gb", "gg", "gi", "gr", "hr", "hu", "ie", "im",
    "is", "it", "je", "li", "lt", "lu", "lv", "mc", "md", "me", "mk", "mt", "nl",
    "no", "pl", "pt", "ro", "rs", "ru", "se", "si", "sj", "sk", "sm", "ua", "va",
    "xk",
  ],
  africa: [
    "ao", "bf", "bi", "bj", "bw", "cd", "cf", "cg", "ci", "cm", "cv", "dj", "dz",
    "eg", "eh", "er", "et", "ga", "gh", "gm", "gn", "gq", "gw", "ke", "km", "lr",
    "ls", "ly", "ma", "mg", "ml", "mr", "mu", "mw", "mz", "na", "ne", "ng", "re",
    "rw", "sc", "sd", "sh", "sl", "sn", "so", "ss", "st", "sz", "td", "tg", "tn",
    "tz", "ug", "yt", "za", "zm", "zw",
  ],
  "middle-east": [
    "ae", "bh", "il", "iq", "ir", "jo", "kw", "lb", "om", "ps", "qa", "sa", "sy",
    "tr", "ye",
  ],
  asia: [
    "af", "am", "az", "bd", "bn", "bt", "cn", "ge", "hk", "id", "in", "io", "jp",
    "kg", "kh", "kp", "kr", "kz", "la", "lk", "mm", "mn", "mo", "mv", "my", "np",
    "ph", "pk", "sg", "th", "tj", "tl", "tm", "tw", "uz", "vn",
  ],
  oceania: [
    "as", "au", "cc", "ck", "cx", "fj", "fm", "gu", "ki", "mh", "mp", "nc", "nf",
    "nr", "nu", "nz", "pf", "pg", "pn", "pw", "sb", "tk", "to", "tv", "um", "vu",
    "wf", "ws",
  ],
  "north-america": ["bm", "ca", "gl", "pm", "us"],
  latam: [
    "ag", "ai", "ar", "aw", "bb", "bl", "bo", "bq", "br", "bs", "bz", "cl", "co",
    "cr", "cu", "cw", "dm", "do", "ec", "fk", "gd", "gf", "gp", "gt", "gy", "hn",
    "ht", "jm", "kn", "ky", "lc", "mf", "mq", "ms", "mx", "ni", "pa", "pe", "pr",
    "py", "sr", "sv", "sx", "tc", "tt", "uy", "vc", "ve", "vg", "vi",
  ],
};

const WORLD_ONLY = new Set(["aq", "gs", "tf"]);

const codeToRegion = new Map<string, Exclude<RegionId, "world">>();
for (const [region, codes] of Object.entries(REGION_CODES) as [
  Exclude<RegionId, "world">,
  readonly string[],
][]) {
  for (const code of codes) {
    if (codeToRegion.has(code)) {
      throw new Error(`Region overlap: ${code}`);
    }
    codeToRegion.set(code, region);
  }
}

export function regionOf(code: string): Exclude<RegionId, "world"> | null {
  return codeToRegion.get(code.toLowerCase()) ?? null;
}

export function inRegion(code: string, region: RegionId): boolean {
  if (region === "world") return true;
  return regionOf(code) === region;
}

export function assertRegionsCover(codes: string[]): void {
  const leftover = codes.filter((c) => !codeToRegion.has(c) && !WORLD_ONLY.has(c));
  if (leftover.length) {
    throw new Error(`Unassigned region codes: ${leftover.join(", ")}`);
  }
}
