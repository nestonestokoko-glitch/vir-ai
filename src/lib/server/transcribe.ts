/**
 * Speech-to-text fallback using Groq's Whisper API (whisper-large-v3).
 *
 * Why this exists: fetchRealCaptions() / fetchCaptionsOnly() only work when a
 * video already HAS YouTube captions. Many videos (music, old uploads, foreign
 * language, captions-disabled) have none — those used to fall back to a fake
 * mock transcript, producing meaningless "best moments" and wrong burned
 * captions. When GROQ_API_KEY is set we transcribe the extracted audio instead,
 * so any video with speech gets a REAL transcript.
 *
 * Auth: the GROQ_API_KEY environment variable (no key → graceful null).
 * Model: whisper-large-v3 (Groq's Whisper implementation).
 * Returns: TranscriptSegment[] with word-level timestamps, or null on any
 * failure so the caller can keep its existing fallback chain.
 */

import fs from "node:fs";
import type { TranscriptSegment, TranscriptWord } from "@/lib/clip-types";

const GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const GROQ_MODEL = "whisper-large-v3";

interface GroqWord {
  word: string;
  start: number;
  end: number;
}

interface GroqSegment {
  id: string;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
  words: GroqWord[];
}

interface GroqTranscriptionResponse {
  text: string;
  segments?: GroqSegment[];
  words?: GroqWord[];
}

/**
 * Transcribe an audio file to timestamped transcript segments via Groq Whisper.
 * Returns null if no API key, no file, or the request fails — so callers can
 * fall back silently.
 */
export async function transcribeAudio(
  audioPath: string | null | undefined
): Promise<TranscriptSegment[] | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  if (!audioPath || !fs.existsSync(audioPath)) return null;

  try {
    const audioData = fs.readFileSync(audioPath);
    const form = new FormData();
    const blob = new Blob([audioData], {
      type: "audio/wav",
    });
    form.append("file", blob, "audio.wav");
    form.append("model", GROQ_MODEL);
    form.append("response_format", "verbose_json");
    form.append("timestamp_granularities[]", "word");
    form.append("language", "en");

    const resp = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });

    if (!resp.ok) return null;

    const data = (await resp.json()) as GroqTranscriptionResponse;
    const segments = buildSegments(data);
    return segments.length > 0 ? segments : null;
  } catch {
    return null;
  }
}

/**
 * Convert Groq's verbose_json response into our TranscriptSegment[] shape.
 * Prefers per-word timestamps when present; otherwise falls back to segment
 * boundaries and word-fraction interpolation.
 */
function buildSegments(data: GroqTranscriptionResponse): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];

  // Preferred path: segment-level words (most accurate, aligned to speech).
  if (data.segments && data.segments.length) {
    for (let i = 0; i < data.segments.length; i++) {
      const seg = data.segments[i];
      const words = seg.words?.length
        ? seg.words.map((w) => ({
            word: w.word.trim(),
            start: Number(w.start.toFixed(2)),
            end: Number(w.end.toFixed(2)),
          }))
        : splitWords(seg.text, seg.start, seg.end);
      const text = words.map((w) => w.word).join(" ").trim();
      if (!text) continue;
      segments.push({
        id: `groq_${i}`,
        text,
        start: Number(seg.start.toFixed(2)),
        end: Number(seg.end.toFixed(2)),
        words,
      });
    }
    if (segments.length) return segments;
  }

  // Fallback: top-level words array.
  if (data.words && data.words.length) {
    let i = 0;
    while (i < data.words.length) {
      const windowStart = data.words[i].start;
      const windowEnd = data.words[i].end;
      const chunk: GroqWord[] = [data.words[i]];
      i++;
      // Group words into ~12s windows for readability.
      while (
        i < data.words.length &&
        data.words[i].end - windowStart < 12
      ) {
        chunk.push(data.words[i]);
        i++;
      }
      const words: TranscriptWord[] = chunk.map((w) => ({
        word: w.word.trim(),
        start: Number(w.start.toFixed(2)),
        end: Number(w.end.toFixed(2)),
      }));
      const text = words.map((w) => w.word).join(" ").trim();
      if (!text) continue;
      segments.push({
        id: `groq_${segments.length}`,
        text,
        start: Number(windowStart.toFixed(2)),
        end: Number(windowEnd.toFixed(2)),
        words,
      });
    }
    if (segments.length) return segments;
  }

  // Last resort: a single segment from the plain text (no timestamps usable).
  if (data.text && data.text.trim()) {
    const words = splitWords(data.text, 0, 0);
    segments.push({
      id: "groq_0",
      text: data.text.trim(),
      start: 0,
      end: 0,
      words,
    });
  }

  return segments;
}

function splitWords(text: string, start: number, end: number): TranscriptWord[] {
  const words = text.split(/\s+/).filter(Boolean);
  const span = end > start ? end - start : 0;
  return words.map((w, idx) => ({
    word: w,
    start: Number((start + span * (idx / words.length)).toFixed(2)),
    end: Number((start + span * ((idx + 1) / words.length)).toFixed(2)),
  }));
}
