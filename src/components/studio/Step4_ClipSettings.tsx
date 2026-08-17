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
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-400">
          <span>Step 4 of 4 • Clip Generation Parameters</span>
        </div>
        <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
          Set Clip Quantity & Max Duration
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Choose how many clips to generate. The AI scans the full video for distinct high-value scenes — hooks, emotional peaks, surprising moments, key statements — and builds a different short from each.
        </p>
      </div>

      {/* 1. Clip Quantity Selection (PRD Section 10) */}
      <div className="rounded-2xl border border-[#1f293d] bg-[#0d1322] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-[#0488C5]" />
            <h3 className="text-base font-bold text-white">Select Number of Clips</h3>
          </div>
          <span className="text-xs font-mono text-[#0488C5]">Selected: {clipCount} Clips</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          {PRESET_COUNTS.map((cnt) => (
            <button
              key={cnt}
              onClick={() => {
                setIsCustom(false);
                onClipCountChange(cnt);
              }}
              className={`relative flex flex-col items-center justify-center rounded-xl border p-4 transition-all ${
                !isCustom && clipCount === cnt
                  ? "border-[#0488C5] bg-[#0488C5]/20 ring-2 ring-[#0488C5]"
                  : "border-slate-800 bg-[#070b14] hover:border-slate-600"
              }`}
            >
              {!isCustom && clipCount === cnt && (
                <div className="absolute top-2 right-2 text-[#0488C5]">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
              )}
              <span className="text-2xl font-black text-white">{cnt}</span>
              <span className="text-[11px] font-semibold text-gray-400">Clips</span>
            </button>
          ))}

          {/* Custom count toggle */}
          <button
            onClick={() => setIsCustom(true)}
            className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-all ${
              isCustom
                ? "border-[#0488C5] bg-[#0488C5]/20 ring-2 ring-[#0488C5]"
                : "border-slate-800 bg-[#070b14] hover:border-slate-600"
            }`}
          >
            <span className="text-sm font-bold text-white">Custom</span>
            <span className="text-[10px] text-gray-400">Limit 1–15</span>
          </button>
        </div>

        {isCustom && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-800 bg-[#070b14] p-3">
            <span className="text-xs text-gray-300 font-medium">Custom Quantity:</span>
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
              className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-center text-sm font-bold text-white focus:border-[#0488C5] focus:outline-none"
            />
            <span className="text-xs text-gray-400">clips (safely bounded)</span>
          </div>
        )}
      </div>

      {/* 2. Clip Duration Selection (PRD Section 11) */}
      <div className="rounded-2xl border border-[#1f293d] bg-[#0d1322] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#526EF5]" />
            <h3 className="text-base font-bold text-white">Target Clip Duration</h3>
          </div>
          <span className="text-xs font-mono text-[#526EF5]">Max: 60s per clip</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {DURATIONS.map((dur) => (
            <button
              key={dur}
              onClick={() => onClipDurationChange(dur)}
              className={`relative flex flex-col items-center justify-center rounded-xl border p-5 transition-all ${
                clipDuration === dur
                  ? "border-[#526EF5] bg-[#526EF5]/20 ring-2 ring-[#526EF5]"
                  : "border-slate-800 bg-[#070b14] hover:border-slate-600"
              }`}
            >
              {clipDuration === dur && (
                <div className="absolute top-3 right-3 text-[#526EF5]">
                  <Check className="h-5 w-5 stroke-[3]" />
                </div>
              )}
              <span className="text-3xl font-extrabold text-white">{dur}s</span>
              <span className="mt-1 text-xs font-semibold text-gray-300">
                {dur === 30 ? "Short & Punchy" : dur === 45 ? "Balanced Insight" : "In-Depth Story"}
              </span>
              <span className="mt-2 text-[10px] text-gray-400">
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
            className={`relative flex flex-col items-center justify-center rounded-xl border p-5 transition-all ${
              isCustomDuration
                ? "border-[#526EF5] bg-[#526EF5]/20 ring-2 ring-[#526EF5]"
                : "border-slate-800 bg-[#070b14] hover:border-slate-600"
            }`}
          >
            {isCustomDuration && (
              <div className="absolute top-3 right-3 text-[#526EF5]">
                <Check className="h-5 w-5 stroke-[3]" />
              </div>
            )}
            <span className="text-lg font-bold text-white">Custom</span>
            <span className="mt-1 text-[10px] text-gray-400">
              {isCustomDuration ? `${clipDuration}s limit` : "Any limit ≤180s"}
            </span>
          </button>
        </div>

        {isCustomDuration && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-800 bg-[#070b14] p-3">
            <span className="text-xs text-gray-300 font-medium">Custom Duration (seconds):</span>
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
              className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-center text-sm font-bold text-white focus:border-[#526EF5] focus:outline-none"
            />
            <span className="text-xs text-gray-400">seconds (the AI fits the best scene to this length)</span>
          </div>
        )}
      </div>

      {/* Summary Box */}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/20 via-[#0d1322] to-[#0a0f1c] p-5">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-white">AI Moment Search Strategy</h4>
            <p className="text-xs text-gray-300">
              AI will analyze the complete long-form video timeline to detect the top <span className="font-bold text-sky-400">{clipCount} distinct, high-value scenes</span> — each a different short (hook, emotional peak, surprise, key statement…) capped at <span className="font-bold text-sky-400">{clipDuration} seconds</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Navigation & Generate Action */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-gray-300 hover:border-slate-500 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <button
          onClick={onStartAnalysis}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-[#0488C5] px-8 py-4 text-base font-extrabold text-white shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105"
        >
          <Sparkles className="h-5 w-5" />
          <span>Run AI Moment Detection & Generate Clips</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
