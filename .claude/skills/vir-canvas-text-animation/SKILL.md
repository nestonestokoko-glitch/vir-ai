---
name: vir-canvas-text-animation
description: Use when adding or modifying character-by-character text animations (Reveal, Bounce, etc.) in the vir-ai editor's PreviewCanvas. Encodes the After Effects Range-Selector canvas pattern, the exact spec-to-code mapping, and the specific pitfalls that make an animation look like a different one or feel jerky. Read this BEFORE writing any animation code.
---

# Smooth Canvas Text Animations (vir-ai editor)

This project renders text animations on a 2D `<canvas>` (`PreviewCanvas.tsx`), not with CSS
or a library. The target aesthetic is premium short-form video titles (TikTok / Reels /
Shorts): character-by-character reveals that are **smooth, consistent, clear, and stable**.

## When to use this skill
- Adding a new animation option (e.g. a 3rd animation next to `Reveal` / `Bounce`).
- Modifying an existing animation's motion, easing, speed, or look.
- Debugging "it looks like the other animation", "it's jerky", "it's not smooth", or
  "characters at the end don't animate".

## Architecture (read before editing)
- `src/app/editor/components/PreviewCanvas.tsx` — the renderer. Contains `drawHookComposition`
  (the Hook style: charcoal bg + grid + blue gradient + glow + shine) and generic character
  helpers `drawCharReveal` / `drawCharBounce`. `drawPreview` is the per-frame callback; it
  branches on `project.style` (Hook gets the full composition) and `project.animation`.
- `src/app/editor/components/AnimationSelector.tsx` — the list of animation options
  (`animationOptions` array). Add new entries here. Also owns the **speed** slider.
- `src/app/editor/hooks/useProject.ts` — `Project` type. `animationSpeed` (default `1`) and
  `size` (default `1`) live here; `animation` is a free string.
- `page.tsx` (Step 5) passes `speed={project.animationSpeed ?? 1}` and
  `onSpeedChange={(animationSpeed) => updateProject({ animationSpeed })}`.

### The helper contract (do not break it)
Every character animation is a helper of this shape:
```
drawCharX(
  ctx, text, cx, cy, size, weight, font, italic, align,
  cyc, cycle, paused, speed,            // timing
  (ch, x, y, alpha, blur) => { ... }    // drawGlyph callback (ctx already transformed)
)
```
- `cyc` = current frame within the loop (`frame % cycle`), or `-1` when paused.
- `paused` = `!isPlaying` → render the **settled final state** (every glyph at rest).
- `drawGlyph` does the actual `fillText`. It must honor `alpha` (globalAlpha) and `blur`
  (`if (blur > 0.1) ctx.filter = blur(px)`). The Hook callback additionally applies the
  gradient fill + blue glow.
- Characters are positioned **manually** (measure each glyph width, advance `x`), so live
  `letterSpacing` must be reset to `"0px"` before calling.

## The canonical motion model (AE Range Selector, character granularity)
After Effects animates text with a **Range Selector** whose `Offset` sweeps `-100% → +100%`,
easing each character in/out over a ramp. On canvas we replicate this with a single advancing
**front** and a per-character progress `pp`:

1. `front` advances `0 → frontMax` over the sweep duration, eased with **smootherstep**
   (Perlin: `t³(6t²−15t+10)` — zero velocity AND acceleration at both ends, so nothing jerks).
2. Per character `i`: `pp = (front − i) / ramp`. `pp∈[0,1]` = entrance; `pp>1` = overshoot phase.
3. The glyph's transform is a pure function of `pp` (entrance + optional bump), so motion is
   fully deterministic and identical for every character (consistency = "same to same").

**CRITICAL — `frontMax` must include the overshoot span:**
```
const frontMax = n - 1 + ramp * (1 + bounceSpan);
```
If `front` only reaches `n - 1 + ramp`, the trailing characters never enter the `pp>1`
overshoot window, so they just rise and stop → **the animation looks exactly like the plain
Reveal**. This is the #1 cause of "you mixed bounce with reveal". Always extend `frontMax`
past the last character's full entrance + bounce.

## Exact AE → canvas mapping (for the Bounce spec)
| AE animator | canvas |
|---|---|
| Animator 1 Position `0,+200` | `yOff = +offsetDown·(1−ent)`, `offsetDown = size·0.8` (starts BELOW) |
| Animator 1 Scale `0%` | `scale = ent` (0 → 1) |
| Animator 1 Opacity `0%` | `alpha = ent` (0 → 1) |
| Animator 2 Position `0,−100` | `yOff -= offsetUp·bump`, `offsetUp = size·0.5` (overshoots ABOVE) |
| Animator 2 Scale `150%` | `scale = ent·(1 + 0.5·bump)` → peaks at 1.5 |
| Animator 2 (no opacity) | bump never changes alpha |
| Ramp Up, Ease High/Low `50%` | smoothstep per-character influence |
| Offset `-100%→+100%` over ~1s | `front` sweeps over `sweepDur ≈ 36/speed` frames |
| ~10f later (Animator 2) | bump begins at `pp=1` (entrance complete) |

## Exact AE → canvas mapping (for the Reveal / tracking-spread spec)
| AE animator | canvas |
|---|---|
| Tracking `-100` | letters compressed at the text-block center (`clusterX`); each glyph spreads to its final `finalX[i]` as `pp→1` (no vertical motion) |
| Opacity `0%` | `alpha = eased(pp)` (0 → 1) |
| Range Selector Start `0%→100%` over ~1s | `front` sweeps over `revealDur ≈ 30/speed` frames |
| Ramp Up, Easy Ease (F9) + Speed Graph S-curve | smootherstep per-character (`pp`) |
| Motion Blur | velocity-scaled horizontal blur, crisp when settled |
| No bounce / overshoot / vertical move | `frontMax = n-1+ramp` (reveal only, NO overshoot span), `y` stays at `cy` |

## Whole-text composition styles (Caption, Hook)
Some styles are a FULL composition, not a per-character helper. `drawHookComposition` and
`drawCaptionComposition` render on an offscreen canvas and `return` early in `drawPreview`
(before the generic Reveal/Bounce/Fade path), so the style fully owns the look. They still
must honor the same quality bar:

**Caption is a STYLE, not a template.** After the user picks Caption, the *motion* is driven by
`project.animation` — `drawCaptionComposition` dispatches on it: `Reveal`/`Bounce`/`Fade` route
through the matching character helper (rendered to the offscreen canvas with a Caption-flavored
glyph callback: bold 900, white→slight-tint gradient, glow, drop shadow); `Pop` keeps the
whole-text rise + flicker. Unknown animations fall back to Fade. So Caption = the *look*; the
animation selector = the *motion*.

- **Gradient fill** (vertical, *slight*) — Caption tints white→`lerpHex(#fff, textColor, 0.4)`:
  deliberately understated (the tutorial's "very, very slight" gradient), NOT a bold wash.
  The color picker still re-themes it (purple/blue/pink/green variants come "for free").
- **RISE** = whole-text **smootherstep** (`t³(6t²−15t+10)`, clean, no flicker) from
  `yOff = size*0.7` below, opacity 0→1. Distinct from the per-character Reveal. RISE and POP
  are SEPARATE presets in the tutorial — do NOT fuse the pop flicker into the rise.
  (The per-character **Fade** helper ALSO rises each glyph from `size*0.8` below on entrance.)
- **POP** = a separate `animation` option (whole-text opacity flicker envelope
  `0→0.45→0.2→0.75→1` over the first ~14% of the loop, then held). It also layers onto the
  Caption style when `project.animation === "Pop"`. Driven by the speed slider.
- **Drop shadow** (`rgba(0,0,0,0.55)`, small `+y` offset, moderate blur) + **restrained glow**
  (one shadowBlur pass in the theme color, capped radius — never heavy).
- **Diagonal light sweep**: draw on the offscreen canvas with
  `globalCompositeOperation = "source-atop"` after `translate(cx,cy)+rotate(~-π/7)`, so the
  bright band lands ONLY on the glyphs. Add a faint inner core for the edge shimmer. Plays once
  per loop (`drawShine(cyc, cycle)`) for every Caption animation; skipped when `paused`.
- **Speed wired** (varies per animation: `round(fps*3/speed)` for Reveal/Bounce, `autoFadeCycle`
  for Fade, `round(fps*3.2/speed)` for Pop), **clean loop** (rise→hold→quick seam fade),
  **`paused` shows the settled frame** (skip the shine, settled glyphs, `op=1`).

## Kinetic typography system (word-based, reflow)
The `Kinetic` style is a reusable kinetic-typography engine — NOT a single text object. It lives in
`src/app/editor/components/kinetic/kineticEngine.ts` (pure logic) + `drawKinetic` in `PreviewCanvas.tsx`
(drawing only). It satisfies the "every word is an independently animated element" bar:
- **Parse**: `parseWords(text)` splits on whitespace and applies markers — `*word*`=emphasis(centered,
  subtle), `^word^`=typewriter, `!word!`=pop, plain=**tracking** (centered, subtle — letter-spacing
  is the hero, no directional travel); ALL-CAPS words are ALSO emphasis (union, still centered).
- **Timeline**: `buildTimeline` staggers entrances (`step`, `enterDur`, `holdDur`, `exitDur`,
  `repositionDur`, `enterTrackingDur`, `exitTrackingDur`, all ÷ `speed`) into a looping `loopCycle`.
  Per-word lifecycle is time-based (`enterDuration`/`holdDuration`/`exitDuration` seconds from
  `KineticConfig`, ÷ `speed`). `step` (stagger between entrances) = `max(enterDur, round(lifespan / maxVisible))`,
  so a word exits as the word `maxVisible` ahead enters — producing a clean rolling window (default max 3
  words on screen at once; raise `maxVisible` to keep more on screen, lower to show fewer).
- **Layout/reflow**: `layoutSlots(words, indices, …)` builds a centered, vertically-balanced stack
  (emphasis words get `emphasisScale`) for exactly the supplied active word indices. The active set is
  `activeSetAt(frame)` = words that have entered but not yet been removed (`frame < exitEnd[i]`), so
  removed words never reserve space. When the active set changes (a word enters OR an old word is
  removed), the remaining words ease to their new slots over `repositionDur` (`easeOutCubic`) — the
  "make room" / recenter behavior works on BOTH enter and exit.
- **Lifecycle (ENTER → HOLD → EXIT → REMOVE)**: `computeWordState` returns `null` before `tEnter[i]`
  (not entered) and after `exitEnd[i]` (removed → excluded from layout AND drawing, so old text never
  accumulates). Phases: ENTER is **centered & subtle** (default `tracking` entrance: fade-in + a hair of
  scale + letter-spacing opening compressed→normal; `zoom`/`pop` are centered scale-ins, `typewriter` a
  centered char reveal — **no directional travel**), HOLD is
  perfectly stable for `holdDur`, EXIT is **centered & subtle** (no fly-off): the word eases a hair
  smaller, fades, and its letter-spacing spreads normal→expanded (the visible "release"), all driven by
  ONE `easeInOutCubic` progress ("same to same"), then REMOVE. Configurable via `enterDuration`/
  `holdDuration`/`exitDuration`/`maxVisible` in `KineticConfigPanel` (Step 4); tracking has its own
  controls (Tracking Enabled, Enter/Final/Exit tracking, durations, easing, emphasis).
- **Per-word state**: `computeWordState` returns position, scale, opacity, color, visible-chars
  (typewriter), arrow flag, **and `tracking` (letter-spacing as % of font size, animated per-word)**.
  Entrance easing uses `easeOutBack` (slight overshoot) / `smootherstep`; reflow uses `easeOutCubic`;
  boing arrow uses `raisedCosineBump`.
- **Tracking (letter-spacing) animation** (per-word, tied to the lifecycle; values are % of font size so
  it scales with type size): ENTER eases `trackingEnter` (compressed, e.g. −8%) → `trackingFinal` (0%); HOLD
  & REFLOW hold `trackingFinal` (reflow never resets tracking); EXIT eases `trackingFinal` → `trackingExit`
  (expanded, e.g. +12%) when `trackingExitEnabled`. Emphasis words get stronger values (`trackingEmphasis`).
  `drawKinetic` applies it as `letterSpacing = (tracking/100)·size px`. Rendering measures layout at
  `trackingFinal` so centering stays accurate.
- **Motion blur**: `motionBlurFor` is velocity-scaled (crisp at rest, smeared in motion) — same bar as
  the per-character helpers.
- **Configurable**: every value lives in `KineticConfig` (editable via `KineticConfigPanel` on Step 4),
  so emphasis color / timing / scale / blur can change without touching code.
- Reuse this skill's smoothness rules (character/word independence, zero-velocity easing, velocity
  blur, clean loops, paused = settled frame, speed wired everywhere).

## Smoothness rules (non-negotiable for "clear, smooth, premium")
1. **Character-by-character, never word-by-word.** Split with `Array.from(text)` (grapheme-safe).
2. **Easing has zero velocity at seams.** Use smootherstep for sweeps; use a **raised-cosine
   bump** `0.5 − 0.5·cos(2π·u)` (NOT a raw sine — sine has max velocity at the start of the
   overshoot, which jerks). Raised cosine is flat at both ends → elastic but controlled.
3. **Crisp at rest, soft in motion.** Motion blur must be **velocity-scaled**:
   `vel = |yOffAt(pp+ε) − yOffAt(pp−ε)| / 2ε; blur = min(size·0.07, vel·0.045)`. Zero when
   settled, never a constant smear.
4. **Consistent across every character** — identical easing, identical amplitude. No random
   delays, no per-character variation.
5. **Distinct from sibling animations.** If two animations share the same entrance (e.g. both
   rise-from-below + scale + fade), the *differentiating* motion (the overshoot) must be the
   **visible climax**, not a subtle blip. Make the entrance snappier (tighter `ramp`, shorter
   `sweepDur`) so the pop reads.
6. **Loop cleanly.** Hold the finished state most of the cycle; only a short envelope fade at
   the seam. `paused` must render the fully settled state.
7. **Keep the user's text.** Never auto-fill sample/placeholder text — use `project.text` /
   `project.segments` as-is.
8. **Wire `speed` everywhere.** The speed slider must reach both the sweep duration and any
   per-character timing in every helper and every call site (Hook + generic).

9. **Auto-scale the loop to text length.** When an animation must feel the same for short and
   long text, derive the loop `cycle` from the character count (constant frames-per-character),
   NOT a fixed duration. Otherwise long text rushes and short text drags — both read as jerky
   and break "same to same" smoothness. In this repo the Fade animation does this via
   `autoFadeCycle(text, speed)`: `cycle = round((n-1+ramp)·perChar · 2.65)` (sweep + hold +
   fade-out + tail), capped so very long text stays manageable. With a length-aware `cycle`,
   fixed phase *ratios* inside the helper yield constant per-character time automatically.

## Adding a NEW animation — checklist
- [ ] Add `{ label, value }` to `animationOptions` in `AnimationSelector.tsx`.
- [ ] In `drawPreview`: declare `const xOn = project.animation === "X"` (both occurrences:
      the Hook `drawHookComposition` and the generic branch). Reuse the existing `cyc`/`cycle`
      loop for `cyc` and `paused`.
- [ ] Add an `else if (xOn)` branch in **both** the segments branch and the single-text branch,
      calling your `drawCharX` with the matching `drawGlyph` callback (solid fill for generic,
      gradient+glow for Hook).
- [ ] In `drawHookComposition`, add the `else if (xOn)` branch with the Hook gradient callback
      (reset `letterSpacing` to `"0px"` first).
- [ ] Verify `frontMax` extends through the full motion (rule: front-sweep bug above).
- [ ] `npx tsc --noEmit` must pass. Watch the editor preview (Step 4 style → Step 5 animation).

## Self-audit before declaring done
- Does `frontMax` include the overshoot span? (trailing chars must animate)
- Is every easing zero-velocity at its seams? (no jerk)
- Is motion blur velocity-scaled and zero at rest?
- Are Reveal/Bounce/etc. visually distinct and share the same easing quality bar?
- Does `paused` show the settled final frame?
- Does the speed slider affect this animation?
- Does the loop cycle scale with text length (constant per-character time), so short and long
  text both animate smoothly ("same to same")?
