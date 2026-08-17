"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "../hooks/useProject";
import {
  parseWords,
  defaultKineticConfig,
  buildTimeline,
  computeWordState,
  motionBlurFor,
  raisedCosineBump,
  easeOutCubic,
  clamp01,
  type KineticConfig,
  type WordNode,
} from "./kinetic/kineticEngine";

type PreviewCanvasProps = {
  project: Project;
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Render the "Hook" style as a full viral hook-title graphic:
 *  - dark charcoal background with a subtle technical grid
 *  - oversized heavy-italic electric-blue gradient headline + soft blue glow + soft bottom shadow
 *  - smaller bright-white glowing subtext
 *  - cinematic shine sweep + a rotated diagonal light-square mask
 * Everything is composited on an offscreen canvas so highlights only land on the type.
 */
function drawHookComposition(
  ctx: CanvasRenderingContext2D,
  project: Project,
  width: number,
  height: number,
  frame: number,
  fps: number,
  animate: boolean,
  speed: number
) {
  // Dark charcoal background with a subtle technical grid.
  ctx.fillStyle = "#0b0b0f";
  ctx.fillRect(0, 0, width, height);
  drawTechGrid(ctx, width, height);

  const { headline, sub } = parseHookText(project);
  if (!headline) return;

  const off = document.createElement("canvas");
  off.width = width;
  off.height = height;
  const o = off.getContext("2d");
  if (!o) return;
  o.textAlign = "center";
  o.textBaseline = "middle";

  const sizeScale = project.size ?? 1;
  const headlineSize = Math.round(height * 0.13 * sizeScale);
  const subSize = Math.round(height * 0.05 * sizeScale);
  const cx = width / 2;
  const headlineY = height * 0.46;
  const subY = headlineY + headlineSize * 0.66;
  const revealCycle = Math.round((fps * 3) / speed);
  const cyc = animate ? frame % revealCycle : -1;
  const paused = !animate;
  const revealOn = project.animation === "Reveal";
  const bounceOn = project.animation === "Bounce";
  const fadeOn = project.animation === "Fade";

  // --- Headline: heavy italic, electric-blue four-color gradient + blue glow + soft bottom shadow ---
  o.save();
  o.font = `italic 900 ${headlineSize}px "Anton", "Arial Black", sans-serif`;
  (o as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${-Math.round(headlineSize * 0.02)}px`;

  if (revealOn) {
    // Character-by-character REVEAL (tracking-spread): each glyph starts overlapped at
    // the center and spreads to its final spacing while fading in, with the blue gradient + glow.
    const grad = blueHookGradient(o, headline, cx);
    const letterSpacing = o as CanvasRenderingContext2D & { letterSpacing: string };
    letterSpacing.letterSpacing = "0px"; // characters are positioned manually
    drawCharReveal(
      o,
      headline,
      cx,
      headlineY,
      headlineSize,
      900,
      "Anton",
      true,
      "center",
      cyc,
      revealCycle,
      paused,
      speed,
      (ch, gx, gy, ga, gb) => {
        o.save();
        o.globalAlpha = ga;
        if (gb > 0.1) o.filter = `blur(${gb}px)`;
        o.shadowColor = "rgba(37, 99, 235, 0.95)";
        o.shadowBlur = headlineSize * 0.28;
        o.fillStyle = grad;
        o.fillText(ch, gx, gy);
        o.restore();
      }
    );
  } else if (bounceOn) {
    // Character-by-character scale-up BOUNCE: rise from below (scale 0 -> 100% + fade in),
    // then a quick overshoot pops each glyph up and to ~150% scale before settling to 100%.
    const grad = blueHookGradient(o, headline, cx);
    (o as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
    drawCharBounce(
      o,
      headline,
      cx,
      headlineY,
      headlineSize,
      900,
      "Anton",
      true,
      "center",
      cyc,
      revealCycle,
      paused,
      speed,
      (ch, gx, gy, ga, gb) => {
        o.save();
        o.globalAlpha = ga;
        if (gb > 0.1) o.filter = `blur(${gb}px)`;
        o.shadowColor = "rgba(37, 99, 235, 0.95)";
        o.shadowBlur = headlineSize * 0.28;
        o.fillStyle = grad;
        o.fillText(ch, gx, gy);
        o.restore();
      }
    );
  } else if (fadeOn) {
    // Character-by-character FADE: each glyph fades in (opacity 0 -> 1) left-to-right in
    // the text color, the whole headline scales subtly 90% -> 100%, then a reverse sweep
    // fades the characters back out. Loop cycle auto-scales to the text length so the
    // cascade stays smooth for any headline. Keeps the Hook blue gradient + glow identity.
    const fcycle = autoFadeCycle(headline, speed);
    const fcyc = animate ? frame % fcycle : -1;
    const grad = blueHookGradient(o, headline, cx);
    (o as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
    drawCharFade(
      o,
      headline,
      cx,
      headlineY,
      headlineSize,
      900,
      "Anton",
      true,
      "center",
      fcyc,
      fcycle,
      paused,
      speed,
      (ch, gx, gy, ga, gb, color) => {
        o.save();
        o.globalAlpha = ga;
        o.shadowColor = "rgba(37, 99, 235, 0.95)";
        o.shadowBlur = headlineSize * 0.28;
        o.fillStyle = grad;
        o.fillText(ch, gx, gy);
        o.restore();
      }
    );
  } else {
    const grad = blueHookGradient(o, headline, cx);

    // Pass 1: luminous blue outer glow.
    o.shadowColor = "rgba(37, 99, 235, 0.95)";
    o.shadowBlur = headlineSize * 0.28;
    o.shadowOffsetX = 0;
    o.shadowOffsetY = 0;
    o.fillStyle = grad;
    o.fillText(headline, cx, headlineY);

    // Pass 2: soft drop shadow (~50% opacity, very high softness, bottom) — redraw glyphs.
    o.shadowColor = "rgba(0, 0, 0, 0.5)";
    o.shadowBlur = headlineSize * 0.95;
    o.shadowOffsetX = 0;
    o.shadowOffsetY = headlineSize * 0.12;
    o.fillStyle = grad;
    o.fillText(headline, cx, headlineY);
  }
  (o as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
  o.restore();

  // --- Secondary text: bright white with a subtle glow ---
  if (sub) {
    o.save();
    o.font = `italic 700 ${subSize}px "Inter", sans-serif`;
    o.shadowColor = "rgba(255, 255, 255, 0.55)";
    o.shadowBlur = subSize * 0.35;
    o.shadowOffsetY = 0;
    o.fillStyle = "#ffffff";
    o.fillText(sub, cx, subY);
    o.restore();
  }

  // --- Cinematic shine sweep + rotated diagonal light-square mask (glyphs only) ---
  const cycle = fps * 2.2;
  const p = (frame % cycle) / cycle;
  o.save();
  o.globalCompositeOperation = "source-atop";

  // Horizontal shine band.
  const band = width * 0.28;
  const sweepX = -band + (width + 2 * band) * p;
  const shine = o.createLinearGradient(sweepX - band, 0, sweepX + band, 0);
  shine.addColorStop(0, "rgba(255,255,255,0)");
  shine.addColorStop(0.5, "rgba(255,255,255,0.6)");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  o.fillStyle = shine;
  o.fillRect(0, 0, width, height);

  // Diagonal square gradient/mask element sweeping across.
  const sq = width * 0.55;
  const sqX = -sq + (width + 2 * sq) * p;
  const sqY = height * (0.25 + 0.5 * p);
  o.translate(sqX, sqY);
  o.rotate(Math.PI / 4);
  const dGrad = o.createLinearGradient(-sq / 2, 0, sq / 2, 0);
  dGrad.addColorStop(0, "rgba(150, 190, 255, 0)");
  dGrad.addColorStop(0.5, "rgba(200, 220, 255, 0.45)");
  dGrad.addColorStop(1, "rgba(150, 190, 255, 0)");
  o.fillStyle = dGrad;
  o.fillRect(-sq / 2, -sq / 2, sq, sq);
  o.restore();

  ctx.drawImage(off, 0, 0);
}

/** Punchy POP opacity envelope for the Caption entrance: 0 → partial → lower → higher → 1. */
function captionPopOpacity(t: number): number {
  const keys: [number, number][] = [
    [0, 0], [0.3, 0.45], [0.5, 0.2], [0.75, 0.75], [1, 1],
  ];
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t >= t0 && t <= t1) {
      const f = (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * f;
    }
  }
  return 1;
}

/**
 * Render the "Caption" style: a premium viral short-form caption (DaVinci-style preset).
 *  - bold, tight-tracked typography with a SUBTLE white→tinted vertical gradient
 *  - RISE entrance (clean): the whole text starts below at ~0 opacity and eases up with a
 *    smootherstep (no flicker, NO big bounce). POP is a separate preset — see the Pop
 *    animation — but when `project.animation === "Pop"` the flicker layers onto this rise.
 *  - restrained soft glow + subtle dark drop shadow (text lifted off the background)
 *  - diagonal light-sweep shimmer (source-atop, lands only on the glyphs) with a faint
 *    edge core for a polished reflection
 * Loop is clean: rise → hold → quick seam fade; `paused` renders the settled final frame.
 * The gradient bottom color is a slight tint of `project.textColor`, so the color picker
 * re-themes it (purple/blue/pink/green variants come "for free").
 */
/**
 * Render the "Caption" STYLE. Caption is a *look* (bold Inter-Black, subtle white→tinted
 * gradient, soft glow, drop shadow, diagonal shine) — NOT a fixed template. The motion is
 * driven by `project.animation`, so the user picks Caption as the style and then chooses any
 * animation (Fade / Reveal / Bounce / Pop / …) to drive it. Every animation inherits the
 * Caption look; the character draws are rendered to an offscreen canvas and the diagonal
 * shine is composited on top (source-atop → lands only on the glyphs).
 */
function drawCaptionComposition(
  ctx: CanvasRenderingContext2D,
  project: Project,
  width: number,
  height: number,
  frame: number,
  fps: number,
  animate: boolean,
  speed: number
) {
  // Background (standard, consistent with the other styles).
  if (project.background.type === "solid") {
    ctx.fillStyle = project.background.value;
  } else {
    ctx.fillStyle = "#000000";
  }
  ctx.fillRect(0, 0, width, height);

  const { headline } = parseHookText(project);
  const text = headline || project.text || "";
  if (!text) {
    ctx.font = `400 24px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#444444";
    ctx.fillText("Enter text to preview", width / 2, height / 2);
    return;
  }

  // Offscreen canvas: text is drawn here (transparent bg) so the diagonal shine can be
  // composited with source-atop and land ONLY on the glyphs.
  const off = document.createElement("canvas");
  off.width = width;
  off.height = height;
  const o = off.getContext("2d");
  if (!o) return;
  o.textAlign = "center";
  o.textBaseline = "middle";

  const sizeScale = project.size ?? 1;
  const fontSize = Math.round((project.format === "portrait" ? 64 : 56) * sizeScale);
  const cx = width / 2;
  const cy = height / 2;
  const font = project.font || "Inter";
  const weight = 900; // Inter Black / bold caption look
  const anim = project.animation || "Fade";
  const paused = !animate;

  // Subtle white→tinted vertical gradient (the tutorial's "very, very slight" gradient).
  const captionGrad = o.createLinearGradient(0, cy - fontSize * 0.7, 0, cy + fontSize * 0.7);
  captionGrad.addColorStop(0, "#ffffff");
  captionGrad.addColorStop(1, lerpHex("#ffffff", project.textColor || "#ffffff", 0.4));

  // Caption-flavored glyph: subtle glow + drop shadow + gradient fill. Ignores the neon
  // `color` argument so the Caption look stays consistent across all animations.
  const captionGlyph = (
    ch: string,
    x: number,
    y: number,
    alpha: number,
    blur: number
  ) => {
    o.save();
    o.globalAlpha = alpha;
    if (blur > 0.1) o.filter = `blur(${blur}px)`;
    // Pass 1: restrained soft glow.
    o.shadowColor = project.textColor || "#ffffff";
    o.shadowBlur = fontSize * 0.18;
    o.shadowOffsetX = 0;
    o.shadowOffsetY = 0;
    o.fillStyle = captionGrad;
    o.fillText(ch, x, y);
    // Pass 2: subtle dark drop shadow (lifted from the background).
    o.shadowColor = "rgba(0, 0, 0, 0.55)";
    o.shadowBlur = fontSize * 0.14;
    o.shadowOffsetX = 0;
    o.shadowOffsetY = fontSize * 0.05;
    o.fillStyle = captionGrad;
    o.fillText(ch, x, y);
    o.restore();
  };

  // Diagonal light-sweep shimmer (source-atop → lands only on the glyphs) + faint edge core.
  // Plays once per loop during the first part of the animation.
  const drawShine = (loopFrame: number, loopCycle: number) => {
    if (paused) return;
    const tNorm = loopCycle > 0 ? (loopFrame % loopCycle) / loopCycle : 0;
    const sweepT = (tNorm - 0.06) / 0.5; // runs during [0.06, 0.56] of the loop
    if (sweepT < 0 || sweepT > 1) return;
    o.save();
    o.globalCompositeOperation = "source-atop";
    o.translate(cx, cy);
    o.rotate(-Math.PI / 7);
    const bandW = width * 0.16;
    const sx = -bandW + (width + 2 * bandW) * sweepT;
    const shine = o.createLinearGradient(sx - bandW, 0, sx + bandW, 0);
    shine.addColorStop(0, "rgba(255,255,255,0)");
    shine.addColorStop(0.5, "rgba(255,255,255,0.85)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    o.fillStyle = shine;
    o.fillRect(sx - bandW, -height, 2 * bandW, height * 2);
    // Faint edge core for a polished reflection (extremely subtle).
    const core = o.createLinearGradient(sx - bandW * 0.28, 0, sx + bandW * 0.28, 0);
    core.addColorStop(0, "rgba(255,255,255,0)");
    core.addColorStop(0.5, "rgba(255,255,255,0.5)");
    core.addColorStop(1, "rgba(255,255,255,0)");
    o.fillStyle = core;
    o.fillRect(sx - bandW * 0.28, -height, 2 * bandW * 0.56, height * 2);
    o.restore();
  };

  if (anim === "Reveal") {
    const cycle = Math.max(30, Math.round((fps * 3) / speed));
    const cyc = animate ? frame % cycle : -1;
    drawCharReveal(o, text, cx, cy, fontSize, weight, font, false, "center", cyc, cycle, paused, speed, captionGlyph);
  } else if (anim === "Bounce") {
    const cycle = Math.max(30, Math.round((fps * 3) / speed));
    const cyc = animate ? frame % cycle : -1;
    drawCharBounce(o, text, cx, cy, fontSize, weight, font, false, "center", cyc, cycle, paused, speed, captionGlyph);
  } else if (anim === "Pop") {
    // POP: whole-text rise with a punchy opacity flicker over the first part of the loop,
    // then held. Distinct from RISE — the tutorial keeps them as separate presets.
    const capCycle = Math.max(30, Math.round((fps * 3.2) / speed));
    const cyc = animate ? frame % capCycle : 0;
    const t = paused ? 1.3 : cyc / capCycle; // 1.3 = settled, past everything
    const smooth = (u: number) => {
      const c = Math.min(1, Math.max(0, u));
      return c * c * c * (c * (c * 6 - 15) + 10);
    };
    const riseEnd = 0.18;
    const riseProg = Math.min(1, Math.max(0, t / riseEnd));
    const e = smooth(riseProg);
    const offsetDown = fontSize * 0.7;
    const yOff = paused ? 0 : offsetDown * (1 - e);
    let op = paused ? 1 : captionPopOpacity(riseProg);
    if (!paused && t > 0.85) op *= Math.max(0, (1 - t) / 0.15);
    o.save();
    o.font = `${weight} ${fontSize}px "${font}", sans-serif`;
    o.globalAlpha = op;
    o.shadowColor = project.textColor || "#ffffff";
    o.shadowBlur = fontSize * 0.18;
    o.shadowOffsetX = 0;
    o.shadowOffsetY = 0;
    o.fillStyle = captionGrad;
    o.fillText(text, cx, cy + yOff);
    o.shadowColor = "rgba(0, 0, 0, 0.55)";
    o.shadowBlur = fontSize * 0.14;
    o.shadowOffsetY = fontSize * 0.05;
    o.fillStyle = captionGrad;
    o.fillText(text, cx, cy + yOff);
    o.restore();
    drawShine(cyc, capCycle);
  } else {
    // Fade (default) — now includes a gentle rise as each glyph fades in.
    const cycle = autoFadeCycle(text, speed);
    const cyc = animate ? frame % cycle : -1;
    drawCharFade(o, text, cx, cy, fontSize, weight, font, false, "center", cyc, cycle, paused, speed, captionGlyph);
    drawShine(cyc, cycle);
  }

  ctx.drawImage(off, 0, 0);
}

/**
 * Render the "Kinetic" STYLE: a sentence is parsed into independently-animated words that
 * enter sequentially, reflow to make room for each other, and emphasize key words (larger +
 * accent color). Motion logic lives in `kineticEngine`; this function only draws. See SKILL.md.
 */
function drawKinetic(
  ctx: CanvasRenderingContext2D,
  project: Project,
  width: number,
  height: number,
  frame: number,
  fps: number,
  isPlaying: boolean,
  speed: number
) {
  // Background (standard, consistent with the other styles).
  if (project.background.type === "solid") {
    ctx.fillStyle = project.background.value;
  } else {
    ctx.fillStyle = "#000000";
  }
  ctx.fillRect(0, 0, width, height);

  const cfg: KineticConfig = {
    ...defaultKineticConfig,
    ...(project.kinetic || {}),
    primaryColor: project.kinetic?.primaryColor || project.textColor || "#FFFFFF",
  };

  const text = (project.text && project.text.trim()) || project.segments[0]?.text || "";
  if (!text) {
    ctx.font = `400 24px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#444444";
    ctx.fillText("Enter text to preview", width / 2, height / 2);
    return;
  }

  const words = parseWords(text);
  if (words.length === 0) return;
  const timeline = buildTimeline(words, cfg, fps);
  const n = words.length;

  // When paused, freeze on a settled mid-hold frame (a word holding in the balanced stack) so the
  // composition reads and nothing is mid-exit.
  const settleIdx = n > 0 ? Math.min(n - 1, Math.max(0, Math.floor(n / 2))) : 0;
  const settled =
    n > 0
      ? Math.min(timeline.loopCycle - 1, timeline.tEnter[settleIdx] + timeline.enterDur + Math.round(timeline.holdDur * 0.5))
      : 0;
  const loopFrame = isPlaying
    ? ((frame % timeline.loopCycle) + timeline.loopCycle) % timeline.loopCycle
    : settled;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";

  // Secondary "scene" motion (mirrors the tutorial's parent null): a subtle global scale + lift
  // that eases in each time a word enters, then settles — gives the whole composition life.
  // Applied uniformly to every word, so it never breaks per-word "same to same" consistency.
  let lastEnter = -Infinity;
  for (let j = 0; j < n; j++) {
    if (timeline.tEnter[j] <= loopFrame && timeline.tEnter[j] > lastEnter) lastEnter = timeline.tEnter[j];
  }
  const sinceEnter = loopFrame - lastEnter;
  const sEase = 1 - easeOutCubic(clamp01(sinceEnter / Math.max(1, timeline.enterDur)));
  const sceneScale = 1 + 0.02 * sEase; // +2% breath right after an entrance, settling back to 1
  const sceneLift = -height * 0.008 * sEase; // tiny upward drift, settling to 0
  const cx = width / 2;
  const cy = height / 2;
  const sx = (x: number) => cx + (x - cx) * sceneScale;
  const sy = (y: number) => cy + (y - cy) * sceneScale + sceneLift;

  const setFont = (w: WordNode, size: number, trackingPx = 0) => {
    ctx.font = `${w.isEmphasis ? cfg.emphasisWeight : cfg.weight} ${size}px "${cfg.font}", sans-serif`;
    // Tracking / letter-spacing animation (per-word, tied to the lifecycle): px = (% of font size) * size.
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${trackingPx}px`;
  };

  // Pass 1: words.
  words.forEach((w, i) => {
    const st = computeWordState(w, i, words, loopFrame, cfg, width, height, timeline);
    if (!st || !st.visible) return;
    const stPrev = computeWordState(w, i, words, loopFrame - 1, cfg, width, height, timeline);
    const blur = stPrev ? motionBlurFor(st, stPrev, cfg, st.size) : 0;

    ctx.save();
    ctx.globalAlpha = st.opacity;
    if (blur > 0.1) ctx.filter = `blur(${blur}px)`;
    setFont(w, st.size, (st.tracking / 100) * st.size);
    ctx.fillStyle = st.color;
    ctx.fillText(w.clean.slice(0, st.visibleChars), sx(st.x), sy(st.y));
    ctx.restore();
  });

  // Pass 2: boing arrows for emphasis words (enter slightly after the word, small bounce).
  words.forEach((w, i) => {
    if (!w.isEmphasis) return;
    const tEnter = timeline.tEnter[i];
    const since = loopFrame - (tEnter + timeline.enterDur * 0.6);
    if (since < 0) return;
    const ap = since / (timeline.enterDur * 0.6 + 1);
    const bump = raisedCosineBump(ap);
    if (bump <= 0.01) return;
    const st = computeWordState(w, i, words, loopFrame, cfg, width, height, timeline);
    if (!st || !st.visible) return;
    const arrowSize = st.size * 0.42;
    const ax = sx(st.x + st.width / 2 + arrowSize * 0.6);
    const ay = sy(st.y - st.size * 0.5 - arrowSize * (1 - bump) * 0.3);
    ctx.save();
    ctx.globalAlpha = bump * st.opacity;
    setFont(w, arrowSize, 0);
    ctx.fillStyle = st.color;
    ctx.fillText("↗", ax, ay);
    ctx.restore();
  });
}

/** Faint technical grid overlay for the Hook background. */
function drawTechGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const step = Math.max(36, Math.round(width / 26));
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.045)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += step) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
  }
  for (let y = 0; y <= height; y += step) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
  }
  ctx.stroke();
  ctx.restore();
}

/** Pick the big headline (line 1) and the smaller supporting phrase (remaining lines). */
function parseHookText(project: Project): { headline: string; sub: string } {
  if (project.segments && project.segments.length > 0) {
    return {
      headline: project.segments[0].text,
      sub: project.segments.slice(1).map((s) => s.text).join("   "),
    };
  }
  const raw = project.text || "";
  if (raw.includes("\n")) {
    const lines = raw.split("\n");
    return { headline: lines[0], sub: lines.slice(1).join("   ") };
  }
  return { headline: raw, sub: "" };
}

/** Electric-blue four-color gradient across the measured text width. */
function blueHookGradient(o: CanvasRenderingContext2D, text: string, centerX: number) {
  const tw = o.measureText(text).width;
  const grad = o.createLinearGradient(centerX - tw / 2, 0, centerX + tw / 2, 0);
  grad.addColorStop(0, "#1e3a8a"); // deep blue
  grad.addColorStop(0.4, "#2563eb"); // bright royal blue
  grad.addColorStop(0.7, "#3b82f6"); // blue
  grad.addColorStop(1, "#bfdbfe"); // light blue highlight
  return grad;
}

/**
 * Character-by-character REVEAL (After Effects Range Selector / tracking-animator style):
 *  - each glyph starts tightly overlapped at the text center (tracking ≈ -100) at opacity 0,
 *    then smoothly spreads out to its final spacing while fading in, left-to-right over ~1s.
 *  - This is a TRACKING-SPREAD reveal: no vertical motion, no bounce/overshoot. The letters
 *    emerge from the center and settle into perfectly spaced final positions.
 *  - Easy-Ease (smootherstep) gives the strong S-curve accel-then-decel; a velocity-scaled
 *    blur fakes motion blur while a glyph is moving and is crisp once it settles.
 * `cyc` is the frame within the loop, `paused` renders the settled final state. The
 * `drawGlyph` callback lets the Hook style supply its gradient + glow fill.
 */
function drawCharReveal(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  size: number,
  weight: number,
  font: string,
  italic: boolean,
  align: "left" | "center" | "right",
  cyc: number,
  revealCycle: number,
  paused: boolean,
  speed: number,
  drawGlyph: (ch: string, x: number, y: number, alpha: number, blur: number) => void
) {
  const chars = Array.from(text); // grapheme-safe, character-by-character (never word)
  if (chars.length === 0) return;

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `${italic ? "italic " : ""}${weight} ${size}px "${font}", sans-serif`;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px"; // characters positioned manually

  const widths = chars.map((c) => (c === " " ? ctx.measureText(" ").width : ctx.measureText(c).width));
  const totalW = widths.reduce((a, b) => a + b, 0);
  const n = chars.length;

  // Final (settled) x position of each glyph.
  const startX = align === "left" ? cx : align === "right" ? cx - totalW : cx - totalW / 2;
  const finalX: number[] = [];
  for (let i = 0; i < n; i++) {
    finalX.push(i === 0 ? startX : finalX[i - 1] + widths[i - 1]);
  }
  // Compressed target: all glyphs pulled to the center of the text block (tracking -100),
  // so unrevealed letters overlap in one spot before spreading out to their final spacing.
  const clusterX = startX + totalW / 2;

  const ramp = Math.max(4, Math.round(n * 0.25)); // Ramp Up band → smooth cascade
  const revealDur = Math.max(12, Math.round(30 / speed)); // ~1s at 1x (matches the spec)

  // Short envelope fade at the loop seam so the restart is clean (no hard jump).
  let envelope = 1;
  if (!paused) {
    const cp = cyc / revealCycle;
    envelope = cp > 0.82 ? Math.max(0, 1 - (cp - 0.82) / 0.18) : cp < 0.04 ? cp / 0.04 : 1;
  }

  // Smootherstep (Perlin): zero velocity AND acceleration at both ends → the strong,
  // natural S-curve (fast mid, soft settle). Same easing bar as Bounce/Fade for "same to same".
  const smooth = (t: number) => {
    const c = Math.min(1, Math.max(0, t));
    return c * c * c * (c * (c * 6 - 15) + 10);
  };
  const gProg = paused ? 1 : smooth(Math.min(1, cyc / revealDur));
  const front = gProg * (n - 1 + ramp); // no overshoot span — reveal only

  chars.forEach((ch, i) => {
    const pp = Math.min(1, Math.max(0, (front - i) / ramp)); // per-character progress 0→1
    const eased = smooth(pp); // ramp softening (AE Ease High/Low)
    const alpha = paused ? 1 : eased;
    if (alpha <= 0.001) return; // still hidden at the center — skip drawing

    // Spread from the compressed center position out to the final x (tracking expansion).
    const x = clusterX + (finalX[i] - clusterX) * eased;

    // Horizontal velocity (finite difference) → velocity-scaled motion blur: crisp when
    // settled, soft only while a glyph is actively spreading.
    const e2 = smooth(Math.min(1, Math.max(0, pp + 0.02)));
    const e1 = smooth(Math.min(1, Math.max(0, pp - 0.02)));
    const vel = Math.abs((finalX[i] - clusterX) * (e2 - e1)) / 0.04;
    const blur = paused ? 0 : Math.min(size * 0.06, vel * 0.04);

    drawGlyph(ch, x, cy, alpha * envelope, blur);
  });
  ctx.restore();
}

/**
 * Character-by-character scale-up BOUNCE (After Effects, two animators, no expressions):
 *  - Animator 1: each glyph starts ~size*0.8 below its final spot, scale 0%, opacity 0,
 *    and eases up to its final place (scale 100%, opacity 100) — left-to-right over ~1s.
 *  - Animator 2 (~10f later): a quick overshoot that pops the glyph UP (~size*0.5) and
 *    scales it to ~150%, then settles back to 100%. Per-character cascade + Motion Blur.
 * `cyc` is the frame within the loop; `paused` renders the settled final state.
 */
function drawCharBounce(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  size: number,
  weight: number,
  font: string,
  italic: boolean,
  align: "left" | "center" | "right",
  cyc: number,
  cycle: number,
  paused: boolean,
  speed: number,
  drawGlyph: (ch: string, x: number, y: number, alpha: number, blur: number) => void
) {
  const chars = Array.from(text); // grapheme-safe
  if (chars.length === 0) return;

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `${italic ? "italic " : ""}${weight} ${size}px "${font}", sans-serif`;

  const widths = chars.map((c) => (c === " " ? ctx.measureText(" ").width : ctx.measureText(c).width));
  const totalW = widths.reduce((a, b) => a + b, 0);
  const n = chars.length;

  const startX = align === "left" ? cx : align === "right" ? cx - totalW : cx - totalW / 2;
  const offsetDown = size * 0.8; // Animator 1 Position Y (+200px, scaled to font size)
  const offsetUp = size * 0.5; // Animator 2 Position Y (-100px-ish, the upward overshoot)
  const ramp = Math.max(5, Math.round(n * 0.2)); // tighter cascade → clean sequential rhythm
  const bounceSpan = 1.4; // longer overshoot → gentler, more controlled settle
  // Front must travel far enough that the LAST character also completes its full
  // entrance AND bounce — otherwise only the leading chars overshoot (looks like Reveal).
  const frontMax = n - 1 + ramp * (1 + bounceSpan);
  const sweepDur = Math.max(18, Math.round(40 / speed)); // ~1.3s sweep at 1x — smooth & readable

  let envelope = 1;
  if (!paused) {
    const cp = cyc / cycle;
    envelope = cp > 0.9 ? Math.max(0, 1 - (cp - 0.9) / 0.1) : cp < 0.03 ? cp / 0.03 : 1;
  }

  // Smootherstep (Perlin): zero velocity AND acceleration at both ends → no perceptible
  // jerk at all, the buttery premium feel for both the cascade and each glyph.
  const smooth = (t: number) => {
    const c = Math.min(1, Math.max(0, t));
    return c * c * c * (c * (c * 6 - 15) + 10);
  };
  // When paused, jump past the whole animation so every glyph is settled at final.
  const front = paused ? frontMax * 2 : smooth(Math.min(1, cyc / sweepDur)) * frontMax;

  let x = startX;
  chars.forEach((ch, i) => {
    const pp = (front - i) / ramp; // per-character progress: 0 = start, 1 = entrance done
    const ent = smooth(Math.min(1, Math.max(0, pp)));
    const bump = pp > 1 && pp < 1 + bounceSpan ? Math.sin((Math.PI * (pp - 1)) / bounceSpan) : 0;

    const opacity = paused ? 1 : Math.min(1, Math.max(0, pp * 1.6)) * envelope;
    if (opacity <= 0.001) {
      x += widths[i];
      return;
    }

    const yOff = offsetDown * (1 - ent) - offsetUp * bump; // down during entrance, up on overshoot
    const scale = ent * (1 + 0.5 * bump); // 0 -> 1, overshoot to ~1.5, settle back to 1
    const y = cy + yOff;

    // Scale the glyph around its own center for the bounce (crisp — no blur smear).
    const cxG = x + widths[i] / 2;
    ctx.save();
    ctx.translate(cxG, y);
    ctx.scale(scale, scale);
    ctx.translate(-cxG, -y);
    drawGlyph(ch, x, y, opacity, 0);
    ctx.restore();

    x += widths[i];
  });
  ctx.restore();
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Linear interpolate between two hex colors → "rgb(r, g, b)". */
function lerpHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

/** Neon palette (purple → blue → cyan → pink) sampled by t in [0,1]. */
function neonColorAt(t: number): string {
  const stops = ["#a855f7", "#3b82f6", "#22d3ee", "#ec4899"];
  const clamped = Math.min(0.999999, Math.max(0, t)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(clamped));
  return lerpHex(stops[i], stops[i + 1], clamped - i);
}

/**
 * Auto-length loop cycle for the Fade animation. The total loop time scales with the
 * number of characters so each glyph gets a CONSTANT reveal window — short and long text
 * both cascade with the same smooth cadence (the "same to same" rule). Without this, a
 * fixed cycle makes long text rush and short text drag, which reads as jerky.
 */
function autoFadeCycle(text: string, speed: number): number {
  const n = Math.max(1, Array.from(text).length);
  const ramp = Math.max(5, Math.round(n * 0.2));
  const perChar = Math.max(2, Math.round(5 / speed)); // frames per character of cascade
  const sweep = (n - 1 + ramp) * perChar; // frames to fully sweep the range selector
  // Base sweep(1.0) + hold(0.5) + reverse fade-out(1.0) + tail(0.15) = 2.65x sweep.
  const cycle = Math.round(sweep * 2.65);
  return Math.min(cycle, 480); // cap ~16s @30fps so very long text stays manageable
}

/**
 * Character-by-character FADE (After Effects Range Selector style):
 *  - each glyph fades in (opacity 0 -> 1, Ramp Up, Ease High 100% ≈ smoothstep) left-to-right
 *  - a neon color (purple/blue/cyan/pink) travels across the characters as they appear
 *  - each glyph RISES gently from below as it fades in (no overshoot), plus the whole
 *    headline scales subtly 90% -> 100% (easy-ease, no bounce)
 *  - a second sweep fades the characters back out (sequential, reverse-style / Subtract feel)
 *  - two-layer glow (wide atmospheric + tight core) via shadowBlur passes
 * `cyc` is the frame within the loop; `paused` renders the fully settled (visible) state.
 * The `drawGlyph` callback supplies the fill color + glow (neon for generic, blue for Hook).
 */
function drawCharFade(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  size: number,
  weight: number,
  font: string,
  italic: boolean,
  align: "left" | "center" | "right",
  cyc: number,
  cycle: number,
  paused: boolean,
  speed: number,
  drawGlyph: (ch: string, x: number, y: number, alpha: number, blur: number, color?: string) => void
) {
  const chars = Array.from(text); // grapheme-safe, character-by-character (never word)
  if (chars.length === 0) return;

  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px"; // manually positioned

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `${italic ? "italic " : ""}${weight} ${size}px "${font}", sans-serif`;

  const widths = chars.map((c) => (c === " " ? ctx.measureText(" ").width : ctx.measureText(c).width));
  const totalW = widths.reduce((a, b) => a + b, 0);
  const n = chars.length;

  const startX = align === "left" ? cx : align === "right" ? cx - totalW : cx - totalW / 2;
  const ramp = Math.max(5, Math.round(n * 0.2)); // Ramp Up band → smooth cascade
  // frontMax must reach the last character's full fade-in (no overshoot needed for fade).
  const frontMax = n - 1 + ramp;
  const offsetDown = size * 0.8; // RISE: each glyph eases up from below as it fades in

  // Phase timeline as ratios of the loop cycle. The cycle is auto-scaled to text length
  // (see autoFadeCycle), so these fixed ratios give every character a constant reveal
  // window — the cascade reads identically smooth for short and long text ("same to same").
  // Decomposes the cycle as: fade-in(1.0) + hold(0.5) + reverse fade-out(1.0) + tail(0.15).
  const fadeInEnd = cycle * 0.377;
  const holdEnd = cycle * 0.566;
  const fadeOutEnd = cycle * 0.943;
  const scaleDur = cycle * 0.34; // subtle scale-up completes early, then holds

  // Smootherstep (Perlin): zero velocity AND acceleration at both ends → no perceptible
  // jerk. Same quality bar as Reveal / Bounce for a consistent "same to same" feel.
  const smooth = (t: number) => {
    const c = Math.min(1, Math.max(0, t));
    return c * c * c * (c * (c * 6 - 15) + 10);
  };

  const frontIn = paused ? frontMax * 2 : smooth(Math.min(1, cyc / fadeInEnd)) * frontMax;
  const frontOut = paused
    ? 0
    : cyc <= holdEnd
    ? 0
    : smooth(Math.min(1, (cyc - holdEnd) / (fadeOutEnd - holdEnd))) * frontMax;
  const scaleWhole = paused ? 1 : 0.9 + 0.1 * smooth(Math.min(1, cyc / scaleDur));

  // Subtle whole-text scale around the text center (easy-ease, no bounce).
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scaleWhole, scaleWhole);
  ctx.translate(-cx, -cy);

  let x = startX;
  chars.forEach((ch, i) => {
    const fin = Math.min(1, Math.max(0, (frontIn - i) / ramp));
    const fout = Math.min(1, Math.max(0, (frontOut - i) / ramp));
    const opacity = smooth(fin) * (1 - smooth(fout));
    if (opacity <= 0.001) {
      x += widths[i];
      return;
    }
    // RISE: each glyph eases up from below as it fades in (no overshoot on the way out).
    const ent = smooth(fin);
    const y = cy + offsetDown * (1 - ent);
    const color = n > 1 ? neonColorAt(i / (n - 1)) : neonColorAt(0.5);
    drawGlyph(ch, x, y, opacity, 0, color);
    x += widths[i];
  });
  ctx.restore();
  ctx.restore();
}

export default function PreviewCanvas({ project }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fps = project.fps || 30;
  const totalFrames = project.duration * fps;

  const drawPreview = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      const width = project.width;
      const height = project.height;
      const style = project.style;
      const speed = project.animationSpeed ?? 1;

      // The Hook style is a full dedicated composition (background + grid + type).
      if (style === "Hook") {
        drawHookComposition(ctx, project, width, height, frame, fps, isPlaying, speed);
        return;
      }
      if (style === "Caption") {
        drawCaptionComposition(ctx, project, width, height, frame, fps, isPlaying, speed);
        return;
      }
      if (style === "Kinetic") {
        drawKinetic(ctx, project, width, height, frame, fps, isPlaying, speed);
        return;
      }

      // Word-reveal animation timing: loop while playing, settled (fully visible) when paused.
      const revealCycle = Math.round((fps * 3) / speed);
      const cyc = isPlaying ? frame % revealCycle : -1;
      const paused = !isPlaying;
      const revealOn = project.animation === "Reveal";
      const bounceOn = project.animation === "Bounce";
      const fadeOn = project.animation === "Fade";
      const popOn = project.animation === "Pop";

      /** Draw styled text for the current frame (non-Hook styles). */
      const drawText = (
        text: string,
        x: number,
        y: number,
        size: number,
        weight: number,
        font: string
      ) => {
        ctx.fillStyle = project.textColor || "#FFFFFF";
        ctx.font = `${weight} ${size}px "${font}", sans-serif`;
        ctx.fillText(text, x, y);
      };

      ctx.clearRect(0, 0, width, height);

      if (project.background.type === "solid") {
        ctx.fillStyle = project.background.value;
      } else {
        ctx.fillStyle = "#000000";
      }
      ctx.fillRect(0, 0, width, height);

      const fontSize = (project.format === "portrait" ? 56 : 48) * (project.size ?? 1);
      ctx.fillStyle = project.textColor || "#FFFFFF";
      ctx.textBaseline = "middle";

      if (project.segments && project.segments.length > 0) {
        project.segments.forEach((segment, index) => {
          if (frame >= segment.startFrame && frame <= segment.endFrame) {
            const segmentProgress =
              (frame - segment.startFrame) / (segment.endFrame - segment.startFrame);

            ctx.font = `${segment.weight || project.weight || 400} ${fontSize}px "${segment.font || project.font || "Inter"}", sans-serif`;

            let x = width / 2;
            if (project.alignment === "left") x = width * 0.15;
            else if (project.alignment === "right") x = width * 0.85;

            ctx.textAlign = project.alignment;
            const y = (height / (project.segments.length + 1)) * (index + 1);

            if (revealOn) {
              drawCharReveal(
                ctx,
                segment.text,
                x,
                y,
                fontSize,
                segment.weight || project.weight || 400,
                segment.font || project.font || "Inter",
                false,
                project.alignment,
                cyc,
                revealCycle,
                paused,
                speed,
                (ch, gx, gy, ga, gb) => {
                  ctx.save();
                  ctx.globalAlpha = ga;
                  if (gb > 0.1) ctx.filter = `blur(${gb}px)`;
                  ctx.fillText(ch, gx, gy);
                  ctx.restore();
                }
              );
            } else if (bounceOn) {
              drawCharBounce(
                ctx,
                segment.text,
                x,
                y,
                fontSize,
                segment.weight || project.weight || 400,
                segment.font || project.font || "Inter",
                false,
                project.alignment,
                cyc,
                revealCycle,
                paused,
                speed,
                (ch, gx, gy, ga, gb) => {
                  ctx.save();
                  ctx.globalAlpha = ga;
                  if (gb > 0.1) ctx.filter = `blur(${gb}px)`;
                  ctx.fillText(ch, gx, gy);
                  ctx.restore();
                }
              );
            } else if (fadeOn) {
              const fcycle = autoFadeCycle(segment.text, speed);
              const fcyc = isPlaying ? frame % fcycle : -1;
              drawCharFade(
                ctx,
                segment.text,
                x,
                y,
                fontSize,
                segment.weight || project.weight || 400,
                segment.font || project.font || "Inter",
                false,
                project.alignment,
                fcyc,
                fcycle,
                paused,
                speed,
                (ch, gx, gy, ga, gb, color) => {
                  ctx.save();
                  ctx.globalAlpha = ga;
                  ctx.fillStyle = project.textColor || "#ffffff";
                  ctx.shadowColor = project.textColor || "#ffffff";
                  ctx.shadowBlur = fontSize * 0.35;
                  ctx.fillText(ch, gx, gy);
                  ctx.shadowBlur = fontSize * 0.12;
                  ctx.fillText(ch, gx, gy);
                  ctx.restore();
                }
              );
            } else if (popOn) {
              // POP: punchy opacity flicker over a short window at the start of the loop, then held.
              const popWin = 0.14;
              const phase = paused ? 1 : Math.min(1, (cyc / revealCycle) / popWin);
              const popOpacity = paused ? 1 : captionPopOpacity(phase);
              ctx.save();
              ctx.globalAlpha = popOpacity;
              drawText(
                segment.text,
                x,
                y,
                fontSize,
                segment.weight || project.weight || 400,
                segment.font || project.font || "Inter"
              );
              ctx.restore();
            } else {
              const opacity = Math.min(1, Math.max(0, Math.sin(segmentProgress * Math.PI)));
              ctx.globalAlpha = opacity;
              drawText(
                segment.text,
                x,
                y,
                fontSize,
                segment.weight || project.weight || 400,
                segment.font || project.font || "Inter"
              );
              ctx.globalAlpha = 1;
            }
          }
        });
      } else if (project.text) {
        ctx.font = `${project.weight || 400} ${fontSize}px "${project.font || "Inter"}", sans-serif`;
        ctx.textAlign = project.alignment;
        let x = width / 2;
        if (project.alignment === "left") x = width * 0.15;
        else if (project.alignment === "right") x = width * 0.85;
        if (revealOn) {
          drawCharReveal(
            ctx,
            project.text,
            x,
            height / 2,
            fontSize,
            project.weight || 400,
            project.font || "Inter",
            false,
            project.alignment,
            cyc,
            revealCycle,
            paused,
            speed,
            (ch, gx, gy, ga, gb) => {
              ctx.save();
              ctx.globalAlpha = ga;
              if (gb > 0.1) ctx.filter = `blur(${gb}px)`;
              ctx.fillText(ch, gx, gy);
              ctx.restore();
            }
          );
        } else if (bounceOn) {
          drawCharBounce(
            ctx,
            project.text,
            x,
            height / 2,
            fontSize,
            project.weight || 400,
            project.font || "Inter",
            false,
            project.alignment,
            cyc,
            revealCycle,
            paused,
            speed,
            (ch, gx, gy, ga, gb) => {
              ctx.save();
              ctx.globalAlpha = ga;
              ctx.fillText(ch, gx, gy);
              ctx.restore();
            }
          );
        } else if (fadeOn) {
          const fcycle = autoFadeCycle(project.text, speed);
          const fcyc = isPlaying ? frame % fcycle : -1;
          drawCharFade(
            ctx,
            project.text,
            x,
            height / 2,
            fontSize,
            project.weight || 400,
            project.font || "Inter",
            false,
            project.alignment,
            fcyc,
            fcycle,
            paused,
            speed,
            (ch, gx, gy, ga, gb, color) => {
              ctx.save();
              ctx.globalAlpha = ga;
              ctx.fillStyle = project.textColor || "#ffffff";
              ctx.shadowColor = project.textColor || "#ffffff";
              ctx.shadowBlur = fontSize * 0.35;
              ctx.fillText(ch, gx, gy);
              ctx.shadowBlur = fontSize * 0.12;
              ctx.fillText(ch, gx, gy);
              ctx.restore();
            }
          );
        } else if (popOn) {
          // POP: punchy opacity flicker over a short window at the start of the loop, then held.
          const popWin = 0.14;
          const phase = paused ? 1 : Math.min(1, (cyc / revealCycle) / popWin);
          const popOpacity = paused ? 1 : captionPopOpacity(phase);
          ctx.save();
          ctx.globalAlpha = popOpacity;
          drawText(project.text, x, height / 2, fontSize, project.weight || 400, project.font || "Inter");
          ctx.restore();
        } else {
          drawText(project.text, x, height / 2, fontSize, project.weight || 400, project.font || "Inter");
        }
      } else {
        ctx.font = `400 24px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#444444";
        ctx.fillText("Enter text to preview", width / 2, height / 2);
      }
    },
    [project, isPlaying]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = project.width;
    canvas.height = project.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawPreview(ctx, frameRef.current);
  }, [project, drawPreview]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now() - (frameRef.current / fps) * 1000;
    }

    const animate = (timestamp: number) => {
      const elapsed = timestamp - (startTimeRef.current ?? timestamp);
      const frame = Math.floor((elapsed / 1000) * fps) % totalFrames;
      frameRef.current = frame;
      setCurrentTime(frame / fps);
      drawPreview(ctx, frame);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, fps, totalFrames, drawPreview]);

  const handlePlay = () => {
    startTimeRef.current = performance.now() - (frameRef.current / fps) * 1000;
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    startTimeRef.current = null;
  };

  const handleRestart = () => {
    frameRef.current = 0;
    setCurrentTime(0);
    startTimeRef.current = isPlaying ? performance.now() : null;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) drawPreview(ctx, 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    frameRef.current = Math.floor(time * fps);
    setCurrentTime(time);
    startTimeRef.current = isPlaying ? performance.now() - time * 1000 : null;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) drawPreview(ctx, frameRef.current);
  };

  const handleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Size the preview to the largest box that fits the available area while preserving the
  // user-selected aspect ratio (9:16 portrait / 16:9 landscape). This keeps the displayed
  // video shaped exactly like the chosen format and lets it grow/shrink responsively with
  // the panel instead of being locked to a fixed pixel height.
  useEffect(() => {
    const container = containerRef.current;
    const holder = holderRef.current;
    if (!container || !holder) return;
    const apply = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw <= 0 || ch <= 0) return;
      const ratio = project.format === "portrait" ? 9 / 16 : 16 / 9; // width / height
      let fitW = cw;
      let fitH = cw / ratio;
      if (fitH > ch) {
        fitH = ch;
        fitW = ch * ratio;
      }
      holder.style.width = `${Math.round(fitW)}px`;
      holder.style.height = `${Math.round(fitH)}px`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(container);
    return () => ro.disconnect();
  }, [project.format]);

  return (
    <div className="flex h-full flex-col">
      <div
        ref={containerRef}
        className={`relative flex flex-1 items-center justify-center overflow-hidden bg-black p-3 sm:p-4 lg:p-6 min-h-[50vh] lg:min-h-0 ${
          isFullscreen ? "fixed inset-0 z-50" : ""
        }`}
      >
        <div
          ref={holderRef}
          className="relative overflow-hidden rounded-lg border border-[var(--studio-border)] bg-black shadow-2xl"
        >
          <canvas
            ref={canvasRef}
            className="h-full w-full object-contain"
            style={{ width: "100%", height: "100%" }}
          />
          <div className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-[var(--studio-muted)] backdrop-blur-sm">
            {project.format === "portrait" ? "9:16" : "16:9"}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--studio-border)] bg-[var(--studio-surface)] px-3 py-3 sm:px-4">
        <div className="mb-2 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={project.duration}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[var(--studio-border)] accent-[var(--studio-green)]"
            aria-label="Timeline scrubber"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {isPlaying ? (
              <button
                type="button"
                onClick={handlePause}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10"
                aria-label="Pause"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlay}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--studio-green)] transition-colors hover:bg-[var(--studio-green-muted)]"
                aria-label="Play"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={handleRestart}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Restart"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <span className="font-mono text-xs text-[var(--studio-muted)] sm:text-sm">
            {formatTime(currentTime)} / {formatTime(project.duration)}
          </span>

          <button
            type="button"
            onClick={handleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Fullscreen"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
