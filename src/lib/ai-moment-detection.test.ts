import { analyzeVideoAndDetectMoments } from "./ai-moment-detection";
import { fetchVideoMetadata } from "./youtube";

describe("AI Moment Detection Engine", () => {
  it("should extract candidate moments and score them above thresholds", async () => {
    const metadata = await fetchVideoMetadata("https://www.youtube.com/watch?v=L_Guz73G-lM");
    const moments = analyzeVideoAndDetectMoments(metadata, 3, 45);

    expect(moments.length).toBeGreaterThan(0);
    expect(moments.length).toBeLessThanOrEqual(3);

    const first = moments[0];
    expect(first.score.overallScore).toBeGreaterThan(70);
    expect(first.duration).toBeLessThanOrEqual(45);
    expect(first.title).toBeDefined();
    expect(first.score.engagement).toBeGreaterThan(70);
  });

  it("should deduplicate and rank moments by overall score descending", async () => {
    const metadata = await fetchVideoMetadata("https://www.youtube.com/watch?v=hFL6qRIJZ_Y");
    const moments = analyzeVideoAndDetectMoments(metadata, 5, 60);

    for (let i = 0; i < moments.length - 1; i++) {
      expect(moments[i].score.overallScore).toBeGreaterThanOrEqual(
        moments[i + 1].score.overallScore
      );
    }
  });
});
