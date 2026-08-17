"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GeneratedClip, TranscriptWord, SCENE_LABELS } from "@/lib/clip-types";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2 } from "lucide-react";

interface ClipPlayerCanvasProps {
  clip: GeneratedClip;
  autoPlay?: boolean;
}

export default function ClipPlayerCanvas({ clip, autoPlay = false }: ClipPlayerCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(Math.max(5, clip.duration || 45));
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Flatten words from transcript for caption synchronization
  const words: TranscriptWord[] = clip.transcript.flatMap((seg) => seg.words || []);
  const fullText = clip.transcript.map((seg) => seg.text).join(" ");

  // Source clip start offset: the moment exists somewhere inside the source video.
  // We map the clip's startTime to the playback position in the sample footage.
  const sourceStart = clip.startTime % Math.max(1, duration);

  // The exported clip is ALWAYS portrait (1080x1920), regardless of the
  // Portrait/Landscape choice — that toggle only changes the in-frame layout.
  const isPortrait = true;

  // Keep video element muted state in sync
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  // Auto-play handling (video autoplay requires muted in most browsers)
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.muted = true;
      setIsMuted(true);
      void videoRef.current.play().catch(() => {
        /* autoplay can be blocked; user can press play */
      });
    }
  }, [autoPlay, videoLoaded]);

  // Track playback time
  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime - sourceStart);
  }, [sourceStart]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      // Jump to the clip's section within the source footage if we're at the very start
      if (v.currentTime < sourceStart || v.currentTime >= sourceStart + duration) {
        v.currentTime = sourceStart;
      }
      void v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, [sourceStart, duration]);

  const handleRestart = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = sourceStart;
    setCurrentTime(0);
    void v.play();
    setIsPlaying(true);
  }, [sourceStart]);

  const handleSeek = useCallback(
    (val: number) => {
      const v = videoRef.current;
      if (!v) return;
      const target = sourceStart + val;
      v.currentTime = target;
      setCurrentTime(val);
    },
    [sourceStart]
  );

  // Determine active caption text for the current playback time
  const relTime = clip.startTime + currentTime;
  const activeWord = words.find((w) => relTime >= w.start && relTime <= w.end);
  const displayPhrase = activeWord
    ? getSurroundingPhrase(fullText, activeWord.word)
    : fullText.split(" ").slice(0, 6).join(" ");

  // Caption animation class based on the selected preset
  const captionAnimClass = getCaptionAnimClass(clip.animation);

  // Caption container styling based on subtitle style
  const captionBoxStyle = getCaptionBoxStyle(clip.style, clip.captionBgColor, clip.captionColor);
  const captionPosClass =
    clip.captionPosition === "top"
      ? "top-[12%]"
      : clip.captionPosition === "center"
        ? "top-1/2 -translate-y-1/2"
        : "bottom-[10%]";

  return (
    <div className="flex flex-col items-center w-full">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-[24px] border border-brand-border bg-black shadow-[0_25px_50px_-12px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]"
        style={{
          aspectRatio: isPortrait ? "9/16" : "16/9",
          maxHeight: isPortrait ? "560px" : "360px",
        }}
      >
        {/* Real source footage */}
        {clip.videoUrl && !videoError ? (
          <video
            ref={videoRef}
            src={clip.videoUrl}
            className="absolute inset-0 h-full w-full object-cover"
            playsInline
            loop
            muted={isMuted}
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              setDuration(Math.max(5, clip.duration || 45));
              setVideoLoaded(true);
              // Seek to the clip's section inside the source footage
              try {
                v.currentTime = sourceStart;
              } catch {
                /* metadata may not be ready */
              }
            }}
            onTimeUpdate={onTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onError={() => setVideoError(true)}
          />
        ) : (
          // Fallback: animated gradient placeholder if no footage is available
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-deep via-surface to-black">
            <div className="h-16 w-16 animate-pulse rounded-full bg-gradient-to-br from-brand to-cyan" />
          </div>
        )}

        {/* Darken lower area for caption readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        {/* Video Overlay Aspect & Score Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="rounded-full bg-success/20 px-2.5 py-1 text-[11px] font-extrabold text-success border border-success/30 backdrop-blur-md">
            AI Score: {clip.score.overallScore}
          </span>
          <span className="rounded-full bg-elevated/80 px-2.5 py-1 text-[11px] font-bold text-ink-secondary border border-brand-border backdrop-blur-md">
            {clip.format === "portrait" ? "9:16 Portrait" : "9:16 Portrait · Centered"}
          </span>
          {clip.sceneType && (
            <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-amber-500/30 backdrop-blur-md">
              {SCENE_LABELS[clip.sceneType] || clip.sceneType}
            </span>
          )}
        </div>

        {/* Animated caption overlay */}
        {displayPhrase && (
          <div
            className={`pointer-events-none absolute left-1/2 w-[88%] -translate-x-1/2 px-3 text-center ${captionPosClass}`}
          >
            <div className={`${captionBoxStyle} ${captionAnimClass} inline-block`}>
              <span
                className="font-extrabold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                style={{
                  fontFamily: `"${clip.font}", sans-serif`,
                  fontSize: isPortrait ? "1.5rem" : "1.25rem",
                  color: clip.captionColor || "#FFFFFF",
                }}
              >
                {displayPhrase}
              </span>
            </div>
          </div>
        )}

        {/* Play/Pause Center Overlay when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity hover:bg-black/20"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-ink shadow-2xl shadow-brand transition-transform hover:scale-110 hover:bg-brand-hover">
              <Play className="h-8 w-8 fill-current ml-1" />
            </div>
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl border border-brand-border bg-elevated px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-elevated text-ink hover:bg-brand"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
          </button>
          <button
            onClick={handleRestart}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-elevated hover:text-ink"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Timeline Scrubber */}
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={currentTime}
          onChange={(e) => handleSeek(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-elevated accent-cyan"
        />

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-ink-muted">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button
            onClick={() => setIsMuted((m) => !m)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-elevated hover:text-ink"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function getCaptionAnimClass(animation: string): string {
  switch (animation) {
    case "Word Reveal":
    case "Phrase Reveal":
      return "animate-[fadeIn_0.4s_ease-out]";
    case "Pop":
    case "Scale":
      return "animate-[popIn_0.35s_ease-out]";
    case "Fade":
      return "animate-[fadeIn_0.8s_ease-in-out]";
    case "Typewriter":
      return "animate-[fadeIn_0.2s_ease-out]";
    case "Stagger":
      return "animate-[slideUp_0.4s_ease-out]";
    case "Highlight":
      return "animate-[fadeIn_0.3s_ease-out]";
    case "Kinetic":
      return "animate-[slideUp_0.3s_ease-out]";
    default:
      return "animate-[fadeIn_0.4s_ease-out]";
  }
}

function getCaptionBoxStyle(
  style: string,
  bg: string = "rgba(0,0,0,0.7)",
  color: string = "#FFFFFF"
): string {
  switch (style) {
    case "Bold":
    case "Kinetic":
      return `rounded-2xl px-5 py-3 backdrop-blur-md`;
    case "Modern":
      return `rounded-2xl px-5 py-3 border border-white/10 backdrop-blur-md bg-white/10`;
    case "Minimal":
      return `px-2 py-1`;
    case "Cinematic":
      return `w-full rounded-none bg-black/85 px-6 py-4`;
    case "Editorial":
      return `rounded-xl px-5 py-3 border border-white/20 bg-black/70 font-serif`;
    default:
      return `rounded-2xl px-5 py-3 backdrop-blur-md`;
  }
}

function getSurroundingPhrase(fullText: string, activeWord: string): string {
  const words = fullText.split(" ");
  const idx = words.findIndex((w) => w.toLowerCase().includes(activeWord.toLowerCase()));
  if (idx === -1) return activeWord;
  const start = Math.max(0, idx - 2);
  const end = Math.min(words.length, idx + 3);
  return words.slice(start, end).join(" ");
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
