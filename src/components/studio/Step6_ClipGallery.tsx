"use client";

import { useState } from "react";
import { GeneratedClip } from "@/lib/clip-types";
import ClipPlayerCanvas from "./ClipPlayerCanvas";
import { Download, Sliders, Sparkles, Trophy, Clock, CheckCircle2, Play, Share2 } from "lucide-react";
import confetti from "canvas-confetti";

interface Step6Props {
  clips: GeneratedClip[];
  onEditClip: (clip: GeneratedClip) => void;
  onReset: () => void;
}

export default function Step6_ClipGallery({ clips, onEditClip, onReset }: Step6Props) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // If none of the clips point at a real rendered file, the pipeline fell back
  // to bundled sample footage (the source video couldn't be downloaded — e.g.
  // age-restricted / members-only / geo-blocked / network). Surface that here
  // instead of silently showing a clip that isn't the user's video.
  const isGeneratedClip = (u?: string) =>
    u?.startsWith("/api/clips/") || u?.startsWith("/generated/");
  const usedSampleFootage = clips.some((c) => !isGeneratedClip(c.videoUrl));

  const handleDownload = (clip: GeneratedClip) => {
    setDownloadingId(clip.id);

    // Trigger confetti celebration!
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
    });

    // Download the actual generated clip footage (real MP4 source segment)
    setTimeout(() => {
      const safeName = clip.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const element = document.createElement("a");

      if (clip.videoUrl) {
        element.href = clip.videoUrl;
        element.download = `${safeName}_${clip.format}.mp4`;
      } else {
        // Fallback: export clip metadata when no footage is available
        const file = new Blob(
          [
            `VIR AI Studio Generated Clip\nTitle: ${clip.title}\nAI Score: ${clip.score.overallScore}\nTimestamp: ${formatTime(clip.startTime)} - ${formatTime(clip.endTime)}\nFormat: ${clip.format}\nFont: ${clip.font}\nStyle: ${clip.style}\nAnimation: ${clip.animation}\n\nTranscript:\n${clip.summary}`,
          ],
          { type: "text/plain" }
        );
        element.href = URL.createObjectURL(file);
        element.download = `${safeName}_${clip.format}.txt`;
      }

      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloadingId(null);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4">
      {usedSampleFootage && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/40 p-4 text-xs text-amber-200">
          <strong className="font-bold">⚠ Couldn't download the source video.</strong>{" "}
          These clips use bundled sample footage, not your video. This usually means the
          URL is age-restricted, members-only, geo-blocked, or yt-dlp couldn't fetch it.
          Try a public video, or add cookies for restricted videos (see setup notes).
        </div>
      )}
      {/* Header Banner */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-[#0d1322] to-[#0a0f1c] p-6 text-center shadow-2xl sm:flex-row sm:text-left">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-xl shadow-emerald-500/30">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                AI MOMENT SELECTION COMPLETE
              </span>
              <span className="text-xs text-gray-400 font-mono">{clips.length} Clips Generated</span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold text-white">Your AI Generated Short Clips</h2>
            <p className="mt-0.5 text-xs text-gray-300">
              Highest quality moments ranked by AI engagement, emotional interest, and content value signals.
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:border-slate-500 hover:text-white"
        >
          Process Another Video
        </button>
      </div>

      {/* Clip Gallery Grid (PRD Section 24) */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
        {clips.map((clip, index) => (
          <div
            key={clip.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#1f293d] bg-gradient-to-b from-[#0d1322] to-[#0a0f1c] p-6 shadow-2xl transition-all duration-300 hover:border-[#0488C5]/50"
          >
            {/* Top Rank Badge & Title */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#0488C5] to-[#526EF5] px-3 py-1 text-xs font-extrabold text-white shadow-md">
                  Clip #{index + 1}
                </span>

                {/* AI Score Badge (PRD Section 14) */}
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-0.5 font-mono text-xs font-black text-emerald-400">
                    AI Score {clip.score.overallScore}
                  </span>
                  <span className="font-mono text-xs text-gray-400">
                    {formatTime(clip.startTime)} – {formatTime(clip.endTime)}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-extrabold text-white line-clamp-1">{clip.title}</h3>
              <p className="mt-1 text-xs text-gray-400 line-clamp-2">{clip.summary}</p>

              {/* AI Score Breakdown telemetry */}
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-slate-800 bg-[#070b14]/80 p-2.5 text-center text-[10px]">
                <div>
                  <span className="text-gray-400">Engagement</span>
                  <p className="font-mono font-bold text-sky-400">{clip.score.engagement}/100</p>
                </div>
                <div>
                  <span className="text-gray-400">Content Value</span>
                  <p className="font-mono font-bold text-indigo-400">{clip.score.contentValue}/100</p>
                </div>
                <div>
                  <span className="text-gray-400">Completeness</span>
                  <p className="font-mono font-bold text-emerald-400">{clip.score.completeness}/100</p>
                </div>
              </div>

              {/* Interactive Video Player Canvas */}
              <div className="mt-4">
                <ClipPlayerCanvas clip={clip} autoPlay={index === 0} />
              </div>
            </div>

            {/* Action Buttons: Download & Edit */}
            <div className="mt-6 flex items-center gap-3 border-t border-slate-800/80 pt-4">
              <button
                onClick={() => handleDownload(clip)}
                disabled={downloadingId === clip.id}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0488C5] to-[#526EF5] py-3 text-xs font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="h-4 w-4" />
                <span>{downloadingId === clip.id ? "Preparing MP4..." : "Download MP4"}</span>
              </button>

              <button
                onClick={() => onEditClip(clip)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs font-bold text-gray-300 hover:border-slate-500 hover:text-white"
              >
                <Sliders className="h-4 w-4 text-sky-400" />
                <span>Edit Clip</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
