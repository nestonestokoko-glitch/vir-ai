/**
 * Animation presets based on PRD section 21
 * Each preset defines how text should animate in and out
 */

/**
 * Animation configuration type based on PRD section 22
 */
export type AnimationPreset = {
  id: string;
  name: string;
  enter: {
    type: string;
    duration: number; // in seconds
    easing: string;
    delay?: number; // in seconds
  };
  exit?: {
    type: string;
    duration: number; // in seconds
    easing: string;
  };
  stagger?: {
    enabled: boolean;
    amount: number; // in seconds
  };
};

// Define animation presets based on PRD section 21
export const animationPresets: Record<string, AnimationPreset> = {
  Fade: {
    id: "fade",
    name: "Fade",
    enter: {
      type: "fade",
      duration: 0.5,
      easing: "ease-in-out",
    },
    exit: {
      type: "fade",
      duration: 0.5,
      easing: "ease-in-out",
    },
  },
  SlideUp: {
    id: "slide-up",
    name: "Slide Up",
    enter: {
      type: "slide",
      duration: 0.5,
      easing: "ease-out",
      delay: 0,
    },
    exit: {
      type: "slide",
      duration: 0.5,
      easing: "ease-in",
    },
  },
  SlideDown: {
    id: "slide-down",
    name: "Slide Down",
    enter: {
      type: "slide",
      duration: 0.5,
      easing: "ease-out",
      delay: 0,
    },
    exit: {
      type: "slide",
      duration: 0.5,
      easing: "ease-in",
    },
  },
  Scale: {
    id: "scale",
    name: "Scale",
    enter: {
      type: "scale",
      duration: 0.5,
      easing: "ease-out",
    },
    exit: {
      type: "scale",
      duration: 0.5,
      easing: "ease-in",
    },
  },
  Pop: {
    id: "pop",
    name: "Pop",
    enter: {
      type: "scale",
      duration: 0.3,
      easing: "back-out(1.7)",
    },
    exit: {
      type: "scale",
      duration: 0.3,
      easing: "back-in(1.7)",
    },
  },
  Blur: {
    id: "blur",
    name: "Blur",
    enter: {
      type: "blur",
      duration: 0.5,
      easing: "ease-out",
    },
    exit: {
      type: "blur",
      duration: 0.5,
      easing: "ease-in",
    },
  },
  Typewriter: {
    id: "typewriter",
    name: "Typewriter",
    enter: {
      type: "typewriter",
      duration: 0.05, // per character
      easing: "linear",
    },
    stagger: {
      enabled: true,
      amount: 0.05, // 50ms between characters
    },
  },
  WordReveal: {
    id: "word-reveal",
    name: "Word Reveal",
    enter: {
      type: "fade",
      duration: 0.3,
      easing: "ease-out",
    },
    stagger: {
      enabled: true,
      amount: 0.2, // 200ms between words
    },
  },
  PhraseReveal: {
    id: "phrase-reveal",
    name: "Phrase Reveal",
    enter: {
      type: "fade",
      duration: 0.5,
      easing: "ease-out",
    },
    stagger: {
      enabled: true,
      amount: 0.5, // 500ms between phrases
    },
  },
  Stagger: {
    id: "stagger",
    name: "Stagger",
    enter: {
      type: "fade",
      duration: 0.3,
      easing: "ease-out",
    },
    stagger: {
      enabled: true,
      amount: 0.1, // 100ms between elements
    },
  },
  Wipe: {
    id: "wipe",
    name: "Wipe",
    enter: {
      type: "wipe",
      duration: 0.5,
      easing: "ease-in-out",
    },
    exit: {
      type: "wipe",
      duration: 0.5,
      easing: "ease-in-out",
    },
  },
  Glitch: {
    id: "glitch",
    name: "Glitch",
    enter: {
      type: "glitch",
      duration: 0.5,
      easing: "ease-in-out",
    },
    exit: {
      type: "glitch",
      duration: 0.5,
      easing: "ease-in-out",
    },
  },
};

/**
 * Get animation preset by ID
 */
export function getAnimationPreset(id: string): AnimationPreset | undefined {
  return (
    animationPresets[id] ||
    Object.values(animationPresets).find(
      (p) => p.id === id || p.name.toLowerCase() === id.toLowerCase()
    )
  );
}

/**
 * Get all animation preset IDs
 */
export function getAnimationPresetIds(): string[] {
  return Object.keys(animationPresets);
}