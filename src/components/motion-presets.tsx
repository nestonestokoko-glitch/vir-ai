import MotionPresetCard from "./motion-preset-card";

export const MotionPresets = () => {
  return (
    <section id="animation" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Animation Presets
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from professionally crafted animation presets to bring your text to life
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MotionPresetCard
            name="Fade"
            description="Smooth fade in/out effect"
            icon="fade"
          />
          <MotionPresetCard
            name="Slide Up"
            description="Text slides up from below"
            icon="slide-up"
          />
          <MotionPresetCard
            name="Slide Down"
            description="Text slides down from above"
            icon="slide-down"
          />
          <MotionPresetCard
            name="Slide Left"
            description="Text slides in from left"
            icon="slide-left"
          />
          <MotionPresetCard
            name="Slide Right"
            description="Text slides in from right"
            icon="slide-right"
          />
          <MotionPresetCard
            name="Scale"
            description="Text scales up/down"
            icon="scale"
          />
          <MotionPresetCard
            name="Typewriter"
            description="Classic typewriter effect"
            icon="typewriter"
          />
          <MotionPresetCard
            name="Word Reveal"
            description="Words reveal one by one"
            icon="word-reveal"
          />
          <MotionPresetCard
            name="Phrase Reveal"
            description="Phrases reveal sequentially"
            icon="phrase-reveal"
          />
          <MotionPresetCard
            name="Stagger"
            description="Elements animate with delay"
            icon="stagger"
          />
          <MotionPresetCard
            name="Blur"
            description="Blur in/out effect"
            icon="blur"
          />
          <MotionPresetCard
            name="Glitch"
            description="Digital glitch effect"
            icon="glitch"
          />
        </div>
      </div>
    </section>
  );
};