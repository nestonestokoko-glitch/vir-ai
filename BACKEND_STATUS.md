# AI Video Studio — Backend Implementation Status

> Handoff / status document. Last updated: 2026-08-14.
> Project: `vir-ai` (Next.js 16.3.0, React 19, TypeScript, Tailwind 4, Turbopack).
> Goal (from user): when a user pastes a link → fetch the real video → find the best
> moment → cut a final clip per the user's settings → preview the ACTUAL clip (not a fake canvas).

---

## 1. What was the original problem

- The "AI Clipping" feature was broken: it showed a **fake canvas gradient** instead of the real
  downloaded video, and never actually fetched/cut anything.
- The user asked to implement the real backend per `working.md` (Typography Reels + AI Clipping).
- The 4-pillar gap table defined what was missing:
  - **(A) Ingestion** — download real video via `yt-dlp`.
  - **(B) AI scoring** — pick best moments with Claude.
  - **(C) Render** — cut + reframe + burn captions via `ffmpeg`.
  - **(D) Storage** — serve output clips.
  - **(E) Job wiring** — async pipeline with status polling.

---

## 2. What is now implemented (real functionality)

### Pipeline flow (`src/app/api/clipping/process/route.ts`)
1. **Stage 1 – Fetch/Ingest** (`ingestVideo`): downloads the source video with `yt-dlp`, also pulls
   `.vtt` subtitles, extracts audio via `ffmpeg`.
2. **Stage 2 – Transcript**: parses the downloaded `.vtt` (`parseVtt`) or falls back to live caption
   scraping (`fetchRealCaptions`).
3. **Stage 3 – AI scoring** (`scoreMomentsWithClaude`): sends the transcript to Claude
   (via `ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN`) and gets scored moments. Falls back to the
   deterministic keyword scorer (`analyzeVideoAndDetectMoments`) when Claude/env is unavailable.
4. **Stage 4 – Select** top N non-duplicate moments.
5. **Stage 5 – Render** (`renderClip`): cuts `-ss/-to`, reframes to 9:16 or 16:9, burns styled
   captions, outputs `public/generated/{clipId}.mp4` (served at `/generated/{clipId}.mp4`).
   Falls back to bundled sample footage (`/wind-blowing.mp4`) only if no source video is available.

### Files touched

| File | Status | Purpose |
|------|--------|---------|
| `src/lib/clip-types.ts` | read-only | Types: `VideoMetadata`, `TranscriptSegment`, `CandidateMoment`, `GeneratedClip`, `ProcessingJob`, etc. (already had `videoUrl`, `transcript`, `captionPosition`…). |
| `src/lib/youtube.ts` | modified | Added `sampleVideoUrl` to `SAMPLE_PRESET_VIDEOS`; `fetchVideoMetadata` sets `videoUrl` to sample footage for presets/generic fallback. Contains `generateMockTranscriptForVideo()`. |
| `src/components/studio/ClipPlayerCanvas.tsx` | rewritten | Now a real `<video>` element playing `clip.videoUrl` with HTML/CSS caption overlay synced to transcript timestamps + play/pause/restart/scrubber/mute. (Fixes the original "fake canvas" complaint.) |
| `src/components/studio/Step6_ClipGallery.tsx` | modified | `handleDownload` downloads the real `clip.videoUrl` as `.mp4` (falls back to `.txt` metadata if absent). Keeps confetti. |
| `src/app/globals.css` | modified | Added `@keyframes fadeIn / popIn / slideUp` for caption animations. |
| `package.json` | modified | Added `canvas-confetti` (was imported but undeclared); fixed a duplicate `next` entry. |
| `src/lib/server/paths.ts` | **created** | `findFfmpeg()`, `findYtDlp()`, `PROJECT_ROOT` (cwd-independent resolver — see §4). |
| `src/lib/server/captions.ts` | **created** | `fetchRealCaptions()` (scrapes `ytInitialPlayerResponse` + timedtext XML) and `parseVtt()` (WebVTT → `TranscriptSegment[]`). |
| `src/lib/server/ai-scoring.ts` | **created** | `scoreMomentsWithClaude()` — calls `${ANTHROPIC_BASE_URL}/v1/messages` with the transcript + the §13 rubric; returns `CandidateMoment[]` or `null`. |
| `src/lib/server/ingest.ts` | **created** | `ingestVideo()` downloads video+subs via `yt-dlp`, audio via `ffmpeg`. `cleanupIngest()`. |
| `src/lib/server/render.ts` | **created** | `renderClip()` (ffmpeg cut/reframe/caption-burn) + `getVideoDuration()` (ffprobe). Rejects <1KB outputs. |
| `src/app/api/clipping/process/route.ts` | rewritten | The real async 5-stage pipeline above. |
| `src/app/api/debug-paths/route.ts` | **TEMP** | Diagnostics: reports `PROJECT_ROOT`, `findYtDlp/ffmpeg`, `bin/yt-dlp.exe` existence. **Delete before finishing.** |
| `src/app/api/debug-ingest/route.ts` | **TEMP** | Calls `ingestVideo` directly and reports timing/result. **Delete before finishing.** |

### Confirmed working (verified end-to-end)
- `yt-dlp` downloads a real video (e.g. TED talk `iG9CE55wbtY`) → `tmp/ingest/{id}.mp4`.
- Auto-subtitle `.vtt` download works on captioned videos (e.g. `ted_iG9CE55wbtY.en.vtt`, 30KB).
- `parseVtt` converts the VTT into word-level `TranscriptSegment[]`.
- `renderClip` produces a **real 9.8 MB MP4** with burned captions for an in-range moment
  (`clip_…_3.mp4`, 45s, portrait-reframed) from the downloaded TED video. ✅ This proves pillars
  A, B/C wiring, C (render), D (served at `/generated/…`), and E (job/status) all work.
- Binaries: `bin/yt-dlp.exe` (17.4M) present; `ffmpeg` + `ffprobe` available via WinGet PATH.

---

## 3. Graceful-degradation design

Every stage degrades instead of crashing:
- No `yt-dlp` → ingest returns `null` → use bundled sample footage.
- No captions → live scrape → else mock transcript.
- No Claude env (`ANTHROPIC_BASE_URL`/`ANTHROPIC_AUTH_TOKEN`) → keyword fallback scorer.
- Caption burn-in fails → retry without subtitles → else sample footage.

This is correct behavior, but it means: **without the Claude env vars set, moments come from the
fallback scorer** (IDs like `moment_4_gen_seg_4`, not Claude `moment_<ts>_<i>`).

---

## 4. Key bug fixed: cwd-independent paths

`ingest.ts` / `render.ts` originally used `process.cwd()` to locate `bin/`, `tmp/`, `public/`. In a
Next dev worker the cwd may not be the project root, so `bin/yt-dlp.exe` wasn't found → `ingestVideo`
returned `null` instantly → full mock fallback.

Fix in `paths.ts`: `PROJECT_ROOT` walks **up** from `import.meta.url` until it finds
`bin/yt-dlp.exe` (with `process.cwd()` fast-path). Verified via `debug-paths`: `PROJECT_ROOT`,
`ytDlp`, `ffmpeg` all resolve correctly in the server context.

---

## 5. CURRENT ISSUE — where the work is left

### Symptom
When run on a video, the pipeline produces:
- 1 good real clip when the (fallback) moment happens to be **in range** (e.g. `clip_3`, 45s, 9.8MB).
- 2 clips that are only **1.4s** (40KB) when the fallback moments fall **outside** the real video
  duration (e.g. moments at 1450s / 2100s on a 1164–1203s video).

### Root cause (two parts)
1. **Fallback moments have out-of-range timestamps.** The deterministic scorer generates moments
   using a generic/long transcript, so timestamps can exceed the real ingested video. The pipeline
   clamps each clip window into `[0, realDuration]` before rendering — but **that clamp code is not
   executing in the running server** (see #2).
2. **The dev server is serving stale code.** The project's dev server is managed by a supervisor:
   `language_server_windows_x64.exe` (VS Code) → `powershell "npm run dev"` → `next dev` on **port 3000**.
   Turbopack's file-watcher is **not hot-reloading edits** in this environment, and killing the
   `next dev` process appears to leave a "zombie" that keeps serving its in-memory compile. Repeated
   `.next` clears + restarts recompile, yet the served route keeps missing the latest edit (the
   temporary file-based diagnostic never gets written, confirming the running route ≠ latest source).

So the clamp fix is very likely correct, but **cannot be verified because the running server won't
pick up the edited `process/route.ts`**.

### What was attempted to break the stale-server loop
- Killed the `next dev` process(es) by PID; they respawn via the VS Code supervisor.
- Cleared `.next/dev`, `.next/cache`, even all of `.next`; supervisor restarts `next dev` from disk
  but the served module still lags.
- Started a separate server on port 3127 — blocked because the 3000 server holds the `.next/dev` lock
  ("Another next dev server is already running").
- Added a file-write diagnostic in the route (first with `require`, then with the imported `fs`) to
  observe `realDuration` at runtime — the file was never created, proving the edited code isn't running.

---

## 6. Remaining tasks — COMPLETED (2026-08-15)

1. **Get the running server to execute current `process/route.ts`.** Done. Started a fresh
   `next start` (production build) on :3000 — the production build is a guaranteed-consistent
   compile of current source, sidestepping the stale `next dev` watcher entirely. (The dev
   supervisor was not running at this point, so no zombie to fight.)
2. **Verify the clamp logic** produces correct windows. Done — replaced the clamp with a
   re-anchoring strategy (see §9) so ALL fallback clips are full-length and distinct.
3. **Improve fallback moment placement** so moments are generated within the real duration. Done
   — `analyzeVideoAndDetectMoments()` now accepts `realDuration` + `realTranscript` and spreads
   windows evenly across the real video, using the real parsed captions when available.
4. **Claude scoring**: documented env vars in `.env.example`. The scoring path was already wired
   (`src/lib/server/ai-scoring.ts`); it activates automatically when `ANTHROPIC_BASE_URL` +
   `ANTHROPIC_AUTH_TOKEN` are set.
5. **Cleanup before finishing** — DONE:
   - Deleted `src/app/api/debug-paths/` and `src/app/api/debug-ingest/`.
   - Removed the TEMP DIAGNOSTIC block in `process/route.ts`.
   - Added `public/generated/` to `.gitignore`. (No `console.error` remained in `ingest.ts`.)
6. **Final verification**: `npm run build` passes (no type errors, debug routes gone from the
   route table) and `npm test` (jest) passes — 25/25 tests. End-to-end render re-verified (§10).

---

## 9. Fix applied for the §5 "1.4s clip" bug

**Root cause confirmed**: the deterministic fallback (`analyzeVideoAndDetectMoments` →
`generateMockTranscriptForVideo`) emits moments at generic timestamps (e.g. `gen_seg_4` @ 1450s,
`gen_seg_5` @ 2100s) that exceed a short real video (TED talk ≈ 1164s). The old clamp collapsed
every out-of-range moment onto the SAME tail window → duplicate/empty ~1.4s clips.

**Fix** (two layers, both in code):
- `src/lib/ai-moment-detection.ts`:
  - `analyzeVideoAndDetectMoments(metadata, count, dur, options?)` now takes
    `{ realDuration, realTranscript }`. When `realDuration` is known it calls
    `remapMomentsToRealDuration()`, which spreads `clipCount` windows **evenly** across
    `[0, realDuration - clipDuration]` and uses the REAL parsed transcript words for captions
    (falling back to the mock text shifted into the window only when no real transcript exists).
  - New `clampMomentsToDuration(moments, realDuration, clipDuration)` is a safety net applied to
    BOTH Claude and fallback moments: keeps every window in `[0, realDuration]`; if a window
    collapses, it re-spreads by index instead of piling onto the tail.
- `src/app/api/clipping/process/route.ts`:
  - Computes `realDuration` right after ingest (before moment selection).
  - Passes `realDuration` + the parsed `transcript` to the fallback call.
  - Applies `clampMomentsToDuration` to the moments before composing clips; removed the old
    clamp-on-clips block + TEMP DIAGNOSTIC.

Result: for the TED repro, all 3 clips are now distinct, full-length (~45s) windows inside the
real video, with real burned-in captions.

---

## 10. Re-verification (end-to-end)

```bash
# Fresh production server on :3000 (current compiled source):
npx next start -p 3000

# Job (TED talk repro from §7):
curl -X POST http://localhost:3000/api/clipping/process -H "Content-Type: application/json" -d '{...clipCount:3, clipDuration:45...}'
# -> 3 distinct .mp4 files in public/generated/, each ~45s, burned captions.
# ffprobe public/generated/clip_*.mp4   # all durations ≈ 45s (previously 1.4s for 2 of 3)
```

> Note: `ingest.ts`/`render.ts` previously used synchronous `execFileSync` for yt-dlp/ffmpeg, which
> blocked the Node event loop during the download+render. The server appeared "hung" (requests timed
> out) while a job ran. **This is now FIXED (see §11).**

---

## 11. Speed optimization — caption-first + async pipeline (2026-08-15)

Inspired by `bradautomates/claude-video` (caption-first ingestion: skip the video download
until you know which clips you want). Applied to vir-ai:

**Changes**
- `src/lib/server/ingest.ts`:
  - New `fetchCaptionsOnly(url)` — runs `yt-dlp --skip-download --write-subs
    --write-auto-subs` to grab the `.vtt` track ONLY (seconds, no full video).
  - `ingestVideo()` converted from `execFileSync` → async `execFile` (non-blocking).
- `src/lib/server/render.ts`:
  - `renderClip()` converted to async (non-blocking `execFile`); retry-without-
    subtitles preserved. `getVideoDuration()` converted to async `execFile`/ffprobe.
- `src/app/api/clipping/process/route.ts` — pipeline reordered:
  1. **Caption-first**: fetch captions (no video) → parse VTT (or live scrape).
  2. Score moments from the transcript (Claude or keyword fallback) — **no video
     needed yet**. Status polls stay responsive because nothing blocks the loop.
  3. **Lazy download**: only AFTER moments are selected, `ingestVideo()` pulls the
     video; exact duration re-clamps windows.
  4. **Parallel render**: all N clips rendered via `Promise.all` (independent ffmpeg
     child processes) instead of sequentially.
  - Caption order: try the **fast HTTP scrape** (`fetchRealCaptions`, ~1-3s) FIRST,
    fall back to the slower `yt-dlp --skip-download` subtitle fetch only if the
    scrape finds nothing. (This alone cut `fetching` from ~108s to ~10s on the
    TED repro — yt-dlp caption extraction was the bottleneck when run first.)

**Why this is faster**
- Analysis no longer waits on a ~30MB video download — scoring finishes in seconds.
- The server no longer freezes mid-job (status endpoint answers during download/render).
- 3 clips render concurrently (~1 clip's worth of time instead of 3× serial).

**Verified**: `npm run build` ✓, `npm test` ✓ (25/25). End-to-end TED repro on the
supervisor-respawned `next start` (current build): status polled every 3s returned in
~80ms throughout the job (proving non-blocking), and 3 distinct **45.0s** clips rendered.
Measured stages: fetching ≈10s (was ~108s), analyzing ≈32s, rendering ≈41s → **total
job ≈83s** (previously fetching alone exceeded 108s).

> Remaining optional speed-up not done here: `yt-dlp --download-sections` to fetch only
> the exact clip ranges (skip the full video entirely). Reliable but format-fiddly; the
> caption-first + parallel-render change already removes the main bottleneck.

---

## 12. Speech-to-text fallback for caption-less videos (2026-08-15)

**Problem it solves**: the original pipeline could only understand a video if YouTube
already had captions. Videos with NO captions (music, old uploads, foreign language,
captions disabled) silently fell back to a *mock* transcript → meaningless "best
moments" and wrong burned captions. There was no transcription of the actual audio
(ingest.ts extracted a `.wav` but never used it).

**Fix** — real speech-to-text via Groq's Whisper API (`whisper-large-v3`):
- `src/lib/server/transcribe.ts` (NEW): `transcribeAudio(audioPath)` POSTs the
  extracted audio to `https://api.groq.com/openai/v1/audio/transcriptions` with
  `response_format=verbose_json` + `timestamp_granularities[]=word`. Converts Groq's
  response into `TranscriptSegment[]` (prefers segment-level word timestamps, falls back
  to top-level words, then to a single plain-text segment). Returns `null` on any
  failure / missing key.
- `src/app/api/clipping/process/route.ts`: pipeline now branches on whether captions
  were found —
  - **Captioned video** → analyze first (caption-first, no download yet), download
    lazily at render (unchanged optimization).
  - **No captions + `GROQ_API_KEY` set** → download the video early to get the audio,
    transcribe it with Groq Whisper, then analyze from the REAL transcript.
  - **No captions + no key** → graceful mock-transcript fallback (unchanged).
- `.env.example`: documents `GROQ_API_KEY` (free key at console.groq.com). When unset,
  caption-less videos still render a real clip of the actual video (cut from the
  downloaded source) — only the *captions/moment-quality* degrade, never the footage.

**Why `groq_whisperer` was NOT used directly**: `Eigenwise/groq_whisperer` is a
*Python desktop tool* (records mic audio via a hotkey → copies text to clipboard). It is
not an npm package or a callable API, so it cannot run inside this Next.js pipeline. The
equivalent capability — Groq Whisper speech-to-text — is wired in directly via the Groq
REST API, which is exactly what that tool wraps.

**Verified**: `npm run build` ✓. End-to-end:
- No-caption video (Big Buck Bunny `aqz-KE-bpKQ`, no EN subs) → completed, rendered
  real clips from the actual downloaded video (`/generated/clip_1786789520155_1.mp4`).
  With `GROQ_API_KEY` unset it uses the mock transcript; SET it to get real speech.
- Captioned video (TED `iG9CE55wbtY`) → still works, real 20.0s 1080×1920 portrait MP4.
- The Groq path itself returns `null` gracefully without a key, so it cannot crash a job.

---

## 13. "Clip is not making" — download hardening + visible fallback (2026-08-15)

**Symptom reported**: pasting a YouTube link yields no clip of the user's video.

**Root cause found**: the backend DOES make clips for normal videos (verified: a real
pasted video `dQw4w9WgXcQ` produced `/generated/clip_1786790637617_1.mp4`). The failure
mode for *some* videos was `ingestVideo()` using a strict format filter
(`-f "22/best[ext=mp4]/..."`). When the video has no format 22 / no MP4 stream,
`yt-dlp` exits non-zero and `ingestVideo` returned `null` → **no source video → every
clip silently fell back to the bundled `/wind-blowing.mp4` sample**, which the user
reads as "no clip of my video."

**Fixes**
- `src/lib/server/ingest.ts`: if the strict-format download produces no file, retry
  with a plain `yt-dlp <url> -o <path>` (best available stream) instead of bailing to
  `null`. Also logs `[ingest] download failed for <url>: <reason>` so a failure is
  diagnosable (restricted / geo-blocked / network / outdated yt-dlp).
- `src/components/studio/Step6_ClipGallery.tsx`: when no clip points at a real
  `/generated/...` file, show an amber banner: "Couldn't download the source video…
  these clips use bundled sample footage" — so the fallback is never silent.

**Still-unaddressed (needs user input)**: if a specific URL still fails, it's one of:
age-restricted / members-only / geo-blocked (needs `yt-dlp --cookies`), a network block,
or an outdated `bin/yt-dlp.exe`. Provide the exact failing URL to reproduce, or add a
browser cookie export (see §14). Verified the happy path still works after this change.

---

## 14. For restricted videos: yt-dlp cookie support (optional, TODO)

Age-restricted / members-only videos can't be downloaded without authentication. Add a
`COOKIES_PATH` env var (path to a Netscape-format cookie file exported from a logged-in
browser, e.g. `yt-dlp --cookies-from-browser chrome` or a `cookies.txt` from a
cookie-extension) and pass `--cookies <path>` to every `runYtDlp` call in
`src/lib/server/ingest.ts`. Without it, those videos fall back to sample footage (§13).

---

## 7. How to reproduce / test

```bash
# The dev server is on :3000 (supervised). Start a job:
curl -X POST http://localhost:3000/api/clipping/process -H "Content-Type: application/json" -d '{
  "videoUrl":"https://www.youtube.com/watch?v=iG9CE55wbtY",
  "metadata":{"id":"iG9CE55wbtY","sourceUrl":"https://www.youtube.com/watch?v=iG9CE55wbtY",
    "title":"Ken Robinson: Do schools kill creativity?","channelName":"TED",
    "durationSeconds":1164,"formattedDuration":"19:24","hasAudio":true,"hasTranscript":true,
    "videoUrl":"/wind-blowing.mp4"},
  "format":"portrait","font":"Inter","style":"Bold","animation":"Word Reveal",
  "clipCount":3,"clipDuration":45
}'
# returns { jobId }. Poll:
curl http://localhost:3000/api/clipping/status/<jobId>
# Inspect outputs:
ls -la public/generated/            # expect 3 real .mp4 files
ffprobe public/generated/clip_*.mp4 # check durations (should all be ~45s once clamp works)
```

Binaries used: `bin/yt-dlp.exe`, and `ffmpeg`/`ffprobe` at
`C:/Users/ANKIT KUMAR/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_.../ffmpeg-9.0-full_build/bin/`.

---

## 8. Notes / gotchas
- `AGENTS.md` warns "this is NOT the Next.js you know" and says to read `node_modules/next/dist/docs`
  before writing code. Standard App Router patterns were used and the dev server compiles, but the
  Turbopack hot-reload behavior in this environment is non-standard (see §5).
- `yt-dlp` is **not** on `PATH` — it is resolved only via `bin/yt-dlp.exe` (handled by `findYtDlp`).
- Big Buck Bunny (`aqz-KE-bpKQ`) has **no English subtitles**, so it exercises the mock fallback
  path correctly. Use captioned videos (e.g. TED talks) to test the real VTT → Claude → render path.

## 15. CRITICAL: `next start` stale-server trap (caused the "can't make a clip" bug)
- A `next start` process serves the **in-memory copy** of `.next` loaded at boot. Rebuilding `.next`
  on disk does NOT update a running server — it keeps serving the old build.
- `pkill -f "next start"` **does not match** the real worker. Its cmdline is
  `node .../next/dist/bin/next" start -p 3000` (quoted), so the substring `next start` never matches.
  Only `pkill -f "npx-cli.js next"` matches the npx wrapper, leaving the real `next/dist/bin/next`
  worker alive — which then keeps port 3000 and serves stale code. This masked the `toLowerCase`
  guard fix for an entire session.
- **Correct way to restart during debugging:** kill by exact PID using the port owner:
  ```powershell
  $pid = (Get-NetTCPConnection -LocalPort 3000 | Select-Object -First 1 OwningProcess).OwningProcess
  Stop-Process -Id $pid -Force
  Start-Process cmd.exe -ArgumentList "/c","npx next start -p 3000 > server.log 2>&1" -NoNewWindow
  ```
- Also note a VS Code supervisor (`language_server_windows_x64.exe`) may auto-respawn `next start`
  on :3000, so the port owner PID can change between runs — always re-check before testing.
- Symptom of a stale server: a bug you "fixed in source + rebuilt" keeps reproducing with the exact
  same minified stack offset. Kill the port owner by PID and restart.

## 16. Env activation
- `.env.example` is **NOT** auto-loaded by Next.js. Keys only take effect from `.env` / `.env.local`.
  A working `.env.local` (copied from `.env.example`) now exists in this repo so GROQ Whisper and the
  Anthropic token are active.
- `scoreMomentsWithClaude` returns `null` immediately when `ANTHROPIC_BASE_URL` is empty (safe
  fallback to the keyword scorer) — so an empty base URL never crashes/hangs the pipeline.
- `ANTHROPIC_BASE_URL` is intentionally empty in `.env.example` (the bundled token is not a live
  Anthropic endpoint), so moment scoring uses the deterministic keyword scorer; real transcript
  text still comes from YouTube captions or Groq Whisper.

## 17. CRITICAL: `next start` does NOT serve runtime-created `public/` files
- Symptom: the API renders a clip to `public/generated/clip_*.mp4` (file exists on disk, job
  reports `completed`), but the browser `<video src="/generated/...mp4">` gets **HTTP 404** and the
  player shows a blank gradient ("it's not generating a clip"). This happens for EVERY video because
  clips are always written after the server boots.
- Root cause: `next start` (production) takes a snapshot of `public/` at startup and will not serve
  files created afterward. Files that existed at boot serve fine (200); anything generated later 404s.
  Verified: an old clip served 200 while freshly-generated clips returned 404 on the same running server.
- Fix: render output still lands in `public/generated/`, but clips are served via a dynamic route
  `src/app/api/clips/[file]/route.ts` that reads from disk per-request (bypasses the static cache).
  `route.ts` now sets `videoUrl: /api/clips/<id>.mp4`; `Step6_ClipGallery` treats `/api/clips/` and
  `/generated/` as real clips for the sample-footage check. After this change, freshly generated
  clips serve HTTP 200 `video/mp4`.
- Do NOT revert clips back to `/generated/` static paths — that reintroduces the 404.
- To manually verify serving after any change: generate a clip, then
  `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/clips/clip_<id>.mp4` → expect 200.

## 18. Feature: orientation-locked portrait output + single best moment → 3 clips
User requirement (PRD): the Portrait/Landscape toggle must ONLY change how the portrait video is
*presented on screen* — it must NEVER change the actual portrait orientation of the exported clip.
Both modes export a **1080×1920** vertical short. In addition, the system must take the full
transcript, run **semantic analysis** (context, topic, narrative, emotional peaks, important
statements, surprising moments, hooks) to find the high-value moments, then generate a
**user-chosen number of clips (3 / 5 / 7 presets)** — each from a DIFFERENT moment across the video,
each presented as a different scene type (hook, emotional peak, surprise, key statement, …).

### Orientation lock (render.ts)
- Both modes now output 1080×1920 — the landscape "letterbox" misconception (1920×1080) was removed.
- Portrait mode = `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:...` (cover,
  full-bleed, crop around `activeSpeakerFocus` focus point).
- Landscape mode = `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:
  (oh-ih)/2:color=0x0a0f1c` (contain: portrait video fit inside the 1080×1920 frame, centered, dark
  `#0a0f1c` background fills the rest). Never cropped, never stretched, never rotated.
- `fx/fy` framing focus derived from `clip.activeSpeakerFocus.{x,y}` clamped to [0.05,0.95].
- Subtitle burn-in + no-subtitle retry logic preserved; only the base filter string changed.

### Semantic detection + scene types (ai-scoring.ts + ai-moment-detection.ts)
- `scoreMomentsWithClaude(transcript, count, clipDuration, title)` (ai-scoring.ts): prompts Claude to
  first understand the whole video (context/topic/narrative/emotional peaks/hooks/surprises), then
  return up to `count` distinct, non-overlapping moments, each tagged with a `category` (scene type)
  from {hook, emotional_peak, surprising, important_statement, story, conflict, insight, climax, other}.
  Returns `CandidateMoment[]` with `sceneType` set, or `null` when `ANTHROPIC_BASE_URL`/token absent.
- `detectMomentsWithSemanticAnalysis(transcript, metadata, {count, clipDuration, realDuration,
  realTranscript})` (ai-moment-detection.ts): calls the LLM variant when available; else falls back to
  the keyword `analyzeVideoAndDetectMoments` spread across the video, with `inferSceneType()` guessing
  each moment's scene type from its text.
- `generateClipsFromMoments(moments, config)`: one `GeneratedClip` per moment. Each clip's PRESENTATION
  (style, caption position, animation, color, reframing focus) is driven by its `sceneType` via the
  `SCENE_PRESETS` map, so the N clips read as different kinds of shorts. `SCENE_LABELS` (shared in
  `clip-types.ts`) renders a human label in the player.

### Wiring (clipping/process/route.ts)
- Always ensures a transcript (real captions/Whisper, else mock) before detection.
- `detectMomentsWithSemanticAnalysis(analysisTranscript, metadata, {count: clipCount, clipDuration,
  realDuration: roughDuration})` → `clampMomentsToDuration(moments, exactDuration, clipDuration)` →
  `generateClipsFromMoments(clamped, {...})`.
- Clip count = user-chosen `config.clipCount` (Step 4 presets 3/5/7; UI default is 3). Not fixed.
- `detectBestMomentWithClaude` is now unused (superseded by multi-moment `scoreMomentsWithClaude`);
  left exported for reference. `buildGeneratedClipsFromMoments` / `pickBestSegment` /
  `detectSingleBestMoment` / `generateThreeClipsFromMoment` were removed.

### UX (Step2_Format.tsx, ClipPlayerCanvas.tsx)
- Step2 copy updated: Portrait = "covers the full portrait frame"; Landscape = "9:16 · Centered"
  (contained + background, never cropped). Both show "1080 × 1920 resolution".
- ClipPlayerCanvas: `isPortrait = true` (always), score tag shows "9:16 Portrait" / "9:16 Portrait ·
  Centered" so the player frame stays vertical in both modes.

### Verification
- `POST /api/youtube/fetch` → `POST /api/clipping/process` (format portrait AND landscape) → poll
  status → expect `generatedClips.length === 3`, every `videoUrl` starts with `/api/clips/`, and
  `curl .../api/clips/<id>.mp4` → 200. `ffprobe` a clip per mode → `width=1080, height=1920`.
- NOTE: `ANTHROPIC_BASE_URL` is empty here, so the single-best-moment path uses the keyword-scorer
  fallback (best segment). Adding a real `ANTHROPIC_BASE_URL` enables true LLM semantic selection;
  all downstream behavior (3 clips, portrait export) is identical.
