import { animationPresets, getAnimationPreset, getAnimationPresetIds } from "./animations";

describe("Animation Presets", () => {
  describe("animationPresets", () => {
    it("should have all expected presets", () => {
      const expectedPresets = [
        "Fade",
        "SlideUp",
        "SlideDown",
        "Scale",
        "Pop",
        "Blur",
        "Typewriter",
        "WordReveal",
        "PhraseReveal",
        "Stagger",
        "Wipe",
        "Glitch",
      ];
      expect(Object.keys(animationPresets)).toEqual(expect.arrayContaining(expectedPresets));
    });

    it("should have correct Fade preset", () => {
      const fade = animationPresets.Fade;
      expect(fade.name).toBe("Fade");
      expect(fade.enter.type).toBe("fade");
      expect(fade.enter.duration).toBe(0.5);
    });

    it("should have correct Typewriter preset with stagger", () => {
      const typewriter = animationPresets.Typewriter;
      expect(typewriter.name).toBe("Typewriter");
      expect(typewriter.enter.type).toBe("typewriter");
      expect(typewriter.stagger?.enabled).toBe(true);
      expect(typewriter.stagger?.amount).toBe(0.05);
    });
  });

  describe("getAnimationPreset", () => {
    it("should return preset for valid ID", () => {
      const preset = getAnimationPreset("fade");
      expect(preset).toBeDefined();
      expect(preset?.name).toBe("Fade");
    });

    it("should return undefined for invalid ID", () => {
      const preset = getAnimationPreset("invalid");
      expect(preset).toBeUndefined();
    });
  });

  describe("getAnimationPresetIds", () => {
    it("should return all preset IDs", () => {
      const ids = getAnimationPresetIds();
      expect(ids.length).toBeGreaterThan(0);
      expect(ids).toContain("Fade");
      expect(ids).toContain("Typewriter");
    });
  });
});