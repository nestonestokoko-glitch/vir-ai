import { NextRequest, NextResponse } from "next/server";
import { getJobById, processJobAsync } from "../../process/route";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const job = await getJobById(jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const isTerminal = job.status === "completed" || job.status === "failed";
    if (!isTerminal && job.config && job.metadata) {
      const ageMs = Date.now() - new Date(job.updatedAt).getTime();
      // Re-drive only when the background work is genuinely frozen, not merely
      // slow: a healthy job updates its timestamp as each stage progresses
      // (e.g. a local video download can legitimately take >30s). We restart if
      // it never left "queued" (background never started — the common serverless
      // freeze right after the HTTP response) or has been stuck non-terminal for
      // a long time (frozen mid-pipeline).
      const frozenAtStart = job.status === "queued" && ageMs > 2000;
      const frozenMid = ageMs > 45000;
      if (frozenAtStart || frozenMid) {
        // Background work likely froze — restart it (idempotent; writes
        // progress back to the persistent store as it goes).
        processJobAsync(
          job.id,
          job.config,
          job.metadata,
          job.requestedClipsCount,
          job.targetDurationSeconds
        ).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch job status" },
      { status: 500 }
    );
  }
}
