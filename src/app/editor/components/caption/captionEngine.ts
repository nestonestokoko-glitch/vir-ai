import type { Project } from "../../hooks/useProject";

export type CaptionConfig = {
  font: string; // typeface, default "Inter"
  weight: number; // 100..900, default 900 (bold caption look)
  sizeRatio: number; // base font size as a FRACTION of frame HEIGHT (default 0.085)
  tracking: number; // letter-spacing at REST, in % of font size (corrective, default -10)
  color: string; // text color, default "#FFFFFF"
  shadowBlur: number; // drop-shadow blur as a fraction of font size (default 0.14)
  shadowDistance: number; // drop-shadow offset-Y as a fraction of font size (default 0.06)
  shadowOpacity: number; // drop-shadow opacity 0..1 (default 0.55)
  emphasisScale: number; // size multiplier for *word* emphasis (default 1.4)
  maxChars: number; // single-line character cap (default 17)
  slideDuration: number; // Slide-In duration in SECONDS (default 0.45)
  holdDuration: number; // Hold duration in SECONDS (default 2.2)
  exitDuration: number; // Exit-Left duration in SECONDS (default 0.5)
  blurAmount: number; // focus-pull peak blur as a fraction of font size (default 0.16)
  speed: number; // global speed multiplier (default 1)
};

export const defaultCaptionConfig: CaptionConfig = {
  font: "Inter",
  weight: 900,
  sizeRatio: 0.085,
  tracking: -10,
  color: "#FFFFFF",
  shadowBlur: 0.14,
  shadowDistance: 0.06,
  shadowOpacity: 0.55,
  emphasisScale: 1.4,
  maxChars: 17,
  slideDuration: 0.45,
  holdDuration: 2.2,
  exitDuration: 0.5,
  blurAmount: 0.16,
  speed: 1,
};

export type CaptionChunk = {
  index: number;
  clean: string; // display text: markers stripped AND uppercased (all-caps caption)
  isEmphasis: boolean;
  scale: number; // = cfg.emphasisScale if emphasis else 1
};

export function parseCaption(text: string, cfg: CaptionConfig): CaptionChunk[] {
  // 1. collapse whitespace + trim
  let collapsed = text.replace(/\s+/g, " ").trim();

  // 2. truncate whole string to maxChars (single-line, no wrap)
  if (collapsed.length > cfg.maxChars) {
    collapsed = collapsed.slice(0, cfg.maxChars) + "…";
  }

  // 3. split into words
  const words = collapsed.length > 0 ? collapsed.split(" ") : [];

  // 4. per-word emphasis detection + all-caps
  const chunks: CaptionChunk[] = words.map((word, index) => {
    const emphasisMatch = /^[*](.+)[*]$/.exec(word);
    let clean: string;
    let isEmphasis: boolean;
    if (emphasisMatch) {
      clean = emphasisMatch[1].toUpperCase();
      isEmphasis = true;
    } else {
      clean = word.toUpperCase();
      isEmphasis = false;
    }
    return {
      index,
      clean,
      isEmphasis,
      scale: isEmphasis ? cfg.emphasisScale : 1,
    };
  });

  return chunks;
}

export type CaptionTimeline = {
  slideDur: number; // frames
  holdDur: number; // frames
  exitDur: number; // frames
  loopCycle: number; // frames (full loop)
  tEnter: number[]; // per-chunk enter frame (staggered)
};

export function buildCaptionTimeline(
  chunks: CaptionChunk[],
  cfg: CaptionConfig,
  fps: number
): CaptionTimeline {
  const s = Math.max(0.1, cfg.speed);

  const slideDur = Math.max(2, Math.round((cfg.slideDuration * fps) / s));
  const holdDur = Math.max(2, Math.round((cfg.holdDuration * fps) / s));
  const exitDur = Math.max(2, Math.round((cfg.exitDuration * fps) / s));

  const staggerFrames = Math.max(2, Math.round(slideDur * 0.18));
  const tEnter: number[] = chunks.map((chunk) => chunk.index * staggerFrames);

  const lastEnter = tEnter.length > 0 ? tEnter[tEnter.length - 1] : 0;
  const loopCycle =
    lastEnter + slideDur + holdDur + exitDur + Math.max(2, Math.round(fps * 0.3));

  return {
    slideDur,
    holdDur,
    exitDur,
    loopCycle,
    tEnter,
  };
}

export type CaptionState = {
  visible: boolean;
  x: number; // CENTER x of this chunk (already includes any exit-left drift)
  y: number; // CENTER y of this chunk (already includes any slide offset)
  opacity: number;
  blur: number; // px (focus-pull / mirrored-close blur)
  tracking: number; // % of font size (rest value, constant)
  scale: number; // emphasis size multiplier
  size: number; // final font size px for this chunk (height * sizeRatio * scale)
  color: string;
  isEmphasis: boolean;
};

// ---------------------------------------------------------------------------
// Easing helpers
// ---------------------------------------------------------------------------

function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smootherstep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ---------------------------------------------------------------------------
// Text measuring helper (browser-only, SSR-safe)
// ---------------------------------------------------------------------------

let _mctx: CanvasRenderingContext2D | null = null;

function measureCtx(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (_mctx) return _mctx;
  const canvas = document.createElement("canvas");
  _mctx = canvas.getContext("2d");
  return _mctx;
}

const trackingToPx = (pct: number, size: number) => (pct / 100) * size;

function measure(
  text: string,
  weight: number,
  font: string,
  size: number,
  trackingPct: number
): number {
  const c = measureCtx();
  if (!c) return text.length * size * 0.6; // SSR-safe fallback
  c.font = `${weight} ${size}px "${font}", sans-serif`;
  (c as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
    `${trackingToPx(trackingPct, size)}px`;
  return c.measureText(text).width;
}

// ---------------------------------------------------------------------------
// Core state computation
// ---------------------------------------------------------------------------

export function computeCaptionState(
  chunk: CaptionChunk,
  i: number,
  chunks: CaptionChunk[],
  loopFrame: number,
  cfg: CaptionConfig,
  width: number,
  height: number,
  timeline: CaptionTimeline
): CaptionState | null {
  const n = chunks.length;
  if (n === 0) return null;

  const fontSizeBase = Math.round(height * cfg.sizeRatio);

  // This chunk's font size
  const size = Math.round(fontSizeBase * chunk.scale);

  // Resting centered single-line layout for ALL chunks
  const cx = width / 2;
  const cy = height / 2;

  const spaceWidth = measure(" ", cfg.weight, cfg.font, fontSizeBase, cfg.tracking);

  let totalWidth = 0;
  const chunkWidths: number[] = new Array(n);
  for (let j = 0; j < n; j++) {
    const w = measure(
      chunks[j].clean,
      cfg.weight,
      cfg.font,
      Math.round(fontSizeBase * chunks[j].scale),
      cfg.tracking
    );
    chunkWidths[j] = w;
    totalWidth += w;
  }
  // spaces between chunks
  if (n > 1) totalWidth += spaceWidth * (n - 1);

  // Compute this chunk's resting center x
  let cursor = cx - totalWidth / 2;
  let restX = cx;
  for (let j = 0; j < n; j++) {
    const w = chunkWidths[j];
    const center = cursor + w / 2;
    if (j === i) restX = center;
    cursor += w + (j < n - 1 ? spaceWidth : 0);
  }
  const restY = cy;

  // Per-chunk lifecycle
  const enterFrame = timeline.tEnter[i] ?? 0;
  const slideDur = timeline.slideDur;
  const holdDur = timeline.holdDur;
  const exitDur = timeline.exitDur;
  const lifespan = slideDur + holdDur + exitDur;

  if (loopFrame < enterFrame) return null; // not entered yet
  if (loopFrame >= enterFrame + lifespan) return null; // removed / out of layout

  const local = loopFrame - enterFrame;

  let x = restX;
  let y = restY;
  let opacity = 1;
  let blur = 0;

  if (local < slideDur) {
    // Slide-In (vertical, up)
    const eSlide = easeOutCubic(clamp01(local / slideDur));
    const offsetDown = fontSizeBase * 0.5;
    y = restY + offsetDown * (1 - eSlide);

    // Opacity resolves AHEAD of position (fully opaque at 70% of slide)
    opacity = smootherstep(clamp01(local / (slideDur * 0.7)));

    // Blur focus-pull resolves with opacity (peak at start, 0 by 70% of slide)
    blur = cfg.blurAmount * size * (1 - smootherstep(clamp01(local / (slideDur * 0.7))));
  } else if (local < slideDur + holdDur) {
    // Hold (strictly static)
    y = restY;
    opacity = 1;
    blur = 0;
  } else {
    // Exit-Left (horizontal)
    const eExit = easeInOutCubic(
      clamp01((local - slideDur - holdDur) / exitDur)
    );
    const driftLeft = width * 0.6;
    x = restX - driftLeft * eExit;
    opacity = 1 - eExit;
    blur = cfg.blurAmount * size * eExit;
    y = restY;
  }

  const tracking = cfg.tracking;
  const scale = chunk.scale;
  const color = cfg.color;
  const isEmphasis = chunk.isEmphasis;

  const visible = opacity > 0.001;

  return {
    visible,
    x,
    y,
    opacity,
    blur,
    tracking,
    scale,
    size,
    color,
    isEmphasis,
  };
}
