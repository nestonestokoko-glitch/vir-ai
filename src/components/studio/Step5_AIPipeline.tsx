"use client";

import { useEffect, useState } from "react";
import { ProcessingJob, JobStatusStage, VideoMetadata } from "@/lib/clip-types";
import { Sparkles, Loader2, CheckCircle2, Cpu, Zap, Activity, Radio, AlertCircle } from "lucide-react";

interface Step5Props {
  jobId: string;
  metadata: VideoMetadata;
  onJobCompleted: (job: ProcessingJob) => void;
  onError: (msg: string) => void;
}

const STAGES: { id: JobStatusStage; title: string; desc: string }[] = [
  { id: "queued", title: "1. Queued in Pipeline", desc: "Allocating AI worker thread & compute buffer" },
  { id: "fetching", title: "2. Ingesting Stream", desc: "Retrieving metadata, audio tracks & timestamps" },
  { id: "transcribing", title: "3. AI Diarization", desc: "Speech-to-text word alignment & speaker detection" },
  { id: "analyzing", title: "4. Moment Detection", desc: "Scoring engagement, content value & story climax" },
  { id: "selecting", title: "5. Context Filtering", desc: "Ranking top non-duplicate clips & sentence boundaries" },
  { id: "rendering", title: "6. Composition Engine", desc: "Safe-area subtitle layout & canvas reframing" },
  { id: "completed", title: "7. Clips Ready", desc: "Final MP4 short clips rendered successfully!" },
];

export default function Step5_AIPipeline({
  jobId,
  metadata,
  onJobCompleted,
  onError,
}: Step5Props) {
  const [jobState, setJobState] = useState<ProcessingJob | null>(null);

  useEffect(() => {
    let timerId: any = null;

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/clipping/status/${jobId}`);
        const data = await res.json();
        
        if (data.success && data.job) {
          setJobState(data.job);
          
          if (data.job.status === "completed") {
            onJobCompleted(data.job);
            return;
          }

          if (data.job.status === "failed") {
            onError(data.job.error || "AI processing pipeline failed.");
            return;
          }
        }
      } catch (err: any) {
        console.error("Error polling job status:", err);
      }

      timerId = setTimeout(pollStatus, 800);
    };

    pollStatus();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [jobId, onJobCompleted, onError]);

  const currentStage = jobState?.status || "queued";
  const progressPercentage = jobState?.progressPercentage || 10;
  const currentStepMessage = jobState?.currentStepMessage || "Processing video through AI engine...";

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      {/* Telemetry Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#1f293d] bg-gradient-to-b from-[#0d1322] to-[#0a0f1c] p-8 shadow-2xl">
        <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-[#0488C5]/20 blur-3xl" />

        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0488C5] to-[#526EF5] text-white shadow-lg shadow-[#0488C5]/30">
              <Cpu className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                  AI Pipeline Active
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white sm:text-2xl mt-0.5">
                Analyzing Long Video & Extracting Best Moments
              </h3>
            </div>
          </div>

          <div className="hidden font-mono text-right sm:block">
            <span className="text-3xl font-black text-white">{progressPercentage}%</span>
            <p className="text-[10px] text-gray-400">Job ID: {jobId.slice(0, 12)}</p>
          </div>
        </div>

        {/* Source Video Brief */}
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-800 bg-[#070b14]/70 p-4">
          <img
            src={metadata.thumbnailUrl}
            alt={metadata.title}
            className="h-14 w-24 rounded-lg object-cover border border-slate-800"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400">{metadata.channelName}</span>
              <span className="font-mono text-xs text-gray-400">{metadata.formattedDuration}</span>
            </div>
            <h4 className="mt-0.5 text-sm font-bold text-white truncate">{metadata.title}</h4>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
            <span className="flex items-center gap-1.5 font-medium text-sky-400">
              <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
              {currentStepMessage}
            </span>
            <span className="font-mono font-bold text-white">{progressPercentage}%</span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0488C5] via-sky-400 to-[#526EF5] transition-all duration-500 shadow-md shadow-[#0488C5]/40"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Live Stage Checklist */}
        <div className="mt-8 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Pipeline Telemetry & Stage Progress
          </h4>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {STAGES.map((s, idx) => {
              const isPast = getStageIndex(currentStage) > idx;
              const isCurrent = currentStage === s.id;

              return (
                <div
                  key={s.id}
                  className={`flex items-start gap-3 rounded-xl border p-3 transition-all ${
                    isCurrent
                      ? "border-[#0488C5] bg-[#0488C5]/15 text-white"
                      : isPast
                      ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                      : "border-slate-800/80 bg-[#070b14]/50 text-gray-500 opacity-60"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-700" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">{s.title}</h5>
                    <p className="text-[11px] text-gray-400 line-clamp-1">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStageIndex(stage: JobStatusStage): number {
  const order: JobStatusStage[] = [
    "queued",
    "fetching",
    "transcribing",
    "analyzing",
    "selecting",
    "rendering",
    "completed",
  ];
  return order.indexOf(stage);
}
