"use client";

type AnimationSelectorProps = {
  animation: string;
  speed: number;
  onAnimationChange: (animation: string) => void;
  onSpeedChange: (speed: number) => void;
};

const animationOptions = [
  { label: "Reveal", value: "Reveal" },
  { label: "Bounce", value: "Bounce" },
  { label: "Fade", value: "Fade" },
  { label: "Pop", value: "Pop" },
  { label: "Slide", value: "SlideUp" },
  { label: "Scale", value: "Scale" },
  { label: "Word Reveal", value: "WordReveal" },
  { label: "Phrase Reveal", value: "PhraseReveal" },
  { label: "Typewriter", value: "Typewriter" },
  { label: "Stagger", value: "Stagger" },
  { label: "Glitch", value: "Glitch" },
];

const MIN_SPEED = 0.5;
const MAX_SPEED = 2;

export default function AnimationSelector({
  animation,
  speed,
  onAnimationChange,
  onSpeedChange,
}: AnimationSelectorProps) {
  const clamp = (v: number) => Math.min(MAX_SPEED, Math.max(MIN_SPEED, Math.round(v * 100) / 100));
  const label = speed >= 1.95 ? "2x" : `${speed.toFixed(1)}x`;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-sm text-[var(--studio-muted)]">
          Pick how your text animates on screen.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {animationOptions.map((opt) => {
            const isSelected = animation === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onAnimationChange(opt.value)}
                className={`studio-card px-3 py-3 text-center transition-all ${
                  isSelected ? "studio-card-selected ring-1 ring-[var(--studio-green)]" : "hover:border-white/20"
                }`}
              >
                <span className={`text-sm font-medium ${isSelected ? "text-[var(--studio-green)]" : "text-white"}`}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="studio-card px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-white">Animation speed</span>
          <span className="font-mono text-xs text-[var(--studio-muted)]">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Decrease speed"
            onClick={() => onSpeedChange(clamp(speed - 0.1))}
            disabled={speed <= MIN_SPEED}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--studio-border)] text-lg text-white transition-colors hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            −
          </button>
          <input
            type="range"
            min={MIN_SPEED}
            max={MAX_SPEED}
            step={0.1}
            value={speed}
            onChange={(e) => onSpeedChange(clamp(Number(e.target.value)))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-[var(--studio-border)] accent-[var(--studio-green)]"
            aria-label="Animation speed"
          />
          <button
            type="button"
            aria-label="Increase speed"
            onClick={() => onSpeedChange(clamp(speed + 0.1))}
            disabled={speed >= MAX_SPEED}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--studio-border)] text-lg text-white transition-colors hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            +
          </button>
        </div>
        <p className="mt-2 text-[11px] text-[var(--studio-muted)]">
          Default 1x — higher is faster. Drives the Reveal, Bounce, Fade, and Pop animations.
        </p>
      </div>
    </div>
  );
}
