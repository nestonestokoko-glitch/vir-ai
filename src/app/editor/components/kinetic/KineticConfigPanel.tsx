"use client";

import type { KineticConfig } from "./kineticEngine";

type Props = {
  config: KineticConfig;
  onChange: (partial: Partial<KineticConfig>) => void; // CALLER merges partial into full config
};

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

type SliderRowProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display?: (v: number) => string;
  onChange: (v: number) => void;
};

function SliderRow({ label, value, min, max, step, display, onChange }: SliderRowProps) {
  return (
    <div className="studio-card px-4 py-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="font-mono text-xs text-[var(--studio-muted)]">
          {display ? display(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-[var(--studio-border)] accent-[var(--studio-green)]"
        aria-label={label}
      />
    </div>
  );
}

type ColorRowProps = {
  label: string;
  value: string;
  onChange: (c: string) => void;
};

function ColorRow({ label, value, onChange }: ColorRowProps) {
  return (
    <div className="studio-card px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="font-mono text-xs text-[var(--studio-muted)]">{value}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {presetColors.map((c) => {
          const isActive = value.toLowerCase() === c.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              aria-label={`Use color ${c}`}
              onClick={() => onChange(c)}
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
          <span className="absolute inset-0" style={{ backgroundColor: value }} aria-hidden />
          <span className="relative text-sm leading-none text-black/70">+</span>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={`Custom ${label} picker`}
          />
        </label>
      </div>
    </div>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="studio-card px-4 py-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--studio-border)] bg-black/40 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[var(--studio-green)]"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0b0b0f]">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type ToggleRowProps = {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
};

function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  return (
    <div className="studio-card flex items-center justify-between px-4 py-3.5">
      <span className="text-sm font-medium text-white">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          value ? "bg-[var(--studio-green)]" : "bg-[var(--studio-border)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            value ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function KineticConfigPanel({ config, onChange }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--studio-muted)]">Fine-tune the kinetic typography.</p>

      {/* Typography */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--studio-muted)]">
          Typography
        </h3>

        <div className="studio-card px-4 py-3.5">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-sm font-medium text-white">Font</span>
            <span className="font-mono text-xs text-[var(--studio-muted)]">{config.font}</span>
          </div>
          <input
            type="text"
            value={config.font}
            onChange={(e) => onChange({ font: e.target.value })}
            className="w-full rounded-lg border border-[var(--studio-border)] bg-black/40 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[var(--studio-green)]"
            aria-label="Font family"
          />
        </div>

        <SliderRow
          label="Weight"
          value={config.weight}
          min={100}
          max={900}
          step={100}
          onChange={(v) => onChange({ weight: v })}
        />
        <SliderRow
          label="Emphasis weight"
          value={config.emphasisWeight}
          min={100}
          max={900}
          step={100}
          onChange={(v) => onChange({ emphasisWeight: v })}
        />
        <SliderRow
          label="Base size"
          value={config.baseSize}
          min={24}
          max={140}
          step={2}
          onChange={(v) => onChange({ baseSize: v })}
        />
      </div>

      {/* Color */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--studio-muted)]">
          Color
        </h3>
        <ColorRow
          label="Primary color"
          value={config.primaryColor}
          onChange={(c) => onChange({ primaryColor: c })}
        />
        <ColorRow
          label="Emphasis color"
          value={config.emphasisColor}
          onChange={(c) => onChange({ emphasisColor: c })}
        />
      </div>

      {/* Motion */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--studio-muted)]">
          Motion
        </h3>
        <SliderRow
          label="Speed"
          value={config.speed}
          min={0.5}
          max={2}
          step={0.1}
          display={(v) => `${v.toFixed(1)}x`}
          onChange={(v) => onChange({ speed: v })}
        />
        <SliderRow
          label="Bounce strength"
          value={config.bounceStrength}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => onChange({ bounceStrength: v })}
        />
        <SliderRow
          label="Pop strength"
          value={config.popStrength}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => onChange({ popStrength: v })}
        />
        <SliderRow
          label="Blur amount"
          value={config.blurAmount}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => onChange({ blurAmount: v })}
        />
        <SliderRow
          label="Global scale"
          value={config.globalScale}
          min={0.5}
          max={2}
          step={0.05}
          display={(v) => `${v.toFixed(2)}x`}
          onChange={(v) => onChange({ globalScale: v })}
        />
      </div>

      {/* Lifecycle */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--studio-muted)]">
          Lifecycle
        </h3>
        <SliderRow
          label="Enter duration"
          value={config.enterDuration}
          min={0.1}
          max={1.5}
          step={0.05}
          display={(v) => `${(v ?? 0).toFixed(2)}s`}
          onChange={(v) => onChange({ enterDuration: v })}
        />
        <SliderRow
          label="Hold duration"
          value={config.holdDuration}
          min={0.1}
          max={2}
          step={0.05}
          display={(v) => `${(v ?? 0).toFixed(2)}s`}
          onChange={(v) => onChange({ holdDuration: v })}
        />
        <SliderRow
          label="Exit duration"
          value={config.exitDuration}
          min={0.1}
          max={1.5}
          step={0.05}
          display={(v) => `${(v ?? 0).toFixed(2)}s`}
          onChange={(v) => onChange({ exitDuration: v })}
        />
        <SliderRow
          label="Max visible words"
          value={config.maxVisible}
          min={1}
          max={5}
          step={1}
          display={(v) => `${v ?? 3}`}
          onChange={(v) => onChange({ maxVisible: v })}
        />
      </div>

      {/* Composition */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--studio-muted)]">
          Composition
        </h3>
        <SliderRow
          label="Composition X"
          value={config.compositionX}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => onChange({ compositionX: v })}
        />
        <SliderRow
          label="Composition Y"
          value={config.compositionY}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => onChange({ compositionY: v })}
        />
        <SliderRow
          label="Word spacing"
          value={config.wordSpacing}
          min={0.7}
          max={2}
          step={0.05}
          onChange={(v) => onChange({ wordSpacing: v })}
        />
        <SliderRow
          label="Emphasis scale"
          value={config.emphasisScale}
          min={1}
          max={2.2}
          step={0.05}
          display={(v) => `${v.toFixed(2)}x`}
          onChange={(v) => onChange({ emphasisScale: v })}
        />
      </div>

      {/* Tracking (letter-spacing animation) */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--studio-muted)]">
          Tracking
        </h3>
        <ToggleRow
          label="Tracking enabled"
          value={config.trackingEnabled}
          onChange={(v) => onChange({ trackingEnabled: v })}
        />
        <SliderRow
          label="Enter tracking"
          value={config.trackingEnter}
          min={-20}
          max={0}
          step={1}
          display={(v) => `${v}%`}
          onChange={(v) => onChange({ trackingEnter: v })}
        />
        <SliderRow
          label="Final tracking"
          value={config.trackingFinal}
          min={-10}
          max={10}
          step={1}
          display={(v) => `${v}%`}
          onChange={(v) => onChange({ trackingFinal: v })}
        />
        <SliderRow
          label="Exit tracking"
          value={config.trackingExit}
          min={0}
          max={30}
          step={1}
          display={(v) => `${v}%`}
          onChange={(v) => onChange({ trackingExit: v })}
        />
        <SliderRow
          label="Enter duration"
          value={config.trackingEnterDuration}
          min={0.1}
          max={1.5}
          step={0.05}
          display={(v) => `${(v ?? 0).toFixed(2)}s`}
          onChange={(v) => onChange({ trackingEnterDuration: v })}
        />
        <SliderRow
          label="Exit duration"
          value={config.trackingExitDuration}
          min={0.1}
          max={1.5}
          step={0.05}
          display={(v) => `${(v ?? 0).toFixed(2)}s`}
          onChange={(v) => onChange({ trackingExitDuration: v })}
        />
        <ToggleRow
          label="Exit tracking enabled"
          value={config.trackingExitEnabled}
          onChange={(v) => onChange({ trackingExitEnabled: v })}
        />
        <SelectRow
          label="Tracking easing"
          value={config.trackingEasing}
          options={[
            { label: "Ease out", value: "ease-out" },
            { label: "Ease in-out", value: "ease-in-out" },
            { label: "Smooth", value: "smooth" },
          ]}
          onChange={(v) => onChange({ trackingEasing: v as KineticConfig["trackingEasing"] })}
        />
        <ToggleRow
          label="Emphasis tracking"
          value={config.trackingEmphasis}
          onChange={(v) => onChange({ trackingEmphasis: v })}
        />
      </div>
    </div>
  );
}
