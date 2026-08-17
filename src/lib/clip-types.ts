export type VideoFormat = "portrait" | "landscape";

export type ClippingFont =
  | "Inter"
  | "Poppins"
  | "Montserrat"
  | "Manrope"
  | "Space Grotesk"
  | "Bebas Neue"
  | "Anton"
  | "Oswald"
  | "Playfair Display"
  | "DM Sans";

export type SubtitleStyle =
  | "Minimal"
  | "Bold"
  | "Cinematic"
  | "Modern"
  | "Kinetic"
  | "Editorial";

export type TextAnimation =
  | "Word Reveal"
  | "Phrase Reveal"
  | "Pop"
  | "Scale"
  | "Fade"
  | "Typewriter"
  | "Stagger"
  | "Highlight"
  | "Kinetic";

export type CaptionPosition = "top" | "center" | "bottom";

/** Human-readable labels for the semantic scene types a clip can represent. */
export const SCENE_LABELS: Record<string, string> = {
  hook: "Hook",
  emotional_peak: "Emotional Peak",
  surprising: "Surprising Moment",
  important_statement: "Key Statement",
  story: "Story",
  conflict: "Conflict",
  insight: "Insight",
  climax: "Climax",
  other: "Highlight",
};

export interface VideoMetadata {
  id: string;
  sourceUrl: string;
  title: string;
  channelName: string;
  durationSeconds: number;
  formattedDuration: string;
  thumbnailUrl: string;
  description?: string;
  speakers?: string[];
  hasAudio: boolean;
  hasTranscript: boolean;
  videoUrl?: string; // Optional direct video URL / sample fallback for HTML5 video player
}

export interface TranscriptWord {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
  confidence?: number;
  speaker?: string;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  start: number;
  end: number;
  speaker?: string;
  words: TranscriptWord[];
}

export interface CandidateMomentScore {
  engagement: number;        // 0 - 100
  contentValue: number;      // 0 - 100
  emotionalInterest: number; // 0 - 100
  completeness: number;      // 0 - 100
  overallScore: number;      // Weighted aggregate 0 - 100
  reasoning: string;         // AI rationale e.g., "Strong insight with emotional reaction and question/answer climax"
}

export interface CandidateMoment {
  id: string;
  title: string;
  summary: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  duration: number;  // seconds
  score: CandidateMomentScore;
  transcript: TranscriptSegment[];
  speakers: string[];
  keyTopics: string[];
  activeSpeakerFocus?: { x: number; y: number }; // smart reframing coordinates (0-100%)
  /** Semantic scene category from LLM analysis, e.g. "hook", "emotional_peak", "surprising". */
  sceneType?: string;
}

export interface GeneratedClip {
  id: string;
  momentId: string;
  title: string;
  summary: string;
  startTime: number;
  endTime: number;
  duration: number; // e.g. 30, 45, 60s
  format: VideoFormat;
  font: ClippingFont;
  style: SubtitleStyle;
  animation: TextAnimation;
  captionPosition: CaptionPosition;
  captionColor: string;
  captionBgColor: string;
  score: CandidateMomentScore;
  videoUrl?: string;
  thumbnailUrl?: string;
  transcript: TranscriptSegment[];
  activeSpeakerFocus: { x: number; y: number };
  /** Semantic scene category this clip represents, e.g. "hook", "emotional_peak", "surprising". */
  sceneType?: string;
  createdAt: string;
}

export type JobStatusStage =
  | "queued"
  | "fetching"
  | "transcribing"
  | "analyzing"
  | "selecting"
  | "rendering"
  | "completed"
  | "failed";

export interface ProcessingJob {
  id: string;
  videoId: string;
  videoMetadata: VideoMetadata;
  status: JobStatusStage;
  progressPercentage: number;
  currentStepMessage: string;
  requestedClipsCount: number;
  targetDurationSeconds: number; // 30, 45, 60
  format: VideoFormat;
  font: ClippingFont;
  style: SubtitleStyle;
  animation: TextAnimation;
  generatedClips: GeneratedClip[];
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClippingProjectConfig {
  videoUrl: string;
  metadata?: VideoMetadata;
  format: VideoFormat;
  font: ClippingFont;
  style: SubtitleStyle;
  animation: TextAnimation;
  clipCount: number;
  clipDuration: number;
  customClipCount?: number;
}
