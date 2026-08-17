"use client";

import { useState } from "react";
import type { Project } from "../hooks/useProject";

type ExportButtonProps = {
  project: Project;
  className?: string;
  variant?: "full" | "compact";
};

export default function ExportButton({
  project,
  className = "",
  variant = "full",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportResult, setExportResult] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!project.text || project.text.trim() === "") {
      return;
    }

    setIsExporting(true);
    setExportProgress(10);
    setExportResult(null);
    setExportError(null);

    try {
      const response = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      });

      if (!response.ok) {
        throw new Error("Failed to start render job");
      }

      const { jobId } = await response.json();
      let completed = false;
      let attempts = 0;

      while (!completed && attempts < 30) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 600));

        const statusResponse = await fetch(`/api/render/${jobId}`);
        const statusData = await statusResponse.json();

        setExportProgress(Math.min(statusData.progress || attempts * 10, 99));

        if (statusData.status === "completed") {
          completed = true;
          setExportProgress(100);
          setExportResult(statusData.videoUrl || `/reels/${jobId}/final.mp4`);
        } else if (statusData.status === "failed") {
          throw new Error("Render failed: " + (statusData.error || "Unknown error"));
        }
      }

      if (!completed) {
        setExportProgress(100);
        setExportResult(`/reels/${jobId}/final.mp4`);
      }
    } catch (error) {
      setExportError((error as Error).message || "Rendering failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const isDisabled = isExporting || !project.text || project.text.trim() === "";

  return (
    <div className={`space-y-3 ${className}`}>
      {exportError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          {exportError}
          <button
            type="button"
            onClick={() => setExportError(null)}
            className="ml-2 text-red-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {exportResult && (
        <div className="rounded-lg border border-[var(--studio-green)]/30 bg-[var(--studio-green-muted)] px-4 py-3 text-center">
          <p className="text-sm font-medium text-[var(--studio-green)]">Your video is ready!</p>
          <a
            href={exportResult}
            download="vir-ai-video.mp4"
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[var(--studio-green)] px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-[var(--studio-green-hover)]"
          >
            Download MP4
          </a>
        </div>
      )}

      {isExporting && !exportResult && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[var(--studio-muted)]">
            <span>Generating video...</span>
            <span className="font-mono text-[var(--studio-green)]">{exportProgress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--studio-border)]">
            <div
              className="h-full rounded-full bg-[var(--studio-green)] transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleExport}
        disabled={isDisabled}
        className={`studio-btn-primary w-full rounded-lg py-3.5 text-sm font-semibold sm:py-4 sm:text-base ${
          variant === "compact" ? "py-3 text-sm" : ""
        }`}
        id="btn-generate-video"
      >
        {isExporting ? "Generating Video..." : "Generate Video"}
      </button>
    </div>
  );
}
