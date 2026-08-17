"use client";

type FontSelectorProps = {
  font: string;
  weight: number;
  size: number;
  onFontChange: (font: string) => void;
  onWeightChange: (weight: number) => void;
  onSizeChange: (size: number) => void;
};

const featuredFonts = [
  "Inter",
  "Roboto",
  "Poppins",
  "Montserrat",
  "Bebas Neue",
  "Oswald",
  "Playfair Display",
  "Space Grotesk",
  "JetBrains Mono",
];

const MIN_SIZE = 0.5;
const MAX_SIZE = 2;

export default function FontSelector({
  font,
  size,
  onFontChange,
  onSizeChange,
}: FontSelectorProps) {
  const clamp = (v: number) => Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(v * 100) / 100));
  const pct = Math.round(size * 100);

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--studio-muted)]">
        Select a font for your typography video.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {featuredFonts.map((f) => {
          const isSelected = font === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => onFontChange(f)}
              className={`studio-card px-4 py-3 text-left transition-all ${
                isSelected ? "studio-card-selected ring-1 ring-[var(--studio-green)]" : "hover:border-white/20"
              }`}
            >
              <span
                style={{ fontFamily: `"${f}", sans-serif` }}
                className={`block truncate text-base ${isSelected ? "text-[var(--studio-green)]" : "text-white"}`}
              >
                {f}
              </span>
              <span
                style={{ fontFamily: `"${f}", sans-serif` }}
                className="mt-0.5 block truncate text-xs text-[var(--studio-muted)]"
              >
                The quick brown fox
              </span>
            </button>
          );
        })}
      </div>

      <div className="studio-card px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-white">Text size</span>
          <span className="font-mono text-xs text-[var(--studio-muted)]">{pct}%</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Decrease text size"
            onClick={() => onSizeChange(clamp(size - 0.1))}
            disabled={size <= MIN_SIZE}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--studio-border)] text-lg text-white transition-colors hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            −
          </button>
          <input
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            step={0.05}
            value={size}
            onChange={(e) => onSizeChange(clamp(Number(e.target.value)))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-[var(--studio-border)] accent-[var(--studio-green)]"
            aria-label="Text size"
          />
          <button
            type="button"
            aria-label="Increase text size"
            onClick={() => onSizeChange(clamp(size + 0.1))}
            disabled={size >= MAX_SIZE}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--studio-border)] text-lg text-white transition-colors hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
