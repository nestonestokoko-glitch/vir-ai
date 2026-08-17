"use client";

import { Type, Video, Sparkles, ArrowRight, Play, Zap, CheckCircle2, Sliders, Film } from "lucide-react";

interface StudioHubProps {
  onSelectOption: (tool: "typography" | "clipping") => void;
}

export default function StudioHub({ onSelectOption }: StudioHubProps) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#070b14] py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Aurora Mesh Glow effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#0488C5]/20 via-[#526EF5]/20 to-purple-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[400px] w-[500px] rounded-full bg-[#0488C5]/10 blur-[100px]" />

      <div className="mx-auto max-w-6xl">
        {/* Header Title & Subtitle */}
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#0488C5]/30 bg-[#0488C5]/10 px-4 py-1.5 text-xs font-semibold text-[#0488C5]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>VIR AI Studio v2.0 MVP</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Choose Your <span className="bg-gradient-to-r from-[#0488C5] via-sky-400 to-[#526EF5] bg-clip-text text-transparent">AI Video Creation</span> Tool
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400 sm:text-lg">
            Transform raw ideas into viral short-form content. Turn plain text into kinetic motion reels or analyze long videos to extract high-scoring clips.
          </p>
        </div>

        {/* Two Main Creation Options Cards (PRD Section 1 & 29) */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Card 1: Typography Reels */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#1f293d] bg-gradient-to-b from-[#0d1322] to-[#0a0f1c] p-8 shadow-2xl transition-all duration-300 hover:border-[#0488C5]/60 hover:shadow-2xl hover:shadow-[#0488C5]/15">
            <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-gradient-to-bl from-[#0488C5]/15 to-transparent transition-opacity group-hover:opacity-100 opacity-60" />

            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0488C5] to-sky-500 text-white shadow-lg shadow-[#0488C5]/30">
                  <Type className="h-7 w-7" />
                </div>
                <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Text to Motion AI
                </span>
              </div>

              {/* Title & Description */}
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#0488C5]">
                  Option 01
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                  Typography Reels
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  Turn your words into animated kinetic typography. Enter text, choose custom fonts, styles, motion presets, and generate 9:16 or 16:9 reels in seconds.
                </p>
              </div>

              {/* Live Preview Motion Visual */}
              <div className="mt-6 rounded-2xl border border-[#1e293b] bg-black/60 p-5 shadow-inner">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1.5 font-medium text-sky-400">
                    <Play className="h-3.5 w-3.5 fill-current" /> Live Motion Preview
                  </span>
                  <span className="font-mono text-[11px] text-gray-500">1080×1920 • MP4</span>
                </div>
                
                <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-gray-900 to-black text-center p-4">
                  <div className="animate-pulse space-y-1">
                    <span className="block text-xl font-extrabold uppercase tracking-tight text-white drop-shadow-md">
                      HEY, I AM ANKIT
                    </span>
                    <span className="inline-block rounded bg-[#0488C5] px-2.5 py-0.5 text-xs font-bold text-white shadow">
                      WORD REVEAL • FADE
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Features Bullet List */}
              <ul className="mt-6 space-y-2.5 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Automatic Text Segmentation & Natural Pacing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>10+ Curated Google Fonts & 6 Typography Preset Styles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>9 Kinetic Motion Animations (Word Reveal, Pop, Stagger, Glitch)</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="mt-8">
              <button
                onClick={() => onSelectOption("typography")}
                className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0488C5] to-[#526EF5] py-3.5 text-sm font-bold text-white shadow-xl shadow-[#0488C5]/20 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#0488C5]/30 active:scale-[0.98]"
              >
                <span>Create Typography Reel</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Card 2: AI Clipping */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#1f293d] bg-gradient-to-b from-[#0d1322] to-[#0a0f1c] p-8 shadow-2xl transition-all duration-300 hover:border-[#526EF5]/60 hover:shadow-2xl hover:shadow-[#526EF5]/15">
            <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-gradient-to-bl from-[#526EF5]/15 to-transparent transition-opacity group-hover:opacity-100 opacity-60" />

            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#526EF5] to-indigo-600 text-white shadow-lg shadow-[#526EF5]/30">
                  <Video className="h-7 w-7" />
                </div>
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Long Video to Short Clips
                </span>
              </div>

              {/* Title & Description */}
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#526EF5]">
                  Option 02
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                  AI Clipping Studio
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  Paste a YouTube podcast, interview, or talk. AI analyzes engagement signals, dialogue dynamics, and key insights to automatically generate viral clips with animated captions.
                </p>
              </div>

              {/* Live Preview Video Clips Visual */}
              <div className="mt-6 rounded-2xl border border-[#1e293b] bg-black/60 p-5 shadow-inner">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1.5 font-medium text-indigo-400">
                    <Zap className="h-3.5 w-3.5 text-amber-400" /> AI Moment Scoring Preview
                  </span>
                  <span className="font-mono text-[11px] text-gray-500">2-10 Clips • 30/45/60s</span>
                </div>
                
                <div className="relative flex h-36 items-center justify-between gap-3 overflow-hidden rounded-xl bg-slate-950 p-3">
                  {/* Clip Mock 1 */}
                  <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-lg border border-indigo-500/40 bg-gradient-to-b from-indigo-950/80 to-slate-900 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        Score 94.2
                      </span>
                      <span className="text-[10px] text-gray-400">45s</span>
                    </div>
                    <p className="text-[11px] font-semibold text-white line-clamp-2">
                      "Compute is the currency of the next century..."
                    </p>
                  </div>

                  {/* Clip Mock 2 */}
                  <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-lg border border-[#1f293d] bg-slate-900/80 p-2.5 opacity-80">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        Score 91.8
                      </span>
                      <span className="text-[10px] text-gray-400">60s</span>
                    </div>
                    <p className="text-[11px] font-semibold text-white line-clamp-2">
                      "Dopamine is not the molecule of pleasure..."
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Features Bullet List */}
              <ul className="mt-6 space-y-2.5 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>AI Sentiment, Energy & Value Moment Detection (Not sequential cutting!)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Smart Reframing & Auto-Subtitle Safe Area Layout</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Interactive Clip Gallery & Multi-track Clip Trim Editor</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="mt-8">
              <button
                onClick={() => onSelectOption("clipping")}
                className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#526EF5] to-indigo-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#526EF5]/20 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#526EF5]/30 active:scale-[0.98]"
              >
                <span>Create Short Clips</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
