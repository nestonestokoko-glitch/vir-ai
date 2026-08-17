/**
 * Text segmentation utilities based on PRD section 16
 * Implements a deterministic segmentation algorithm
 */

/**
 * Split text into sentences using basic punctuation
 */
export function splitIntoSentences(text: string): string[] {
  // Simple sentence splitting on common punctuation
  return text
    .trim()
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);
}

/**
 * Split long sentences into phrases based on commas and conjunctions
 */
export function splitIntoPhrases(sentence: string): string[] {
  // Split on commas and common conjunctions
  return sentence
    .split(/[,;]|(?:\s+(?:and|but|or)\s+)/i)
    .map(phrase => phrase.trim())
    .filter(phrase => phrase.length > 0);
}

/**
 * Main segmentation function that follows the PRD algorithm
 */
export function segmentText(
  text: string,
  duration: number,
  fps: number = 30
): Array<{
  text: string;
  startFrame: number;
  endFrame: number;
}> {
  if (!text.trim()) {
    return [];
  }

  // Step 1: Split text into sentences
  const sentences = splitIntoSentences(text);

  // Step 2: Split long sentences into phrases
  const phrases: string[] = [];
  sentences.forEach(sentence => {
    if (sentence.length > 50) { // Consider sentences > 50 chars as "long"
      phrases.push(...splitIntoPhrases(sentence));
    } else {
      phrases.push(sentence);
    }
  });

  // Step 3: Use punctuation as natural boundaries (already done in splitting)

  // Step 4: If a phrase is too long for the canvas, split it into smaller groups
  // For MVP, we'll assume phrases are reasonable length

  // Step 5: Assign each group a timeline duration
  const totalFrames = duration * fps;
  const timePerPhrase = totalFrames / Math.max(phrases.length, 1);

  const segments: Array<{
    text: string;
    startFrame: number;
    endFrame: number;
  }> = [];

  phrases.forEach((phrase, index) => {
    const startFrame = Math.floor(index * timePerPhrase);
    const endFrame = Math.floor((index + 1) * timePerPhrase);

    segments.push({
      text: phrase,
      startFrame,
      endFrame: Math.min(endFrame, totalFrames - 1), // Ensure we don't exceed total
    });
  });

  // Step 6: Apply selected animation preset (handled elsewhere)

  return segments;
}

/**
 * Alternative segmentation: simple word-based approach for testing
 */
export function segmentByWords(
  text: string,
  duration: number,
  fps: number = 30,
  wordsPerSegment: number = 3
): Array<{
  text: string;
  startFrame: number;
  endFrame: number;
}> {
  if (!text.trim()) {
    return [];
  }

  const words = text.trim().split(/\s+/);
  const totalFrames = duration * fps;
  const framesPerWord = totalFrames / Math.max(words.length, 1);
  const framesPerSegment = framesPerWord * wordsPerSegment;

  const segments: Array<{
    text: string;
    startFrame: number;
    endFrame: number;
  }> = [];

  for (let i = 0; i < words.length; i += wordsPerSegment) {
    const segmentWords = words.slice(i, i + wordsPerSegment);
    const startFrame = Math.floor(i * framesPerWord);
    const endFrame = Math.floor(Math.min((i + wordsPerSegment) * framesPerWord, totalFrames));

    segments.push({
      text: segmentWords.join(" "),
      startFrame,
      endFrame: Math.max(endFrame, startFrame + 1), // Ensure at least 1 frame
    });
  }

  return segments;
}