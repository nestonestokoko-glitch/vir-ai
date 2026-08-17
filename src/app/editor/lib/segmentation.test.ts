import { segmentText, segmentByWords, splitIntoSentences, splitIntoPhrases } from "./segmentation";

describe("Text Segmentation", () => {
  describe("splitIntoSentences", () => {
    it("should split text into sentences", () => {
      const text = "Hey, I am Ankit. I create videos.";
      const sentences = splitIntoSentences(text);
      expect(sentences).toEqual(["Hey, I am Ankit", "I create videos"]);
    });

    it("should handle multiple punctuation", () => {
      const text = "Wow!!! This is amazing... Really?";
      const sentences = splitIntoSentences(text);
      expect(sentences).toEqual(["Wow", "This is amazing", "Really"]);
    });
  });

  describe("splitIntoPhrases", () => {
    it("should split long sentences into phrases", () => {
      const sentence = "I create cinematic videos for social media and Youtube";
      const phrases = splitIntoPhrases(sentence);
      expect(phrases.length).toBeGreaterThan(0);
    });

    it("should handle commas", () => {
      const sentence = "Hello, world, how are you?";
      const phrases = splitIntoPhrases(sentence);
      expect(phrases).toEqual(["Hello", "world", "how are you?"]);
    });
  });

  describe("segmentText", () => {
    it("should segment short text", () => {
      const text = "Hey, I am Ankit.";
      const segments = segmentText(text, 15);
      expect(segments.length).toBeGreaterThan(0);
      expect(segments[0].text).toBe("Hey, I am Ankit");
    });

    it("should segment longer text", () => {
      const text = "Hey, I am Ankit. I create cinematic videos for social media.";
      const segments = segmentText(text, 15);
      expect(segments.length).toBeGreaterThan(1);
      expect(segments[0].text + " " + segments[1].text).toContain("Hey, I am Ankit");
    });

    it("should respect duration", () => {
      const text = "Short text";
      const segments1 = segmentText(text, 5);
      const segments2 = segmentText(text, 10);
      // Both should have same segmentation but different timing
      expect(segments1.length).toEqual(segments2.length);
      expect(segments1[0].endFrame - segments1[0].startFrame).toBeLessThan(
        segments2[0].endFrame - segments2[0].startFrame
      );
    });
  });

  describe("segmentByWords", () => {
    it("should segment by words", () => {
      const text = "Hey I am Ankit";
      const segments = segmentByWords(text, 15, 30, 2);
      expect(segments.length).toBe(2);
      expect(segments[0].text).toBe("Hey I");
      expect(segments[1].text).toBe("am Ankit");
    });
  });
});