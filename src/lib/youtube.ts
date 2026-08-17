import { VideoMetadata, TranscriptSegment, TranscriptWord } from "./clip-types";

export interface SamplePresetVideo {
  id: string;
  url: string;
  title: string;
  channelName: string;
  durationSeconds: number;
  formattedDuration: string;
  thumbnailUrl: string;
  category: string;
  description: string;
  speakers: string[];
  sampleVideoUrl?: string;
}

export const SAMPLE_PRESET_VIDEOS: SamplePresetVideo[] = [
  {
    id: "sam_altman_podcast",
    url: "https://www.youtube.com/watch?v=L_Guz73G-lM",
    title: "Sam Altman: OpenAI, GPT-5, Future of AI & Human Consciousness",
    channelName: "Lex Fridman Podcast #419",
    durationSeconds: 7240, // 2h 00m 40s
    formattedDuration: "2:00:40",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    category: "AI & Tech",
    description: "Deep conversation on artificial general intelligence, compute scaling laws, and humanity's next decade.",
    speakers: ["Lex Fridman", "Sam Altman"],
    sampleVideoUrl: "/wind-blowing.mp4",
  },
  {
    id: "huberman_focus",
    url: "https://www.youtube.com/watch?v=hFL6qRIJZ_Y",
    title: "Dr. Andrew Huberman: Optimize Your Brain for Deep Focus & Energy",
    channelName: "Huberman Lab #112",
    durationSeconds: 5820, // 1h 37m
    formattedDuration: "1:37:00",
    thumbnailUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80",
    category: "Health & Science",
    description: "Neuroscience-backed tools to dramatically improve cognitive focus, dopamine regulation, and mental stamina.",
    speakers: ["Dr. Andrew Huberman"],
    sampleVideoUrl: "/wind-blowing.mp4",
  },
  {
    id: "steve_jobs_speech",
    url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
    title: "Steve Jobs' 2005 Stanford Commencement Address - Stay Hungry, Stay Foolish",
    channelName: "Stanford University",
    durationSeconds: 904, // 15m 04s
    formattedDuration: "15:04",
    thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80",
    category: "Keynote & Talks",
    description: "Iconic speech about connecting dots, loving what you do, and overcoming failure.",
    speakers: ["Steve Jobs"],
    sampleVideoUrl: "/windblowing-mobile.mp4",
  },
  {
    id: "tech_founders_panel",
    url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    title: "Building 100M+ User Products: Y Combinator Founders Masterclass",
    channelName: "Y Combinator Studio",
    durationSeconds: 3840, // 1h 04m
    formattedDuration: "1:04:00",
    thumbnailUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
    category: "Startups & Business",
    description: "Top founders share lessons on product-market fit, rapid iteration, and viral growth hooks.",
    speakers: ["Garry Tan", "Dalton Caldwell", "Michael Seibel"],
    sampleVideoUrl: "/wind-blowing.mp4",
  },
];

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null || url.startsWith("https://") || url.startsWith("http://");
}

export function formatSecondsToTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function fetchVideoMetadata(url: string): Promise<VideoMetadata> {
  const videoId = extractYouTubeId(url);
  
  // Check if matches a preset video sample
  const preset = SAMPLE_PRESET_VIDEOS.find(
    (p) => p.id === url || p.url.includes(url) || (videoId && p.url.includes(videoId))
  );

  if (preset) {
    return {
      id: preset.id,
      sourceUrl: preset.url,
      title: preset.title,
      channelName: preset.channelName,
      durationSeconds: preset.durationSeconds,
      formattedDuration: preset.formattedDuration,
      thumbnailUrl: preset.thumbnailUrl,
      description: preset.description,
      speakers: preset.speakers,
      hasAudio: true,
      hasTranscript: true,
      videoUrl: preset.sampleVideoUrl,
    };
  }

  // Generic fallback parsing for any pasted YouTube video URL
  const cleanId = videoId || `yt_${Date.now().toString(36)}`;

  return {
    id: cleanId,
    sourceUrl: url,
    title: videoId
      ? `YouTube Video (${videoId}) - Masterclass & Conversation`
      : "Long Video Masterclass & Interview",
    channelName: "YouTube Studio Creator",
    durationSeconds: 3600, // Default 1 hour estimation
    formattedDuration: "1:00:00",
    thumbnailUrl: videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80",
    description: "Extracted video stream ready for AI moment analysis.",
    speakers: ["Host", "Guest Speaker"],
    hasAudio: true,
    hasTranscript: true,
    // Use a bundled sample clip so the preview player has real footage to show
    videoUrl: "/wind-blowing.mp4",
  };
}

export function generateMockTranscriptForVideo(
  metadata: VideoMetadata
): TranscriptSegment[] {
  const isSamAltman = (metadata.title || "").toLowerCase().includes("altman") || metadata.id === "sam_altman_podcast";
  const isHuberman = (metadata.title || "").toLowerCase().includes("huberman") || metadata.id === "huberman_focus";
  const isSteveJobs = (metadata.title || "").toLowerCase().includes("jobs") || metadata.id === "steve_jobs_speech";

  if (isSamAltman) {
    return [
      {
        id: "seg_1",
        start: 134,
        end: 178,
        speaker: "Sam Altman",
        text: "The speed at which AI models are advancing is completely unprecedented in human history. Most people underestimate exponential curves until the sudden inflection point hits.",
        words: createWordsForText("The speed at which AI models are advancing is completely unprecedented in human history. Most people underestimate exponential curves until the sudden inflection point hits.", 134, 178),
      },
      {
        id: "seg_2",
        start: 540,
        end: 585,
        speaker: "Lex Fridman",
        text: "What do you think is the single most surprising thing you learned while building GPT-4?",
        words: createWordsForText("What do you think is the single most surprising thing you learned while building GPT-4?", 540, 560),
      },
      {
        id: "seg_3",
        start: 560,
        end: 605,
        speaker: "Sam Altman",
        text: "How much intelligence is actually latent within plain language token prediction. It proved that reasoning isn't magic—it's compressed world understanding.",
        words: createWordsForText("How much intelligence is actually latent within plain language token prediction. It proved that reasoning isn't magic—it's compressed world understanding.", 560, 605),
      },
      {
        id: "seg_4",
        start: 1420,
        end: 1465,
        speaker: "Sam Altman",
        text: "If you want to build something truly transformative, you have to be willing to be misunderstood for long periods of time. Doubters will mock your vision right until it becomes obvious.",
        words: createWordsForText("If you want to build something truly transformative, you have to be willing to be misunderstood for long periods of time. Doubters will mock your vision right until it becomes obvious.", 1420, 1465),
      },
      {
        id: "seg_5",
        start: 2840,
        end: 2885,
        speaker: "Sam Altman",
        text: "Compute is the ultimate currency of the next century. Whoever builds the best infrastructure and algorithmic efficiency will unlock clean energy, cures, and unlimited abundance.",
        words: createWordsForText("Compute is the ultimate currency of the next century. Whoever builds the best infrastructure and algorithmic efficiency will unlock clean energy, cures, and unlimited abundance.", 2840, 2885),
      },
      {
        id: "seg_6",
        start: 3910,
        end: 3955,
        speaker: "Sam Altman",
        text: "My advice to young founders: focus on high leverage skills and surround yourself with relentless optimists. Cynicism is easy, but creation requires courage.",
        words: createWordsForText("My advice to young founders: focus on high leverage skills and surround yourself with relentless optimists. Cynicism is easy, but creation requires courage.", 3910, 3955),
      },
    ];
  }

  if (isHuberman) {
    return [
      {
        id: "h_seg_1",
        start: 90,
        end: 135,
        speaker: "Dr. Andrew Huberman",
        text: "Dopamine is not the molecule of pleasure—it is the molecule of pursuit, motivation, and drive. When you learn to control your dopamine baseline, your focus skyrockets effortlessly.",
        words: createWordsForText("Dopamine is not the molecule of pleasure—it is the molecule of pursuit, motivation, and drive. When you learn to control your dopamine baseline, your focus skyrockets effortlessly.", 90, 135),
      },
      {
        id: "h_seg_2",
        start: 610,
        end: 655,
        speaker: "Dr. Andrew Huberman",
        text: "Viewing natural sunlight within 30 minutes of waking triggers a neural cascade that anchors your circadian rhythm and boosts cortisol at the exact right window.",
        words: createWordsForText("Viewing natural sunlight within 30 minutes of waking triggers a neural cascade that anchors your circadian rhythm and boosts cortisol at the exact right window.", 610, 655),
      },
      {
        id: "h_seg_3",
        start: 1480,
        end: 1525,
        speaker: "Dr. Andrew Huberman",
        text: "The physiological sigh—two deep inhales through the nose followed by a long exhaled breath through the mouth—is the fastest real-time mechanism to reset your autonomic nervous system.",
        words: createWordsForText("The physiological sigh—two deep inhales through the nose followed by a long exhaled breath through the mouth—is the fastest real-time mechanism to reset your autonomic nervous system.", 1480, 1525),
      },
      {
        id: "h_seg_4",
        start: 2420,
        end: 2465,
        speaker: "Dr. Andrew Huberman",
        text: "Deep work sessions should last no longer than 90 minutes. Your brain operates on ultradian rhythms, and forcing focus beyond 90 minutes leads to steep diminishing returns.",
        words: createWordsForText("Deep work sessions should last no longer than 90 minutes. Your brain operates on ultradian rhythms, and forcing focus beyond 90 minutes leads to steep diminishing returns.", 2420, 2465),
      },
    ];
  }

  if (isSteveJobs) {
    return [
      {
        id: "j_seg_1",
        start: 120,
        end: 165,
        speaker: "Steve Jobs",
        text: "You can't connect the dots looking forward; you can only connect them looking backward. So you have to trust that the dots will somehow connect in your future.",
        words: createWordsForText("You can't connect the dots looking forward; you can only connect them looking backward. So you have to trust that the dots will somehow connect in your future.", 120, 165),
      },
      {
        id: "j_seg_2",
        start: 340,
        end: 385,
        speaker: "Steve Jobs",
        text: "Getting fired from Apple was the best thing that could have ever happened to me. The heaviness of being successful was replaced by the lightness of being a beginner again.",
        words: createWordsForText("Getting fired from Apple was the best thing that could have ever happened to me. The heaviness of being successful was replaced by the lightness of being a beginner again.", 340, 385),
      },
      {
        id: "j_seg_3",
        start: 510,
        end: 555,
        speaker: "Steve Jobs",
        text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. And the only way to do great work is to love what you do.",
        words: createWordsForText("Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. And the only way to do great work is to love what you do.", 510, 555),
      },
      {
        id: "j_seg_4",
        start: 780,
        end: 825,
        speaker: "Steve Jobs",
        text: "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma—which is living with the results of other people's thinking. Stay Hungry, Stay Foolish.",
        words: createWordsForText("Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma—which is living with the results of other people's thinking. Stay Hungry, Stay Foolish.", 780, 825),
      },
    ];
  }

  // Generic timestamped transcript segments for any user video
  return [
    {
      id: "gen_seg_1",
      start: 145,
      end: 190,
      speaker: metadata.speakers?.[0] || "Speaker A",
      text: "The secret to building extraordinary products is simple: focus relentlessly on solving a high-friction problem for people who deeply care.",
      words: createWordsForText("The secret to building extraordinary products is simple: focus relentlessly on solving a high-friction problem for people who deeply care.", 145, 190),
    },
    {
      id: "gen_seg_2",
      start: 420,
      end: 465,
      speaker: metadata.speakers?.[1] || metadata.speakers?.[0] || "Speaker B",
      text: "When everyone else is moving in one direction, the biggest opportunities always exist in the counter-intuitive opinion that turns out to be true.",
      words: createWordsForText("When everyone else is moving in one direction, the biggest opportunities always exist in the counter-intuitive opinion that turns out to be true.", 420, 465),
    },
    {
      id: "gen_seg_3",
      start: 890,
      end: 935,
      speaker: metadata.speakers?.[0] || "Speaker A",
      text: "Speed of execution beats perfection every single time. Iterating in public with real user feedback is 100 times more valuable than sitting in a silent room.",
      words: createWordsForText("Speed of execution beats perfection every single time. Iterating in public with real user feedback is 100 times more valuable than sitting in a silent room.", 890, 935),
    },
    {
      id: "gen_seg_4",
      start: 1450,
      end: 1495,
      speaker: metadata.speakers?.[1] || "Speaker B",
      text: "If you look at the greatest breakthroughs in science and technology, they almost always came from people who refused to accept traditional boundaries.",
      words: createWordsForText("If you look at the greatest breakthroughs in science and technology, they almost always came from people who refused to accept traditional boundaries.", 1450, 1495),
    },
    {
      id: "gen_seg_5",
      start: 2100,
      end: 2145,
      speaker: metadata.speakers?.[0] || "Speaker A",
      text: "Consistency is the compound interest of self-improvement. Showing up every day with 1% progress creates unimaginable results over a 5-year timeline.",
      words: createWordsForText("Consistency is the compound interest of self-improvement. Showing up every day with 1% progress creates unimaginable results over a 5-year timeline.", 2100, 2145),
    },
  ];
}

function createWordsForText(text: string, startSec: number, endSec: number): TranscriptWord[] {
  const wordsArr = text.split(" ");
  const durationPerWord = (endSec - startSec) / Math.max(1, wordsArr.length);
  return wordsArr.map((w, idx) => ({
    word: w,
    start: Number((startSec + idx * durationPerWord).toFixed(2)),
    end: Number((startSec + (idx + 1) * durationPerWord).toFixed(2)),
    confidence: 0.95 + Math.random() * 0.05,
  }));
}
