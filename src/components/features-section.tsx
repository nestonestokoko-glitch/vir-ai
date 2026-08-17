import { FeatureStoryboardCard } from "@/components/FeatureStoryboardCard";

const FEATURES = [
  {
    title: "Professional Quality",
    description:
      "Export in HD MP4 format with smooth animations and professional typography rendering",
    icon: (
      <svg className="h-8 w-8 text-[#DEDBC8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 0a2 2 0 100-4 2 2 0 000 4zm-6 0a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 100-4 2 2 0 000 4z"></path>
      </svg>
    ),
  },
  {
    title: "Easy to Use",
    description:
      "Intuitive interface with drag-and-drop timeline and real-time preview - no experience needed",
    icon: (
      <svg className="h-8 w-8 text-[#DEDBC8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18m-9 4v9m-9-4v9m9-4V7l4 4 4-4m0 5h.01M9 16h.01"></path>
      </svg>
    ),
  },
  {
    title: "Mobile Optimized",
    description:
      "Create vertical 9:16 reels perfect for Instagram, TikTok, and YouTube Shorts",
    icon: (
      <svg className="h-8 w-8 text-[#DEDBC8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v6a2 2 0 002 2"></path>
      </svg>
    ),
  },
];

export const FeaturesSection = () => {
  return (
    <section className="bg-black py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[#E1E0CC]">
            Why Choose VIR AI
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-400">
            Professional tools designed for creators who want stunning typography reels without the complexity
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureStoryboardCard
              key={feature.title}
              title={feature.title}
              iconNode={feature.icon}
              ctaLabel="Learn more"
            >
              {feature.description}
            </FeatureStoryboardCard>
          ))}
        </div>
      </div>
    </section>
  );
};
