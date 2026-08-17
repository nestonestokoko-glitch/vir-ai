// Downloads the standalone yt-dlp Linux binary into bin/linux during the build
// so it can be traced into the serverless function bundle. We do NOT commit the
// binary (it's a 38MB executable); it's fetched on CI/build where network is
// available. Best-effort: a failed download just warns and lets the build
// continue (the pipeline then falls back to preview footage).
import { createWriteStream } from "node:fs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "bin", "linux");
const outPath = path.join(outDir, "yt-dlp");
const URL =
  "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux";

if (fs.existsSync(outPath)) {
  console.log("[fetch-yt-dlp] already present, skipping");
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });

function get(url, depth = 0) {
  return new Promise((resolve, reject) => {
    if (depth > 5) return reject(new Error("too many redirects"));
    https
      .get(url, { headers: { "User-Agent": "node" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return resolve(get(res.headers.location, depth + 1));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error("status " + res.statusCode));
        }
        const file = createWriteStream(outPath);
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
        file.on("error", reject);
      })
      .on("error", reject);
  });
}

try {
  await get(URL);
  try {
    fs.chmodSync(outPath, 0o755);
  } catch {
    /* exec bit handled at runtime too */
  }
  console.log("[fetch-yt-dlp] downloaded", outPath);
} catch (e) {
  console.warn("[fetch-yt-dlp] WARNING: download failed:", e?.message || e);
  console.warn("[fetch-yt-dlp] yt-dlp will be unavailable; clips fall back to preview footage.");
  process.exit(0);
}
