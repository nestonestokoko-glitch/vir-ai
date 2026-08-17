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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-[24px] border border-brand-border bg-elevated p-6 shadow-card-inset">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-cyan" />
            <h3 className="text-lg font-bold text-ink">Interactive Clip Editor</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-elevated hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Two-Column Editor Layout */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Live Canvas Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <h4 className="mb-2 text-xs font-bold text-ink-muted">Live Edited Canvas Preview</h4>
            <ClipPlayerCanvas clip={editedClip} autoPlay />
          </div>

          {/* Right Column: Customization Controls */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Format Selection */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-secondary">Canvas Format</label>
              <div className="flex gap-3">
                <button
                  onClick={() => update({ format: "portrait" })}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition-all duration-200 ${
                    editedClip.format === "portrait"
                      ? "border-brand-light bg-brand-light/15 text-ink"
                      : "border-brand-border bg-surface text-ink-secondary"
                  }`}
                >
                  <Smartphone className="h-4 w-4" /> 9:16 Portrait
                </button>
                <button
                  onClick={() => update({ format: "landscape" })}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition-all duration-200 ${
                    editedClip.format === "landscape"
                      ? "border-brand-light bg-brand-light/15 text-ink"
                      : "border-brand-border bg-surface text-ink-secondary"
                  }`}
                >
                  <Monitor className="h-4 w-4" /> 16:9 Landscape
                </button>
              </div>
            </div>

            {/* 2. Font Selection */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-secondary">Caption Font</label>
              <select
                value={editedClip.font}
                onChange={(e) => update({ font: e.target.value as ClippingFont })}
                className="w-full rounded-xl border border-brand-border bg-surface p-2.5 text-xs font-bold text-ink focus:border-brand-light focus:outline-none"
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
                <label className="mb-1.5 block text-xs font-bold text-ink-secondary">Subtitle Style</label>
                <select
                  value={editedClip.style}
                  onChange={(e) => update({ style: e.target.value as SubtitleStyle })}
                  className="w-full rounded-xl border border-brand-border bg-surface p-2.5 text-xs font-bold text-ink focus:border-brand-light focus:outline-none"
                >
                  {STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink-secondary">Animation</label>
                <select
                  value={editedClip.animation}
                  onChange={(e) => update({ animation: e.target.value as TextAnimation })}
                  className="w-full rounded-xl border border-brand-border bg-surface p-2.5 text-xs font-bold text-ink focus:border-brand-light focus:outline-none"
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
              <label className="mb-1.5 block text-xs font-bold text-ink-secondary">Caption Position</label>
              <div className="flex gap-2">
                {(["top", "center", "bottom"] as CaptionPosition[]).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => update({ captionPosition: pos })}
                    className={`flex-1 rounded-xl border py-2 text-xs font-bold capitalize transition-all duration-200 ${
                      editedClip.captionPosition === pos
                        ? "border-cyan bg-cyan/20 text-ink"
                        : "border-brand-border bg-surface text-ink-secondary"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Start/End Trim Adjustment */}
            <div className="space-y-2 rounded-xl border border-brand-border bg-surface p-3">
              <label className="block text-xs font-bold text-ink-secondary">Trim Timestamps (Seconds)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-ink-muted">Start Time (sec)</span>
                  <input
                    type="number"
                    value={editedClip.startTime}
                    onChange={(e) => {
                      const st = Math.max(0, Number(e.target.value));
                      update({ startTime: st, duration: editedClip.endTime - st });
                    }}
                    className="w-full rounded-lg border border-brand-border bg-deep px-3 py-1.5 text-xs font-bold text-ink"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted">End Time (sec)</span>
                  <input
                    type="number"
                    value={editedClip.endTime}
                    onChange={(e) => {
                      const et = Math.max(editedClip.startTime + 5, Number(e.target.value));
                      update({ endTime: et, duration: et - editedClip.startTime });
                    }}
                    className="w-full rounded-lg border border-brand-border bg-deep px-3 py-1.5 text-xs font-bold text-ink"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-brand-border pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-brand-border bg-elevated px-5 py-2.5 text-xs font-bold text-ink-secondary transition-colors hover:text-ink"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-xs font-bold text-ink shadow-brand transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-brand-glow"
          >
            <Save className="h-4 w-4" />
            <span>Save Clip Customizations</span>
          </button>
        </div>
      </div>
    </div>
  );
}
