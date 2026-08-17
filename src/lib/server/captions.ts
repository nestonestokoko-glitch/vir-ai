/**
 * Fetches REAL YouTube captions (timestamped transcript) for a video.
 *
 * No audio download or transcription API key required — uses YouTube's public
 * caption tracks (timedtext). Falls back to null when captions are unavailable
 * so the caller can decide whether to download audio + transcribe instead.
 */

import { extractYouTubeId } from "@/lib/youtube";
import type { TranscriptSegment, TranscriptWord } from "@/lib/clip-types";

interface CaptionTrack {
  baseUrl: string;
  name?: { simpleText?: string };
  languageCode?: string;
}

interface PlayerResponse {
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: CaptionTrack[];
    };
  };
}

function scrapePlayerResponse(html: string): PlayerResponse | null {
  const marker = "ytInitialPlayerResponse";
  const start = html.indexOf(marker);
  if (start === -1) return null;
  // Find the first '{' after the marker and balance braces.
  const braceStart = html.indexOf("{", start);
  if (braceStart === -1) return null;
  let depth = 0;
  for (let i = braceStart; i < html.length; i++) {
    const ch = html[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const json = html.slice(braceStart, i + 1);
        try {
          return JSON.parse(json);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

/** Decode HTML entities produced by the timedtext XML. */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

/**
 * Parse YouTube timedtext XML (<text start=".." dur="..">word</text>) into
 * per-word timestamped segments.
 */
function parseTimedTextXml(xml: string): TranscriptSegment[] {
  const textRe = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  const raw: { start: number; end: number; text: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = textRe.exec(xml)) !== null) {
    const start = parseFloat(m[1]);
    const dur = parseFloat(m[2]);
    const text = decodeEntities(m[3]).replace(/\n/g, " ").trim();
    if (text) raw.push({ start, end: start + dur, text });
  }

  // Merge consecutive caption lines into sentence-like segments (max ~12s each)
  const segments: TranscriptSegment[] = [];
  let current: { start: number; end: number; words: string[] } | null = null;

  for (const line of raw) {
    const words = line.text.split(/\s+/).filter(Boolean);
    if (!current) {
      current = { start: line.start, end: line.end, words: [...words] };
      continue;
    }
    const span = line.end - current.start;
    if (span > 12) {
      segments.push(finalizeSegment(current));
      current = { start: line.start, end: line.end, words: [...words] };
    } else {
      current.end = line.end;
      current.words.push(...words);
    }
  }
  if (current) segments.push(finalizeSegment(current));

  return segments;

  function finalizeSegment(c: { start: number; end: number; words: string[] }): TranscriptSegment {
    const text = c.words.join(" ");
    const words: TranscriptWord[] = c.words.map((w, i) => {
      const frac = (i + 1) / c.words.length;
      return {
        word: w,
        start: Number((c.start + (c.end - c.start) * (i / c.words.length)).toFixed(2)),
        end: Number((c.start + (c.end - c.start) * frac).toFixed(2)),
      };
    });
    return {
      id: `cap_${Math.round(c.start)}`,
      text,
      start: Number(c.start.toFixed(2)),
      end: Number(c.end.toFixed(2)),
      words,
    };
  }
}

/**
 * Fetch real captions for a YouTube URL.
 * Returns null when no caption track is available (caller should fall back to
 * audio transcription).
 */
export async function fetchRealCaptions(
  url: string,
  preferredLang = "en"
): Promise<TranscriptSegment[] | null> {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const res = await fetch(watchUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; VIRAI/1.0)" },
  });
  if (!res.ok) return null;
  const html = await res.text();

  const player = scrapePlayerResponse(html);
  const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!tracks || tracks.length === 0) return null;

  // Prefer the requested language, else fall back to the first track.
  const track =
    tracks.find((t) => t.languageCode === preferredLang) ?? tracks[0];
  if (!track?.baseUrl) return null;

  const capRes = await fetch(track.baseUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; VIRAI/1.0)" },
  });
  if (!capRes.ok) return null;
  const xml = await capRes.text();

  const segments = parseTimedTextXml(xml);
  return segments.length > 0 ? segments : null;
}

/** Parse a WebVTT file (as produced by yt-dlp --sub-format vtt) into segments. */
export function parseVtt(vtt: string): TranscriptSegment[] {
  const lines = vtt.split(/\r?\n/);
  const cueRe = /(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})/;
  const segments: TranscriptSegment[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    const m = line.match(cueRe);
    if (m) {
      const start = toSeconds(m[1], m[2], m[3], m[4]);
      const end = toSeconds(m[5], m[6], m[7], m[8]);
      // Collect text lines until blank line
      const textLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "") {
        textLines.push(lines[i].trim());
        i++;
      }
      const text = textLines.join(" ").replace(/<[^>]+>/g, "").trim();
      if (text) {
        const words = text.split(/\s+/).filter(Boolean);
        const wordObjs: TranscriptWord[] = words.map((w, idx) => ({
          word: w,
          start: Number((start + (end - start) * (idx / words.length)).toFixed(2)),
          end: Number((start + (end - start) * ((idx + 1) / words.length)).toFixed(2)),
        }));
        segments.push({
          id: `vtt_${segments.length}`,
          text,
          start: Number(start.toFixed(2)),
          end: Number(end.toFixed(2)),
          words: wordObjs,
        });
      }
    } else {
      i++;
    }
  }
  return segments;
}

function toSeconds(h: string, m: string, s: string, ms: string): number {
  return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
}
