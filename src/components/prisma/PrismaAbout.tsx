"use client";

import { useRef } from "react";
import { useScroll } from "motion/react";
import { WordsPullUpMultiStyle } from "./WordsPullUpMultiStyle";
import { AnimatedLetter } from "./AnimatedLetter";

const bodyText =
  "Over the last few years, VIR AI has helped creators and teams ship clips for Reels, Shorts, and TikTok — work that has earned millions of views across major social platforms.";

export function PrismaAbout() {
  const targetRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 0.8", "end 0.2"],
  });
  const chars = Array.from(bodyText);
  const total = chars.length;

  return (
    <section className="bg-black px-4 py-24 sm:py-32 md:py-40">
      <div className="mx-auto max-w-6xl rounded-3xl bg-[#101010] px-6 py-16 text-center sm:px-12 sm:py-24">
        <p className="text-[10px] uppercase tracking-widest text-[#DEDBC8] sm:text-xs">
          Visual arts
        </p>

        <div className="mx-auto mt-8 max-w-3xl text-3xl leading-[0.95] sm:leading-[0.9] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
          <WordsPullUpMultiStyle
            segments={[
              { text: "I am VIR AI,", className: "font-normal" },
              {
                text: "an AI clipping studio.",
                className: "italic font-[family-name:var(--font-instrument)]",
              },
              {
                text: "We turn long videos into sharp, scroll-stopping clips with smart pacing and caption sync.",
                className: "font-normal",
              },
            ]}
          />
        </div>

        <p
          ref={targetRef}
          className="mx-auto mt-10 max-w-2xl text-left text-xs leading-relaxed text-[#DEDBC8] sm:text-sm md:text-base"
        >
          {chars.map((char, i) => (
            <AnimatedLetter
              key={i}
              char={char}
              progress={scrollYProgress}
              range={[i / total - 0.1, i / total + 0.05]}
            />
          ))}
        </p>
      </div>
    </section>
  );
}

export default PrismaAbout;
