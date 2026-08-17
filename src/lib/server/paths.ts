/**
 * Locates external binaries (ffmpeg, yt-dlp) at runtime.
 * All real-ingestion paths degrade gracefully if a binary is missing.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Locate the project root robustly. In Next dev, server modules are compiled
 * into `.next/dev/...`, so neither `process.cwd()` (may differ) nor a fixed
 * number of `..` from `import.meta.url` (points at the compiled output) is
 * reliable. We walk UP from this file until we find the directory that actually
 * contains `bin/yt-dlp.exe`, falling back to cwd.
 */
function findProjectRoot(): string {
  // Fast path: cwd already looks like the project root.
  if (fs.existsSync(path.join(process.cwd(), "bin", "yt-dlp.exe"))) {
    return process.cwd();
  }

  let dir: string;
  try {
    dir = path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }

  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, "bin", "yt-dlp.exe"))) return dir;
    // Reached a dir containing package.json with a src/lib/server tree.
    if (
      fs.existsSync(path.join(dir, "package.json")) &&
      fs.existsSync(path.join(dir, "src", "lib", "server"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return process.cwd();
}

export const PROJECT_ROOT = findProjectRoot();

function resolveFromEnv(name: string): string | null {
  const val = process.env[name];
  return val && fs.existsSync(val) ? val : null;
}

/** Find ffmpeg binary. */
export function findFfmpeg(): string | null {
  if (process.env.FFMPEG_PATH) {
    const p = resolveFromEnv("FFMPEG_PATH");
    if (p) return p;
  }
  // Common WinGet install path observed in this environment
  const candidates = [
    "C:/Users/ANKIT KUMAR/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0-full_build/bin/ffmpeg.exe",
    path.join(PROJECT_ROOT, "bin", "ffmpeg.exe"),
    "ffmpeg",
  ];
  for (const c of candidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ c)) return c;
    try {
      execSync(`where ${c}`, { stdio: "ignore" });
      return c;
    } catch {
      /* keep looking */
    }
  }
  return null;
}

/** Find yt-dlp binary (standalone exe or python module). */
export function findYtDlp(): string | null {
  if (process.env.YTDLP_PATH) {
    const p = resolveFromEnv("YTDLP_PATH");
    if (p) return p;
  }
  const candidates = [
    path.join(PROJECT_ROOT, "bin", "yt-dlp.exe"),
    "yt-dlp",
    "yt-dlp.exe",
  ];
  for (const c of candidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ c)) return c;
    try {
      execSync(`where ${c}`, { stdio: "ignore" });
      return c;
    } catch {
      /* keep looking */
    }
  }
  return null;
}
