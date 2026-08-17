"use client";

import { useState } from "react";
import { VideoMetadata } from "@/lib/clip-types";
import { extractYouTubeId, isValidYouTubeUrl } from "@/lib/youtube";
import { Search, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

const YoutubeIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
  const [focused, setFocused] = useState(false);
  const [editing, setEditing] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const videoId = extractYouTubeId(urlInput);
  const hasValidLink = !!videoId;
  const previewThumb = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;

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
    <div className="mx-auto max-w-4xl space-y-10 py-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3.5 py-1 text-xs font-semibold text-cyan">
          <YoutubeIcon className="h-4 w-4 text-red-500" />
          <span>Step 1 of 4 • Ingest Source Video</span>
        </div>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl md:text-[56px] md:leading-[1.05]">
          Paste Your Long-Form Video Link
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-ink-secondary sm:text-base">
          Supports Podcasts, Masterclasses, Keynotes, Webinars, and YouTube videos up to 5+ hours.
        </p>
      </div>

      {/* Fetched metadata success card */}
      {metadata ? (
        <div className="animate-fade-up rounded-[24px] border border-success/40 bg-elevated p-6 shadow-card-inset">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={metadata.thumbnailUrl}
                  alt={metadata.title}
                  className="h-24 w-40 rounded-xl border border-success/30 object-cover shadow-lg"
                />
                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                  {metadata.formattedDuration}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/15 px-2.5 py-0.5 text-[11px] font-bold text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Video Ready
                  </span>
                  <span className="text-xs text-ink-secondary">{metadata.channelName}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={onNext}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-ink shadow-brand transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-brand-glow md:w-auto"
              >
                <span>Next: Choose Format</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : hasValidLink && !editing ? (
        /* Pasted a valid link → show a big thumbnail preview + Fetch Video */
        <div className="rounded-[24px] border border-brand-border bg-elevated p-6 shadow-card-inset sm:p-8">
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-5 sm:min-h-[440px]">
            <div className="relative w-full overflow-hidden rounded-xl border border-brand-border">
              {previewThumb && !thumbError ? (
                <img
                  src={previewThumb}
                  alt="Video thumbnail preview"
                  onError={() => setThumbError(true)}
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-brand/40 to-elevated">
                  <YoutubeIcon className="h-10 w-10 text-cyan/70" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleFetch()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-ink shadow-brand transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-brand-glow disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-brand"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Search className="h-4 w-4" />
                    Fetch Video
                  </span>
                )}
              </button>
              <button
                onClick={() => setEditing(true)}
                className="rounded-xl border border-brand-border bg-elevated px-5 py-3.5 text-sm font-semibold text-ink-secondary transition-colors hover:border-ink-muted hover:text-ink"
              >
                Edit link
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
              {error}
            </div>
          )}
        </div>
      ) : (
        /* URL input form */
        <div className="rounded-[24px] border border-brand-border bg-elevated p-6 shadow-card-inset sm:p-8">
          <label className="mb-3 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Paste YouTube Video URL
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="a-ca_form_input_wrapper relative flex flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink-muted">
                <YoutubeIcon className="h-5 w-5 text-red-500" />
              </div>
              <input
                id="yt-link-header"
                type="text"
                value={urlInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setUrlInput(val);
                  setError(null);
                  setThumbError(false);
                  if (extractYouTubeId(val)) setEditing(false);
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder=""
                aria-label="Paste YouTube Video URL"
                className="w-full rounded-xl border border-brand-border bg-deep py-3.5 pl-12 pr-4 text-sm text-ink transition-all duration-200 placeholder-transparent focus:border-brand-light focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:shadow-[0_0_0_3px_rgba(32,184,230,0.15)]"
              />
              {/* Custom placeholder overlay — sibling div, toggled by input state (display:none when typing, dim on focus) */}
              <div
                className={`a-ca_form_input_placeholder pointer-events-none absolute inset-y-0 left-12 right-4 flex items-center truncate text-sm text-ink-muted transition-opacity duration-150 ${
                  urlInput.length === 0
                    ? focused
                      ? "opacity-50"
                      : "opacity-100"
                    : "hidden"
                }`}
              >
                Paste a YouTube or podcast link
              </div>
            </div>

            <button
              onClick={() => handleFetch()}
              disabled={loading || !urlInput.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-ink shadow-brand transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-brand-glow disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-brand"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fetching...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Search className="h-4 w-4" />
                  Fetch Video
                </span>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
