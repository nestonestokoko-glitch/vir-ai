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
      // The process endpoint awaits the pipeline on Netlify (serverless freezes
      // fire-and-forget work after the response), so a job normally reaches a
      // terminal state before the first status poll. The only case we re-drive
      // is a job stuck in "queued" — i.e. the process endpoint returned before the
      // pipeline ran (e.g. it 504'd right after saving the initial job). We do
      // NOT re-drive mid-pipeline stages: on serverless a re-driven job freezes
      // again, resetting its timestamp and looping forever at "analyzing".
      const frozenAtStart = job.status === "queued" && ageMs > 2000;
      if (frozenAtStart) {
        // Restart the pipeline (idempotent; writes progress back to the store).
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
