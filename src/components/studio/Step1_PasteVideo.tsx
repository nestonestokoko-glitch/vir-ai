"use client";

import { useState } from "react";
import { VideoMetadata } from "@/lib/clip-types";
import { SAMPLE_PRESET_VIDEOS, isValidYouTubeUrl } from "@/lib/youtube";
import { Search, CheckCircle2, ArrowRight, Loader2, Play, Sparkles, Video } from "lucide-react";

const YoutubeIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface Step1Props {
  metadata: VideoMetadata | null;
  onMetadataFetched: (meta: VideoMetadata) => void;
  onNext: () => void;
}

export default function Step1_PasteVideo({ metadata, onMetadataFetched, onNext }: Step1Props) {
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async (targetUrl?: string) => {
    const urlToUse = targetUrl || urlInput;
    if (!urlToUse) {
      setError("Please paste a valid YouTube video URL.");
      return;
    }

    if (!isValidYouTubeUrl(urlToUse)) {
      setError("Please enter a valid YouTube video link (e.g., https://youtube.com/watch?v=...).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/youtube/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToUse }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch YouTube video metadata.");
      }

      onMetadataFetched(data.metadata);
    } catch (err: any) {
      setError(err.message || "Could not fetch video. Please check the URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-400">
          <YoutubeIcon className="h-4 w-4 text-red-500" />
          <span>Step 1 of 4 • Ingest Source Video</span>
        </div>
        <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
          Paste Your Long-Form Video Link
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Supports Podcasts, Masterclasses, Keynotes, Webinars, and YouTube videos up to 5+ hours.
        </p>
      </div>

      {/* Main YouTube URL Input Form */}
      <div className="rounded-2xl border border-[#1f293d] bg-gradient-to-b from-[#0d1322] to-[#0a0f1c] p-6 shadow-2xl">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
          Paste YouTube Video URL
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <YoutubeIcon className="h-5 w-5 text-red-500" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setError(null);
              }}
              placeholder="https://youtube.com/watch?v=L_Guz73G-lM or podcast link..."
              className="w-full rounded-xl border border-[#1f293d] bg-[#070b14] py-3.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:border-[#0488C5] focus:outline-none focus:ring-2 focus:ring-[#0488C5]/30"
            />
          </div>

          <button
            onClick={() => handleFetch()}
            disabled={loading || !urlInput.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0488C5] to-[#526EF5] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0488C5]/20 transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Fetch Video</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Preset Sample YouTube Links (for instant 1-click testing) */}
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Or test immediately with a popular sample podcast:</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {SAMPLE_PRESET_VIDEOS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setUrlInput(preset.url);
                  handleFetch(preset.url);
                }}
                className="flex items-start gap-3 rounded-xl border border-slate-800 bg-[#070b14]/80 p-3 text-left transition-all hover:border-[#0488C5]/50 hover:bg-[#0d1322]"
              >
                <img
                  src={preset.thumbnailUrl}
                  alt={preset.title}
                  className="h-12 w-20 shrink-0 rounded-lg object-cover border border-slate-800"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#0488C5] uppercase">
                      {preset.category}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400">
                      {preset.formattedDuration}
                    </span>
                  </div>
                  <h4 className="mt-0.5 text-xs font-bold text-white truncate">
                    {preset.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 truncate">
                    {preset.channelName}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Video Metadata Success Card */}
      {metadata && (
        <div className="animate-fade-up rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-[#0d1322] to-[#0a0f1c] p-6 shadow-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <img
                  src={metadata.thumbnailUrl}
                  alt={metadata.title}
                  className="h-24 w-40 rounded-xl object-cover border border-emerald-500/30 shadow-lg"
                />
                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                  {metadata.formattedDuration}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Video Ready
                  </span>
                  <span className="text-xs text-gray-400">{metadata.channelName}</span>
                </div>

                <h3 className="mt-2 text-base font-bold text-white sm:text-lg">
                  {metadata.title}
                </h3>
                <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                  {metadata.description}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={onNext}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 md:w-auto"
              >
                <span>Next: Choose Format</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
