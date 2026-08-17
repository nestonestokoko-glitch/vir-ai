"use client";

import Link from "next/link";
import { Sparkles, Video, Type, Home, ArrowLeft } from "lucide-react";

interface StudioNavProps {
  activeTool: "hub" | "typography" | "clipping";
  onSelectTool: (tool: "hub" | "typography" | "clipping") => void;
}

export default function StudioNav({ activeTool, onSelectTool }: StudioNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#1f293d] bg-[#070b14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Back to Home */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Landing</span>
          </Link>

          <div className="h-4 w-px bg-gray-800" />

          <button
            onClick={() => onSelectTool("hub")}
            className="flex items-center gap-2 text-left group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0488C5] to-[#526EF5] text-white shadow-lg shadow-[#0488C5]/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">
                VIR AI <span className="text-xs font-semibold uppercase tracking-widest text-[#0488C5]">Studio</span>
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 rounded-xl border border-[#1f293d] bg-[#0d1322] p-1">
          <button
            onClick={() => onSelectTool("hub")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTool === "hub"
                ? "bg-[#1e293b] text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Studio Hub</span>
          </button>

          <button
            onClick={() => onSelectTool("typography")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTool === "typography"
                ? "bg-gradient-to-r from-[#0488C5] to-[#526EF5] text-white shadow-md shadow-[#0488C5]/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Type className="h-3.5 w-3.5 text-sky-400" />
            <span>Typography Reels</span>
          </button>

          <button
            onClick={() => onSelectTool("clipping")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTool === "clipping"
                ? "bg-gradient-to-r from-[#526EF5] to-indigo-600 text-white shadow-md shadow-[#526EF5]/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Video className="h-3.5 w-3.5 text-indigo-400" />
            <span className="relative">
              AI Clipping
              <span className="ml-1.5 inline-block rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                PRO
              </span>
            </span>
          </button>
        </nav>

        {/* Status indicator */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>AI Engine Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
