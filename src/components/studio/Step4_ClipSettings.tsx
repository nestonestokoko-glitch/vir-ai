"use client";

import { useState } from "react";
import { Sliders, Clock, Film, Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";

interface Step4Props {
  clipCount: number;
  clipDuration: number;
  onClipCountChange: (count: number) => void;
  onClipDurationChange: (duration: number) => void;
  onStartAnalysis: () => void;
  onBack: () => void;
}

const PRESET_COUNTS = [3, 5, 7];
const DURATIONS: number[] = [30, 45, 60];
const MAX_CUSTOM_DURATION = 180;

export default function Step4_ClipSettings({
  clipCount,
  clipDuration,
  onClipCountChange,
  onClipDurationChange,
  onStartAnalysis,
  onBack,
}: Step4Props) {
  const [isCustom, setIsCustom] = useState(!PRESET_COUNTS.includes(clipCount));
  const [customVal, setCustomVal] = useState(clipCount);
  const isCustomDuration = !DURATIONS.includes(clipDuration);
  const [customDur, setCustomDur] = useState(clipDuration);

  return (
    <div className="mx-auto max-w-4xl space-y-10 py-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3.5 py-1 text-xs font-semibold text-cyan">
          <span>Step 4 of 4 • Clip Generation Parameters</span>
        </div>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Set Clip Quantity & Max Duration
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-ink-secondary sm:text-base">
          Choose how many clips to generate. The AI scans the full video for distinct high-value scenes — hooks, emotional peaks, surprising moments, key statements — and builds a different short from each.
        </p>
      </div>

      {/* 1. Clip Quantity Selection (PRD Section 10) */}
      <div className="rounded-[24px] border border-brand-border bg-surface p-6 shadow-card-inset">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-cyan" />
            <h3 className="text-base font-bold text-ink">Select Number of Clips</h3>
          </div>
          <span className="font-mono text-xs text-cyan">Selected: {clipCount} Clips</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          {PRESET_COUNTS.map((cnt) => (
            <button
              key={cnt}
              onClick={() => {
                setIsCustom(false);
                onClipCountChange(cnt);
              }}
              className={`relative flex flex-col items-center justify-center rounded-xl border p-4 transition-all duration-200 ${
                !isCustom && clipCount === cnt
                  ? "border-brand-light bg-brand-light/15 ring-2 ring-brand-light"
                  : "border-brand-border bg-deep hover:border-ink-muted/40"
              }`}
            >
              {!isCustom && clipCount === cnt && (
                <div className="absolute right-2 top-2 text-cyan">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
              )}
              <span className="text-2xl font-bold text-ink">{cnt}</span>
              <span className="text-[11px] font-semibold text-ink-secondary">Clips</span>
            </button>
          ))}

          {/* Custom count toggle */}
          <button
            onClick={() => setIsCustom(true)}
            className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-all duration-200 ${
              isCustom
                ? "border-brand-light bg-brand-light/15 ring-2 ring-brand-light"
                : "border-brand-border bg-deep hover:border-ink-muted/40"
            }`}
          >
            <span className="text-sm font-bold text-ink">Custom</span>
            <span className="text-[10px] text-ink-secondary">Limit 1–15</span>
          </button>
        </div>

        {isCustom && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-brand-border bg-deep p-3">
            <span className="text-xs font-medium text-ink-secondary">Custom Quantity:</span>
            <input
              type="number"
              min={1}
              max={15}
              value={customVal}
              onChange={(e) => {
                const v = Math.min(15, Math.max(1, Number(e.target.value)));
                setCustomVal(v);
                onClipCountChange(v);
              }}
              className="w-20 rounded-lg border border-brand-border bg-deep px-3 py-1.5 text-center text-sm font-bold text-ink focus:border-brand-light focus:outline-none"
            />
            <span className="text-xs text-ink-muted">clips (safely bounded)</span>
          </div>
        )}
      </div>

      {/* 2. Clip Duration Selection (PRD Section 11) */}
      <div className="rounded-[24px] border border-brand-border bg-surface p-6 shadow-card-inset">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan" />
            <h3 className="text-base font-bold text-ink">Target Clip Duration</h3>
          </div>
          <span className="font-mono text-xs text-cyan">Max: 60s per clip</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {DURATIONS.map((dur) => (
            <button
              key={dur}
              onClick={() => onClipDurationChange(dur)}
              className={`relative flex flex-col items-center justify-center rounded-xl border p-5 transition-all duration-200 ${
                clipDuration === dur
                  ? "border-brand-light bg-brand-light/15 ring-2 ring-brand-light"
                  : "border-brand-border bg-deep hover:border-ink-muted/40"
              }`}
            >
              {clipDuration === dur && (
                <div className="absolute right-3 top-3 text-cyan">
                  <Check className="h-5 w-5 stroke-[3]" />
                </div>
              )}
              <span className="text-3xl font-bold text-ink">{dur}s</span>
              <span className="mt-1 text-xs font-semibold text-ink-secondary">
                {dur === 30 ? "Short & Punchy" : dur === 45 ? "Balanced Insight" : "In-Depth Story"}
              </span>
              <span className="mt-2 text-[10px] text-ink-muted">
                {dur === 30 ? "Best for TikTok / Shorts" : dur === 45 ? "Best for Instagram Reels" : "Best for YouTube"}
              </span>
            </button>
          ))}

          {/* Custom duration toggle */}
          <button
            onClick={() => {
              const fallback = isCustomDuration ? customDur : 90;
              setCustomDur(fallback);
              onClipDurationChange(fallback);
            }}
            className={`relative flex flex-col items-center justify-center rounded-xl border p-5 transition-all duration-200 ${
              isCustomDuration
                ? "border-brand-light bg-brand-light/15 ring-2 ring-brand-light"
                : "border-brand-border bg-deep hover:border-ink-muted/40"
            }`}
          >
            {isCustomDuration && (
              <div className="absolute right-3 top-3 text-cyan">
                <Check className="h-5 w-5 stroke-[3]" />
              </div>
            )}
            <span className="text-lg font-bold text-ink">Custom</span>
            <span className="mt-1 text-[10px] text-ink-muted">
              {isCustomDuration ? `${clipDuration}s limit` : "Any limit ≤180s"}
            </span>
          </button>
        </div>

        {isCustomDuration && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-brand-border bg-deep p-3">
            <span className="text-xs font-medium text-ink-secondary">Custom Duration (seconds):</span>
            <input
              type="number"
              min={1}
              max={MAX_CUSTOM_DURATION}
              value={customDur}
              onChange={(e) => {
                const v = Math.min(MAX_CUSTOM_DURATION, Math.max(1, Number(e.target.value) || 1));
                setCustomDur(v);
                onClipDurationChange(v);
              }}
              className="w-24 rounded-lg border border-brand-border bg-deep px-3 py-1.5 text-center text-sm font-bold text-ink focus:border-brand-light focus:outline-none"
            />
            <span className="text-xs text-ink-muted">seconds (the AI fits the best scene to this length)</span>
          </div>
        )}
      </div>

      {/* Summary Box */}
      <div className="rounded-[24px] border border-brand-border bg-elevated p-6 shadow-card-inset">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 shrink-0 text-cyan" />
          <div>
            <h4 className="text-sm font-bold text-ink">AI Moment Search Strategy</h4>
            <p className="text-xs text-ink-secondary">
              AI will analyze the complete long-form video timeline to detect the top{" "}
              <span className="font-bold text-cyan">{clipCount} distinct, high-value scenes</span> — each a
              different short (hook, emotional peak, surprise, key statement…) capped at{" "}
              <span className="font-bold text-cyan">{clipDuration} seconds</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Navigation & Generate Action */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-brand-border bg-elevated px-5 py-3 text-sm font-semibold text-ink-secondary transition-colors hover:border-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <button
          onClick={onStartAnalysis}
          className="flex items-center gap-2 rounded-xl bg-brand px-8 py-4 text-base font-bold text-ink shadow-brand transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-brand-glow"
        >
          <Sparkles className="h-5 w-5" />
          <span>Run AI Moment Detection & Generate Clips</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
