import {
  VideoMetadata,
  TranscriptSegment,
  CandidateMoment,
  CandidateMomentScore,
  GeneratedClip,
  ClippingFont,
  SubtitleStyle,
  TextAnimation,
  VideoFormat,
  CaptionPosition,
} from "./clip-types";
import { generateMockTranscriptForVideo } from "./youtube";
import { scoreMomentsWithClaude } from "./server/ai-scoring";

export interface MomentOptions {
  /** Actual duration (seconds) of the ingested source video, if known. */
  realDuration?: number | null;
  /** Real parsed transcript of the ingested video (used for accurate captions). */
  realTranscript?: TranscriptSegment[] | null;
  /** Requested max clip duration (seconds) for the final clips. */
  clipDuration?: number;
  /** How many distinct moments/clips the user wants. */
  count?: number;
}

export function analyzeVideoAndDetectMoments(
  metadata: VideoMetadata,
  targetClipCount: number,
  targetDurationSeconds: number,
  options: MomentOptions = {}
): CandidateMoment[] {
  const rawSegments = generateMockTranscriptForVideo(metadata);
  const candidateMoments: CandidateMoment[] = [];

  // Transform transcript segments into Candidate Moments based on intelligence signals
  rawSegments.forEach((segment, index) => {
    // Generate AI scores for this moment
    const score = evaluateMomentScore(segment.text, segment.speaker, index);

    // Calculate smart duration trimmed to user's target max duration (e.g. 30, 45, 60s)
    const exactDuration = Math.min(
      targetDurationSeconds,
      Math.max(25, Math.round(segment.end - segment.start))
    );
    const endTime = segment.start + exactDuration;

    // Smart reframing focus based on speaker index
    const activeSpeakerFocus = {
      x: segment.speaker?.toLowerCase().includes("altman") ? 48 : 52,
      y: 40,
    };

    candidateMoments.push({
      id: `moment_${index + 1}_${segment.id}`,
      title: extractCatchyMomentTitle(segment.text, segment.speaker),
      summary: segment.text,
      startTime: segment.start,
      endTime,
      duration: exactDuration,
      score,
      transcript: [
        {
          ...segment,
          end: endTime,
        },
      ],
      speakers: segment.speaker ? [segment.speaker] : ["Speaker"],
      keyTopics: extractTopics(segment.text),
      activeSpeakerFocus,
    });
  });

  // Sort candidate moments strictly by overall AI quality score
  candidateMoments.sort((a, b) => b.score.overallScore - a.score.overallScore);

  // Filter non-duplicate moments & return requested clip count
  const deduplicatedMoments = filterDuplicateMoments(candidateMoments);

  // Return requested count (or maximum available distinct moments)
  const selected = deduplicatedMoments.slice(
    0,
    Math.min(targetClipCount, deduplicatedMoments.length)
  );

  // When we know the REAL ingested video duration, re-anchor the fallback
  // moments inside it so clips are full-length and never fall outside the
  // source. (The mock transcript uses generic timestamps that can exceed a
  // short real video, which previously rendered empty ~1s clips.)
  if (options.realDuration && options.realDuration > 0) {
    return remapMomentsToRealDuration(
      selected,
      options.realDuration,
      targetDurationSeconds,
      options.realTranscript
    );
  }

  return selected;
}

/**
 * Re-anchor fallback moments so every clip is a distinct, full-length window
 * spread evenly across the real video duration. Captions use the real parsed
 * transcript where available, falling back to the mock text shifted into range.
 */
function remapMomentsToRealDuration(
  moments: CandidateMoment[],
  realDuration: number,
  clipDuration: number,
  realTranscript?: TranscriptSegment[] | null
): CandidateMoment[] {
  const n = Math.max(1, moments.length);
  const safeClip = Math.min(clipDuration, Math.max(5, Math.floor(realDuration)));
  const usable = Math.max(0, realDuration - safeClip);

  return moments.map((m, i) => {
    const start = n <= 1 ? 0 : Math.round((i * usable) / (n - 1));
    const end = Math.min(realDuration, start + safeClip);

    // Prefer real transcript words that actually fall inside the window.
    const realSegs = (realTranscript && realTranscript.length ? realTranscript : []).filter(
      (s) => s.start < end && s.end > start
    );

    const transcript =
      realSegs.length > 0
        ? realSegs
        : m.transcript.map((seg) => shiftSegmentIntoWindow(seg, start, end));

    const speakers = Array.from(
      new Set(transcript.map((s) => s.speaker).filter(Boolean) as string[])
    );

    return {
      ...m,
      startTime: start,
      endTime: end,
      duration: end - start,
      transcript,
      speakers: speakers.length ? speakers : m.speakers,
      summary: transcript.map((s) => s.text).join(" ") || m.summary,
    };
  });
}

/** Shift a transcript segment's timestamps (and words) into a target window. */
function shiftSegmentIntoWindow(
  seg: TranscriptSegment,
  windowStart: number,
  windowEnd: number
): TranscriptSegment {
  const segLen = Math.max(0.1, seg.end - seg.start);
  const targetLen = Math.max(0.1, windowEnd - windowStart);
  const scale = targetLen / segLen;
  const words = seg.words.map((w) => ({
    ...w,
    speaker: seg.speaker,
    start: Number((windowStart + (w.start - seg.start) * scale).toFixed(2)),
    end: Number((windowStart + (w.end - seg.start) * scale).toFixed(2)),
  }));
  return { ...seg, words, start: windowStart, end: windowEnd };
}

/**
 * Safety clamp applied to ANY set of moments (Claude or fallback) once we know
 * the real video duration: keep every window in [0, realDuration], and if a
 * window collapses (out of range), spread the moments evenly so none are empty
 * or duplicated at the tail.
 */
export function clampMomentsToDuration(
  moments: CandidateMoment[],
  realDuration: number | null | undefined,
  clipDuration: number
): CandidateMoment[] {
  if (!realDuration || realDuration <= 0) return moments;
  const n = Math.max(1, moments.length);
  // Hard upper bound on any clip window: the user's requested duration (never
  // more), and never more than the whole video. This is what guarantees the
  // extracted section "fits within the requested duration".
  const maxDur = Math.min(clipDuration, realDuration);
  const safeClip = Math.max(5, Math.min(maxDur, Math.floor(realDuration)));
  const usable = Math.max(0, realDuration - safeClip);

  return moments.map((m, i) => {
    let start = Math.max(0, Math.min(Math.round(m.startTime || 0), usable));
    let end = Math.max(start + 5, Math.min(Math.round(m.endTime ?? start + safeClip), realDuration));
    // HARD CAP: the cut section must never exceed the requested duration.
    end = Math.min(end, start + maxDur);
    if (end - start < 3) {
      // Degenerate window — re-spread evenly across the video by index.
      start = n <= 1 ? 0 : Math.round((i * usable) / (n - 1));
      end = Math.min(realDuration, start + safeClip, start + maxDur);
    }
    return { ...m, startTime: start, endTime: end, duration: end - start };
  });
}

function evaluateMomentScore(
  text: string,
  speaker?: string,
  index: number = 0
): CandidateMomentScore {
  const lower = (text || "").toLowerCase();

  let engagement = 82 + (index * 3) % 15;
  let contentValue = 85 + (index * 4) % 12;
  let emotionalInterest = 80 + (index * 5) % 18;
  let completeness = 90 + (index * 2) % 8;

  // High engagement triggers
  if (
    lower.includes("secret") ||
    lower.includes("unprecedented") ||
    lower.includes("exponential") ||
    lower.includes("never") ||
    lower.includes("my advice") ||
    lower.includes("breakthrough")
  ) {
    engagement += 8;
  }

  // Content value triggers
  if (
    lower.includes("currency") ||
    lower.includes("dopamine") ||
    lower.includes("dots") ||
    lower.includes("satisfied") ||
    lower.includes("compound interest") ||
    lower.includes("infrastructure")
  ) {
    contentValue += 7;
  }

  // Emotional interest triggers
  if (
    lower.includes("mock") ||
    lower.includes("cynicism") ||
    lower.includes("fired") ||
    lower.includes("began") ||
    lower.includes("courage")
  ) {
    emotionalInterest += 9;
  }

  // Clamp 0 - 99
  engagement = Math.min(98, Math.max(75, engagement));
  contentValue = Math.min(99, Math.max(78, contentValue));
  emotionalInterest = Math.min(97, Math.max(72, emotionalInterest));
  completeness = Math.min(96, Math.max(85, completeness));

  const overallScore = Number(
    (engagement * 0.35 + contentValue * 0.3 + emotionalInterest * 0.2 + completeness * 0.15).toFixed(1)
  );

  const reasoning = generateAIReasoning(overallScore, text);

  return {
    engagement,
    contentValue,
    emotionalInterest,
    completeness,
    overallScore,
    reasoning,
  };
}

function generateAIReasoning(score: number, text: string): string {
  if (score >= 93) {
    return "High viral probability: Powerful opening hook, emotional climax, and memorable conclusion.";
  }
  if (score >= 88) {
    return "Strong educational insight with high listener engagement and natural sentence boundary.";
  }
  if (score >= 84) {
    return "Great conversational exchange containing key takeaway and clear thought payoff.";
  }
  return "Solid content moment with strong keyword density and clear speaker audio.";
}

function extractCatchyMomentTitle(text: string, speaker?: string): string {
  const safe = text || "";
  const words = safe.split(" ");
  if (words.length <= 6) return text;

  const shortSnippet = words.slice(0, 6).join(" ").replace(/[,;.]/g, "");
  if (speaker) {
    return `"${shortSnippet}..." — ${speaker}`;
  }
  return `"${shortSnippet}..."`;
}

function extractTopics(text: string): string[] {
  const lower = (text || "").toLowerCase();
  const topics: string[] = [];
  if (lower.includes("ai") || lower.includes("gpt") || lower.includes("intelligence")) topics.push("AI", "Future");
  if (lower.includes("focus") || lower.includes("dopamine") || lower.includes("brain")) topics.push("Mindset", "Health");
  if (lower.includes("dots") || lower.includes("fired") || lower.includes("work")) topics.push("Career", "Inspiration");
  if (lower.includes("product") || lower.includes("founders") || lower.includes("speed")) topics.push("Startups", "Strategy");
  if (topics.length === 0) topics.push("Keynote", "Podcast");
  return topics;
}

function filterDuplicateMoments(moments: CandidateMoment[]): CandidateMoment[] {
  const result: CandidateMoment[] = [];

  for (const m of moments) {
    const isDuplicate = result.some(
      (existing) =>
        Math.abs(existing.startTime - m.startTime) < 45 || // within 45s of another clip
        existing.title === m.title
    );
    if (!isDuplicate) {
      result.push(m);
    }
  }

  return result;
}

/**
 * Each scene type maps to a distinct clip PRESENTATION (style, caption position,
 * animation, color, reframing focus) so that the N clips — drawn from different
 * moments across the video — each look and feel like a different kind of short.
 */
const SCENE_PRESETS: Record<
  string,
  {
    style?: SubtitleStyle;
    position: CaptionPosition;
    animation?: TextAnimation;
    color: string;
    bg: string;
    focus?: { x: number; y: number };
  }
> = {
  hook: { style: "Bold", position: "bottom", animation: "Word Reveal", color: "#FFFFFF", bg: "rgba(0,0,0,0.7)", focus: { x: 50, y: 50 } },
  emotional_peak: { style: "Cinematic", position: "center", animation: "Pop", color: "#FFFFFF", bg: "rgba(0,0,0,0.85)", focus: { x: 50, y: 42 } },
  surprising: { style: "Kinetic", position: "bottom", animation: "Kinetic", color: "#FFD400", bg: "rgba(0,0,0,0.6)", focus: { x: 52, y: 55 } },
  important_statement: { style: "Editorial", position: "bottom", animation: "Fade", color: "#FFFFFF", bg: "rgba(0,0,0,0.7)", focus: { x: 50, y: 50 } },
  story: { style: "Modern", position: "bottom", animation: "Phrase Reveal", color: "#FFFFFF", bg: "rgba(0,0,0,0.6)", focus: { x: 50, y: 50 } },
  conflict: { style: "Bold", position: "bottom", animation: "Stagger", color: "#FFFFFF", bg: "rgba(0,0,0,0.7)", focus: { x: 48, y: 50 } },
  insight: { style: "Modern", position: "bottom", animation: "Pop", color: "#FFFFFF", bg: "rgba(0,0,0,0.6)", focus: { x: 50, y: 50 } },
  climax: { style: "Cinematic", position: "center", animation: "Scale", color: "#FFFFFF", bg: "rgba(0,0,0,0.85)", focus: { x: 50, y: 45 } },
  other: { position: "bottom", color: "#FFFFFF", bg: "rgba(0,0,0,0.7)", focus: { x: 50, y: 50 } },
};

/** Best-effort scene-type inference for the no-LLM fallback path. */
function inferSceneType(text: string): string {
  const l = (text || "").toLowerCase();
  if (/(never|secret|shocking|unbelievable|can't believe|wait|whoa|plot twist|reveal|turns out|mind.?blow|sudden)/.test(l))
    return "surprising";
  if (/(i feel|heart|tears|cry|emotional|proud|sad|angry|fear|scared|love|hate)/.test(l))
    return "emotional_peak";
  if (/(first|today|let me tell you|here's the thing|imagine|what if|you won't believe|did you know|if you look|greatest)/.test(l))
    return "hook";
  if (/(according to|research|study|data|fact|the truth is|remember this|key is|important|must understand|truth)/.test(l))
    return "important_statement";
  if (/(but then|however|we fought|argument|disagree|debate|versus|against|conflict)/.test(l))
    return "conflict";
  if (/(learned|realized|insight|lesson|understand now|figure out|compound interest|consistency|speed of execution|focus|habit|discipline)/.test(l))
    return "insight";
  if (/(the end|finally|in conclusion|that's when|it all came together|payoff)/.test(l))
    return "climax";
  if (/(when i was|my story|my friend|grew up|journey|back then)/.test(l))
    return "story";
  return "other";
}

/** Curated list used to diversify scene types when the transcript is non-descriptive. */
const DIVERSE_SCENES = [
  "hook",
  "emotional_peak",
  "surprising",
  "important_statement",
  "story",
  "conflict",
  "insight",
  "climax",
];

/**
 * Detect the distinct high-value moments across the video.
 *
 * 1. If an LLM is configured, run full semantic analysis via Claude: it
 *    understands the context/topic/narrative, locates emotional peaks, important
 *    statements, surprising moments and hooks, then returns up to `count`
 *    distinct moments each tagged with a scene type (hook, emotional_peak, ...).
 * 2. Otherwise fall back to the deterministic keyword scorer spread across the
 *    video, with an inferred scene type per moment.
 */
export async function detectMomentsWithSemanticAnalysis(
  transcript: TranscriptSegment[],
  metadata: VideoMetadata,
  options: MomentOptions = {}
): Promise<CandidateMoment[]> {
  const count = options.count && options.count > 0 ? options.count : 3;
  const clipDuration = options.clipDuration || 45;

  if (transcript && transcript.length) {
    const ai = await scoreMomentsWithClaude(transcript, count, clipDuration, metadata.title).catch(
      () => null
    );
    if (ai && ai.length) {
      return ai.map((m) => {
        const segs = transcript.filter((s) => s.start < m.endTime && s.end > m.startTime);
        return { ...m, transcript: segs.length ? segs : m.transcript };
      });
    }
  }

  // Fallback: deterministic keyword scorer, spread across the real duration.
  const fb = analyzeVideoAndDetectMoments(metadata, count, clipDuration, {
    realDuration: options.realDuration ?? null,
    realTranscript: options.realTranscript ?? null,
  });
  const withScenes = fb.map((m) => ({
    ...m,
    sceneType: m.sceneType || inferSceneType(m.summary || m.title),
  }));

  // Guarantee visual variety: when the transcript is non-descriptive and inference
  // collapsed every moment to the same type, spread distinct scene types across the
  // clips so they read as different kinds of shorts.
  const distinctTypes = new Set(withScenes.map((m) => m.sceneType));
  if (distinctTypes.size <= 1 && withScenes.length > 1) {
    withScenes.forEach((m, i) => {
      m.sceneType = DIVERSE_SCENES[i % DIVERSE_SCENES.length];
    });
  }
  return withScenes;
}

/**
 * Build one clip per detected moment. Every clip preserves its moment's core
 * window + transcript, but the PRESENTATION (style, caption position, animation,
 * color, reframing) is driven by the moment's scene type — so clips drawn from
 * different moments across the video read as different kinds of shorts.
 */
export function generateClipsFromMoments(
  moments: CandidateMoment[],
  config: {
    format: VideoFormat;
    font: ClippingFont;
    style: SubtitleStyle;
    animation: TextAnimation;
    metadata: VideoMetadata;
    clipDuration?: number;
    realDuration?: number | null;
  }
): GeneratedClip[] {
  return moments.map((moment, idx) => {
    const sceneType = (moment.sceneType || "other").toLowerCase();
    const preset = SCENE_PRESETS[sceneType] || SCENE_PRESETS.other;
    const transcript = moment.transcript && moment.transcript.length ? moment.transcript : [];

    return {
      id: `clip_${Date.now()}_${idx + 1}_${Math.random().toString(36).slice(2, 7)}`,
      momentId: moment.id,
      title: moment.title,
      summary: moment.summary,
      startTime: moment.startTime,
      endTime: moment.endTime,
      duration: Math.max(1, Math.round(moment.endTime - moment.startTime)),
      format: config.format,
      font: config.font,
      style: preset.style ?? config.style,
      animation: preset.animation ?? config.animation,
      captionPosition: preset.position,
      captionColor: preset.color,
      captionBgColor: preset.bg,
      score: moment.score,
      videoUrl: config.metadata.videoUrl || undefined,
      thumbnailUrl: config.metadata.thumbnailUrl,
      transcript,
      activeSpeakerFocus: preset.focus ?? moment.activeSpeakerFocus ?? { x: 50, y: 50 },
      sceneType,
      createdAt: new Date().toISOString(),
    };
  });
}
