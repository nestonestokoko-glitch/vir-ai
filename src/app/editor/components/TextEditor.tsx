"use client";

import { useState } from "react";

type TextEditorProps = {
  text: string;
  onTextChange: (text: string) => void;
};

const SAMPLE_PRESETS = [
  { label: "Intro", text: "Hey, I am Ankit. I create cinematic videos for social media." },
  { label: "Quote", text: "Work hard in silence. Let your success be your noise." },
  { label: "Build", text: "Building AI tools in public. Day 1 of creating VIR AI." },
];

export default function TextEditor({ text, onTextChange }: TextEditorProps) {
  const [localText, setLocalText] = useState(text);

  if (localText !== text) {
    setLocalText(text);
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalText(value);
    onTextChange(value);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--studio-muted)]">
        Enter the text you want to animate in your video.
      </p>

      <textarea
        value={localText}
        onChange={handleChange}
        rows={6}
        className="studio-input w-full resize-none rounded-lg px-4 py-3 text-sm leading-relaxed placeholder:text-[var(--studio-muted)]"
        placeholder="Enter your text in English..."
      />

      <div className="flex flex-wrap gap-2">
        {SAMPLE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setLocalText(preset.text);
              onTextChange(preset.text);
            }}
            className="rounded-lg border border-[var(--studio-border)] px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-[var(--studio-green)] hover:text-[var(--studio-green)]"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex justify-between text-xs text-[var(--studio-muted)]">
        <span>English text supported</span>
        <span>{localText.length} characters</span>
      </div>
    </div>
  );
}
