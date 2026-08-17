"use client";

type StyleSelectorProps = {
  style: string;
  onStyleChange: (style: string) => void;
  textColor?: string;
  onTextColorChange?: (color: string) => void;
};

const styleOptions = [
  { label: "Minimal", value: "Minimal", desc: "Simple subtle movement" },
  { label: "Modern", value: "Modern", desc: "Clean contemporary typography" },
  { label: "Bold", value: "Bold", desc: "Large, high-impact typography" },
  { label: "Cinematic", value: "Cinematic", desc: "Dramatic widescreen feel" },
  { label: "Kinetic", value: "Kinetic", desc: "Kinetic typography: words enter, reflow & emphasize" },
  { label: "Editorial", value: "Editorial", desc: "Magazine-inspired layout" },
  { label: "Hook", value: "Hook", desc: "Multi-color gradient shine title" },
  { label: "Caption", value: "Caption", desc: "Viral caption: clean rise + slight gradient + shine" },
];

const presetColors = [
  "#FFFFFF",
  "#000000",
  "#FFD600",
  "#FF4D6D",
  "#22D3EE",
  "#A855F7",
  "#3B82F6",
  "#22C55E",
];

export default function StyleSelector({
  style,
  onStyleChange,
  textColor = "#FFFFFF",
  onTextColorChange,
}: StyleSelectorProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--studio-muted)]">
        Choose a text style that matches your content.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {styleOptions.map((opt) => {
          const isSelected = style === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStyleChange(opt.value)}
              className={`studio-card px-3 py-3 text-left transition-all ${
                isSelected ? "studio-card-selected ring-1 ring-[var(--studio-green)]" : "hover:border-white/20"
              }`}
            >
              <span className={`block text-sm font-medium ${isSelected ? "text-[var(--studio-green)]" : "text-white"}`}>
                {opt.label}
              </span>
              <span className="mt-0.5 block text-[11px] text-[var(--studio-muted)]">{opt.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="studio-card px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-white">Text color</span>
          <span className="font-mono text-xs text-[var(--studio-muted)]">{textColor}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {presetColors.map((c) => {
            const isActive = textColor.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                aria-label={`Use color ${c}`}
                onClick={() => onTextColorChange?.(c)}
                className={`h-8 w-8 rounded-full border-2 transition ${
                  isActive ? "border-[var(--studio-green)]" : "border-white/20 hover:border-white/40"
                }`}
                style={{ backgroundColor: c }}
              />
            );
          })}
          <label
            className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/20"
            title="Custom color"
          >
            <span
              className="absolute inset-0"
              style={{ backgroundColor: textColor }}
              aria-hidden
            />
            <span className="relative text-sm leading-none text-black/70">+</span>
            <input
              type="color"
              value={textColor}
              onChange={(e) => onTextColorChange?.(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Custom color picker"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
