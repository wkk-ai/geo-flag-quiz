import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const flags = JSON.parse(readFileSync(join("data", "flags.json"), "utf8"));
const dir = join("public", "flags");
mkdirSync(dir, { recursive: true });

async function grab(code) {
  const url = `https://flagcdn.com/${code}.svg`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${code} ${res.status}`);
  const text = await res.text();
  writeFileSync(join(dir, `${code}.svg`), text);
}

const codes = flags.map((f) => f.code);
const failed = [];
for (let i = 0; i < codes.length; i += 8) {
  const batch = codes.slice(i, i + 8);
  await Promise.all(
    batch.map(async (code) => {
      try {
        await grab(code);
      } catch (e) {
        failed.push(String(e));
      }
    })
  );
  process.stdout.write(`\rflags ${Math.min(i + 8, codes.length)}/${codes.length}`);
}
const ok = codes.filter((c) => existsSync(join(dir, `${c}.svg`)));
const urls = [
  "/",
  "/maps/world-50m.json",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/sw.js",
  "/offline-assets.json",
  ...ok.map((c) => `/flags/${c}.svg`),
];
writeFileSync(join("public", "offline-assets.json"), JSON.stringify({ version: `flags-${ok.length}`, urls }, null, 2));
console.log(`\nsaved ${ok.length} flags, failed ${failed.length}`);
if (failed.length) console.log(failed.slice(0, 20).join("\n"));
