"use client";

import { useState, useCallback } from "react";
import TextEditor from "./components/TextEditor";
import FontSelector from "./components/FontSelector";
import StyleSelector from "./components/StyleSelector";
import AnimationSelector from "./components/AnimationSelector";
import FormatSelector from "./components/FormatSelector";
import PreviewCanvas from "./components/PreviewCanvas";
import Timeline from "./components/Timeline";
import ExportButton from "./components/ExportButton";
import StudioHeader from "./components/StudioHeader";
import StepIndicator, { STUDIO_STEPS, type StudioStepId } from "./components/StepIndicator";
import FinalSettings from "./components/FinalSettings";
import KineticConfigPanel from "./components/kinetic/KineticConfigPanel";
import { defaultKineticConfig } from "./components/kinetic/kineticEngine";
import { useProject } from "./hooks/useProject";

const STEP_TITLES: Record<StudioStepId, string> = {
  1: "Content",
  2: "Format",
  3: "Font",
  4: "Text Style",
  5: "Animation",
  6: "Final Settings",
};

export default function Editor() {
  const { project, updateProject, resetProject } = useProject();
  const [currentStep, setCurrentStep] = useState<StudioStepId>(1);

  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, 6) as StudioStepId);
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1) as StudioStepId);
  }, []);

  const handleNewProject = () => {
    resetProject();
    setCurrentStep(1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TextEditor
            text={project.text || ""}
            onTextChange={(text) => updateProject({ text })}
          />
        );
      case 2:
        return (
          <FormatSelector
            format={project.format}
            onFormatChange={(format) => updateProject({ format })}
          />
        );
      case 3:
        return (
          <FontSelector
            font={project.font || "Inter"}
            weight={project.weight || 400}
            size={project.size ?? 1}
            onFontChange={(font) => updateProject({ font })}
            onWeightChange={(weight) => updateProject({ weight })}
            onSizeChange={(size) => updateProject({ size })}
          />
        );
      case 4:
        return (
          <>
            <StyleSelector
              style={project.style || "Modern"}
              onStyleChange={(style) => updateProject({ style })}
              textColor={project.textColor || "#FFFFFF"}
              onTextColorChange={(textColor) => updateProject({ textColor })}
            />
            {project.style === "Kinetic" && (
              <KineticConfigPanel
                config={project.kinetic ?? defaultKineticConfig}
                onChange={(partial) =>
                  updateProject({ kinetic: { ...(project.kinetic ?? defaultKineticConfig), ...partial } })
                }
              />
            )}
          </>
        );
      case 5:
        return (
          <AnimationSelector
            animation={project.animation || "Fade"}
            speed={project.animationSpeed ?? 1}
            onAnimationChange={(animation) => updateProject({ animation })}
            onSpeedChange={(animationSpeed) => updateProject({ animationSpeed })}
          />
        );
      case 6:
        return <FinalSettings project={project} onUpdate={updateProject} />;
      default:
        return null;
    }
  };

  return (
    <div className="studio-bg flex min-h-screen flex-col text-white">
      <StudioHeader onNewProject={handleNewProject} />

      <main className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left: Video Preview */}
        <section className="flex flex-col lg:w-[38%] xl:w-[35%] lg:min-h-0 lg:border-r lg:border-[var(--studio-border)]">
          <PreviewCanvas project={project} />
          <Timeline
            project={project}
            onSegmentUpdate={(index, updates) => {
              const newSegments = [...project.segments];
              newSegments[index] = { ...newSegments[index], ...updates };
              updateProject({ segments: newSegments });
            }}
            onSegmentDelete={(index) => {
              const newSegments = [...project.segments];
              newSegments.splice(index, 1);
              updateProject({ segments: newSegments });
            }}
            onSegmentAdd={(text, startTime, endTime) => {
              updateProject({
                segments: [
                  ...project.segments,
                  {
                    id: String(Date.now() + Math.random()),
                    text,
                    startFrame: startTime * 30,
                    endFrame: endTime * 30,
                    font: project.font || "Inter",
                    weight: project.weight || 400,
                    style: project.style || "Modern",
                    animation: project.animation || "Fade",
                    position: { x: 0, y: 0 },
                  },
                ],
              });
            }}
          />
        </section>

        {/* Right: Editing Panel */}
        <section className="flex flex-1 flex-col lg:min-h-0 lg:w-[62%] xl:w-[65%]">
          <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
            {/* Step indicator — sidebar on desktop, compact on mobile */}
            <aside className="hidden shrink-0 border-b border-[var(--studio-border)] p-4 lg:block lg:w-44 lg:border-b-0 lg:border-r xl:w-48 xl:p-6">
              <StepIndicator
                currentStep={currentStep}
                onStepClick={setCurrentStep}
              />
            </aside>

            {/* Step content */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="shrink-0 border-b border-[var(--studio-border)] px-4 py-3 lg:px-6 lg:py-4">
                <div className="mb-3 lg:hidden">
                  <StepIndicator
                    currentStep={currentStep}
                    onStepClick={setCurrentStep}
                    compact
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--studio-muted)]">
                      Step {currentStep} of {STUDIO_STEPS.length}
                    </p>
                    <h2 className="text-lg font-semibold text-white sm:text-xl">
                      {STEP_TITLES[currentStep]}
                    </h2>
                  </div>
                  <span className="hidden font-mono text-xs text-[var(--studio-muted)] sm:block">
                    {currentStep}/{STUDIO_STEPS.length}
                  </span>
                </div>
              </div>

              <div className="studio-scroll flex-1 overflow-y-auto px-4 py-4 lg:px-6 lg:py-5">
                {renderStepContent()}
              </div>

              {/* Navigation + Generate */}
              <div className="sticky bottom-0 z-40 shrink-0 border-t border-[var(--studio-border)] bg-black px-4 py-3 lg:static lg:px-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={currentStep === 1}
                    className="rounded-lg border border-[var(--studio-border)] px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Back
                  </button>
                  {currentStep < 6 && (
                    <button
                      type="button"
                      onClick={goNext}
                      className="studio-btn-primary rounded-lg px-6 py-2.5 text-sm"
                    >
                      Next
                    </button>
                  )}
                </div>
                <ExportButton project={project} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
