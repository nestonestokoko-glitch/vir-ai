"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  delayStart?: number;
}

export function WordsPullUpMultiStyle({
  segments,
  className = "",
  delayStart = 0,
}: WordsPullUpMultiStyleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  let wordIndex = 0;

  return (
    <span ref={ref} className={`inline-flex flex-wrap justify-center ${className}`}>
      {segments.map((seg, si) => (
        <span key={si} className={seg.className}>
          {seg.text.split(" ").map((word, wi) => {
            const idx = wordIndex++;
            return (
              <motion.span
                key={wi}
                className="relative mr-[0.25em] inline-block"
                initial={{ y: 20, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : {}}
                transition={{
                  duration: 0.6,
                  delay: delayStart + idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {word}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

export default WordsPullUpMultiStyle;
