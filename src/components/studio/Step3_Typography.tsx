"use client";

import { ClippingFont, SubtitleStyle, TextAnimation } from "@/lib/clip-types";
import { Type, Sparkles, Wand2, Check, ArrowRight, ArrowLeft } from "lucide-react";

interface Step3Props {
  font: ClippingFont;
  style: SubtitleStyle;
  animation: TextAnimation;
  onFontChange: (font: ClippingFont) => void;
  onStyleChange: (style: SubtitleStyle) => void;
  onAnimationChange: (animation: TextAnimation) => void;
  onNext: () => void;
  onBack: () => void;
}

const FONTS: { id: ClippingFont; name: string; category: string }[] = [
  { id: "Inter", name: "Inter", category: "Sans-Serif" },
  { id: "Poppins", name: "Poppins", category: "Modern Sans" },
  { id: "Montserrat", name: "Montserrat", category: "Clean Geometric" },
  { id: "Manrope", name: "Manrope", category: "Tech Sans" },
  { id: "Space Grotesk", name: "Space Grotesk", category: "Futuristic" },
  { id: "Bebas Neue", name: "Bebas Neue", category: "Bold Display" },
  { id: "Anton", name: "Anton", category: "Impact Display" },
  { id: "Oswald", name: "Oswald", category: "Condensed" },
  { id: "Playfair Display", name: "Playfair Display", category: "Serif Elegant" },
  { id: "DM Sans", name: "DM Sans", category: "Minimalist" },
];

const STYLES: { id: SubtitleStyle; name: string; desc: string }[] = [
  { id: "Bold", name: "Bold Highlight", desc: "High-contrast dark pill backdrop with bold typography" },
  { id: "Modern", name: "Modern Glass", desc: "Clean frosted glass caption bar with glowing text" },
  { id: "Minimal", name: "Minimalist Text", desc: "Pure text with soft ambient drop-shadow" },
  { id: "Cinematic", name: "Cinematic Sub", desc: "Letterboxed subtitle bar at bottom safe zone" },
  { id: "Kinetic", name: "Kinetic Motion", desc: "Dynamic color accents with vibrant outlines" },
  { id: "Editorial", name: "Editorial Serif", desc: "Elegant magazine publication styling" },
];

const ANIMATIONS: { id: TextAnimation; name: string; tag: string }[] = [
  { id: "Word Reveal", name: "Word Reveal", tag: "Fast Pacing" },
  { id: "Phrase Reveal", name: "Phrase Reveal", tag: "Natural Read" },
  { id: "Pop", name: "Pop In", tag: "High Energy" },
  { id: "Scale", name: "Scale Pulse", tag: "Emphasis" },
  { id: "Fade", name: "Fade Transition", tag: "Smooth" },
  { id: "Typewriter", name: "Typewriter", tag: "Retro" },
  { id: "Stagger", name: "Stagger Words", tag: "Dynamic" },
  { id: "Highlight", name: "Active Highlight", tag: "Viral Reel" },
  { id: "Kinetic", name: "Kinetic Burst", tag: "Kinetic" },
];

export default function Step3_Typography({
  font,
  style,
  animation,
  onFontChange,
  onStyleChange,
  onAnimationChange,
  onNext,
  onBack,
}: Step3Props) {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-400">
          <span>Step 3 of 4 • Typography & Motion Styling</span>
        </div>
        <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
          Customize Captions & Animation
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Choose the font, caption backdrop style, and motion animation to match your brand identity.
        </p>
      </div>

      {/* 1. Font Selection (PRD Section 7) */}
      <div className="rounded-2xl border border-[#1f293d] bg-[#0d1322] p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Type className="h-5 w-5 text-[#0488C5]" />
          <h3 className="text-base font-bold text-white">Select Caption Font</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => onFontChange(f.id)}
              className={`relative flex flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                font === f.id
                  ? "border-[#0488C5] bg-[#0488C5]/15 ring-2 ring-[#0488C5]"
                  : "border-slate-800 bg-[#070b14] hover:border-slate-600"
              }`}
            >
              {font === f.id && (
                <div className="absolute top-2 right-2 text-[#0488C5]">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
              )}
              <span className="text-[10px] font-mono text-gray-400">{f.category}</span>
              <span
                className="mt-2 text-base font-extrabold text-white truncate"
                style={{ fontFamily: f.id }}
              >
                {f.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Subtitle Style Selection (PRD Section 8) */}
      <div className="rounded-2xl border border-[#1f293d] bg-[#0d1322] p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-[#526EF5]" />
          <h3 className="text-base font-bold text-white">Select Subtitle Style</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => onStyleChange(s.id)}
              className={`relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                style === s.id
                  ? "border-[#526EF5] bg-[#526EF5]/15 ring-2 ring-[#526EF5]"
                  : "border-slate-800 bg-[#070b14] hover:border-slate-600"
              }`}
            >
              {style === s.id && (
                <div className="absolute top-2 right-2 text-[#526EF5]">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
              )}
              <h4 className="text-sm font-bold text-white">{s.name}</h4>
              <p className="mt-1 text-xs text-gray-400">{s.desc}</p>
              
              {/* Visual preview pill */}
              <div className="mt-3 rounded-lg border border-slate-700 bg-black/60 p-2 text-center">
                <span
                  className={`text-xs font-bold text-white ${
                    s.id === "Kinetic" ? "text-sky-400 underline" : ""
                  }`}
                  style={{ fontFamily: font }}
                >
                  "THE BEST MOMENTS"
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Text Animation Selection (PRD Section 9) */}
      <div className="rounded-2xl border border-[#1f293d] bg-[#0d1322] p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="h-5 w-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Select Text Animation</h3>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
          {ANIMATIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => onAnimationChange(a.id)}
              className={`relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                animation === a.id
                  ? "border-amber-400 bg-amber-400/10 ring-2 ring-amber-400"
                  : "border-slate-800 bg-[#070b14] hover:border-slate-600"
              }`}
            >
              {animation === a.id && (
                <div className="absolute top-2 right-2 text-amber-400">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
              )}
              <span className="text-[10px] font-mono text-amber-400">{a.tag}</span>
              <span className="mt-1 text-xs font-extrabold text-white">{a.name}</span>
            </button>
          ))}
        </div>
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
          <span>Next: Clip Quantity & Duration</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
