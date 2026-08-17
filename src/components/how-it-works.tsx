import { FeatureStoryboardCard } from "@/components/FeatureStoryboardCard";

const STEPS = [
  {
    num: "01",
    title: "Enter Your Text",
    description:
      "Type or paste your English text into the editor. The system automatically segments it for optimal animation timing.",
  },
  {
    num: "02",
    title: "Choose Style & Animation",
    description:
      "Select from professional typography styles and animation presets to match your vision and brand.",
  },
  {
    num: "03",
    title: "Customize & Preview",
    description:
      "Adjust colors, timing, positioning, and see your creation in real-time with our live preview.",
  },
  {
    num: "04",
    title: "Choose Format",
    description:
      "Select portrait (9:16) for social media stories or landscape (16:9) for YouTube and presentations.",
  },
  {
    num: "05",
    title: "Generate & Download",
    description:
      "One-click rendering creates your MP4 reel ready for download and sharing across platforms.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-black py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[#E1E0CC]">
            How It Works
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-400">
            Simple 5-step process to create stunning typography reels
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => (
            <FeatureStoryboardCard key={step.num} num={step.num} title={step.title}>
              {step.description}
            </FeatureStoryboardCard>
          ))}
        </div>
      </div>
    </section>
  );
};
