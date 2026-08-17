/**
 * Real video ingestion using yt-dlp + ffmpeg.
 *
 * Downloads the source video for a pasted URL into a local working directory so
 * it can be cut/rendered. Also downloads available subtitles (.vtt) for
 * transcription-free captioning. Degrades gracefully: returns null when yt-dlp
 * is unavailable so the caller can fall back to bundled sample footage.
 */

import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { findFfmpeg, findYtDlp, PROJECT_ROOT } from "./paths";
import { extractYouTubeId } from "@/lib/youtube";
import { IS_SERVERLESS } from "./isServerless";

// Serverless filesystems are read-only except /tmp.
const WORK_DIR = IS_SERVERLESS
  ? path.join("/tmp", "ingest")
  : path.join(PROJECT_ROOT, "tmp", "ingest");

/**
 * Egress proxy for yt-dlp. YouTube bot-blocks datacenter IPs (which is what
 * Netlify Functions run on), so downloads from the serverless backend need to
 * egress through a residential/rotating proxy. `YTDLP_PROXY` is a comma-
 * separated list of endpoints; we round-robin across them so a single blocked
 * or rate-limited endpoint doesn't sink the whole job. Leave unset for local
 * dev (residential IP, no proxy needed).
 */
const PROXY_LIST = (process.env.YTDLP_PROXY || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
let proxyCursor = 0;
function nextProxy(): string | null {
  if (!PROXY_LIST.length) return null;
  const p = PROXY_LIST[proxyCursor % PROXY_LIST.length];
  proxyCursor++;
  return p;
}

/**
 * YouTube bot-blocks the default web client's download URLs (HTTP 403 /
 * "Video unavailable") from many datacenter / shared IPs. The `android`
 * player client is the most reliable for direct downloads in this environment;
 * the extra clients are fallbacks yt-dlp tries in order if `android` fails.
 */
const YTDLP_PLAYER_CLIENT_ARGS = [
  "--extractor-args",
  "youtube:player_client=android,web_safari,tv,ios,web",
];

export interface IngestResult {
  videoPath: string; // local path to downloaded video
  audioPath: string; // local path to extracted audio (for transcription)
  captionPath: string | null; // local path to downloaded .vtt subtitles (if any)
  sourceUrl: string;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/** Build an env object that puts ffmpeg on PATH so yt-dlp can merge formats. */
function ffmpegEnv(): NodeJS.ProcessEnv {
  const ffmpeg = findFfmpeg();
  if (!ffmpeg) return process.env;
  const ffmpegDir = path.dirname(ffmpeg);
  const existing = process.env.PATH || "";
  if (existing.includes(ffmpegDir)) return process.env;
  return { ...process.env, PATH: `${ffmpegDir}${path.delimiter}${existing}` };
}

/**
 * Run yt-dlp as a non-blocking child process (resolves on success, rejects on
 * failure). stdio is discarded — callers inspect the filesystem afterwards.
 */
function runYtDlp(args: string[], timeoutMs: number): Promise<void> {
  const ytDlp = findYtDlp();
  if (!ytDlp) return Promise.reject(new Error("yt-dlp not found"));
  // Route egress through the (rotating) proxy so YouTube doesn't block the
  // datacenter IP. `--proxy` is a global option, safe to prepend.
  const proxy = nextProxy();
  const fullArgs = proxy ? ["--proxy", proxy, ...args] : args;
  return new Promise((resolve, reject) => {
    execFile(
      ytDlp,
      fullArgs,
      { timeout: timeoutMs, stdio: "ignore", env: ffmpegEnv(), windowsHide: true } as any,
      (err: any) => (err ? reject(err) : resolve())
    );
  });
}

/**
 * Caption-first fetch: download ONLY the subtitle track (no video) for a URL.
 * This is the cheap path used to score moments — it avoids pulling the whole
 * video before we even know which clips we want. Returns the .vtt path, or
 * null if yt-dlp is missing or no captions are available.
 */
export async function fetchCaptionsOnly(url: string): Promise<string | null> {
  const ytDlp = findYtDlp();
  if (!ytDlp) return null;

  const videoId = extractYouTubeId(url) || `vid_${Date.now().toString(36)}`;
  ensureDir(WORK_DIR);
  const safeId = videoId.replace(/[^a-zA-Z0-9_-]/g, "");
  const stem = path.join(WORK_DIR, safeId);
  const captionPath = `${stem}.en.vtt`;

  try {
    await runYtDlp(
      [
        ...YTDLP_PLAYER_CLIENT_ARGS,
        url,
        "--no-playlist",
        "--skip-download",
        "--write-subs",
        "--write-auto-subs",
        "--sub-lang",
        "en",
        "--sub-format",
        "vtt",
        "-o",
        stem + ".%(id)s.%(ext)s",
        "--no-warnings",
        "--quiet",
      ],
      120_000
    );
  } catch {
    /* captions are optional */
  }

  if (fs.existsSync(captionPath)) return captionPath;
  const vtts = fs
    .readdirSync(WORK_DIR)
    .filter((f) => f.startsWith(safeId) && f.endsWith(".vtt"));
  return vtts.length ? path.join(WORK_DIR, vtts[0]) : null;
}

/**
 * Download a video (and its subtitles) for the given URL.
 * Returns null if the required binaries are missing or the download fails.
 * Async/non-blocking so the server stays responsive while a job runs.
 */
export async function ingestVideo(url: string): Promise<IngestResult | null> {
  const ytDlp = findYtDlp();
  const ffmpeg = findFfmpeg();
  if (!ytDlp) return null;

  const videoId = extractYouTubeId(url) || `vid_${Date.now().toString(36)}`;
  ensureDir(WORK_DIR);
  const safeId = videoId.replace(/[^a-zA-Z0-9_-]/g, "");
  const stem = path.join(WORK_DIR, safeId);
  const videoPath = `${stem}.mp4`;
  const audioPath = `${stem}.wav`;
  const captionPath = `${stem}.en.vtt`;

  try {
    // Download video. Prefer a pre-muxed MP4 so no merge step is required.
    await runYtDlp(
      [
        ...YTDLP_PLAYER_CLIENT_ARGS,
        url,
        "--no-playlist",
        // Cap at 720p: smaller download finishes well within the function
        // timeout (full 1080p videos can blow it on a slow proxy).
        "-f",
        "best[height<=720][ext=mp4]/best[height<=720]",
        "-o",
        videoPath,
        "--no-warnings",
        "--quiet",
      ],
      240_000
    );

    // If the strict format filter found nothing (many videos lack an MP4
    // stream), fall back to the best available stream capped at 720p so we
    // still get a real clip instead of bailing out to null.
    if (!fs.existsSync(videoPath)) {
      await runYtDlp(
        [
          ...YTDLP_PLAYER_CLIENT_ARGS,
          url,
          "--no-playlist",
          "-f",
          "best[height<=720]",
          "-o",
          videoPath,
          "--no-warnings",
          "--quiet",
        ],
        300_000
      );
    }

    if (!fs.existsSync(videoPath)) return null;

    // Download subtitles (manual + auto-generated) when present.
    try {
      await runYtDlp(
        [
          ...YTDLP_PLAYER_CLIENT_ARGS,
          url,
          "--no-playlist",
          "--skip-download",
          "--write-subs",
          "--write-auto-subs",
          "--sub-lang",
          "en",
          "--sub-format",
          "vtt",
          "-o",
          stem + ".%(id)s.%(ext)s",
          "--no-warnings",
          "--quiet",
        ],
        120_000
      );
    } catch {
      /* subtitles are optional */
    }

    // Locate the downloaded .vtt (name may include the video id).
    let foundVtt: string | null = null;
    if (fs.existsSync(captionPath)) foundVtt = captionPath;
    else {
      const vtts = fs
        .readdirSync(WORK_DIR)
        .filter((f) => f.startsWith(safeId) && f.endsWith(".vtt"));
      if (vtts.length) foundVtt = path.join(WORK_DIR, vtts[0]);
    }

    // Extract audio for downstream transcription if ffmpeg is present.
    if (ffmpeg) {
      try {
        await new Promise<void>((resolve) =>
          execFile(
            ffmpeg,
            ["-y", "-i", videoPath, "-vn", "-ac", "1", "-ar", "16000", audioPath],
            { timeout: 120_000, stdio: "ignore", windowsHide: true } as any,
            () => resolve()
          )
        );
      } catch {
        /* audio extraction is optional */
      }
    }

    return { videoPath, audioPath, captionPath: foundVtt, sourceUrl: url };
  } catch (err: any) {
    // Download failed entirely — caller falls back to bundled sample footage.
    // Log so a "no clip" report is diagnosable (restricted/geo-blocked video,
    // network, or outdated yt-dlp).
    console.warn(`[ingest] download failed for ${url}: ${err?.message || err}`);
    return null;
  }
}

/** Best-effort cleanup of downloaded working files. */
export function cleanupIngest(result: IngestResult | null) {
  if (!result) return;
  for (const p of [result.videoPath, result.audioPath, result.captionPath].filter(Boolean) as string[]) {
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch {
      /* ignore */
    }
  }
}
