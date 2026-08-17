"use client";

import { useState } from "react";
import { GeneratedClip, ClippingFont, SubtitleStyle, TextAnimation, VideoFormat, CaptionPosition } from "@/lib/clip-types";
import ClipPlayerCanvas from "./ClipPlayerCanvas";
import { X, Sliders, Save, Download, Type, Sparkles, Wand2, Smartphone, Monitor } from "lucide-react";

interface Step7Props {
  clip: GeneratedClip;
  onSaveClip: (updated: GeneratedClip) => void;
  onClose: () => void;
}

const FONTS: ClippingFont[] = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Manrope",
  "Space Grotesk",
  "Bebas Neue",
  "Anton",
  "Oswald",
  "Playfair Display",
  "DM Sans",
];

const STYLES: SubtitleStyle[] = ["Bold", "Modern", "Minimal", "Cinematic", "Kinetic", "Editorial"];

const ANIMATIONS: TextAnimation[] = [
  "Word Reveal",
  "Phrase Reveal",
  "Pop",
  "Scale",
  "Fade",
  "Typewriter",
  "Stagger",
  "Highlight",
  "Kinetic",
];

export default function Step7_ClipEditor({ clip, onSaveClip, onClose }: Step7Props) {
  const [editedClip, setEditedClip] = useState<GeneratedClip>({ ...clip });

  const update = (updates: Partial<GeneratedClip>) => {
    setEditedClip((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onSaveClip(editedClip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-[#1f293d] bg-[#070b14] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-[#0488C5]" />
            <h3 className="text-lg font-extrabold text-white">Interactive Clip Editor</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Two-Column Editor Layout */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Live Canvas Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <h4 className="text-xs font-bold text-gray-400 mb-2">Live Edited Canvas Preview</h4>
            <ClipPlayerCanvas clip={editedClip} autoPlay />
          </div>

          {/* Right Column: Customization Controls */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Format Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Canvas Format</label>
              <div className="flex gap-3">
                <button
                  onClick={() => update({ format: "portrait" })}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold ${
                    editedClip.format === "portrait"
                      ? "border-[#0488C5] bg-[#0488C5]/20 text-white"
                      : "border-slate-800 bg-[#0d1322] text-gray-400"
                  }`}
                >
                  <Smartphone className="h-4 w-4" /> 9:16 Portrait
                </button>
                <button
                  onClick={() => update({ format: "landscape" })}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold ${
                    editedClip.format === "landscape"
                      ? "border-[#526EF5] bg-[#526EF5]/20 text-white"
                      : "border-slate-800 bg-[#0d1322] text-gray-400"
                  }`}
                >
                  <Monitor className="h-4 w-4" /> 16:9 Landscape
                </button>
              </div>
            </div>

            {/* 2. Font Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Caption Font</label>
              <select
                value={editedClip.font}
                onChange={(e) => update({ font: e.target.value as ClippingFont })}
                className="w-full rounded-xl border border-slate-800 bg-[#0d1322] p-2.5 text-xs font-bold text-white focus:border-[#0488C5] focus:outline-none"
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Subtitle Style & Animation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Subtitle Style</label>
                <select
                  value={editedClip.style}
                  onChange={(e) => update({ style: e.target.value as SubtitleStyle })}
                  className="w-full rounded-xl border border-slate-800 bg-[#0d1322] p-2.5 text-xs font-bold text-white focus:border-[#0488C5] focus:outline-none"
                >
                  {STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Animation</label>
                <select
                  value={editedClip.animation}
                  onChange={(e) => update({ animation: e.target.value as TextAnimation })}
                  className="w-full rounded-xl border border-slate-800 bg-[#0d1322] p-2.5 text-xs font-bold text-white focus:border-[#0488C5] focus:outline-none"
                >
                  {ANIMATIONS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Caption Position */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Caption Position</label>
              <div className="flex gap-2">
                {(["top", "center", "bottom"] as CaptionPosition[]).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => update({ captionPosition: pos })}
                    className={`flex-1 rounded-xl border py-2 text-xs font-bold capitalize ${
                      editedClip.captionPosition === pos
                        ? "border-sky-400 bg-sky-400/20 text-white"
                        : "border-slate-800 bg-[#0d1322] text-gray-400"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Start/End Trim Adjustment */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-3 space-y-2">
              <label className="block text-xs font-bold text-gray-300">Trim Timestamps (Seconds)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-gray-400">Start Time (sec)</span>
                  <input
                    type="number"
                    value={editedClip.startTime}
                    onChange={(e) => {
                      const st = Math.max(0, Number(e.target.value));
                      update({ startTime: st, duration: editedClip.endTime - st });
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">End Time (sec)</span>
                  <input
                    type="number"
                    value={editedClip.endTime}
                    onChange={(e) => {
                      const et = Math.max(editedClip.startTime + 5, Number(e.target.value));
                      update({ endTime: et, duration: et - editedClip.startTime });
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-bold text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0488C5] to-[#526EF5] px-6 py-2.5 text-xs font-extrabold text-white shadow-xl hover:scale-105"
          >
            <Save className="h-4 w-4" />
            <span>Save Clip Customizations</span>
          </button>
        </div>
      </div>
    </div>
  );
}
