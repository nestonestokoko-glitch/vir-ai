"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

interface AnimatedLetterProps {
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
}

export function AnimatedLetter({ char, progress, range }: AnimatedLetterProps) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return <motion.span style={{ opacity }}>{char}</motion.span>;
}

export default AnimatedLetter;
