"use client";

import Link from "next/link";
import { Sparkles, Video, ArrowLeft } from "lucide-react";

interface StudioNavProps {
  activeTool: "clipping";
  onSelectTool: (tool: "clipping") => void;
}

export default function StudioNav({ activeTool, onSelectTool }: StudioNavProps) {
  return (
    <header className="sticky top-0 z-[1000] border-b border-brand-border bg-deep/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Back to Home */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-ink-secondary transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Landing</span>
          </Link>

          <div className="hidden h-5 w-px bg-brand-border sm:block" />

          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-cyan shadow-[0_0_18px_rgba(32,184,230,0.25)] transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-ink">
              VIR AI <span className="text-xs font-semibold uppercase tracking-widest text-cyan">Studio</span>
            </span>
          </Link>
        </div>

        {/* Center: Active tool pill */}
        <div className="hidden items-center gap-2 rounded-full border border-brand-border bg-brand/40 px-4 py-1.5 sm:flex">
          <Video className="h-4 w-4 text-cyan" />
          <span className="text-sm font-semibold text-ink">AI Clipping Pro</span>
          <span className="ml-1 inline-block rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
            Pro
          </span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success shadow-[0_0_18px_rgba(24,201,139,0.18)] md:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
            </span>
            <span>AI Engine Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
