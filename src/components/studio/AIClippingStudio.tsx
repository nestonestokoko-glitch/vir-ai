"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  VideoMetadata,
  VideoFormat,
  ClippingFont,
  SubtitleStyle,
  TextAnimation,
  ProcessingJob,
  GeneratedClip,
  ClippingProjectConfig,
} from "@/lib/clip-types";
import Step1_PasteVideo from "./Step1_PasteVideo";
import Step2_Format from "./Step2_Format";
import Step3_Typography from "./Step3_Typography";
import Step4_ClipSettings from "./Step4_ClipSettings";
import Step5_AIPipeline from "./Step5_AIPipeline";
import Step6_ClipGallery from "./Step6_ClipGallery";
import Step7_ClipEditor from "./Step7_ClipEditor";
import { Check } from "lucide-react";

export default function AIClippingStudio() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);

  // Customization state
  const [format, setFormat] = useState<VideoFormat>("portrait");
  const [font, setFont] = useState<ClippingFont>("Inter");
  const [style, setStyle] = useState<SubtitleStyle>("Bold");
  const [animation, setAnimation] = useState<TextAnimation>("Word Reveal");
  const [clipCount, setClipCount] = useState<number>(3);
  const [clipDuration, setClipDuration] = useState<number>(45);

  // Job & Results state
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [generatedClips, setGeneratedClips] = useState<GeneratedClip[]>([]);
  const [editingClip, setEditingClip] = useState<GeneratedClip | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startAIPipeline = async () => {
    if (!metadata) return;
    setErrorMsg(null);
    setStep(5);

    try {
      const config: ClippingProjectConfig = {
        videoUrl: metadata.sourceUrl,
        metadata,
        format,
        font,
        style,
        animation,
        clipCount,
        clipDuration,
      };

      const res = await fetch("/api/clipping/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to start AI clipping process.");
      }

      setActiveJobId(data.jobId);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
      setStep(4);
    }
  };

  const handleJobCompleted = (job: ProcessingJob) => {
    setGeneratedClips(job.generatedClips);
    setStep(6);
  };

  const handleUpdateClipInGallery = (updated: GeneratedClip) => {
    setGeneratedClips((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleReset = () => {
    setStep(1);
    setMetadata(null);
    setActiveJobId(null);
    setGeneratedClips([]);
    setEditingClip(null);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-deep">
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Wizard Progress Indicator */}
        {step <= 4 && (
          <div className="mx-auto mb-12 max-w-2xl">
            <div className="relative">
              {/* Track */}
              <div className="absolute left-5 right-5 top-5 h-[2px] -translate-y-1/2 rounded-full bg-brand-border" />
              <div
                className="absolute left-5 top-5 h-[2px] -translate-y-1/2 rounded-full bg-brand shadow-[0_0_12px_rgba(32,184,230,0.45)] transition-all duration-500"
                style={{ width: `calc((100% - 40px) * ${(step - 1) / 3})` }}
              />
              <div className="relative flex items-start justify-between">
                {[
                  { num: 1, title: "Source" },
                  { num: 2, title: "Format" },
                  { num: 3, title: "Style" },
                  { num: 4, title: "Settings" },
                ].map((s) => {
                  const isPast = step > s.num;
                  const isCurrent = step === s.num;
                  return (
                    <div key={s.num} className="flex w-20 flex-col items-center gap-2.5">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-500 ${
                          isPast
                            ? "border border-success/30 bg-success/15 text-success"
                            : isCurrent
                              ? "bg-brand text-ink shadow-brand-glow ring-1 ring-cyan/40"
                              : "border border-brand-border bg-elevated text-ink-muted"
                        }`}
                      >
                        {isPast ? <Check className="h-5 w-5 stroke-[3]" /> : s.num}
                      </div>
                      <span
                        className={`text-[11px] font-semibold tracking-wide transition-colors duration-300 ${
                          isCurrent
                            ? "text-ink"
                            : isPast
                              ? "text-success"
                              : "text-ink-muted"
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mx-auto mb-6 max-w-3xl rounded-2xl border border-red-500/40 bg-red-950/50 p-4 text-center text-xs text-red-200">
            {errorMsg}
          </div>
        )}

        {/* Step Render Switch (subtle entrance transition) */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {step === 1 && (
            <Step1_PasteVideo
              metadata={metadata}
              onMetadataFetched={(meta) => setMetadata(meta)}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <Step2_Format
              format={format}
              onFormatChange={setFormat}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <Step3_Typography
              font={font}
              style={style}
              animation={animation}
              onFontChange={setFont}
              onStyleChange={setStyle}
              onAnimationChange={setAnimation}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <Step4_ClipSettings
              clipCount={clipCount}
              clipDuration={clipDuration}
              onClipCountChange={setClipCount}
              onClipDurationChange={setClipDuration}
              onStartAnalysis={startAIPipeline}
              onBack={() => setStep(3)}
            />
          )}

          {step === 5 && activeJobId && metadata && (
            <Step5_AIPipeline
              jobId={activeJobId}
              metadata={metadata}
              onJobCompleted={handleJobCompleted}
              onError={(msg) => {
                setErrorMsg(msg);
                setStep(4);
              }}
            />
          )}

          {step === 6 && (
            <Step6_ClipGallery
              clips={generatedClips}
              onEditClip={(clip) => setEditingClip(clip)}
              onReset={handleReset}
            />
          )}
        </motion.div>

        {/* Interactive Modal Clip Editor */}
        {editingClip && (
          <Step7_ClipEditor
            clip={editingClip}
            onSaveClip={handleUpdateClipInGallery}
            onClose={() => setEditingClip(null)}
          />
        )}
      </div>
    </div>
  );
}
