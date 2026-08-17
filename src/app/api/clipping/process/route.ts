import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import { ProcessingJob, ClippingProjectConfig, GeneratedClip, CandidateMoment } from "@/lib/clip-types";
import { fetchVideoMetadata, generateMockTranscriptForVideo } from "@/lib/youtube";
import {
  detectMomentsWithSemanticAnalysis,
  generateClipsFromMoments,
  clampMomentsToDuration,
} from "@/lib/ai-moment-detection";
import { fetchRealCaptions, parseVtt } from "@/lib/server/captions";
import { ingestVideo, fetchCaptionsOnly } from "@/lib/server/ingest";
import { transcribeAudio } from "@/lib/server/transcribe";
import { renderClip, getVideoDuration } from "@/lib/server/render";
import { saveJob, getJob } from "@/lib/server/jobStore";

export async function POST(req: NextRequest) {
  try {
    const config: ClippingProjectConfig = await req.json();

    if (!config.videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required." },
        { status: 400 }
      );
    }

    const metadata = config.metadata || (await fetchVideoMetadata(config.videoUrl));
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const clipCount = config.customClipCount || config.clipCount || 3;
    const clipDuration = config.clipDuration || 45;

    const initialJob: ProcessingJob = {
      id: jobId,
      videoId: metadata.id,
      videoMetadata: metadata,
      status: "queued",
      progressPercentage: 5,
      currentStepMessage: "Job queued in processing pipeline...",
      requestedClipsCount: clipCount,
      targetDurationSeconds: clipDuration,
      format: config.format || "portrait",
      font: config.font || "Inter",
      style: config.style || "Bold",
      animation: config.animation || "Word Reveal",
      generatedClips: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Persisted so the status endpoint can re-drive this job if the
      // serverless runtime freezes the background work after the response.
      config,
      metadata,
    };

    await saveJob(initialJob);

    // Detect serverless reliably. `NETLIFY` is supposed to be injected, but be
    // defensive: Netlify also sets CONTEXT / DEPLOY_URL / URL in the function
    // runtime, so any of these means we're on serverless and must await.
    const IS_SERVERLESS = !!(
      process.env.NETLIFY ||
      process.env.CONTEXT ||
      process.env.DEPLOY_URL ||
      process.env.NETLIFY_DEV
    );

    // On serverless the runtime freezes background work after the HTTP response
    // is sent, so a fire-and-forget job would never finish and the UI would hang
    // forever. Await it here so the function stays alive until the job is
    // complete. The no-binary path (no yt-dlp/ffmpeg) is fast and the external
    // network calls are bounded by timeouts, so this stays within the function
    // timeout. Locally we keep it fire-and-forget so the dev server stays
    // responsive during long video downloads.
    if (IS_SERVERLESS) {
      await processJobAsync(jobId, config, metadata, clipCount, clipDuration);
    } else {
      processJobAsync(jobId, config, metadata, clipCount, clipDuration);
    }

    return NextResponse.json({
      success: true,
      jobId,
      job: initialJob,
      // TEMP diagnostic — removed after verifying serverless detection.
      _env: {
        NETLIFY: process.env.NETLIFY,
        CONTEXT: process.env.CONTEXT,
        DEPLOY_URL: process.env.DEPLOY_URL ? "set" : undefined,
        URL: process.env.URL ? "set" : undefined,
        serverless: IS_SERVERLESS,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to start AI clipping job." },
      { status: 500 }
    );
  }
}

export async function getJobById(jobId: string): Promise<ProcessingJob | undefined> {
  return getJob(jobId);
}

export async function processJobAsync(
  jobId: string,
  config: ClippingProjectConfig,
  metadata: any,
  clipCount: number,
  clipDuration: number
) {
  const updateJob = async (updates: Partial<ProcessingJob>) => {
    const existing = await getJob(jobId);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      await saveJob(updated);
    }
  };

  try {
    // ── Stage 1: Caption-first fetch (no video download yet) ─────────────────
    // Grab ONLY the subtitle track — no full-video download — so we can score
    // the best moments immediately for captioned videos.
    await updateJob({
      status: "fetching",
      progressPercentage: 15,
      currentStepMessage: "Fetching captions (caption-first — skipping full video download)...",
    });

    // Fast path first: scrape YouTube's public timedtext captions over HTTP
    // (~1-3s). Fall back to a yt-dlp subtitle download only if the scrape finds
    // nothing — the yt-dlp path is slower but handles videos without web captions.
    let transcript = await fetchRealCaptions(config.videoUrl).catch(() => null);
    if (!transcript || transcript.length === 0) {
      const captionPath = await fetchCaptionsOnly(config.videoUrl).catch(() => null);
      if (captionPath && fs.existsSync(captionPath)) {
        transcript = parseVtt(fs.readFileSync(captionPath, "utf8"));
      }
    }
    const hasCaptions = !!(transcript && transcript.length > 0);
    const roughDuration =
      typeof metadata?.durationSeconds === "number" ? metadata.durationSeconds : null;

    // ── Stage 2: For caption-less videos, we MUST download the audio first so
    // we can transcribe the real speech (Groq Whisper) before picking moments.
    // Captioned videos skip straight to analysis (true caption-first).
    let ingest: Awaited<ReturnType<typeof ingestVideo>> | null = null;
    let sourceVideoPath: string | null = null;

    if (hasCaptions) {
      await updateJob({
        status: "transcribing",
        progressPercentage: 30,
        currentStepMessage: "Real captions retrieved — aligning words & speakers...",
      });
    } else if (process.env.GROQ_API_KEY) {
      await updateJob({
        status: "transcribing",
        progressPercentage: 30,
        currentStepMessage: "No captions found — downloading audio to transcribe with Groq Whisper...",
      });
      ingest = await ingestVideo(config.videoUrl).catch(() => null);
      sourceVideoPath = ingest?.videoPath ?? null;
      if (ingest?.audioPath) {
        const whisper = await transcribeAudio(ingest.audioPath).catch(() => null);
        if (whisper && whisper.length > 0) transcript = whisper;
      }
    } else {
      await updateJob({
        status: "transcribing",
        progressPercentage: 30,
        currentStepMessage: "No captions found — using fallback transcript for analysis...",
      });
    }

    const finalTranscript = transcript && transcript.length > 0 ? transcript : null;

    // ── Stage 3: AI moment detection — full semantic analysis via Claude (when
    // configured) or the keyword scorer. Finds distinct high-value moments across
    // the video, each tagged with a scene type. Runs off the transcript (captions
    // OR transcribed audio). ───────────────────────────────────────────────────
    await updateJob({
      status: "analyzing",
      progressPercentage: 55,
      currentStepMessage: "AI analyzing narrative, hooks, emotional peaks & high-value moments...",
    });

    // Always have a transcript to analyze so detection can run on the full text.
    const analysisTranscript =
      finalTranscript && finalTranscript.length ? finalTranscript : generateMockTranscriptForVideo(metadata);

    // Detect the distinct high-value moments (different scenes across the video).
    // Each is tagged with a semantic scene type by the LLM (or inferred in the
    // keyword fallback), and re-clamped to the exact video duration after download.
    const moments: CandidateMoment[] = await detectMomentsWithSemanticAnalysis(
      analysisTranscript,
      metadata,
      { realDuration: roughDuration, clipDuration, count: clipCount }
    );

    // ── Stage 4: per-moment clip generation ─────────────────────────────────
    await updateJob({
      status: "selecting",
      progressPercentage: 70,
      currentStepMessage: `Building ${clipCount} distinct scene-type clips from detected moments...`,
    });

    // ── Lazy download for captioned videos: only NOW pull the video, after we
    // know what to cut (caption-first optimization). Caption-less videos already
    // downloaded above to obtain audio for transcription.
    if (!sourceVideoPath) {
      ingest = await ingestVideo(config.videoUrl).catch(() => null);
      sourceVideoPath = ingest?.videoPath ?? null;
    }

    // Confirm the EXACT duration and re-clamp moments so windows match the real
    // video (the estimate above can be off for generic/unknown URLs).
    const exactDuration =
      (sourceVideoPath ? await getVideoDuration(sourceVideoPath) : null) ?? roughDuration;

    // Re-clamp the moments to the EXACT video duration, then build one clip per
    // moment — each clip's framing/captions are driven by its scene type.
    const clampedMoments = clampMomentsToDuration(moments, exactDuration, clipDuration);
    const generatedClips = generateClipsFromMoments(clampedMoments, {
      format: config.format || "portrait",
      font: config.font || "Inter",
      style: config.style || "Bold",
      animation: config.animation || "Word Reveal",
      metadata,
      clipDuration,
      realDuration: exactDuration,
    });

    // ── Stage 5: render every clip concurrently (independent ffmpeg child
    // processes), so the N cuts finish in roughly the time of one. ────────────
    await updateJob({
      status: "rendering",
      progressPercentage: 80,
      currentStepMessage: "Rendering selected clips in parallel...",
    });

    const finalClips: GeneratedClip[] = await Promise.all(
      generatedClips.map(async (clip: GeneratedClip) => {
        if (sourceVideoPath) {
          const rendered = await renderClip(clip, sourceVideoPath);
          if (rendered) {
            return { ...clip, videoUrl: `/api/clips/${clip.id}.mp4` };
          }
        }
        // Fallback: preview uses the bundled sample footage.
        return { ...clip, videoUrl: metadata.videoUrl || clip.videoUrl };
      })
    );

    await updateJob({
      status: "completed",
      progressPercentage: 100,
      currentStepMessage: sourceVideoPath
        ? "Generated clips ready for preview & download!"
        : "Generated clips with bundled preview footage (source unavailable).",
      generatedClips: finalClips,
    });
  } catch (err: any) {
    console.error("[clipping] processJobAsync failed:", err?.message || err);
    await updateJob({
      status: "failed",
      error: err?.message || "AI processing pipeline failed.",
      currentStepMessage: "Processing failed. Please try again.",
    });
  }
}
