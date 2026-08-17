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
    <div className="mx-auto max-w-4xl space-y-10 py-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3.5 py-1 text-xs font-semibold text-cyan">
          <span>Step 2 of 4 • Select Output Composition</span>
        </div>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Choose Your Video Format
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-ink-secondary sm:text-base">
          Clips always export in vertical 9:16. Portrait fills the frame; Landscape centers the video with a background.
        </p>
      </div>

      {/* Format Selection Cards (PRD Section 6) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Option 1: Portrait 9:16 */}
        <button
          onClick={() => onFormatChange("portrait")}
          className={`group relative flex flex-col items-center justify-between rounded-[24px] border border-brand-border bg-surface p-6 text-center shadow-card-inset transition-all duration-200 ${
            format === "portrait"
              ? "border-brand-light bg-brand-light/15 ring-2 ring-brand-light"
              : "border-brand-border bg-surface hover:border-ink-muted/40 hover:bg-elevated"
          }`}
        >
          {format === "portrait" && (
            <div className="absolute right-3 top-3 text-cyan">
              <CheckCircle2 className="h-6 w-6 fill-current" />
            </div>
          )}

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-ink shadow-brand">
            <Smartphone className="h-6 w-6" />
          </div>

          <div className="mt-5">
            <span className="inline-block rounded bg-brand-light/20 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan">
              9:16 Portrait
            </span>
            <h3 className="mt-2 text-xl font-bold text-ink">Vertical Reels & Shorts</h3>
            <p className="mt-1 font-mono text-xs text-ink-muted">1080 × 1920 resolution</p>
            <p className="mt-3 text-xs text-ink-secondary">
              Video covers the full portrait frame. Optimized for Instagram Reels, YouTube Shorts, TikTok, and mobile viewing.
            </p>
          </div>

          {/* Canvas Ratio Mock */}
          <div className="mt-6 flex h-36 w-20 items-center justify-center rounded-xl border border-brand-light/40 bg-black shadow-inner">
            <div className="flex h-full w-full flex-col justify-end rounded-lg bg-gradient-to-b from-brand/40 to-elevated p-2">
              <div className="mb-2 h-3 w-full animate-pulse rounded bg-cyan/70" />
            </div>
          </div>
        </button>

        {/* Option 2: Landscape 16:9 */}
        <button
          onClick={() => onFormatChange("landscape")}
          className={`group relative flex flex-col items-center justify-between rounded-[24px] border border-brand-border bg-surface p-6 text-center shadow-card-inset transition-all duration-200 ${
            format === "landscape"
              ? "border-brand-light bg-brand-light/15 ring-2 ring-brand-light"
              : "border-brand-border bg-surface hover:border-ink-muted/40 hover:bg-elevated"
          }`}
        >
          {format === "landscape" && (
            <div className="absolute right-3 top-3 text-cyan">
              <CheckCircle2 className="h-6 w-6 fill-current" />
            </div>
          )}

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-ink shadow-brand">
            <Monitor className="h-6 w-6" />
          </div>

          <div className="mt-5">
            <span className="inline-block rounded bg-brand-light/20 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan">
              9:16 · Centered
            </span>
            <h3 className="mt-2 text-xl font-bold text-ink">Centered (Letterbox)</h3>
            <p className="mt-1 font-mono text-xs text-ink-muted">1080 × 1920 resolution</p>
            <p className="mt-3 text-xs text-ink-secondary">
              Portrait video contained and centered with a background — never cropped or stretched to landscape.
            </p>
          </div>

          {/* Canvas Ratio Mock */}
          <div className="mt-6 flex h-24 w-40 items-center justify-center rounded-xl border border-brand-light/40 bg-black shadow-inner">
            <div className="flex h-full w-full flex-col justify-end rounded-lg bg-gradient-to-r from-brand/40 to-elevated p-2">
              <div className="mx-auto mb-1 h-3 w-3/4 animate-pulse rounded bg-cyan/70" />
            </div>
          </div>
        </button>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-brand-border bg-elevated px-5 py-3 text-sm font-semibold text-ink-secondary transition-colors hover:border-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-ink shadow-brand transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-brand-glow"
        >
          <span>Next: Typography & Styles</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
