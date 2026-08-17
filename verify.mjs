// Drives the clipping pipeline for a given format + clip count and prints facts.
const BASE = "http://localhost:3000";
const URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const fmt = process.argv[2] || "portrait";
const count = parseInt(process.argv[3] || "5", 10);
const duration = parseInt(process.argv[4] || "45", 10);

async function main() {
  const fetchRes = await fetch(`${BASE}/api/youtube/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: URL }),
  });
  const fetchJson = await fetchRes.json();
  const metadata = fetchJson.metadata || fetchJson;
  if (!metadata || !metadata.videoUrl) {
    console.error("FETCH FAILED:", JSON.stringify(fetchJson));
    process.exit(1);
  }
  console.log(`[${fmt}/${count}] metadata title="${metadata.title}" dur=${metadata.durationSeconds}`);

  const procRes = await fetch(`${BASE}/api/clipping/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      videoUrl: metadata.videoUrl,
      metadata,
      format: fmt,
      font: "Inter",
      style: "Bold",
      animation: "Word Reveal",
      clipCount: count,
      clipDuration: duration,
    }),
  });
  const procJson = await procRes.json();
  const jobId = procJson.jobId;
  if (!jobId) {
    console.error("PROCESS FAILED:", JSON.stringify(procJson));
    process.exit(1);
  }
  console.log(`[${fmt}/${count}] jobId=${jobId}`);

  let job = null;
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const st = await fetch(`${BASE}/api/clipping/status/${jobId}`).then((r) => r.json());
    job = st.job || st;
    const status = job.status;
    if (status === "completed" || status === "failed") {
      console.log(`[${fmt}/${count}] status=${status} after ~${(i + 1) * 2}s`);
      break;
    }
    if (i % 5 === 0) console.log(`[${fmt}/${count}] ... ${status} ${job.progressPercentage || 0}%`);
  }

  const clips = job.generatedClips || [];
  console.log(`[${fmt}/${count}] generatedClips.length = ${clips.length} (requested ${count}), duration cap=${duration}s`);
  const starts = new Set();
  const scenes = new Set();
  let maxWindow = 0;
  let overCap = 0;
  for (const c of clips) {
    starts.add(Math.round(c.startTime));
    scenes.add(c.sceneType);
    const win = Number((c.endTime - c.startTime).toFixed(1));
    maxWindow = Math.max(maxWindow, win);
    if (win > duration + 0.5) overCap++;
    console.log(`  - ${c.title?.slice(0, 48)} | start=${c.startTime} end=${c.endTime} (${win}s) | scene=${c.sceneType} | style=${c.style} anim=${c.animation} pos=${c.captionPosition}`);
  }
  console.log(`[${fmt}/${count}] distinct start times: ${starts.size}, distinct scene types: ${scenes.size}`);
  console.log(`[${fmt}/${count}] scene types: ${[...scenes].join(", ")}`);
  console.log(`[${fmt}/${count}] max clip window=${maxWindow}s, clips over ${duration}s cap: ${overCap}`);
}

main().catch((e) => { console.error("ERROR", e); process.exit(1); });
