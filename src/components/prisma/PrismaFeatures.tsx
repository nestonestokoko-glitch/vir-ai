"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { FeatureStoryboardCard } from "@/components/FeatureStoryboardCard";

const FEATURE_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4";

const listCards = [
  {
    num: "01",
    title: "Project Storyboard.",
    icon: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85",
    items: [
      "Auto-generated transcripts",
      "Scene & hook detection",
      "Caption styling presets",
      "One-click export to socials",
    ],
  },
  {
    num: "02",
    title: "Smart Critiques.",
    icon: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85",
    items: [
      "AI analysis of pacing & hooks",
      "Creative notes on every clip",
      "Tool integrations for your stack",
    ],
  },
  {
    num: "03",
    title: "Immersion Capsule.",
    icon: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85",
    items: [
      "Notification silencing while editing",
      "Ambient soundscapes for focus",
      "Calendar schedule syncing",
    ],
  },
];

export function PrismaFeatures() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative min-h-screen w-full bg-black px-4 py-24 sm:px-6 md:px-8">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.15]" />

      <div ref={ref} className="relative mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="text-xl font-normal text-[#E1E0CC] sm:text-2xl md:text-3xl lg:text-4xl">
            Studio-grade clipping for visionary creators.
          </p>
          <p className="mt-2 text-xl font-normal text-gray-500 sm:text-2xl md:text-3xl lg:text-4xl">
            Built for creators. Powered by AI.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-2 md:grid-cols-2 md:gap-1 lg:grid-cols-4">
          {/* Video card */}
          <motion.div
            className="relative h-[400px] overflow-hidden rounded-2xl bg-black md:h-[520px]"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0 * 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              src={FEATURE_VIDEO}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <p className="absolute bottom-4 left-4 text-lg font-medium text-[#E1E0CC]">
              Your clip canvas.
            </p>
          </motion.div>

          {/* List cards */}
          {listCards.map((card, i) => (
            <motion.div
              key={card.num}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{
                duration: 0.6,
                delay: (i + 1) * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <FeatureStoryboardCard
                num={card.num}
                title={card.title}
                icon={card.icon}
                items={card.items}
                ctaLabel="Learn more"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PrismaFeatures;
