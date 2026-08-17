// Kinetic typography engine — pure logic (no React, no canvas drawing here).
//
// Separates typography logic from animation logic (spec rule 6): this module owns parsing,
// timeline construction, layout/reflow math, and per-word state. `PreviewCanvas.drawKinetic`
// consumes `computeWordState` and does the actual canvas rendering.
//
// Parse conventions (see SKILL.md):
//   *word*  -> emphasis (larger + accent color), entrance = tracking (centered, subtle)
//   ^word^  -> typewriter entrance
//   !word!  -> pop entrance
//   ALL-CAPS word -> also treated as emphasis (union with markers)
//   plain word   -> tracking entrance (centered, subtle — tracking is the hero, no directional travel)

export type KineticEntrance = "tracking" | "zoom" | "pop" | "typewriter";

export type WordNode = {
  index: number;
  raw: string; // original token (may include markers)
  clean: string; // display text (markers stripped)
  isEmphasis: boolean;
  entrance: KineticEntrance;
};

export type WordSlot = {
  x: number; // center x (canvas px)
  y: number; // center y (canvas px)
  scale: number; // emphasis multiplier (1 or emphasisScale)
  size: number; // font size px (already includes emphasis)
  width: number; // measured glyph width at this size
};

export type WordState = {
  visible: boolean;
  x: number;
  y: number;
  scale: number; // total render scale (slot.scale * entrance factor)
  size: number; // final font size px to draw
  width: number; // measured glyph width at this size
  tracking: number; // letter-spacing as % of font size (animated per-word)
  opacity: number;
  color: string;
  visibleChars: number; // for typewriter
  isEmphasis: boolean;
  hasArrow: boolean;
};

export type KineticConfig = {
  font: string;
  weight: number;
  emphasisWeight: number;
  baseSize: number;
  primaryColor: string;
  emphasisColor: string;
  speed: number;
  bounceStrength: number;
  popStrength: number;
  blurAmount: number;
  globalScale: number;
  compositionX: number;
  compositionY: number;
  wordSpacing: number;
  emphasisScale: number;
  // Per-word lifecycle (ENTER → HOLD → EXIT → REMOVE), times in seconds.
  enterDuration: number;
  holdDuration: number;
  exitDuration: number;
  maxVisible: number; // rolling window size — at most this many words on screen at once (default 3)
  // Tracking / letter-spacing animation (per-word, tied to the lifecycle). Values are PERCENT of
  // font size so the effect scales with type size. Enter: compressed → normal. Exit: normal → expanded.
  trackingEnabled: boolean;
  trackingEnter: number; // start % on entrance (negative = compressed)
  trackingFinal: number; // settled % (usually 0)
  trackingExit: number; // end % on exit (positive = expanded)
  trackingEnterDuration: number; // seconds
  trackingExitDuration: number; // seconds
  trackingExitEnabled: boolean;
  trackingEasing: "ease-out" | "ease-in-out" | "smooth";
  trackingEmphasis: boolean; // stronger enter/exit values for emphasis words
};

export type Timeline = {
  step: number; // frames between consecutive word entrances
  enterDur: number; // frames per word entrance
  holdDur: number; // frames holding the final composition
  exitDur: number; // frames of fade-reset
  repositionDur: number; // frames a reflow takes
  enterTrackingDur: number; // frames of the enter tracking animation
  exitTrackingDur: number; // frames of the exit tracking animation
  loopCycle: number; // total frames of one loop
  tEnter: number[]; // per-word enter frame
  buildEnd: number; // frame the last word finishes entering
};

export const defaultKineticConfig: KineticConfig = {
  font: "Inter",
  weight: 800,
  emphasisWeight: 900,
  baseSize: 64,
  primaryColor: "#FFFFFF",
  emphasisColor: "#22C55E",
  speed: 1,
  bounceStrength: 0.6,
  popStrength: 0.8,
  blurAmount: 0.5,
  globalScale: 1,
  compositionX: 0.5,
  compositionY: 0.5,
  wordSpacing: 1.1,
  emphasisScale: 1.45,
  enterDuration: 0.3,
  holdDuration: 0.8,
  exitDuration: 0.3,
  maxVisible: 3,
  trackingEnabled: true,
  trackingEnter: -8,
  trackingFinal: 0,
  trackingExit: 12,
  trackingEnterDuration: 0.3,
  trackingExitDuration: 0.3,
  trackingExitEnabled: true,
  trackingEasing: "ease-out",
  trackingEmphasis: false,
};

// ---- easing -----------------------------------------------------------------

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

/** Smootherstep (Perlin): zero velocity AND acceleration at both ends — the repo standard. */
export const smootherstep = (t: number) => {
  const c = clamp01(t);
  return c * c * c * (c * (c * 6 - 15) + 10);
};

/** Ease-out cubic: fast start, gentle deceleration into the target (CapCut "Auto Curve" feel). */
export const easeOutCubic = (t: number) => {
  const c = clamp01(t);
  return 1 - Math.pow(1 - c, 3);
};

/** Ease-in-out cubic: smooth acceleration then deceleration (used for exits). */
export const easeInOutCubic = (t: number) => {
  const c = clamp01(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};

/** Ease-out-back: overshoots past 1 then settles — used for the slight directional overshoot. */
export const easeOutBack = (t: number, strength: number) => {
  const c = clamp01(t);
  const s = Math.max(0, strength) * 1.70158;
  const u = c - 1;
  return 1 + (s + 1) * u * u * u + s * u * u;
};

/** Raised-cosine bump 0→1→0 (boing / arrow settle). Flat at both ends — no jerk. */
export const raisedCosineBump = (u: number) => {
  const c = clamp01(u);
  return 0.5 - 0.5 * Math.cos(2 * Math.PI * c);
};

/** Punchy pop opacity envelope (0 → partial → lower → higher → 1). */
export const popOpacity = (t: number, strength: number) => {
  const keys: [number, number][] = [
    [0, 0],
    [0.3, 0.45 * strength],
    [0.5, 0.2],
    [0.75, 0.75],
    [1, 1],
  ];
  const c = clamp01(t);
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (c >= t0 && c <= t1) {
      const f = (c - t0) / (t1 - t0);
      return v0 + (v1 - v0) * f;
    }
  }
  return 1;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---- parse ------------------------------------------------------------------

export function parseWords(text: string): WordNode[] {
  const tokens = text.split(/\s+/).filter(Boolean);
  return tokens.map((tok, i): WordNode => {
    let clean = tok;
    let isEmphasis = false;
    let entrance: KineticEntrance = "tracking"; // centered, subtle — tracking is the hero

    const star = /^\*(.+)\*$/.exec(tok);
    const caret = /^\^(.+)\$$/.exec(tok);
    const bang = /^!(.+)!$/.exec(tok);

    if (star) {
      clean = star[1];
      isEmphasis = true;
      entrance = "tracking";
    } else if (caret) {
      clean = caret[1];
      entrance = "typewriter";
    } else if (bang) {
      clean = bang[1];
      entrance = "pop";
    } else {
      // ALL-CAPS (2+ alphanumerics, at least one uppercase) → emphasis, still centered/subtle.
      const alnum = clean.replace(/[^A-Za-z0-9]/g, "");
      if (alnum.length >= 2 && /^[A-Z0-9]+$/.test(alnum)) {
        isEmphasis = true;
        entrance = "tracking";
      }
    }
    return { index: i, raw: tok, clean, isEmphasis, entrance };
  });
}

// ---- measuring --------------------------------------------------------------

let _measureCtx: CanvasRenderingContext2D | null = null;
function measureCtx(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!_measureCtx) {
    const c = document.createElement("canvas");
    _measureCtx = c.getContext("2d");
  }
  return _measureCtx;
}

// ---- timeline ---------------------------------------------------------------

export function buildTimeline(
  words: WordNode[],
  cfg: KineticConfig,
  fps: number
): Timeline {
  const s = Math.max(0.25, cfg.speed);
  const enterDur = Math.max(2, Math.round((cfg.enterDuration * fps) / s));
  const holdDur = Math.max(2, Math.round((cfg.holdDuration * fps) / s));
  const exitDur = Math.max(2, Math.round((cfg.exitDuration * fps) / s));
  const repositionDur = Math.max(3, Math.round((fps * 0.3) / s));
  const enterTrackingDur = Math.max(2, Math.round((cfg.trackingEnterDuration * fps) / s));
  const exitTrackingDur = Math.max(2, Math.round((cfg.trackingExitDuration * fps) / s));
  const lifespan = enterDur + holdDur + exitDur;
  // Rolling window: stagger entrances so that exactly `maxVisible` words overlap. A word lives for
  // `lifespan` frames; spacing entrances `lifespan / maxVisible` apart means word i exits at the same
  // moment word i+maxVisible enters — giving a clean sliding 3-word window with no permanent pile-up.
  const maxVisible = Math.max(1, Math.min(6, Math.round(cfg.maxVisible)));
  const step = Math.max(enterDur, Math.round(lifespan / maxVisible));
  const n = words.length;
  const tEnter = words.map((_, i) => i * step);
  const buildEnd = n > 0 ? (n - 1) * step + enterDur : enterDur;
  const lastExitEnd = n > 0 ? tEnter[n - 1] + lifespan : lifespan;
  const resetPad = Math.max(2, Math.round((fps * 0.15) / s)); // brief clean gap before the loop restarts
  const loopCycle = Math.max(1, lastExitEnd + resetPad);
  return { step, enterDur, holdDur, exitDur, repositionDur, enterTrackingDur, exitTrackingDur, loopCycle, tEnter, buildEnd };
}

// ---- layout -----------------------------------------------------------------

/** Convert a tracking percentage (of font size) to pixels, so the spacing scales with type size. */
const trackingToPx = (pct: number, size: number) => (pct / 100) * size;

/** Centered, vertically-balanced stack of the supplied `indices` (the current active words). Auto-fits
 *  so the composition never leaves the frame (long sentences shrink uniformly; over-wide words clamp). */
export function layoutSlots(
  words: WordNode[],
  indices: number[],
  cfg: KineticConfig,
  width: number,
  height: number
): WordSlot[] {
  const resScale = width / 1080; // keep visual size consistent across resolutions
  const lineGap = 1.18 * cfg.wordSpacing;
  const mctx = measureCtx();
  const visN = indices.length;

  // Raw sizes (pre-fit) + raw total height, so we can compute a uniform fit scale.
  const rawSizes: number[] = [];
  let rawTotalH = 0;
  for (let k = 0; k < visN; k++) {
    const w = words[indices[k]];
    const scale = w.isEmphasis ? cfg.emphasisScale : 1;
    const size = cfg.baseSize * resScale * cfg.globalScale * scale;
    rawSizes.push(size);
    rawTotalH += size * lineGap;
  }
  const maxH = height * 0.92;
  const fit = rawTotalH > maxH ? maxH / rawTotalH : 1;

  const maxW = width * 0.92;
  const slots: WordSlot[] = [];
  let totalH = 0;
  for (let k = 0; k < visN; k++) {
    const w = words[indices[k]];
    const scale = w.isEmphasis ? cfg.emphasisScale : 1;
    // Clamp a single word that is wider than the frame by shrinking just that word.
    let size = rawSizes[k] * fit;
    let wWidth = size * w.clean.length * 0.55; // fallback if no canvas
    if (mctx) {
      const measure = (s: number) => {
        mctx.font = `${w.isEmphasis ? cfg.emphasisWeight : cfg.weight} ${s}px "${cfg.font}", sans-serif`;
        // Measure at the settled (final) tracking — entering/exit words differ only symmetrically around
        // center, so measuring at the steady value keeps the centered stack accurate.
        (mctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${trackingToPx(cfg.trackingFinal, s)}px`;
        return mctx.measureText(w.clean).width;
      };
      wWidth = measure(size);
      if (wWidth > maxW) {
        const wordFit = maxW / wWidth;
        size *= wordFit;
        wWidth = measure(size);
      }
    }
    slots.push({ x: cfg.compositionX * width, y: 0, scale, size, width: wWidth });
    totalH += size * lineGap;
  }

  let y = cfg.compositionY * height - totalH / 2;
  for (let k = 0; k < visN; k++) {
    const extent = slots[k].size * lineGap;
    y += extent / 2;
    slots[k].y = y;
    y += extent / 2;
  }
  return slots;
}

// ---- per-word state ---------------------------------------------------------

/** The set of word indices currently participating in layout at `frame`: every word that has
 *  entered but not yet been removed (each word is "removed" once `frame >= exitEnd`). Because
 *  `tEnter` and `exitEnd` are both monotonically increasing, this set is always contiguous
 *  `[firstActive, lastEntered]` — removed words never reserve space. */
function activeSetAt(frame: number, words: WordNode[], timeline: Timeline): number[] {
  const n = words.length;
  if (frame < 0) return [];
  let lastEntered = -1;
  for (let j = 0; j < n; j++) if (timeline.tEnter[j] <= frame) lastEntered = j;
  let firstActive = n;
  for (let j = 0; j < n; j++) {
    const exitEnd = timeline.tEnter[j] + timeline.enterDur + timeline.holdDur + timeline.exitDur;
    if (frame < exitEnd) {
      firstActive = j;
      break;
    }
  }
  if (firstActive > lastEntered) return [];
  const arr: number[] = [];
  for (let j = firstActive; j <= lastEntered; j++) arr.push(j);
  return arr;
}

/** Most recent enter/removal event at or before `frame` — the moment the active set last changed,
 *  which is when a reflow should begin. */
function mostRecentEvent(frame: number, words: WordNode[], timeline: Timeline): number {
  let cf = -Infinity;
  for (let j = 0; j < words.length; j++) {
    const exitEnd = timeline.tEnter[j] + timeline.enterDur + timeline.holdDur + timeline.exitDur;
    if (timeline.tEnter[j] <= frame && timeline.tEnter[j] > cf) cf = timeline.tEnter[j];
    if (exitEnd <= frame && exitEnd > cf) cf = exitEnd;
  }
  return cf;
}

const rangeIndices = (a: number, b: number): number[] => {
  const r: number[] = [];
  for (let k = a; k <= b; k++) r.push(k);
  return r;
};

/** Per-word lifecycle: ENTER → HOLD → EXIT → REMOVE.
 *  - not entered yet (`frame < tEnter[i]`) → null
 *  - removed (`frame >= exitEnd[i]`)       → null (excluded from layout & drawing)
 *  - otherwise returns its state for the current phase. */
export function computeWordState(
  word: WordNode,
  i: number,
  words: WordNode[],
  loopFrame: number,
  cfg: KineticConfig,
  width: number,
  height: number,
  timeline: Timeline
): WordState | null {
  const n = words.length;
  if (n === 0) return null;
  const tEnter = timeline.tEnter[i];
  const enterDur = timeline.enterDur;
  const holdDur = timeline.holdDur;
  const exitDur = timeline.exitDur;
  const lifespan = enterDur + holdDur + exitDur;
  const exitEnd = tEnter + lifespan;

  if (loopFrame < tEnter) return null; // not entered yet
  if (loopFrame >= exitEnd) return null; // removed — out of layout & drawing

  const local = loopFrame - tEnter;
  const pEnter = clamp01(local / enterDur);
  const eEnter = smootherstep(pEnter);

  // Current home (post-reflow) slot, from the live active set (removed words excluded).
  const activeNow = activeSetAt(loopFrame, words, timeline);
  const slotNowAll = layoutSlots(words, activeNow, cfg, width, height);
  const posNow = activeNow.indexOf(i);
  const slotNow = posNow >= 0 ? slotNowAll[posNow] : layoutSlots(words, [i], cfg, width, height)[0];

  const color = word.isEmphasis ? cfg.emphasisColor : cfg.primaryColor;

  let x = slotNow.x;
  let y = slotNow.y;
  let entScale = 1; // additional scale factor (entrance + exit)
  let opacity = 1;
  let visibleChars = word.clean.length;

  const inEntrance = local < enterDur;
  const inExit = local >= enterDur + holdDur;

  if (inEntrance) {
    // --- ENTER (existing entrance animations, unchanged) ---
    if (word.entrance === "tracking") {
      // Centered, subtle entrance: the word simply fades in and eases a hair larger while its
      // letter-spacing opens from compressed → normal (handled by the tracking block below). No
      // positional travel — tracking is the visible motion, so it reads as "settling into place".
      entScale = lerp(0.97, 1, eEnter);
      opacity = eEnter;
    } else if (word.entrance === "zoom") {
      const e = easeOutBack(pEnter, 0.3 * cfg.bounceStrength);
      entScale = lerp(0.8, 1, e);
      opacity = eEnter;
    } else if (word.entrance === "pop") {
      entScale = lerp(0.6, 1, eEnter);
      opacity = popOpacity(pEnter, cfg.popStrength);
    } else {
      // typewriter
      entScale = 1;
      opacity = clamp01(pEnter / 0.3);
      visibleChars = Math.max(0, Math.floor(pEnter * word.clean.length));
    }
  } else {
    // --- HOLD / EXIT: reflow on enter & removal, then animate out ---
    const changeFrame = mostRecentEvent(loopFrame, words, timeline);
    if (changeFrame > -Infinity && loopFrame > changeFrame) {
      const since = loopFrame - changeFrame;
      if (since < timeline.repositionDur) {
        const activeBefore = activeSetAt(changeFrame - 1, words, timeline);
        const pb = activeBefore.indexOf(i);
        if (pb >= 0) {
          const prev = layoutSlots(words, activeBefore, cfg, width, height)[pb];
          const e = easeOutCubic(since / timeline.repositionDur);
          x = lerp(prev.x, slotNow.x, e);
          y = lerp(prev.y, slotNow.y, e);
        }
      }
    }

    if (inExit) {
      // --- EXIT (subtle, centered, tracking-driven): no directional travel. The word stays in
      // place, eases a hair smaller, fades, and its letter-spacing spreads (normal → expanded,
      // handled by the tracking block below). The tracking spread is the visible "release" — the
      // text gently opens apart as it leaves, rather than sliding off in a direction. All driven
      // by ONE eased progress `ee` so every word releases identically ("same to same"). ---
      const ex = clamp01((local - enterDur - holdDur) / exitDur);
      const ee = easeInOutCubic(ex);
      entScale *= lerp(1, 0.94, ee); // subtle shrink, consistent across all words
      opacity = 1 - ee; // eased fade, synced with the motion + tracking spread
    }
  }

  // --- TRACKING (letter-spacing) animation, tied to the per-word lifecycle ---
  // Enter: compressed (negative %) → normal (trackingFinal). Exit: normal → expanded (positive %),
  // if `trackingExitEnabled`. Hold & reflow keep `trackingFinal` untouched — reflow never resets tracking.
  let trackingPct = cfg.trackingFinal;
  if (cfg.trackingEnabled) {
    const emph = cfg.trackingEmphasis && word.isEmphasis;
    const tEnterStart = emph ? -10 : cfg.trackingEnter;
    const tExitEnd = emph ? 14 : cfg.trackingExit;
    if (inEntrance) {
      const te = clamp01(local / timeline.enterTrackingDur);
      const tease =
        cfg.trackingEasing === "ease-in-out"
          ? easeInOutCubic
          : cfg.trackingEasing === "smooth"
          ? smootherstep
          : easeOutCubic;
      trackingPct = lerp(tEnterStart, cfg.trackingFinal, tease(te));
    } else if (inExit) {
      if (cfg.trackingExitEnabled) {
        const ee2 = clamp01((local - enterDur - holdDur) / timeline.exitTrackingDur);
        trackingPct = lerp(cfg.trackingFinal, tExitEnd, easeInOutCubic(ee2));
      } else {
        trackingPct = cfg.trackingFinal;
      }
    } else {
      trackingPct = cfg.trackingFinal;
    }
  }

  return {
    visible: opacity > 0.001,
    x,
    y,
    scale: slotNow.scale * entScale,
    size: slotNow.size * entScale,
    width: slotNow.width,
    tracking: trackingPct,
    opacity,
    color,
    visibleChars,
    isEmphasis: word.isEmphasis,
    hasArrow: word.isEmphasis,
  };
}

/** Velocity-scaled motion blur (crisp at rest, smeared while moving). */
export function motionBlurFor(
  a: { x: number; y: number },
  b: { x: number; y: number },
  cfg: KineticConfig,
  sizeRef: number
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const v = Math.sqrt(dx * dx + dy * dy);
  return Math.min(sizeRef * 0.08, v * (0.4 + cfg.blurAmount));
}
