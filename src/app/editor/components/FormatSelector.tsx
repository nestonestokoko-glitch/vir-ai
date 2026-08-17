"use client";

type FormatSelectorProps = {
  format: "portrait" | "landscape";
  onFormatChange: (format: "portrait" | "landscape") => void;
};

const formats = [
  {
    value: "portrait" as const,
    label: "Portrait",
    ratio: "9:16",
    dimensions: "1080 × 1920",
    icon: (
      <div className="mx-auto h-16 w-9 rounded border-2 border-current" />
    ),
  },
  {
    value: "landscape" as const,
    label: "Landscape",
    ratio: "16:9",
    dimensions: "1920 × 1080",
    icon: (
      <div className="mx-auto h-9 w-16 rounded border-2 border-current" />
    ),
  },
];

export default function FormatSelector({ format, onFormatChange }: FormatSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--studio-muted)]">
        Choose the aspect ratio for your video.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {formats.map((fmt) => {
          const isSelected = format === fmt.value;
          return (
            <button
              key={fmt.value}
              type="button"
              onClick={() => onFormatChange(fmt.value)}
              className={`studio-card flex flex-col items-center gap-3 p-5 transition-all ${
                isSelected ? "studio-card-selected ring-1 ring-[var(--studio-green)]" : "hover:border-white/20"
              }`}
            >
              <div className={isSelected ? "text-[var(--studio-green)]" : "text-white/40"}>
                {fmt.icon}
              </div>
              <div className="text-center">
                <p className={`text-sm font-semibold ${isSelected ? "text-[var(--studio-green)]" : "text-white"}`}>
                  {fmt.label}
                </p>
                <p className="mt-0.5 text-xs text-[var(--studio-muted)]">{fmt.ratio}</p>
                <p className="mt-1 text-[10px] text-[var(--studio-muted)]">{fmt.dimensions}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
