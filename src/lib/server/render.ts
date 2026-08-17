/**
 * Real clip rendering with ffmpeg.
 *
 * Cuts the ingested source video from startTime->endTime, reframes to 9:16 or
 * 16:9, and burns the transcript captions (styled per the clip's font/style) into
 * the output MP4. Returns the output file path, or null if ffmpeg is missing.
 */

import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { findFfmpeg, findFfprobe, PROJECT_ROOT } from "./paths";
import { IS_SERVERLESS } from "./isServerless";
import type { GeneratedClip } from "@/lib/clip-types";

// On serverless the filesystem is read-only except /tmp, so render outputs go
// there; locally we keep the existing public/generated dir.
const OUT_DIR = IS_SERVERLESS
  ? path.join("/tmp", "generated")
  : path.join(PROJECT_ROOT, "public", "generated");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/** Map our subtitle style to an ffmpeg drawtext-friendly color/box config. */
function styleToDrawtext(clip: GeneratedClip): { color: string; box: string } {
  const color = (clip.captionColor || "#FFFFFF").replace("#", "0x");
  switch (clip.style) {
    case "Bold":
    case "Kinetic":
      return { color, box: `box=1:boxcolor=black@0.7:boxborderw=12` };
    case "Cinematic":
      return { color, box: `box=1:boxcolor=black@0.9:boxborderw=8` };
    case "Minimal":
      return { color, box: `` };
    case "Modern":
    case "Editorial":
    default:
      return { color, box: `box=1:boxcolor=black@0.5:boxborderw=10` };
  }
}

/** Build a simple SRT from the clip transcript (clamped to clip window). */
function buildSrt(clip: GeneratedClip): string {
  let idx = 1;
  const lines: string[] = [];
  for (const seg of clip.transcript) {
    if (seg.end < clip.startTime || seg.start > clip.endTime) continue;
    const words = seg.words || [];
    const chunk = 6;
    for (let i = 0; i < words.length; i += chunk) {
      const slice = words.slice(i, i + chunk);
      const s = Math.max(clip.startTime, slice[0].start);
      const e = Math.min(clip.endTime, slice[slice.length - 1].end);
      const text = slice.map((w) => w.word).join(" ");
      lines.push(
        `${idx}\n${fmt(s - clip.startTime)} --> ${fmt(e - clip.startTime)}\n${text}\n`
      );
      idx++;
    }
  }
  return lines.join("\n");
}

function fmt(sec: number): string {
  const ms = Math.round((sec % 1) * 1000);
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const ss = s % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

/** Get the real duration (seconds) of a video file via ffprobe, or null. */
export async function getVideoDuration(videoPath: string): Promise<number | null> {
  const ffmpeg = findFfmpeg();
  if (!ffmpeg || !fs.existsSync(videoPath)) return null;
  const ffprobe = findFfprobe();
  if (!ffprobe) return null;
  try {
    const out = await new Promise<string>((resolve, reject) =>
      execFile(
        ffprobe,
        ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", videoPath],
        { timeout: 30_000, windowsHide: true } as any,
        (err: any, stdout: any) => (err ? reject(err) : resolve(stdout?.toString() ?? ""))
      )
    );
    const d = parseFloat(out.trim());
    return isNaN(d) ? null : d;
  } catch {
    return null;
  }
}

/** Run ffmpeg as a non-blocking child process (resolves on success). */
function runFfmpeg(ffmpeg: string, args: string[], timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      ffmpeg,
      args,
      { timeout: timeoutMs, stdio: "ignore", windowsHide: true } as any,
      (err: any) => (err ? reject(err) : resolve())
    );
  });
}

/**
 * Render a single clip. `sourceVideoPath` is the locally ingested video.
 * Returns the path to the rendered MP4, or null on failure / missing ffmpeg.
 * Async/non-blocking so multiple clips can render concurrently.
 */
export async function renderClip(clip: GeneratedClip, sourceVideoPath: string): Promise<string | null> {
  const ffmpeg = findFfmpeg();
  if (!ffmpeg || !fs.existsSync(sourceVideoPath)) return null;
  ensureDir(OUT_DIR);

  const outPath = path.join(OUT_DIR, `${clip.id}.mp4`);
  const srtPath = path.join(OUT_DIR, `${clip.id}.srt`);
  const safeFont = (clip.font || "Inter").replace(/[^a-zA-Z0-9]/g, "");

  // Write SRT caption file
  fs.writeFileSync(srtPath, buildSrt(clip), "utf8");

  // The exported clip is ALWAYS portrait (1080x1920), regardless of the
  // Portrait/Landscape UI choice. Landscape Mode only changes the LAYOUT:
  // the portrait video is contained (fit, aspect preserved) and centered with a
  // background, instead of covering the full frame.
  const fx = Math.min(0.95, Math.max(0.05, (clip.activeSpeakerFocus?.x ?? 50) / 100));
  const fy = Math.min(0.95, Math.max(0.05, (clip.activeSpeakerFocus?.y ?? 50) / 100));

  // Portrait: cover the full frame, cropping around the speaker/focus point.
  const coverFilter =
    `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:(iw-1080)*${fx.toFixed(3)}:(ih-1920)*${fy.toFixed(3)}`;
  // Landscape: contain (fit, never crop/stretch) centered in 1080x1920, dark bg.
  const containFilter =
    `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x0a0f1c`;

  const baseFilter = clip.format === "landscape" ? containFilter : coverFilter;

  const { color, box } = styleToDrawtext(clip);
  const forceStyle = ["FontName=" + safeFont, "FontSize=34", "PrimaryColour=" + color, box]
    .filter(Boolean)
    .join(",");
  const subSuffix = `,subtitles='${srtPath.replace(/'/g, "'\\''")}':force_style='${forceStyle}'`;

  const subtitleArgs = [
    "-y",
    "-ss",
    String(clip.startTime),
    "-to",
    String(clip.endTime),
    "-i",
    sourceVideoPath,
    "-vf",
    `${baseFilter}${subSuffix}`,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-c:a",
    "aac",
    "-shortest",
    outPath,
  ];

  const noSubArgs = [
    "-y",
    "-ss",
    String(clip.startTime),
    "-to",
    String(clip.endTime),
    "-i",
    sourceVideoPath,
    "-vf",
    baseFilter,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-c:a",
    "aac",
    "-shortest",
    outPath,
  ];

  try {
    await runFfmpeg(ffmpeg, subtitleArgs, 120_000);
  } catch {
    // subtitle burn-in can fail on some systems; retry without subtitles.
    try {
      await runFfmpeg(ffmpeg, noSubArgs, 120_000);
    } catch {
      return null;
    }
  }

  try {
    fs.unlinkSync(srtPath);
  } catch {
    /* ignore */
  }
  // Reject empty / broken outputs (e.g. an out-of-range -ss/-to window).
  if (!fs.existsSync(outPath)) return null;
  try {
    const stat = fs.statSync(outPath);
    if (stat.size < 1024) {
      fs.unlinkSync(outPath);
      return null;
    }
  } catch {
    return null;
  }
  return outPath;
}
