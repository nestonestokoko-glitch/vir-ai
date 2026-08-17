/**
 * Real AI moment detection via the Anthropic Messages API.
 *
 * Sends the real timestamped transcript to Claude with the scoring rubric from
 * working.md §13 and returns ranked candidate moments. If the API is
 * unavailable (no key / network), the caller falls back to the deterministic
 * keyword scorer in `ai-moment-detection.ts`.
 */

import type {
  CandidateMoment,
  CandidateMomentScore,
  TranscriptSegment,
} from "@/lib/clip-types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

const RUBRIC = `You are the semantic "best moments" analyst for a long-form video clipping tool.

STEP 1 — Understand the WHOLE video first:
- Identify the overall CONTEXT and TOPIC.
- Trace the NARRATIVE ARC (setup → tension → payoff).
- Locate EMOTIONAL PEAKS, IMPORTANT STATEMENTS / quotes, SURPRISING or revelation moments, and strong HOOKS (openers that grab attention).

STEP 2 — Pick the distinct, non-overlapping high-value moments that would each make a compelling short-form clip. For every moment, classify its SCENE TYPE and justify it with the semantic analysis above.

Score each moment 0-100 on:
- engagement: hook strength, surprisingness, emotional reaction, laughter, strong opinion, Q&A
- contentValue: insight, useful info, story, controversial/important statement, clear conclusion
- emotionalInterest: emotional change, punchline, payoff, reaction
- completeness: starts/ends naturally, complete thought, no cut-off words
Overall = 0.35*engagement + 0.30*contentValue + 0.20*emotionalInterest + 0.15*completeness.

scene type (category) MUST be exactly one of:
hook | emotional_peak | surprising | important_statement | story | conflict | insight | climax | other

Return STRICTLY the top-N most valuable, NON-DUPLICATE, non-overlapping moments spread across the whole video. Decide each moment's window to BEST MATCH THE REQUESTED DURATION: pick the single most engaging, self-contained section (a complete thought / hook→payoff) whose length fits within maxDuration. Make every window as close to maxDuration as the natural sentence/thought boundaries allow, but it must NEVER exceed maxDuration. Prefer complete thoughts at sentence boundaries. Moment #1 must be the single strongest / best moment.`;

interface ScoredMomentDTO {
  start: number;
  end: number;
  category: string;
  engagement: number;
  contentValue: number;
  emotionalInterest: number;
  completeness: number;
  overallScore: number;
  reason: string;
  title: string;
}

/**
 * Ask Claude to rank the best moments in a real transcript.
 * Returns null when the API call cannot be made (so caller can fall back).
 */
export async function scoreMomentsWithClaude(
  segments: TranscriptSegment[],
  targetClipCount: number,
  targetDurationSeconds: number,
  videoTitle: string
): Promise<CandidateMoment[] | null> {
  const baseUrl = process.env.ANTHROPIC_BASE_URL;
  const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
  if (!baseUrl || !authToken) return null;

  // Build a compact transcript view: [start-end] speaker? text
  const transcriptView = segments
    .map((s) => `[${s.start}-${s.end}]${s.speaker ? " " + s.speaker + ":" : ""} ${s.text}`)
    .join("\n");

  const prompt = `${RUBRIC}

VIDEO TITLE: ${videoTitle}
TARGET CLIP COUNT (N): ${targetClipCount}
REQUESTED CLIP DURATION (seconds, HARD LIMIT): ${targetDurationSeconds}

TRANSCRIPT (with timestamps in seconds):
${transcriptView}

Respond with ONLY a JSON object of this exact shape, no markdown:
{"moments":[{"start":number,"end":number,"category":"hook|emotional_peak|surprising|important_statement|story|conflict|insight|climax|other","engagement":0-100,"contentValue":0-100,"emotionalInterest":0-100,"completeness":0-100,"overallScore":0-100,"reason":"why this moment is compelling, referencing the narrative/emotion/hook","title":"catchy clip title"}]}

Pick exactly up to ${targetClipCount} moments. Do not overlap. Moment #1 = the single best moment.
CRITICAL: For the REQUESTED DURATION (${targetDurationSeconds}s), choose for each moment the BEST, most engaging and self-contained section that FITS WITHIN it. Use the EXACT start/end timestamps from the transcript above (they will be used verbatim to cut the original video). Each moment's end-start must be <= ${targetDurationSeconds}.`;

  try {
    const resp = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": authToken,
        "anthropic-version": "2023-06-01",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    const text = data?.content?.[0]?.text ?? "";
    const json = extractJson(text);
    if (!json?.moments) return null;

    return (json.moments as ScoredMomentDTO[])
      .filter((m) => m && typeof m.start === "number" && typeof m.end === "number")
      .map((m, i) => buildMoment(m, i, segments));
  } catch {
    return null;
  }
}

/**
 * Ask Claude to find the SINGLE best short-form clip moment in a full transcript
 * via semantic analysis (narrative, emotional peaks, hooks, surprising/important
 * statements). Returns a `CandidateMoment` describing that one moment, or null
 * when the API is unavailable / returns something unusable (caller falls back).
 */
export async function detectBestMomentWithClaude(
  segments: TranscriptSegment[],
  videoTitle: string
): Promise<CandidateMoment | null> {
  const baseUrl = process.env.ANTHROPIC_BASE_URL;
  const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
  if (!baseUrl || !authToken) return null;

  const transcriptView = segments
    .map((s) => `[${s.start}-${s.end}]${s.speaker ? " " + s.speaker + ":" : ""} ${s.text}`)
    .join("\n");

  const prompt = `You are the "best moment" detector for a long-form video clipping tool.
Analyze the FULL transcript below for narrative, topic, emotional peaks, important
statements, surprising moments, and strong hooks. Then pick the SINGLE most compelling
short-form clip moment: it must be self-contained, engaging, and understandable without
watching the whole video (a hook plus a payoff).

VIDEO TITLE: ${videoTitle}

TRANSCRIPT (with timestamps in seconds):
${transcriptView}

Respond with ONLY a JSON object of this exact shape, no markdown:
{"start":number,"end":number,"title":"catchy clip title","summary":"what happens in the moment","reasoning":"why this is the best moment","keyTopics":["topic1","topic2"]}

start/end must be real timestamps from the transcript. end-start should be 20-60 seconds.`;

  try {
    const resp = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": authToken,
        "anthropic-version": "2023-06-01",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    const text = data?.content?.[0]?.text ?? "";
    const json = extractJson(text);
    if (!json || typeof json.start !== "number" || typeof json.end !== "number") return null;

    const start = Math.max(0, Math.round(json.start));
    const end = Math.max(start + 5, Math.round(json.end));
    const overlapping = segments.filter((s) => s.start < end && s.end > start);
    const score: CandidateMomentScore = {
      engagement: 95,
      contentValue: 95,
      emotionalInterest: 95,
      completeness: 95,
      overallScore: 95,
      reasoning: json.reasoning || "AI-selected single best moment.",
    };
    return {
      id: "ai_best",
      title: json.title || "Best Moment",
      summary:
        json.summary || overlapping.map((s) => s.text).join(" ") || json.reasoning || "Best moment",
      startTime: start,
      endTime: end,
      duration: end - start,
      score,
      transcript: overlapping.length ? overlapping : segments.slice(0, 1),
      speakers: Array.from(
        new Set(overlapping.map((s) => s.speaker).filter(Boolean) as string[])
      ),
      keyTopics: Array.isArray(json.keyTopics) ? json.keyTopics.slice(0, 6) : [],
      activeSpeakerFocus: { x: 50, y: 50 },
    };
  } catch {
    return null;
  }
}

function extractJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function buildMoment(
  m: ScoredMomentDTO,
  index: number,
  segments: TranscriptSegment[]
): CandidateMoment {
  const start = Math.max(0, Math.round(m.start));
  const end = Math.max(start + 5, Math.round(m.end));
  const score: CandidateMomentScore = {
    engagement: clamp(m.engagement),
    contentValue: clamp(m.contentValue),
    emotionalInterest: clamp(m.emotionalInterest),
    completeness: clamp(m.completeness),
    overallScore: clamp(m.overallScore),
    reasoning: m.reason || "AI-selected high-value moment.",
  };
  const overlapping = segments.filter((s) => s.start < end && s.end > start);
  return {
    id: `ai_moment_${index + 1}`,
    title: m.title || `Moment ${index + 1}`,
    summary: overlapping.map((s) => s.text).join(" ") || m.reason,
    startTime: start,
    endTime: end,
    duration: end - start,
    score,
    transcript: overlapping.length ? overlapping : segments.slice(0, 1),
    speakers: Array.from(new Set(overlapping.map((s) => s.speaker).filter(Boolean) as string[])),
    keyTopics: [],
    activeSpeakerFocus: { x: 50, y: 50 },
    sceneType: normalizeCategory(m.category),
  };
}

function clamp(n: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 80;
  return Math.min(99, Math.max(0, Math.round(n)));
}

const SCENE_CATEGORIES = new Set([
  "hook",
  "emotional_peak",
  "surprising",
  "important_statement",
  "story",
  "conflict",
  "insight",
  "climax",
  "other",
]);

/** Coerce a free-form LLM category string into one of the known scene types. */
function normalizeCategory(raw: unknown): string {
  const c = String(raw || "")
    .toLowerCase()
    .replace(/[^a-z_]/g, "");
  if (SCENE_CATEGORIES.has(c)) return c;
  // loose matches
  if (c.includes("hook") || c.includes("open")) return "hook";
  if (c.includes("emotion") || c.includes("peak") || c.includes("feel")) return "emotional_peak";
  if (c.includes("surpris") || c.includes("shock") || c.includes("reveal") || c.includes("twist"))
    return "surprising";
  if (c.includes("statement") || c.includes("quote") || c.includes("important")) return "important_statement";
  if (c.includes("story") || c.includes("narrat") || c.includes("anecdot")) return "story";
  if (c.includes("conflict") || c.includes("debate") || c.includes("argument")) return "conflict";
  if (c.includes("insight") || c.includes("lesson") || c.includes("realiz")) return "insight";
  if (c.includes("climax") || c.includes("payoff") || c.includes("conclusion")) return "climax";
  return "other";
}
