"use client";

import { useState } from "react";
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
import { Video, Check, Sparkles } from "lucide-react";

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
    <div className="min-h-[calc(100vh-4rem)] bg-[#070b14] px-4 py-6 sm:px-6 lg:px-8">
      {/* Wizard Progress Indicator */}
      {step <= 4 && (
        <div className="mx-auto max-w-4xl mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, title: "1. Source Video" },
              { num: 2, title: "2. Format" },
              { num: 3, title: "3. Typography" },
              { num: 4, title: "4. Clip Settings" },
            ].map((s) => {
              const isPast = step > s.num;
              const isCurrent = step === s.num;

              return (
                <div key={s.num} className="flex flex-1 items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isPast
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                          ? "bg-gradient-to-r from-[#0488C5] to-[#526EF5] text-white shadow-lg shadow-[#0488C5]/30 ring-2 ring-[#0488C5]/50"
                          : "bg-slate-800 text-gray-500"
                      }`}
                    >
                      {isPast ? <Check className="h-4 w-4 stroke-[3]" /> : s.num}
                    </div>
                    <span
                      className={`hidden text-xs font-bold sm:inline ${
                        isCurrent ? "text-white" : isPast ? "text-emerald-400" : "text-gray-500"
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  {s.num < 4 && (
                    <div
                      className={`mx-3 h-0.5 flex-1 rounded ${
                        step > s.num ? "bg-emerald-500" : "bg-slate-800"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mx-auto max-w-3xl mb-6 rounded-2xl border border-red-500/40 bg-red-950/50 p-4 text-center text-xs text-red-200">
          {errorMsg}
        </div>
      )}

      {/* Step Render Switch */}
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

      {/* Interactive Modal Clip Editor */}
      {editingClip && (
        <Step7_ClipEditor
          clip={editingClip}
          onSaveClip={handleUpdateClipInGallery}
          onClose={() => setEditingClip(null)}
        />
      )}
    </div>
  );
}
