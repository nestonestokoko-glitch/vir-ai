"use client";

import { VideoFormat } from "@/lib/clip-types";
import { Smartphone, Monitor, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

interface Step2Props {
  format: VideoFormat;
  onFormatChange: (format: VideoFormat) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2_Format({ format, onFormatChange, onNext, onBack }: Step2Props) {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-400">
          <span>Step 2 of 4 • Select Output Composition</span>
        </div>
        <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
          Choose Your Video Format
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Clips always export in vertical 9:16. Portrait fills the frame; Landscape centers the video with a background.
        </p>
      </div>

      {/* Format Selection Cards (PRD Section 6) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Option 1: Portrait 9:16 */}
        <button
          onClick={() => onFormatChange("portrait")}
          className={`group relative flex flex-col items-center justify-between rounded-2xl border p-6 text-center transition-all ${
            format === "portrait"
              ? "border-[#0488C5] bg-[#0488C5]/10 shadow-2xl shadow-[#0488C5]/20 ring-2 ring-[#0488C5]"
              : "border-[#1f293d] bg-[#0d1322] hover:border-gray-600 hover:bg-[#0f172a]"
          }`}
        >
          {format === "portrait" && (
            <div className="absolute top-3 right-3 text-[#0488C5]">
              <CheckCircle2 className="h-6 w-6 fill-current text-[#0488C5]" />
            </div>
          )}

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0488C5] to-sky-500 text-white shadow-lg">
            <Smartphone className="h-6 w-6" />
          </div>

          <div className="mt-5">
            <span className="inline-block rounded bg-sky-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-sky-400">
              9:16 Portrait
            </span>
            <h3 className="mt-2 text-xl font-extrabold text-white">Vertical Reels & Shorts</h3>
            <p className="mt-1 font-mono text-xs text-gray-400">1080 × 1920 resolution</p>
            <p className="mt-3 text-xs text-gray-300">
              Video covers the full portrait frame. Optimized for Instagram Reels, YouTube Shorts, TikTok, and mobile viewing.
            </p>
          </div>

          {/* Canvas Ratio Mock */}
          <div className="mt-6 flex h-36 w-20 items-center justify-center rounded-xl border border-sky-500/40 bg-black shadow-inner">
            <div className="h-full w-full rounded-lg bg-gradient-to-b from-sky-950/60 to-slate-900 p-2 flex flex-col justify-end">
              <div className="h-3 w-full rounded bg-sky-400/80 mb-2 animate-pulse" />
            </div>
          </div>
        </button>

        {/* Option 2: Landscape 16:9 */}
        <button
          onClick={() => onFormatChange("landscape")}
          className={`group relative flex flex-col items-center justify-between rounded-2xl border p-6 text-center transition-all ${
            format === "landscape"
              ? "border-[#526EF5] bg-[#526EF5]/10 shadow-2xl shadow-[#526EF5]/20 ring-2 ring-[#526EF5]"
              : "border-[#1f293d] bg-[#0d1322] hover:border-gray-600 hover:bg-[#0f172a]"
          }`}
        >
          {format === "landscape" && (
            <div className="absolute top-3 right-3 text-[#526EF5]">
              <CheckCircle2 className="h-6 w-6 fill-current text-[#526EF5]" />
            </div>
          )}

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#526EF5] to-indigo-600 text-white shadow-lg">
            <Monitor className="h-6 w-6" />
          </div>

          <div className="mt-5">
            <span className="inline-block rounded bg-indigo-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-indigo-400">
              9:16 · Centered
            </span>
            <h3 className="mt-2 text-xl font-extrabold text-white">Centered (Letterbox)</h3>
            <p className="mt-1 font-mono text-xs text-gray-400">1080 × 1920 resolution</p>
            <p className="mt-3 text-xs text-gray-300">
              Portrait video contained and centered with a background — never cropped or stretched to landscape.
            </p>
          </div>

          {/* Canvas Ratio Mock */}
          <div className="mt-6 flex h-24 w-40 items-center justify-center rounded-xl border border-indigo-500/40 bg-black shadow-inner">
            <div className="h-full w-full rounded-lg bg-gradient-to-r from-indigo-950/60 to-slate-900 p-2 flex flex-col justify-end">
              <div className="h-3 w-3/4 mx-auto rounded bg-indigo-400/80 mb-1 animate-pulse" />
            </div>
          </div>
        </button>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-gray-300 hover:border-slate-500 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0488C5] to-[#526EF5] px-6 py-3.5 text-sm font-bold text-white shadow-xl hover:scale-105"
        >
          <span>Next: Typography & Styles</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
