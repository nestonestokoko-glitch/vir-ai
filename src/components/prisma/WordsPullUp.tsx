"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface WordsPullUpProps {
  text: string;
  showAsterisk?: boolean;
  className?: string;
  delayStart?: number;
}

export function WordsPullUp({
  text,
  showAsterisk = false,
  className = "",
  delayStart = 0,
}: WordsPullUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const words = text.split(" ");

  return (
    <span ref={ref} className={`inline-flex flex-wrap justify-center ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="relative mr-[0.25em] inline-block"
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{
            duration: 0.6,
            delay: delayStart + i * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {word}
          {showAsterisk && i === words.length - 1 ? (
            <sup className="absolute -right-[0.3em] top-[0.65em] text-[0.31em]">
              *
            </sup>
          ) : null}
        </motion.span>
      ))}
    </span>
  );
}

export default WordsPullUp;
