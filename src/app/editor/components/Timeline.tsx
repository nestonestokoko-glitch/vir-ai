"use client";

import { useState } from "react";
import type { Project, TextSegment } from "../hooks/useProject";

type TimelineProps = {
  project: Project;
  onSegmentUpdate: (index: number, updates: Partial<TextSegment>) => void;
  onSegmentDelete: (index: number) => void;
  onSegmentAdd: (text: string, startTime: number, endTime: number) => void;
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function Timeline({
  project,
  onSegmentUpdate,
  onSegmentDelete,
  onSegmentAdd,
}: TimelineProps) {
  const [editingSegmentIdx, setEditingSegmentIdx] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const duration = project.duration || 15;
  const fps = project.fps || 30;

  const handleSaveTextEdit = (idx: number) => {
    if (editingText.trim()) {
      onSegmentUpdate(idx, { text: editingText.trim() });
    }
    setEditingSegmentIdx(null);
  };

  return (
    <div className="border-t border-[var(--studio-border)] bg-[var(--studio-surface)] px-3 py-3 sm:px-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--studio-muted)]">
          Timeline
        </span>
        <button
          type="button"
          onClick={() => {
            const newStartTime = (project.segments || []).reduce(
              (max, seg) => Math.max(max, (seg.endFrame || 0) / fps),
              0
            );
            const newEndTime = Math.min(newStartTime + 3, duration);
            if (newStartTime < duration) {
              onSegmentAdd("New Segment", newStartTime, newEndTime);
            }
          }}
          className="text-xs font-medium text-[var(--studio-green)] transition-colors hover:text-[var(--studio-green-hover)]"
        >
          + Add Segment
        </button>
      </div>

      <div className="relative mb-3 h-4">
        {[0, 5, 10, 15, 20, 30, 45, 60]
          .filter((t) => t <= duration)
          .map((time) => (
            <span
              key={time}
              className="absolute -translate-x-1/2 font-mono text-[10px] text-[var(--studio-muted)]"
              style={{ left: `${(time / duration) * 100}%` }}
            >
              {formatTime(time)}
            </span>
          ))}
      </div>

      <div className="space-y-1.5">
        {project.segments && project.segments.length > 0 ? (
          project.segments.map((segment, index) => {
            const startSec = (segment.startFrame || 0) / fps;
            const endSec = (segment.endFrame || duration * fps) / fps;
            const isEditing = editingSegmentIdx === index;

            return (
              <div
                key={segment.id || index}
                role="group"
                className="flex items-center justify-between rounded-lg border border-[var(--studio-border)] bg-black px-3 py-2"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2 pr-2">
                  <span className="shrink-0 font-mono text-[10px] text-[var(--studio-green)]">
                    {formatTime(startSec)}–{formatTime(endSec)}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveTextEdit(index)}
                      className="studio-input min-w-0 flex-1 rounded px-2 py-1 text-xs"
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={() => {
                        setEditingSegmentIdx(index);
                        setEditingText(segment.text);
                      }}
                      className="cursor-pointer truncate text-xs text-white/80 hover:text-white"
                    >
                      {segment.text}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onSegmentDelete(index)}
                  aria-label="Delete segment"
                  className="shrink-0 p-1 text-[var(--studio-muted)] transition-colors hover:text-red-400"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })
        ) : (
          <p className="py-2 text-center text-xs text-[var(--studio-muted)]">
            Segments appear automatically from your text
          </p>
        )}
      </div>
    </div>
  );
}
