"use client";

import Link from "next/link";

type StudioHeaderProps = {
  onNewProject: () => void;
};

export default function StudioHeader({ onNewProject }: StudioHeaderProps) {
  return (
    <header className="shrink-0 border-b border-[var(--studio-border)] bg-black">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-[var(--studio-muted)] transition-colors hover:text-white"
            aria-label="Back to home"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-base font-semibold text-white sm:text-lg">Studio</h1>
            <p className="hidden text-xs text-[var(--studio-muted)] sm:block">
              Create animated typography videos
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onNewProject}
          className="rounded-lg border border-[var(--studio-border)] px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white sm:px-4 sm:py-2 sm:text-sm"
        >
          New Project
        </button>
      </div>
    </header>
  );
}
