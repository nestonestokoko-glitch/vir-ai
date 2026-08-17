import { NextResponse } from "next/server";
import { renderJobs, RenderJob } from "./store";

// Generate a unique job ID
function generateJobId(): string {
  return `render_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Simulate video generation progress
async function simulateRender(jobId: string, project: any): Promise<void> {
  const job = renderJobs.get(jobId);
  if (!job) return;

  // Update status to rendering
  job.status = "rendering";
  job.progress = 0;

  // Simulate rendering process with progress updates
  for (let i = 0; i <= 100; i += 10) {
    // Wait 200ms between updates to simulate work
    await new Promise((resolve) => setTimeout(resolve, 200));

    const currentJob = renderJobs.get(jobId);
    if (!currentJob) return; // Job was cancelled or removed

    currentJob.progress = i;

    // If we reach 100%, mark as completed
    if (i === 100) {
      currentJob.status = "completed";
      // In a real implementation, this would be the actual video URL
      currentJob.videoUrl = `/reels/${jobId}/final.mp4`;
    }
  }
}

export async function POST(request: Request) {
  try {
    const { project } = await request.json();

    // Validate project
    if (!project || !project.text) {
      return NextResponse.json(
        { error: "Invalid project data" },
        { status: 400 }
      );
    }

    // Create render job
    const jobId = generateJobId();
    const newJob: RenderJob = {
      id: jobId,
      status: "queued",
      createdAt: Date.now(),
    };

    renderJobs.set(jobId, newJob);

    // Start rendering simulation (in background)
    simulateRender(jobId, project).catch(console.error);

    return NextResponse.json({ jobId });
  } catch (error) {
    console.error("Render error:", error);
    return NextResponse.json(
      { error: "Failed to start render job" },
      { status: 500 }
    );
  }
}