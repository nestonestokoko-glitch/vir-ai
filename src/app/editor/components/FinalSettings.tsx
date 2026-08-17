"use client";

import type { Project } from "../hooks/useProject";

type FinalSettingsProps = {
  project: Project;
  onUpdate: (updates: Partial<Project>) => void;
};

export default function FinalSettings({ project, onUpdate }: FinalSettingsProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--studio-muted)]">
          Duration
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={5}
            max={60}
            value={project.duration}
            onChange={(e) => onUpdate({ duration: Number(e.target.value) })}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-[var(--studio-border)] accent-[var(--studio-green)]"
          />
          <span className="w-10 text-right font-mono text-sm text-white">{project.duration}s</span>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--studio-muted)]">
          Text Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={project.textColor}
            onChange={(e) => onUpdate({ textColor: e.target.value })}
            className="h-11 w-11 cursor-pointer rounded-lg border border-[var(--studio-border)] bg-transparent"
          />
          <span className="font-mono text-sm text-[var(--studio-muted)]">{project.textColor}</span>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--studio-muted)]">
          Background
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={project.background.value}
            onChange={(e) =>
              onUpdate({ background: { type: "solid", value: e.target.value } })
            }
            className="h-11 w-11 cursor-pointer rounded-lg border border-[var(--studio-border)] bg-transparent"
          />
          <span className="font-mono text-sm text-[var(--studio-muted)]">{project.background.value}</span>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--studio-muted)]">
          Text Position
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["left", "center", "right"] as const).map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => onUpdate({ alignment: align })}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium capitalize transition-colors ${
                project.alignment === align
                  ? "bg-[var(--studio-green)] text-black"
                  : "border border-[var(--studio-border)] bg-[var(--studio-surface)] text-white/70 hover:border-white/20 hover:text-white"
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--studio-muted)]">
          Font Weight
        </label>
        <select
          value={project.weight ?? 400}
          onChange={(e) => onUpdate({ weight: Number(e.target.value) })}
          className="studio-input w-full rounded-lg px-3 py-2.5 text-sm"
        >
          <option value={300}>Light</option>
          <option value={400}>Regular</option>
          <option value={600}>Semi Bold</option>
          <option value={700}>Bold</option>
          <option value={900}>Black</option>
        </select>
      </div>
    </div>
  );
}
