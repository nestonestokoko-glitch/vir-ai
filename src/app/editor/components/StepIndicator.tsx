"use client";

export const STUDIO_STEPS = [
  { id: 1, label: "Content" },
  { id: 2, label: "Format" },
  { id: 3, label: "Font" },
  { id: 4, label: "Style" },
  { id: 5, label: "Animation" },
  { id: 6, label: "Settings" },
] as const;

export type StudioStepId = (typeof STUDIO_STEPS)[number]["id"];

type StepIndicatorProps = {
  currentStep: StudioStepId;
  onStepClick?: (step: StudioStepId) => void;
  compact?: boolean;
};

export default function StepIndicator({
  currentStep,
  onStepClick,
  compact = false,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Editing steps" className="shrink-0">
      {compact ? (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 studio-scroll">
          {STUDIO_STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepClick?.(step.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isCurrent
                    ? "bg-[var(--studio-green)] text-black"
                    : isCompleted
                      ? "bg-[var(--studio-green-muted)] text-[var(--studio-green)]"
                      : "bg-[var(--studio-surface)] text-[var(--studio-muted)]"
                }`}
              >
                {step.label}
              </button>
            );
          })}
        </div>
      ) : (
        <ol className="flex flex-col gap-0">
          {STUDIO_STEPS.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isLast = index === STUDIO_STEPS.length - 1;

            return (
              <li key={step.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => onStepClick?.(step.id)}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      isCurrent
                        ? "bg-[var(--studio-green)] text-black ring-2 ring-[var(--studio-green-muted)]"
                        : isCompleted
                          ? "bg-[var(--studio-green)] text-black"
                          : "border border-[var(--studio-border)] bg-[var(--studio-surface)] text-[var(--studio-muted)]"
                    }`}
                  >
                    {isCompleted && !isCurrent ? (
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </button>
                  {!isLast && (
                    <div
                      className={`my-1 h-6 w-px ${
                        isCompleted ? "bg-[var(--studio-green)]" : "bg-[var(--studio-border)]"
                      }`}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onStepClick?.(step.id)}
                  className={`pt-1 text-left text-sm transition-colors ${
                    isCurrent
                      ? "font-semibold text-[var(--studio-green)]"
                      : isCompleted
                        ? "text-white/80"
                        : "text-[var(--studio-muted)]"
                  }`}
                >
                  {step.label}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
}
